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
        (props: ArkpadCommandProps) => {
          const align = typeof args === "string" ? args : args.align;
          return setTextAlign(align)(props);
        },

      /**
       * Convenience commands for common alignments.
       */
      setTextAlignLeft:
        () =>
        (props: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.LEFT)(props),
      setTextAlignCenter:
        () =>
        (props: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.CENTER)(props),
      setTextAlignRight:
        () =>
        (props: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.RIGHT)(props),
      setTextAlignJustify:
        () =>
        (props: ArkpadCommandProps) =>
          setTextAlign(TEXT_ALIGN.JUSTIFY)(props),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-l": () => setTextAlign(TEXT_ALIGN.LEFT),
      "Mod-Shift-e": () => setTextAlign(TEXT_ALIGN.CENTER),
      "Mod-Shift-r": () => setTextAlign(TEXT_ALIGN.RIGHT),
    }),
  });
}

export default createTextAlign;
