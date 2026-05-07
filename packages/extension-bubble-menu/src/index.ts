import { Extension, MenuConfig } from "@arkpad/core";

export interface BubbleMenuOptions {
  shouldShow?: MenuConfig["shouldShow"];
}

/**
 * Headless Bubble Menu extension.
 * This extension now leverages the Global Menu Engine in @arkpad/core
 * for "Super Ultra Fast" zero-flicker positioning.
 */
export const BubbleMenu = Extension.create<BubbleMenuOptions>({
  name: "bubbleMenu",

  addOptions() {
    return {
      shouldShow: undefined,
    };
  },

  addMenu() {
    return {
      type: "bubble",
      shouldShow: this.options.shouldShow || (({ editor, empty }: any) => !empty && editor.isFocused()),
      priority: 100,
    };
  },
});
