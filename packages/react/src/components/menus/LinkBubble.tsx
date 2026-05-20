import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ArkpadEditorAPI } from "@arkpad/core";

export interface LinkBubbleProps {
  editor: ArkpadEditorAPI | null;
  visible: boolean;
  onClose: () => void;
  className?: string;
}

export function LinkBubble({ editor, visible, onClose, className = "" }: LinkBubbleProps) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  const updateCoords = useCallback(
    (ed: ArkpadEditorAPI, set: (c: { x: number; y: number } | null) => void) => {
      const sel = ed.getSelection();
      const onLink = ed.isActive("link");
      if (sel.empty && !onLink) {
        set(null);
        return;
      }
      const pos = sel.empty ? sel.from : undefined;
      const c = ed.getCoords(pos);
      if (c) set({ x: (c.left + c.right) / 2, y: c.top });
    },
    []
  );

  useEffect(() => {
    setCoords(null);
    if (!visible || !editor) return;
    updateCoords(editor, setCoords);
  }, [visible, editor]);

  useEffect(() => {
    if (!visible || !editor) return;
    const cb = () => updateCoords(editor, setCoords);
    return editor.subscribe(cb);
  }, [visible, editor]);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [visible]);

  useEffect(() => {
    if (!editor) return;
    if (visible) {
      setUrl((editor.getAttributes("link")?.href as string) || "");
    } else {
      setUrl("");
    }
  }, [visible, editor]);

  const applyLink = useCallback(() => {
    if (!editor || !url.trim()) return;
    editor.runCommand("setLink", url.trim());
    setCoords(null);
    onClose();
  }, [editor, url, onClose]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.runCommand("unsetLink");
    setCoords(null);
    onClose();
  }, [editor, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyLink();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [applyLink, onClose]
  );

  const [isLink, setIsLink] = useState(false);
  useEffect(() => {
    if (!editor) return;
    const cb = () => setIsLink(editor.isActive("link"));
    cb();
    return editor.subscribe(cb);
  }, [editor]);

  const show = visible && !!coords;

  const style: React.CSSProperties = show
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        transform: `translate3d(${coords!.x}px, ${coords!.y - 8}px, 0) translate(-50%, -100%)`,
      }
    : {
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        visibility: "hidden",
        pointerEvents: "none",
      };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div style={style} className={`ark-link-bubble ${className}`} data-arkpad-menu="true">
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste or type a URL..."
        className="ark-link-bubble-input"
      />
      <div className="ark-link-bubble-actions">
        <button onClick={applyLink} disabled={!url.trim()} className="ark-link-bubble-apply">
          Done
        </button>
        {isLink && (
          <button onClick={removeLink} className="ark-link-bubble-remove" title="Remove link">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="2" x2="22" y1="2" y2="22" />
              <path d="M10.41 10.41a2 2 0 0 0-.82 3.52" />
              <path d="M15.59 15.59a2 2 0 0 0 .82-3.52" />
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M12.68 19.68a5.1 5.1 0 0 1-7.54-.54l-3-3a5 5 0 0 1 7.07-7.07l.68-.68" />
            </svg>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
