import { ArkpadExtension as Extension } from "../types";
import { setTextAlign } from "./utils";

export const TEXT_ALIGN = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
  JUSTIFY: "justify",
} as const;

export type TextAlign = (typeof TEXT_ALIGN)[keyof typeof TEXT_ALIGN];

export function createTextAlign(): Extension {
  return {
    name: "textAlign",
    addCommands: () => ({
      /**
       * Set text alignment for the current block.
       * Handles both direct string and object arguments.
       */
      setTextAlign: (args: string | { align: string }) => {
        const align = typeof args === "string" ? args : args.align;
        return setTextAlign(align);
      },

      /**
       * Convenience commands for common alignments.
       */
      setTextAlignLeft: () => setTextAlign(TEXT_ALIGN.LEFT),
      setTextAlignCenter: () => setTextAlign(TEXT_ALIGN.CENTER),
      setTextAlignRight: () => setTextAlign(TEXT_ALIGN.RIGHT),
      setTextAlignJustify: () => setTextAlign(TEXT_ALIGN.JUSTIFY),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-l": () => setTextAlign(TEXT_ALIGN.LEFT),
      "Mod-Shift-e": () => setTextAlign(TEXT_ALIGN.CENTER),
      "Mod-Shift-r": () => setTextAlign(TEXT_ALIGN.RIGHT),
    }),
  };
}
