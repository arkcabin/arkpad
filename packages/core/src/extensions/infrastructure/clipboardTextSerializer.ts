import { Plugin, PluginKey } from "prosemirror-state";
import { Extension } from "../../sdk/Extension";

export type ClipboardTextSerializerOptions = {
  blockSeparator?: string;
};

/**
 * ClipboardTextSerializer extension - Handles plain text clipboard operations.
 * Mirrors Tiptap's ClipboardTextSerializer extension.
 */
export const ClipboardTextSerializer = Extension.create<ClipboardTextSerializerOptions>({
  name: "clipboardTextSerializer",

  addOptions() {
    return {
      blockSeparator: undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { state } = this.editor!.getView();
            const { doc, selection } = state;
            const { from, to } = selection;
            const separator = this.options.blockSeparator !== undefined ? this.options.blockSeparator : "\n\n";
            
            return doc.textBetween(from, to, separator);
          },
        },
      }),
    ];
  },
});
