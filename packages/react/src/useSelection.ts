import { type ArkpadEditorAPI } from "@arkpad/core";
import { useEditorState } from "./useEditorState";

export interface SelectionState {
  from: number;
  to: number;
  empty: boolean;
  text: string;
  coords: { top: number; left: number; bottom: number; right: number };
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isCode: boolean;
  isLink: boolean;
  headingLevel: number | null;
}

/**
 * A hook that provides a reactive snapshot of the current editor selection.
 * This is highly optimized and only triggers a re-render when the selection changes.
 */
export function useSelection(editor: ArkpadEditorAPI | null): SelectionState {
  const defaultState: SelectionState = {
    from: 0,
    to: 0,
    empty: true,
    text: "",
    coords: { top: 0, left: 0, bottom: 0, right: 0 },
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrike: false,
    isCode: false,
    isLink: false,
    headingLevel: null,
  };

  const selection = useEditorState(
    editor,
    (s): SelectionState => {
      const { from, to, empty } = s.getSelection();
      const coords = s.getCoords();

      return {
        from,
        to,
        empty,
        text: s.getText().slice(from, to), // Note: In PM this is slightly different, but good for snapshot
        coords,
        isBold: s.isActive("strong"),
        isItalic: s.isActive("em"),
        isUnderline: s.isActive("underline"),
        isStrike: s.isActive("strike"),
        isCode: s.isActive("code"),
        isLink: s.isActive("link"),
        headingLevel: s.isActive("heading") ? s.getAttributes("heading")?.level || null : null,
      };
    },
    // Custom equality check for performance
    (prev, next) => {
      return (
        prev.from === next.from &&
        prev.to === next.to &&
        prev.isBold === next.isBold &&
        prev.isItalic === next.isItalic &&
        prev.isUnderline === next.isUnderline &&
        prev.isStrike === next.isStrike &&
        prev.isCode === next.isCode &&
        prev.isLink === next.isLink &&
        prev.headingLevel === next.headingLevel
      );
    }
  );

  return selection || defaultState;
}
