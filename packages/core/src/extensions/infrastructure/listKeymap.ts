import { Extension } from "../../sdk/Extension";

/**
 * ListKeymap extension - Smart list keyboard navigation.
 * Tab/Shift-Tab for indent/outdent, Backspace to convert list item to paragraph.
 */
export const ListKeymap = Extension.create({
  name: "listKeymap",

  addKeyboardShortcuts() {
    return {
      Tab: () =>
        this.editor!.runCommand("first", [
          ({ editor }: any) => editor.commands.sinkListItem?.("listItem"),
          ({ editor }: any) => editor.commands.sinkListItem?.("taskItem"),
        ]),

      "Shift-Tab": () =>
        this.editor!.runCommand("first", [
          ({ editor }: any) => editor.commands.liftListItem?.("listItem"),
          ({ editor }: any) => editor.commands.liftListItem?.("taskItem"),
        ]),

      Backspace: () =>
        this.editor!.runCommand("first", [
          ({ editor }: any) => 
            editor.commands.command(({ state }: any) => {
              const { $anchor } = state.selection;
              const { nodeBefore } = $anchor;
              
              if (nodeBefore || $anchor.parentOffset > 0) {
                return false;
              }

              const parent = $anchor.parent;
              if (!parent.type.name.includes("listItem") && !parent.type.name.includes("taskItem")) {
                return false;
              }
              
              // Use liftListItem to safely outdent/convert the item without losing children
              return editor.runCommand("liftListItem", parent.type.name);
            }),
        ]),
    };
  },
});
