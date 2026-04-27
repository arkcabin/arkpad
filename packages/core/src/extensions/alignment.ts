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
    const { from, to } = state.selection;

    if (dispatch) {
      const tr = state.tr;

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isTextblock) {
          // Dynamic Notion-style fix: Disable alignment if the text block is inside ANY list
          // This prevents layout jumping/flickering and matches professional editor behavior.
          const $pos = state.doc.resolve(pos);
          let isInsideList = false;
          for (let i = $pos.depth; i > 0; i--) {
            if ($pos.node(i).type.name.toLowerCase().includes("list")) {
              isInsideList = true;
              break;
            }
          }

          if (isInsideList) {
            return;
          }

          const attrs = { ...node.attrs, align };
          tr.setNodeMarkup(pos, node.type, attrs);
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
