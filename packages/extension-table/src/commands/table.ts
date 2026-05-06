import type { ArkpadCommandProps } from "@arkpad/core";
import { TextSelection } from "prosemirror-state";
import { fixTables as pmFixTables, deleteTable as pmDeleteTable } from "prosemirror-tables";
import type { InsertTableOptions, CommandFactory } from "../types";
import { createTable } from "../nodes/utilities/createTable";

export const insertTable: CommandFactory =
  (options: InsertTableOptions = {}) =>
  ({ chain }: ArkpadCommandProps) => {
    const { rows = 3, cols = 3, withHeaderRow = true } = options;
    return chain()
      .command(({ state, tr }) => {
        const { schema } = state;
        const node = createTable(schema, rows, cols, withHeaderRow);

        if (!node) return false;

        const offset = tr.selection.from + 1;
        tr.replaceSelectionWith(node).scrollIntoView();
        
        const resolvedPos = tr.doc.resolve(offset);
        tr.setSelection(TextSelection.near(resolvedPos));
        
        return true;
      }, "insertTable")
      .run();
  };

export const deleteTable: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmDeleteTable(state, dispatch))
    .run();
};

export const exitTable: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, tr, dispatch }: ArkpadCommandProps) => {
      const { selection } = state;
      const { $from } = selection;

      let tablePos = -1;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.spec.tableRole === "table") {
          tablePos = $from.before(d);
          break;
        }
      }

      if (tablePos === -1) return false;

      const tableNode = tr.doc.nodeAt(tablePos);
      if (!tableNode) return false;

      const endPos = tablePos + tableNode.nodeSize;

      const nextNode = tr.doc.nodeAt(endPos);
      if (nextNode && nextNode.type.name === "paragraph") {
        if (dispatch) {
          dispatch(
            tr.setSelection(TextSelection.create(tr.doc, endPos + 1)).scrollIntoView()
          );
        }
        return true;
      }

      const paragraph = state.schema.nodes.paragraph!.create();
      tr.insert(endPos, paragraph);
      tr.setSelection(TextSelection.create(tr.doc, endPos + 1));
      if (dispatch) {
        dispatch(tr.scrollIntoView());
      }
      return true;
    })
    .run();
};

export const fixTables: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => {
      const tr = pmFixTables(state);
      if (tr && dispatch) {
        dispatch(tr);
        return true;
      }
      return !!tr;
    })
    .run();
};
