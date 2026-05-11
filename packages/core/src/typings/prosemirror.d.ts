declare module "prosemirror-placeholder" {
  import { Plugin } from "prosemirror-state";
  export function placeholder(text: string): Plugin;
}
