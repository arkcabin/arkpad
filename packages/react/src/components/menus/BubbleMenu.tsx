import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArkpadEditorAPI } from "@arkpad/core";
import { BubbleMenu as BubbleMenuExtension } from "@arkpad/extension-bubble-menu";
import { EditorState } from "@arkpad/core";
import { EditorView } from "@arkpad/core";
import { useMenuPositioner } from "../../hooks/useMenuPositioner";
import { useEditorState } from "../../hooks/useEditorState";
import { EditorButton } from "../ui/EditorButton";
import { DropdownMenu } from "../ui/DropdownMenu";

export interface BubbleMenuProps {
  editor: ArkpadEditorAPI | null;
  children?: React.ReactNode;
  className?: string;
  offset?: number;
  shouldShow?: (props: {
    state: EditorState;
    view: EditorView;
    from: number;
    to: number;
    empty: boolean;
  }) => boolean;
  placement?: "center" | "top-right" | "top-left";
  /**
   * When true, renders a default formatting toolbar (bold, italic, underline, heading, link).
   * Ignored when children are provided.
   */
  defaultToolbar?: boolean;
}

interface DefaultToolbarProps {
  onLinkClick: () => void;
  hasLink: boolean;
  isOnlyLink: boolean;
}

const DefaultToolbar: React.FC<DefaultToolbarProps> = ({ onLinkClick, hasLink, isOnlyLink }) => {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[var(--menu-bg)] rounded-lg shadow-lg border border-[var(--menu-border)]">
      <EditorButton
        command="toggleBold"
        name="bold"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </EditorButton>
      <EditorButton
        command="toggleItalic"
        name="italic"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <line x1="19" x2="10" y1="4" y2="4" />
          <line x1="14" x2="5" y1="20" y2="20" />
          <line x1="15" x2="9" y1="4" y2="20" />
        </svg>
      </EditorButton>
      <EditorButton
        command="toggleUnderline"
        name="underline"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <path d="M6 4v6a6 6 0 0 0 12 0V4" />
          <line x1="4" x2="20" y1="20" y2="20" />
        </svg>
      </EditorButton>
      <EditorButton
        command="toggleStrike"
        name="strike"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <path d="M16 4H9a3 3 0 0 0-2.83 4" />
          <path d="M14 12a4 4 0 0 1 0 8H6" />
          <line x1="4" x2="20" y1="12" y2="12" />
        </svg>
      </EditorButton>
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      <DropdownMenu layout="vertical">
        <DropdownMenu.Trigger className="toolbar-btn text-[10px] font-bold px-1 min-w-[20px] gap-0.5">
          H<span className="text-[8px] opacity-60">▾</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" side="top" minWidth={140}>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <DropdownMenu.Item key={level} command="toggleHeading" name="heading" attrs={{ level }}>
              <span className="font-semibold text-[var(--menu-dim-text)] mr-2 w-5 text-right">
                H{level}
              </span>
              <span>Heading {level}</span>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator />
          <DropdownMenu.Item command="setParagraph" name="paragraph">
            <span className="text-[var(--menu-dim-text)] mr-2 w-5 text-right font-mono">¶</span>
            <span>Paragraph</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      {!isOnlyLink ? (
        <button
          onClick={onLinkClick}
          className="toolbar-btn"
          data-arkpad-ignore="true"
          title="Set Link"
        >
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
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
      ) : (
        <>
          <button
            onClick={onLinkClick}
            className="toolbar-btn"
            data-arkpad-ignore="true"
            title="Edit Link"
          >
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <EditorButton
            command="unsetLink"
            name="link"
            className="toolbar-btn"
            activeClassName="active"
            title="Unlink"
          >
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
          </EditorButton>
        </>
      )}
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      <EditorButton
        command="toggleBulletList"
        name="bulletList"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <line x1="8" x2="21" y1="6" y2="6" />
          <line x1="8" x2="21" y1="12" y2="12" />
          <line x1="8" x2="21" y1="18" y2="18" />
          <line x1="3" x2="3.01" y1="6" y2="6" />
          <line x1="3" x2="3.01" y1="12" y2="12" />
          <line x1="3" x2="3.01" y1="18" y2="18" />
        </svg>
      </EditorButton>
      <EditorButton
        command="toggleOrderedList"
        name="orderedList"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <line x1="10" x2="21" y1="6" y2="6" />
          <line x1="10" x2="21" y1="12" y2="12" />
          <line x1="10" x2="21" y1="18" y2="18" />
          <path d="M4 6h1v4" />
          <path d="M4 10h2" />
          <path d="M6 18H4c0-1 .5-2 2-2 .7 0 1.3.3 1.3.7s-.3.7-1.3 1.3l-1.7.7" />
        </svg>
      </EditorButton>
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      <EditorButton
        command="toggleBlockquote"
        name="blockquote"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </EditorButton>
      <EditorButton
        command="toggleCode"
        name="code"
        className="toolbar-btn"
        activeClassName="active"
      >
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
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </EditorButton>
    </div>
  );
};

