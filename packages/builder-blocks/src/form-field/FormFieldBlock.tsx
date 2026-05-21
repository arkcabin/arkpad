import React from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { Minus } from "lucide-react";

export const FormFieldBlock: React.FC<BlockComponentProps> = ({
  id,
  props,
  styles: _styles,
  isEditing,
}) => {
  const {
    label = "Field Label",
    name = "field_name",
    placeholder = "Enter value...",
    fieldType = "text",
    options = [],
    required = false,
    helperText = "",
  } = props;

  const inputId = `field-${id}`;

  const renderInput = () => {
    const commonClasses = "w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-neutral-900 dark:focus:border-neutral-100 focus:outline-none rounded-none transition-colors duration-150";

    if (fieldType === "textarea") {
      return (
        <textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          required={required}
          disabled={isEditing}
          rows={3}
          className={commonClasses}
        />
      );
    }

    if (fieldType === "select") {
      return (
        <select
          id={inputId}
          name={name}
          required={required}
          disabled={isEditing}
          className={commonClasses}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label || opt.value}
            </option>
          ))}
        </select>
      );
    }

    if (fieldType === "checkbox") {
      return (
        <div className="flex items-center gap-2.5">
          <input
            id={inputId}
            type="checkbox"
            name={name}
            required={required}
            disabled={isEditing}
            className="w-4 h-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-900 focus:ring-0 focus:ring-offset-0 rounded-none cursor-pointer"
          />
          {label && (
            <label
              htmlFor={inputId}
              className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-450 cursor-pointer select-none"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
        </div>
      );
    }

    // Default text, email, password, date, etc.
    const resolvedType = ["email", "password", "number", "date"].includes(fieldType)
      ? fieldType
      : "text";

    return (
      <input
        id={inputId}
        type={resolvedType}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={isEditing}
        className={commonClasses}
      />
    );
  };

  if (fieldType === "checkbox") {
    return (
      <div className="w-full font-mono py-1.5">
        {renderInput()}
        {helperText && (
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 leading-normal">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full font-mono flex flex-col gap-1.5 py-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-455"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {renderInput()}
      {helperText && (
        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
};

export const FormFieldBlockConfig: BlockConfig = {
  type: "form-field",
  name: "Form Input Field",
  description: "Form input elements (text, number, email, select, checkbox).",
  icon: Minus,
  component: FormFieldBlock,
  defaultProps: {
    label: "Field Label",
    name: "field_name",
    placeholder: "Enter value...",
    fieldType: "text",
    required: false,
    helperText: "",
    options: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
    ],
  },
  editorFields: [
    {
      name: "label",
      label: "Field Label",
      type: "text",
      defaultValue: "Field Label",
    },
    {
      name: "name",
      label: "Field Name / Key",
      type: "text",
      defaultValue: "field_name",
    },
    {
      name: "fieldType",
      label: "Input Type",
      type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
        { label: "Email", value: "email" },
        { label: "Password", value: "password" },
        { label: "Date", value: "date" },
        { label: "Checkbox", value: "checkbox" },
        { label: "Dropdown Select", value: "select" },
        { label: "Text Area", value: "textarea" },
      ],
      defaultValue: "text",
    },
    {
      name: "placeholder",
      label: "Placeholder Text",
      type: "text",
      defaultValue: "Enter value...",
    },
    {
      name: "required",
      label: "Required Field",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "helperText",
      label: "Helper / Hint Text",
      type: "text",
      defaultValue: "",
    },
  ],
};
