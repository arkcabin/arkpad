import { Plugin, PluginKey, Selection } from "prosemirror-state";
import { Extension } from "../../sdk/Extension";

/**
 * Keymap extension - Comprehensive keyboard shortcuts.
 * Mirrors Tiptap's Keymap extension.
 */
export const Keymap = Extension.create({
  name: "keymap",

  addKeyboardShortcuts() {
    const handleBackspace = () =>
      this.editor!.runCommand("first", [
        ({ editor }: any) => editor.commands.undoInputRule?.(),

        // Maybe convert first text block node to default node
        ({ editor }: any) =>
          editor.commands.command(({ tr }: any) => {
            const { selection, doc } = tr;
            const { empty, $anchor } = selection;
            const { pos, parent } = $anchor;
            
            if (
              !empty ||
              !parent.type.isTextblock ||
              parent.textContent.length ||
              Selection.atStart(doc).from !== pos ||
              parent.type.name === "paragraph"
            ) {
              return false;
            }

            return editor.commands.clearNodes();
          }),

        ({ editor }: any) => editor.commands.deleteSelection(),
        ({ editor }: any) => editor.commands.joinBackward(),
        ({ editor }: any) => editor.commands.selectNodeBackward(),
      ]);

    const handleDelete = () =>
      this.editor!.runCommand("first", [
        ({ editor }: any) => editor.commands.deleteSelection(),
        ({ editor }: any) => editor.commands.deleteCurrentNode?.(),
        ({ editor }: any) => editor.commands.joinForward(),
        ({ editor }: any) => editor.commands.selectNodeForward(),
      ]);

    const handleEnter = () =>
      this.editor!.runCommand("first", [
        ({ editor }: any) => editor.commands.newlineInCode?.(),
        ({ editor }: any) => editor.commands.createParagraphNear?.(),
        ({ editor }: any) => editor.commands.liftEmptyBlock?.(),
        ({ editor }: any) => editor.commands.splitBlock(),
      ]);

    return {
      Enter: handleEnter,
      "Mod-Enter": () => this.editor!.runCommand("exitCode"),
      Backspace: handleBackspace,
      "Mod-Backspace": handleBackspace,
      "Shift-Backspace": handleBackspace,
      Delete: handleDelete,
      "Mod-Delete": handleDelete,
      "Mod-a": () => this.editor!.runCommand("selectAll"),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("clearDocument"),
        appendTransaction: (transactions, oldState, newState) => {
          if (transactions.some(tr => tr.getMeta("composition"))) {
            return;
          }

          const docChanges = transactions.some(transaction => transaction.docChanged) && !oldState.doc.eq(newState.doc);
          const ignoreTr = transactions.some(transaction => transaction.getMeta("preventClearDocument"));

          if (!docChanges || ignoreTr) {
            return;
          }

          const { empty, from, to } = oldState.selection;
          const allFrom = Selection.atStart(oldState.doc).from;
          const allEnd = Selection.atEnd(oldState.doc).to;
          const allWasSelected = from === allFrom && to === allEnd;

          if (empty || !allWasSelected) {
            return;
          }

          const isEmpty = newState.doc.content.size <= 2;
          if (!isEmpty) {
            return;
          }

          const tr = newState.tr;
          this.editor!.chain()
            .command(({ editor }) => editor.runCommand("clearNodes"))
            .setMeta("preventClearDocument", true)
            .run();

          if (!tr.steps.length) {
            return;
          }

          return tr;
        },
      }),
    ];
  },
});
