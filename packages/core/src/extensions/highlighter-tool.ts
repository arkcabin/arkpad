import { Plugin, PluginKey } from "prosemirror-state";
import { Extension } from "./Extension";

export interface HighlighterToolOptions {
  /**
   * The class name applied to the editor when the highlighter tool is active.
   */
  activeClass: string;
}

export interface HighlighterToolStorage {
  /**
   * Whether the highlighter tool is currently active.
   * This is kept in sync with the PluginState for reactivity.
   */
  active: boolean;
}

export const highlighterToolPluginKey = new PluginKey("highlighter-tool");

export const HighlighterTool = Extension.create<HighlighterToolOptions, HighlighterToolStorage>({
  name: "highlighterTool",

  addOptions() {
    return {
      activeClass: "ark-highlighter-mode",
    };
  },

  addStorage: () => ({
    active: false,
  }),

  addCommands() {
    return {
      setHighlighterTool: (options: { active: boolean }) => (props: any) => {
        const { state, dispatch } = props;
        if (dispatch) {
          const tr = state.tr;
          tr.setMeta(highlighterToolPluginKey, options.active);
          if (options.active) {
            tr.setMeta("highlighter-tool-active", true);
          }
          dispatch(tr);
        }
        return true;
      },
      toggleHighlighterTool: () => (props: any) => {
        const { state, dispatch } = props;
        const pluginState = highlighterToolPluginKey.getState(state);
        const nextActive = !pluginState?.active;

        if (dispatch) {
          const tr = state.tr;
          tr.setMeta(highlighterToolPluginKey, nextActive);
          if (nextActive) {
            tr.setMeta("highlighter-tool-active", true);
          }
          dispatch(tr);
        }
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    const { activeClass } = this.options;

    return [
      new Plugin({
        key: highlighterToolPluginKey,
        state: {
          init() {
            return { active: false };
          },
          apply(tr, value) {
            const meta = tr.getMeta(highlighterToolPluginKey);
            if (typeof meta === "boolean") {
              return { active: meta };
            }
            // Deactivate if any other painting tool is activated or if explicitly requested
            if (tr.getMeta("eraser-tool-active") === true || tr.getMeta("deactivate-painting-tools") === true) {
              return { active: false };
            }
            return value;
          },
        },
        view: () => {
          return {
            update: (view) => {
              const state = highlighterToolPluginKey.getState(view.state);
              if (state && storage.active !== state.active) {
                storage.active = state.active;
              }
            },
          };
        },
        props: {
          attributes: (state) => {
            const pluginState = highlighterToolPluginKey.getState(state);
            const attrs: Record<string, string> = {};
            if (pluginState?.active) {
              attrs.class = activeClass;
              attrs["data-ark-mode"] = "highlighter";
            }
            return attrs;
          },
        },
        appendTransaction: (transactions, oldState, newState) => {
          const pluginState = highlighterToolPluginKey.getState(newState);
          if (!pluginState?.active) return null;

          // If any transaction changed the selection or explicitly triggered an update
          const selectionChanged = transactions.some(tr => tr.selectionSet || tr.getMeta(highlighterToolPluginKey) !== undefined);
          if (!selectionChanged) return null;

          // Ignore our own highlight application to prevent loops
          if (transactions.some(tr => tr.getMeta("highlighter-tool-apply"))) return null;

          const { from, to, empty } = newState.selection;
          if (empty) return null;

          const highlightMark = newState.schema.marks.highlight;
          if (!highlightMark) return null;

          // Check if mark is missing anywhere in selection
          let needsMark = false;
          newState.doc.nodesBetween(from, to, (node) => {
            if (node.isText && !highlightMark.isInSet(node.marks)) {
              needsMark = true;
              return false;
            }
            return true;
          });

          if (!needsMark) return null;

          // Apply mark and PRESERVE selection
          const tr = newState.tr;
          tr.addMark(from, to, highlightMark.create());
          tr.setMeta("highlighter-tool-apply", true);
          return tr;
        },
      }),
    ];
  },
});
