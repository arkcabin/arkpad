import { Extension, MenuConfig } from "@arkpad/core";

export interface FloatingMenuOptions {
  shouldShow?: MenuConfig["shouldShow"];
}

/**
 * Headless Floating Menu extension.
 * This extension now leverages the Global Menu Engine in @arkpad/core
 * for "Super Ultra Fast" zero-flicker positioning.
 */
export const FloatingMenu = Extension.create<FloatingMenuOptions>({
  name: "floatingMenu",

  addOptions() {
    return {
      shouldShow: undefined,
    };
  },

  addMenu() {
    return {
      type: "floating",
      shouldShow:
        this.options.shouldShow ||
        (({ state }) => {
          const { $from, empty } = state.selection;
          const isParagraph = $from.parent.type.name === "paragraph";
          const isEmpty = $from.parent.content.size === 0;
          return empty && isParagraph && isEmpty;
        }),
      priority: 100,
    };
  },
});
