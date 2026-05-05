import { Plugin, PluginKey } from "prosemirror-state";
import { Extension } from "./Extension";

/**
 * FocusEvents extension - Emits focus and blur events to registered extensions.
 * Mirrors Tiptap's FocusEvents extension.
 */
export const FocusEvents = Extension.create({
  name: "focusEvents",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("focusEvents"),
        props: {
          handleDOMEvents: {
            focus: () => {
              if (this.editor && (this.editor as any).eventHooks?.onFocus) {
                for (const ext of (this.editor as any).eventHooks.onFocus) {
                  ext.onFocus?.();
                }
              }
              return false;
            },
            blur: () => {
              if (this.editor && (this.editor as any).eventHooks?.onBlur) {
                for (const ext of (this.editor as any).eventHooks.onBlur) {
                  ext.onBlur?.();
                }
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
