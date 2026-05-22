import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useArkpadContext } from "../editor/context";

interface DropdownContextType {
  open: boolean;
  setOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  layout: "vertical" | "horizontal";
}

const DropdownContext = createContext<DropdownContextType | null>(null);

interface DropdownMenuProps {
  children: React.ReactNode;
  layout?: "vertical" | "horizontal";
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  className?: string;
  minWidth?: number;
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  command?: string;
  name?: string;
  attrs?: Record<string, unknown>;
  args?: unknown[];
  activeClassName?: string;
}

function DropdownRoot({ children, layout = "vertical" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef, layout }}>
      {children}
    </DropdownContext.Provider>
  );
}

function DropdownTrigger({ children, className = "" }: DropdownTriggerProps) {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownTrigger must be used inside DropdownMenu");

  return (
    <span
      ref={ctx.triggerRef}
      className={`cursor-pointer select-none inline-flex items-center ${className}`}
      onMouseDown={(e) => {
        e.preventDefault();
        ctx.setOpen((p) => !p);
      }}
    >
      {children}
    </span>
  );
}

function DropdownContent({
  children,
  align = "start",
  side = "bottom",
  className = "",
  minWidth = 130,
}: DropdownContentProps) {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownContent must be used inside DropdownMenu");
  const { open, triggerRef, contentRef, layout } = ctx;

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const node = contentRef.current;
    if (!node) return;

    const rect = trigger.getBoundingClientRect();
    const contentW = node.offsetWidth || minWidth;
    const contentH = node.offsetHeight || 0;
    const gap = 4;

    let top = side === "bottom" ? rect.bottom + gap : rect.top - contentH - gap;
    let left =
      align === "start"
        ? rect.left
        : align === "end"
          ? rect.right - contentW
          : rect.left + rect.width / 2 - contentW / 2;

    if (top < 4) top = 4;
    if (left < 4) left = 4;
    const maxLeft = window.innerWidth - contentW - 4;
    if (left > maxLeft) left = Math.max(4, maxLeft);

    node.style.top = `${top}px`;
    node.style.left = `${left}px`;
  }, [open, align, side, triggerRef, contentRef, minWidth]);

  useEffect(() => {
    if (!open) return;
    const close = () => ctx.setOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open, ctx]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div
      ref={contentRef}
      data-arkpad-ignore="true"
      style={{ position: "fixed", top: 0, left: 0, zIndex: 1001 }}
      className={`bg-[var(--menu-bg)] rounded-lg shadow-lg border border-[var(--menu-border)] p-1 ${
        layout === "vertical" ? "flex flex-col" : "flex flex-row items-center gap-0.5"
      } ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}

function DropdownItem({
  command,
  name,
  attrs,
  args = [],
  children,
  className = "",
  activeClassName = "",
  ...props
}: DropdownItemProps) {
  const ctx = useContext(DropdownContext);
  const editor = useArkpadContext();
  if (!ctx) throw new Error("DropdownItem must be used inside DropdownMenu");
  const { setOpen, layout } = ctx;
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const targetName = name || command;
    if (!targetName) return;
    const check = () => setIsActive(editor.isActive(targetName, attrs ?? {}));
    check();
    return editor.subscribe(check);
  }, [editor, command, name, attrs]);

  const handleClick = useCallback(() => {
    if (command && editor) {
      const cmdArgs = args.length > 0 ? args : attrs ? [attrs] : [];
      editor.runCommand(command, ...cmdArgs);
    }
    setOpen(false);
  }, [command, args, attrs, editor, setOpen]);

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleClick}
      data-arkpad-ignore="true"
      className={`text-xs rounded transition-colors whitespace-nowrap ${
        layout === "vertical" ? "w-full text-left px-3 py-1.5" : "px-2 py-1"
      } hover:bg-[var(--menu-item-hover)] ${
        isActive
          ? activeClassName || "bg-[var(--menu-item-active-bg)] text-[var(--menu-item-active-text)]"
          : "text-[var(--menu-item-text)]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownSeparator({ className = "" }: { className?: string }) {
  const ctx = useContext(DropdownContext);
  const layout = ctx?.layout || "vertical";

  return (
    <div
      className={`bg-[var(--menu-separator)] ${
        layout === "vertical" ? "h-px w-full my-1" : "w-px h-4 mx-1"
      } ${className}`}
    />
  );
}

export const DropdownMenu = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Separator: DropdownSeparator,
});
