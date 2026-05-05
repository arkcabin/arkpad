import { useEditorState } from "./useEditorState";
import { ArkpadEditorAPI, GlobalMenuStorage } from "@arkpad/core";
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
  offset = 2,
}: UseMenuPositionerProps) {
  const menuState = useEditorState(
    editor,
    (editor) => {
      const storage = editor.storage.menuEngine as GlobalMenuStorage;
      if (!storage || !storage.menus) return null;

      const key = Object.keys(storage.menus).find(
        (k) => k.startsWith(`${extensionName}-`) && storage.menus[k]?.type === type
      );

      const menu = key ? storage.menus[key] : null;
      return {
        menu,
        isLocked: storage.isLocked || false,
      };
    },
    (a, b) => {
      if (!a || !b) return a === b;
      return (
        a.isLocked === b.isLocked &&
        a.menu?.active === b.menu?.active &&
        a.menu?.coords?.top === b.menu?.coords?.top &&
        a.menu?.coords?.left === b.menu?.coords?.left &&
        a.menu?.coords?.bottom === b.menu?.coords?.bottom &&
        a.menu?.coords?.right === b.menu?.coords?.right &&
        a.menu?.isFirstShow === b.menu?.isFirstShow
      );
    }
  );

  if (!menuState || !menuState.menu || !menuState.menu.active || !menuState.menu.coords) {
    return {
      active: false,
      style: {
        visibility: "hidden" as const,
        opacity: 0,
        pointerEvents: "none" as const,
        position: "absolute" as const,
      } as CSSProperties,
    };
  }

  const { menu, isLocked } = menuState;
  const coords = menu.coords!;
  const isFirstShow = menu.isFirstShow;

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
    const floatingPadding = 4;
    x = coords.left - floatingPadding;
    y = coords.top;
  }

  // Positioning Strategy: Absolute
  // By using absolute positioning inside a relative parent (the editor container),
  // the menu moves automatically with the browser's hardware-accelerated scroll.
  const style: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1000,
    transform: `translate3d(${x}px, ${y}px, 0) ${type === "bubble" ? "translate(-50%, -100%)" : "translate(0, -50%)"}`,
    visibility: isLocked ? "hidden" : "visible",
    opacity: isLocked ? 0 : 1,
    pointerEvents: isLocked ? "none" : "auto",
    transition:
      isFirstShow || isLocked
        ? "none"
        : "opacity 0.15s ease-out, transform 0.15s cubic-bezier(0.2, 0, 0, 1), visibility 0.15s",
    willChange: "transform, opacity",
    minWidth: type === "floating" ? "32px" : "auto",
  };

  return {
    active: true,
    style,
  };
}
