import { Extension } from "@arkpad/core";
import { ArkpadCommandProps } from "@arkpad/core";
import { setTextAlign } from "@arkpad/core";

export const TEXT_ALIGN = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
  JUSTIFY: "justify",
} as const;

export type TextAlign = (typeof TEXT_ALIGN)[keyof typeof TEXT_ALIGN];

export function createTextAlign(): Extension {
  return Extension.create({
    name: "textAlign",
    addCommands: () => ({
      /**
       * Set text alignment for the current block.
       * Handles both direct string and object arguments.
       */
      setTextAlign:
        (args: string | { align: string }) =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const align = typeof args === "string" ? args : args.align;
          return setTextAlign(align)(state, dispatch);
        },

      /**
       * Convenience commands for common alignments.
       */
      setTextAlignLeft:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.LEFT)(state, dispatch),
      setTextAlignCenter:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.CENTER)(state, dispatch),
      setTextAlignRight:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.RIGHT)(state, dispatch),
      setTextAlignJustify:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.JUSTIFY)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-l": () => setTextAlign(TEXT_ALIGN.LEFT),
      "Mod-Shift-e": () => setTextAlign(TEXT_ALIGN.CENTER),
      "Mod-Shift-r": () => setTextAlign(TEXT_ALIGN.RIGHT),
    }),
  });
}

export default createTextAlign;
