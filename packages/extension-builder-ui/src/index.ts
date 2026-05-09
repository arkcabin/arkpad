import { Extension } from "@arkpad/core";
import { Plugin, PluginKey } from "prosemirror-state";

const builderUIKey = new PluginKey("builderUI");

/**
 * BuilderUI Extension - ABSOLUTE PURGE VERSION
 * This extension now only handles event logic if needed, 
 * but ALL visual UI elements (toolbar, borders, rings) have been REMOVED.
 */
export const BuilderUI = Extension.create({
  name: "builderUI",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: builderUIKey,
        props: {
          // All visual decorations (hover borders, selection rings) have been PURGED.
          decorations: () => null,
          
          handleDOMEvents: {
            // All toolbar/floating menu logic has been REMOVED.
          }
        },
      }),
    ];
  },
});
