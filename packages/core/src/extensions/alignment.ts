import { Extension } from "../extensions-types";
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
