import React from "react";
import { BlockComponentProps, BlockConfig, BlockRenderer } from "@arkpad/builder";
import { useDroppable } from "@dnd-kit/core";
import { FormInput } from "lucide-react";
import clsx from "clsx";

export const FormBlock: React.FC<BlockComponentProps> = ({
  id,
  props,
  styles = {},
  children,
  isEditing,
}) => {
  const {
    submitLabel = "Submit",
    layout = "flex",
    columns = 1,
    method = "POST",
    action = "",
  } = props;

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "form",
    },
  });

  const childIds = (children || []) as string[];
  const hasChildren = childIds.length > 0;

  const containerStyle = {
    ...(styles.gap ? { gap: styles.gap } : { gap: "1rem" }),
    ...(styles.padding ? { padding: styles.padding } : { padding: "1.5rem" }),
    ...(styles.backgroundColor ? { backgroundColor: styles.backgroundColor } : null),
  };

  const contentClasses = clsx(
    "w-full transition-all duration-150 border border-neutral-300 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10",
    layout === "grid" ? "grid" : "flex flex-col",
    isOver && "bg-neutral-100 dark:bg-neutral-900/50 border-neutral-450 dark:border-neutral-700"
  );

  const gridStyle = layout === "grid"
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  const renderChildren = () => {
    if (!hasChildren) {
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-neutral-300 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-500 text-xs font-mono py-10 w-full">
          <FormInput className="w-5 h-5 mb-2 opacity-55 animate-pulse" />
          <span>Empty Form Block</span>
          <span className="text-[10px] text-neutral-450 dark:text-neutral-600 mt-1">
            Drag form fields here
          </span>
        </div>
      );
    }

    return (
      <div style={{ ...containerStyle, ...gridStyle }} className={contentClasses}>
        {childIds.map((childId, index) => (
          <BlockRenderer
            key={childId}
            blockId={childId}
            index={index}
            parentId={id}
          />
        ))}
      </div>
    );
  };

  const submitButton = (
    <button
      type={isEditing ? "button" : "submit"}
      className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black text-xs font-bold font-mono tracking-wider uppercase rounded-none transition-colors focus:outline-none w-max"
    >
      {submitLabel}
    </button>
  );

  if (isEditing) {
    return (
      <div ref={setNodeRef} className="w-full flex flex-col gap-2">
        {renderChildren()}
        {hasChildren && submitButton}
      </div>
    );
  }

  return (
    <form
      method={method}
      action={action}
      onSubmit={(e) => {
        if (!action) {
          e.preventDefault();
          alert("Form submitted! Action method: " + method);
        }
      }}
      className="w-full flex flex-col gap-2"
    >
      {renderChildren()}
      {hasChildren && submitButton}
    </form>
  );
};

export const FormBlockConfig: BlockConfig = {
  type: "form",
  name: "Form Container",
  description: "Form block grouping input elements with a submit button.",
  icon: FormInput,
  component: FormBlock,
  defaultProps: {
    submitLabel: "Submit Form",
    layout: "flex",
    columns: 1,
    method: "POST",
    action: "",
  },
  editorFields: [
    {
      name: "submitLabel",
      label: "Submit Button Text",
      type: "text",
      defaultValue: "Submit Form",
    },
    {
      name: "layout",
      label: "Fields Layout",
      type: "select",
      options: [
        { label: "Vertical List (Flex)", value: "flex" },
        { label: "Grid Columns", value: "grid" },
      ],
      defaultValue: "flex",
    },
    {
      name: "columns",
      label: "Grid Columns Count",
      type: "number",
      defaultValue: 1,
    },
    {
      name: "method",
      label: "Form Method",
      type: "select",
      options: [
        { label: "POST", value: "POST" },
        { label: "GET", value: "GET" },
      ],
      defaultValue: "POST",
    },
    {
      name: "action",
      label: "Form Action URL",
      type: "text",
      defaultValue: "",
      placeholder: "/api/submit",
    },
  ],
};
