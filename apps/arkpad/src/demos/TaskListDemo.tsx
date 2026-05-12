import { TaskList as TaskListExtension } from "@arkpad/extension-task-list";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { CheckSquare } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function TaskListDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, TaskListExtension],
    content: `
      <h1>Task Lists</h1>
      <p>The task list extension allows you to create interactive to-do lists with checkboxes.</p>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true"><p>Completed task</p></li>
        <li data-type="taskItem" data-checked="false"><p>Uncompleted task</p></li>
        <li data-type="taskItem" data-checked="false"><p>Try clicking the checkbox!</p></li>
      </ul>
      <p>You can also use markdown shortcuts: type <code>[ ] </code> followed by a space to start a list.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Rich Content"
      title="Task List"
      description="Interactive to-do lists with functional checkboxes."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleTaskList"
              name="taskList"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Toggle Task List"
            >
              <CheckSquare className="w-4 h-4" />
            </EditorButton>
          </div>
          <div className="p-8">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}
