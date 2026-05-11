import { useEditorState } from "./useEditorState";
import { ArkpadEditorAPI, GlobalMenuStorage } from "@arkpad/core";
import { CSSProperties, useEffect, useRef } from "react";

export interface UseMenuPositionerProps {
  editor: ArkpadEditorAPI | null;
  extensionName: string;
  type: "bubble" | "floating";
  offset?: number;
  placement?: "center" | "top-right" | "top-left";
}

export function useMenuPositioner({
  editor,
  extensionName,
  type,
  offset = 2,
  placement = "center",
}: UseMenuPositionerProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const menu = menuState?.menu;
  const isActive = !!(menuState && menu && menu.active && menu.coords);
  const coords = menu?.coords;
  const isLocked = menuState?.isLocked ?? false;
  const isFirstShow = menu?.isFirstShow ?? false;

  useEffect(() => {
    if (!editor || !menuRef.current || typeof window === "undefined" || !isActive || !coords) {
      return;
    }

    let frame = 0;

    const updatePosition = () => {
      const node = menuRef.current;
      if (!node) return;

      const editorRect = editor.element.getBoundingClientRect();
      const editorScrollTop = editor.element.scrollTop;
      const editorScrollLeft = editor.element.scrollLeft;

      const viewportCoords = {
        top: editorRect.top + coords.top - editorScrollTop,
        left: editorRect.left + coords.left - editorScrollLeft,
        bottom: editorRect.top + coords.bottom - editorScrollTop,
        right: editorRect.left + coords.right - editorScrollLeft,
      };

      let x: number;
      let y: number;

      if (type === "bubble") {
        if (placement === "top-right") {
          x = viewportCoords.right;
          y = viewportCoords.top - offset;
        } else {
          const centerX = (viewportCoords.left + viewportCoords.right) / 2;
          x = centerX;
          y = viewportCoords.top - offset;
        }
      } else {
        const floatingPadding = 4;
        x = viewportCoords.left - floatingPadding;
        y = viewportCoords.top;
      }

      const transformX = type === "bubble" 
        ? (placement === "top-right" ? "-100%" : "-50%") 
        : "0";
      const transformY = type === "bubble" ? "-100%" : "-50%";

      node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(${transformX}, ${transformY})`;
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updatePosition();
      });
    };

    updatePosition();
    window.addEventListener("scroll", scheduleUpdate, true);
    window.addEventListener("resize", scheduleUpdate);
    editor.element.addEventListener("scroll", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
      editor.element.removeEventListener("scroll", scheduleUpdate);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [
    coords?.bottom,
    coords?.left,
    coords?.right,
    coords?.top,
    editor,
    isActive,
    offset,
    type,
  ]);

  if (!isActive) {
    return {
      active: false,
      ref: menuRef,
      style: {
        visibility: "hidden" as const,
        opacity: 0,
        pointerEvents: "none" as const,
        position: "fixed" as const,
      } as CSSProperties,
    };
  }

  // Position menus in viewport space so they stay aligned even when rendered
  // outside the editor DOM tree (for example in portals or demo wrappers).
  const style: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transform: "translate3d(-9999px, -9999px, 0)",
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
    ref: menuRef,
    style,
  };
}
