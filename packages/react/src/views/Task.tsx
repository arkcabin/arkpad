import * as React from "react";
import { type NodeViewConstructor } from "@arkpad/core";
import { Checkbox } from "../components/ui/checkbox";
import { createReactNodeView, type ReactNodeViewProps } from "../node-view";

/**
 * A functional React component for the Task Item node.
 * This is rendered inside the editor using the createReactNodeView bridge.
 */
export const TaskItemComponent: React.FC<ReactNodeViewProps> = ({ node, updateAttributes }) => {
  const isChecked = node.attrs.checked;

  const handleChange = (checked: boolean | string) => {
    updateAttributes({ checked: checked === true });
  };

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center select-none cursor-pointer"
      contentEditable={false}
    >
      <Checkbox checked={isChecked} onCheckedChange={handleChange} size="md" />
    </div>
  );
};

/**
 * The TaskView constructor used by the editor.
 */
export const TaskView: NodeViewConstructor = createReactNodeView({
  name: "taskItem",
  component: TaskItemComponent,
  tagName: "li",
  className: "task-item flex items-start gap-2 list-none py-0 leading-none",
  contentDOM: true,
});
