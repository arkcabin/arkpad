import React from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { FileText } from "lucide-react";
import clsx from "clsx";

export const ContentBlock: React.FC<BlockComponentProps> = ({
  id: _id,
  props = {},
  styles = {},
  isEditing: _isEditing,
}) => {
  const {
    content = "<p>Standard prose writing content slot. Enter HTML or plain text strings.</p>",
    showLabelBorder = false,
    labelText = "",
  } = props;

  return (
    <div
      className={clsx(
        "w-full flex flex-col transition-all duration-150 relative bg-white dark:bg-neutral-950",
        showLabelBorder && "border border-neutral-300 dark:border-neutral-800 p-4 pt-6 rounded-none",
        styles.className
      )}
      style={{
        width: styles.width,
        height: styles.height,
        marginTop: styles.marginTop,
        marginRight: styles.marginRight,
        marginBottom: styles.marginBottom,
        marginLeft: styles.marginLeft,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
      }}
    >
      {/* HUD border label if specified */}
      {showLabelBorder && labelText && (
        <span className="absolute top-0 left-3 -translate-y-1/2 px-1.5 bg-white dark:bg-neutral-950 font-mono text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest pointer-events-none">
          {labelText}
        </span>
      )}

      {content ? (
        <div
          className="prose dark:prose-invert max-w-none text-xs text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed focus:outline-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="flex items-center justify-center p-4 border border-dashed border-neutral-300 dark:border-neutral-800 text-[10px] font-mono uppercase tracking-wide text-neutral-450 dark:text-neutral-500">
          Empty Content Block
        </div>
      )}
    </div>
  );
};

export const ContentBlockConfig: BlockConfig = {
  type: "content",
  name: "HUD Content prose",
  description: "Standard HTML content renderer with customizable HUD wrapper outlines.",
  icon: FileText,
  component: ContentBlock,
  defaultProps: {
    content: "<p>Standard prose writing content slot. Enter HTML or plain text strings.</p>",
    showLabelBorder: false,
    labelText: "",
  },
  defaultStyles: {
    width: "100%",
  },
  editorFields: [
    {
      name: "content",
      label: "HTML Content Source",
      type: "textarea",
      defaultValue: "<p>Standard prose writing content slot. Enter HTML or plain text strings.</p>",
      placeholder: "<p>Start writing...</p>",
    },
    {
      name: "showLabelBorder",
      label: "Show HUD Border Frame",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "labelText",
      label: "HUD Border Frame Title",
      type: "text",
      defaultValue: "",
      placeholder: "BLOCK DETAILS",
    },
  ],
};
