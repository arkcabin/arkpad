import React from "react";
import { useArkpadContext } from "./context";
import { useEditorState } from "./useEditorState";

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

  // Reactively track if the command is active
  const isActive = useEditorState(editor, (s) => s.isActive(name || command, attrs)) ?? false;

  // Reactively track if the command can be executed
  const canRun =
    useEditorState(editor, (s) => s.canRunCommand(command, ...(args as any[]))) ?? false;

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => editor.runCommand(command, ...(args as any[]))}
      disabled={!canRun || props.disabled}
      className={`${className} ${isActive ? activeClassName : ""}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