interface LinkInputProps {
  initialValue: string;
  onApply: (url: string) => void;
  onCancel: () => void;
}

const LinkInput: React.FC<LinkInputProps> = ({ initialValue, onApply, onCancel }) => {
  const [value, setValue] = React.useState(initialValue || "");

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-[var(--menu-bg)] rounded-lg shadow-lg border border-[var(--menu-border)] min-w-[320px]">
      <div className="flex-1 flex items-center gap-2 px-2 py-1 bg-[rgba(255,255,255,0.05)] rounded border border-[rgba(255,255,255,0.1)]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <input
          autoFocus
          className="bg-transparent border-none outline-none text-xs text-[var(--menu-text)] flex-1 placeholder:opacity-30"
          placeholder="Paste link or search..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply(value);
            if (e.key === "Escape") onCancel();
          }}
        />
      </div>
      <button
        onClick={() => onApply(value)}
        className="px-2 py-1 bg-[var(--brand-primary)] text-white text-[10px] font-bold rounded hover:opacity-90 transition-opacity"
      >
        Apply
      </button>
      <button
        onClick={onCancel}
        className="toolbar-btn p-1"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

/**
 * BubbleMenu component that leverages the Headless Menu Engine in @arkpad/core.
 * It provides zero-flicker, GPU-accelerated positioning.
 * When `defaultToolbar` is true and no children are provided, a default formatting toolbar is rendered.
 */
export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  children,
  className = "",
  offset = 12,
  shouldShow,
  placement = "center",
  defaultToolbar = false,
}) => {
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const { hasLink, isOnlyLink } = useEditorState(editor, (s: ArkpadEditorAPI) => {
    const active = s.isActive("link");
    if (!active) return { hasLink: false, isOnlyLink: false };

    const { state } = s.getView();
    const { from, to, empty } = state.selection;

    // If cursor is inside a link, it's effectively "only link" for editing purposes
    if (empty) return { hasLink: true, isOnlyLink: true };

    const markType = state.schema.marks.link;
    let isFullCoverage = true;

    state.doc.nodesBetween(from, to, (node) => {
      if (node.isText && !node.marks.some((m) => m.type === markType)) {
        isFullCoverage = false;
        return false;
      }
      return true;
    });

    return { hasLink: true, isOnlyLink: isFullCoverage };
  }) || { hasLink: false, isOnlyLink: false };

  const { ref, style, active } = useMenuPositioner({
    editor,
    extensionName: "bubbleMenu",
    type: "bubble",
    offset,
    placement,
  });

  // Reset link input when menu becomes inactive
  useEffect(() => {
    if (!active) {
      setShowLinkInput(false);
    }
  }, [active]);

  useEffect(() => {
    if (!editor) return;

    const extension = BubbleMenuExtension.configure({
      shouldShow: shouldShow as any,
    });

    editor.registerExtension(extension);

    return () => {
      if (editor && extension.name) {
        try {
          editor.unregisterExtension(extension.name);
        } catch (error) {
          console.warn("BubbleMenu cleanup error:", error);
        }
      }
    };
  }, [editor, shouldShow]);

  if (typeof document === "undefined" || !active) return null;

  const handleApplyLink = (url: string) => {
    if (editor) {
      editor.runCommand("setLink", url);
      setShowLinkInput(false);
    }
  };

  const handleCancelLink = () => {
    setShowLinkInput(false);
  };

  const renderContent = () => {
    if (children) return children;

    if (defaultToolbar) {
      if (showLinkInput) {
        const initialUrl = editor?.getAttributes("link")?.href || "";
        return (
          <LinkInput
            initialValue={initialUrl}
            onApply={handleApplyLink}
            onCancel={handleCancelLink}
          />
        );
      }
      return (
        <DefaultToolbar
          onLinkClick={() => setShowLinkInput(true)}
          hasLink={hasLink}
          isOnlyLink={isOnlyLink}
        />
      );
    }

    return null;
  };

  return createPortal(
    <div ref={ref} style={style} className={className} data-arkpad-menu="true">
      {renderContent()}
    </div>,
    document.body
  );
};
