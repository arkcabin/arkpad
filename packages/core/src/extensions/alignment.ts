import { setBlockType } from "prosemirror-commands";
import { arkpadSchema } from "../schema";
import { Extension } from "../extensions-types";

export const TEXT_ALIGN = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
  JUSTIFY: "justify",
} as const;

type TextAlign = (typeof TEXT_ALIGN)[keyof typeof TEXT_ALIGN];

function setAlignCommand(align: TextAlign) {
  return (state: any, dispatch: any) => {
    const { $from, to } = state.selection;
    let canSetAlign = false;

    state.doc.nodesBetween($from.pos, to, (node) => {
      if (
        node.type.isTextblock &&
        node.type.canBeSetWithAttribute(arkpadSchema.nodes.paragraph!, "align")
      ) {
        canSetAlign = true;
        return false;
      }
    });

    if (!canSetAlign) {
      for (let d = $from.depth; d >= 0; d--) {
        const node = $from.node(d);
        if (
          node.isTextblock &&
          node.type.canBeSetWithAttribute(arkpadSchema.nodes.paragraph!, "align")
        ) {
          canSetAlign = true;
          break;
        }
      }
    }

    if (!canSetAlign) return false;

    if (dispatch) {
      const tr = state.tr;
      state.doc.nodesBetween($from.pos, to, (node, pos) => {
        if (node.isTextblock) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, align });
        }
      });
      dispatch(tr);
    }
    return true;
  };
}

export function createTextAlign(): Extension {
  return {
    name: "textAlign",
    addCommands: () => ({
      setTextAlignLeft: () => setAlignCommand(TEXT_ALIGN.LEFT),
      setTextAlignCenter: () => setAlignCommand(TEXT_ALIGN.CENTER),
      setTextAlignRight: () => setAlignCommand(TEXT_ALIGN.RIGHT),
      setTextAlignJustify: () => setAlignCommand(TEXT_ALIGN.JUSTIFY),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-l": () => setAlignCommand(TEXT_ALIGN.LEFT),
      "Mod-Shift-e": () => setAlignCommand(TEXT_ALIGN.CENTER),
      "Mod-Shift-r": () => setAlignCommand(TEXT_ALIGN.RIGHT),
    }),
  };
}
