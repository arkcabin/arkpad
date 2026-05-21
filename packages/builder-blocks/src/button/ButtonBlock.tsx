import React from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { Play } from "lucide-react";
import clsx from "clsx";

export const ButtonBlock: React.FC<BlockComponentProps> = ({
  id: _id,
  props = {},
  styles = {},
  interactions = [],
  isEditing,
  updateBlock: _updateBlock,
}) => {
  const {
    text = "Button",
    variant = "solid",
    size = "default",
    disabled = false,
    actionType = "button",
  } = props;

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }

    // Handle interactions (e.g. alert, navigate)
    if (interactions && interactions.length > 0) {
      const clickInteraction = interactions.find(
        (i) => i.trigger === "click" || i.trigger === "row_click"
      );
      if (clickInteraction) {
        const { action, settings = {} } = clickInteraction;
        if (action === "alert") {
          alert(settings.description || "Action triggered!");
        } else if (action === "navigate") {
          const target = settings.target || "_self";
          if (settings.url) {
            window.open(settings.url, target);
          }
        }
      }
    }
  };

  // Premium HUD style variants: sharp borders (rounded-none), monochrome neutral borders, high contrast
  const variantClasses = {
    solid: "bg-neutral-900 text-white hover:bg-neutral-800 border border-transparent dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200",
    outline: "bg-transparent text-neutral-900 hover:bg-neutral-50 border border-neutral-300 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:border-neutral-800",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900/60 border border-transparent",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-[10px] tracking-wider uppercase font-mono",
    default: "px-5 py-2.5 text-xs tracking-widest uppercase font-mono font-semibold",
    lg: "px-8 py-3.5 text-sm tracking-widest uppercase font-mono font-bold",
  };

  return (
    <button
      type={actionType as "button" | "submit" | "reset"}
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center text-center transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-none w-full",
        variantClasses[variant as keyof typeof variantClasses] || variantClasses.solid,
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
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
      <span>{text}</span>
    </button>
  );
};

export const ButtonBlockConfig: BlockConfig = {
  type: "button",
  name: "Action Button",
  description: "Monochrome HUD-style button for forms and navigation.",
  icon: Play,
  component: ButtonBlock,
  defaultProps: {
    text: "Button Label",
    variant: "solid",
    size: "default",
    actionType: "button",
    disabled: false,
  },
  defaultStyles: {
    width: "auto",
  },
  editorFields: [
    {
      name: "text",
      label: "Label Text",
      type: "text",
      defaultValue: "Button Label",
    },
    {
      name: "variant",
      label: "Style Variant",
      type: "select",
      options: [
        { label: "Solid HUD", value: "solid" },
        { label: "Outline", value: "outline" },
        { label: "Ghost Link", value: "ghost" },
      ],
      defaultValue: "solid",
    },
    {
      name: "size",
      label: "Button Size",
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Default", value: "default" },
        { label: "Large", value: "lg" },
      ],
      defaultValue: "default",
    },
    {
      name: "actionType",
      label: "Button Type",
      type: "select",
      options: [
        { label: "Trigger Button", value: "button" },
        { label: "Submit Form", value: "submit" },
        { label: "Reset Form", value: "reset" },
      ],
      defaultValue: "button",
    },
    {
      name: "disabled",
      label: "Initially Disabled",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};
