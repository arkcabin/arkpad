import { Extension } from "@arkpad/core";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Underline } from "@arkpad/extension-underline";
import { Strike } from "@arkpad/extension-strike";
import { Code } from "@arkpad/extension-code";
import { Link } from "@arkpad/extension-link";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { TaskList } from "@arkpad/extension-task-list";
import { HorizontalRule } from "@arkpad/extension-horizontal-rule";
import { Table } from "@arkpad/extension-table";
import { Superscript } from "@arkpad/extension-superscript";
import { Subscript } from "@arkpad/extension-subscript";
import { CodeBlock } from "@arkpad/extension-code-block";
import { Image } from "@arkpad/extension-image";
import { CharacterCount } from "@arkpad/core";
import { HighlighterTool } from "@arkpad/extension-highlighter";
import { EraserTool } from "@arkpad/extension-eraser";
import { createTextAlign } from "@arkpad/extension-alignment";
import { createMarkdownPaste } from "@arkpad/extension-markdown";
import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";

export const History = Extension.create({
  name: "history",
  addCommands() {
    return {
      undo: () => undo,
      redo: () => redo,
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
    };
  },
  addProseMirrorPlugins() {
    return [history()];
  },
});

export const Placeholder = Extension.create({
  name: "placeholder",
  addOptions() {
    return {
      placeholder: "Start writing...",
    };
  },
  addProseMirrorPlugins() {
    return [createPlaceholderPlugin(this.options.placeholder)];
  },
});

export const StarterKit = Extension.create({
  name: "starterKit",
  addOptions() {
    return {
      placeholder: "Start writing...",
      history: true,
      marks: true,
      nodes: true,
      table: true,
    };
  },
  addExtensions() {
    const extensions = [];

    if (this.options.history) extensions.push(History);
    if (this.options.placeholder)
      extensions.push(Placeholder.configure({ placeholder: this.options.placeholder }));

    // Solo Extensions
    extensions.push(Bold);
    extensions.push(Italic);
    extensions.push(Underline);
    extensions.push(Strike);
    extensions.push(Code);
    extensions.push(Link);
    extensions.push(Heading);
    extensions.push(Blockquote);
    extensions.push(BulletList);
    extensions.push(OrderedList);
    extensions.push(TaskList);
    extensions.push(HorizontalRule);
    extensions.push(Superscript);
    extensions.push(Subscript);
    extensions.push(CodeBlock);
    extensions.push(Image);
    extensions.push(HighlighterTool);
    extensions.push(EraserTool);
    extensions.push(createTextAlign());
    extensions.push(createMarkdownPaste());
    extensions.push(CharacterCount);

    if (this.options.table) {
      extensions.push(Table);
    }

    return extensions;
  },
});

export default StarterKit;
