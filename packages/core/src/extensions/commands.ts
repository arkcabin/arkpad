import { Extension, ArkpadCommandProps } from "@arkpad/core";
import { toggleMark, toggleBlock, toggleList, setTextAlign } from "./utils";
import { type MarkType, type NodeType } from "prosemirror-model";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleMark: (type: string | MarkType, attrs?: Record<string, any>) => void;
    toggleBlock: (type: string | NodeType, attrs?: Record<string, any>) => void;
    toggleList: (listType: string | NodeType, itemType: string | NodeType) => void;
    setTextAlign: (align: string) => void;
    insertNode: (type: string | NodeType, attrs?: Record<string, any>) => void;
  }
}

export const BaseCommands = Extension.create({
  name: "baseCommands",

  addCommands: () => ({
    toggleMark:
      (type: string | MarkType, attrs?: Record<string, any>) => (props: ArkpadCommandProps) => {
        const markType = typeof type === "string" ? props.state.schema.marks[type] : type;
        if (!markType) return false;
        return toggleMark(markType, attrs)(props.state, props.dispatch);
      },
    toggleBlock:
      (type: string | NodeType, attrs?: Record<string, any>) => (props: ArkpadCommandProps) => {
        const blockType = typeof type === "string" ? props.state.schema.nodes[type] : type;
        if (!blockType) return false;
        return toggleBlock(blockType, attrs)(props.state, props.dispatch);
      },
    toggleList:
      (listType: string | NodeType, itemType: string | NodeType) => (props: ArkpadCommandProps) => {
        const list = typeof listType === "string" ? props.state.schema.nodes[listType] : listType;
        const item = typeof itemType === "string" ? props.state.schema.nodes[itemType] : itemType;
        if (!list || !item) return false;
        return toggleList(list, item)(props.state, props.dispatch);
      },
    setTextAlign: (align: string) => (props: ArkpadCommandProps) => {
      return setTextAlign(align)(props.state, props.dispatch);
    },
    insertNode:
      (type: string | NodeType, attrs?: Record<string, any>) => (props: ArkpadCommandProps) => {
        const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
        if (!nodeType) return false;

        const { state, dispatch } = props;
        const { $from } = state.selection;
        const index = $from.index();

        if (!$from.parent.canReplaceWith(index, index, nodeType)) {
          return false;
        }

        if (dispatch) {
          dispatch(state.tr.replaceSelectionWith(nodeType.create(attrs)).scrollIntoView());
        }
        return true;
      },
  }),
});
