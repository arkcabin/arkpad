import React, { useCallback } from "react";
import { useArkpadContext } from "../editor/context";
import { useEditorState } from "../../hooks/useEditorState";
import { ArkpadEditorAPI } from "@arkpad/core";

export interface EditorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The name of the command to execute.
   */
  command: string;
  /**
   * Optional arguments for the command.
   * Elements in this array are spread as arguments to the command.
   * For example, args={[{ rows: 5 }]} passes one object as the first argument.
   */
  args?: unknown[];
  /**
   * Optional name of the node or mark to check for active state.
   */
  name?: string;
  /**
   * Optional attributes to check for active state.
   */
  attrs?: Record<string, unknown>;
  /**
   * Class name when the command is active.
   */
  activeClassName?: string;
}

/**
 * A reactive button component that automatically handles active and disabled states
 * based on the editor's current selection and schema.
 */
export const EditorButton: React.FC<EditorButtonProps> = ({
  command,
  args = [] as unknown[],
  name,
  attrs,
  children,
  className = "",
  activeClassName = "active",
  ...props
}) => {
  const editor = useArkpadContext();

  const selector = useCallback(
    (s: ArkpadEditorAPI) => ({
      isActive: s.isActive(name || command, attrs),
      canRun: s.canRunCommand(command, ...(args as any[])),
    }),
    [name, command, attrs, args]
  );

  const equalityFn = useCallback(
    (a: any, b: any) => a?.isActive === b?.isActive && a?.canRun === b?.canRun,
    []
  );

  // Reactively track editor state (active and executable)
  const state = useEditorState(editor, selector, equalityFn);

  const { isActive, canRun } = state ?? { isActive: false, canRun: false };

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        if (!editor) return;
        editor.runCommand(command, ...(args as any[]));
      }}
      disabled={!canRun || !!props.disabled || !editor}
      className={`${className} ${isActive ? activeClassName : ""}`.trim()}
      data-arkpad-ignore="true"
      {...props}
    >
      {children}
    </button>
  );
};
