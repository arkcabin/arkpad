import { useEditorState } from "./useEditorState";
import { ArkpadEditorAPI, GlobalMenuStorage, MenuState } from "@arkpad/core";
import { CSSProperties } from "react";

export interface UseMenuPositionerProps {
  editor: ArkpadEditorAPI | null;
  extensionName: string;
  type: "bubble" | "floating";
  offset?: number;
}

export function useMenuPositioner({
  editor,
  extensionName,
  type,
  offset = 12,
}: UseMenuPositionerProps) {
  const menuState = useEditorState(
    editor,
    (editor) => {
      const storage = editor.storage.menuEngine as GlobalMenuStorage;
      if (!storage || !storage.menus) return null;

      const key = Object.keys(storage.menus).find(
        (k) => k.startsWith(`${extensionName}-`) && storage.menus[k]?.type === type
      );

      return key ? storage.menus[key] : null;
    },
    (a, b) => {
      if (!a || !b) return a === b;
      return (
        a.active === b.active &&
        a.coords?.top === b.coords?.top &&
        a.coords?.left === b.coords?.left &&
        a.coords?.bottom === b.coords?.bottom &&
        a.coords?.right === b.coords?.right &&
        a.isFirstShow === b.isFirstShow
      );
    }
  );

  const state = menuState as MenuState | null;

  if (!state || !state.active || !state.coords) {
    return {
      active: false,
      style: {
        visibility: "hidden" as const,
        opacity: 0,
        pointerEvents: "none" as const,
        position: "fixed" as const,
      } as CSSProperties,
    };
  }

  const { coords, isFirstShow } = state;

  // Calculate final position
  let x: number;
  let y: number;

  if (type === "bubble") {
    // Center horizontally, position above selection
    const centerX = (coords.left + coords.right) / 2;
    x = centerX;
    y = coords.top - offset;
  } else {
    // Floating menu (left of cursor)
    const floatingPadding = 48;
    x = coords.left - floatingPadding;
    y = coords.top;
  }

  const style: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transform: `translate3d(${x}px, ${y}px, 0) ${type === "bubble" ? "translate(-50%, -100%)" : "translate(0, -50%)"}`,
    visibility: "visible",
    opacity: 1,
    transition: isFirstShow
      ? "none"
      : "opacity 0.15s ease-out, transform 0.15s cubic-bezier(0.2, 0, 0, 1)",
    pointerEvents: "auto",
    willChange: "transform, opacity",
    minWidth: type === "floating" ? "32px" : "auto",
  };

  return {
    active: true,
    style,
  };
}
