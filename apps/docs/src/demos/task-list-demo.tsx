"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { TaskList as TaskListExtension } from "@arkpad/extension-task-list";
import { Engine } from "@arkpad/core";
import { CheckSquare } from "lucide-react";

export function TaskListDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, TaskListExtension],
    content: `
      <p>The task list extension allows you to create interactive to-do lists with checkboxes.</p>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true"><p>Completed task</p></li>
        <li data-type="taskItem" data-checked="false"><p>Uncompleted task</p></li>
        <li data-type="taskItem" data-checked="false"><p>Try clicking the checkbox!</p></li>
      </ul>
    `,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleTaskList"
            name="taskList"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <CheckSquare className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="arkpad-content-area focus:outline-none max-w-none"
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const taskListCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { TaskList } from "@arkpad/extension-task-list";
import { Engine } from "@arkpad/core";
import { CheckSquare } from "lucide-react";

export function TaskListDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, TaskList],
    content: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Task</p></li></ul>',
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleTaskList" name="taskList">
            <CheckSquare className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;
