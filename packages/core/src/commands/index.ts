import { type MarkType, type NodeType } from "prosemirror-model";
import { type ArkpadCommand } from "../types";

import { insertNode } from "./insertNode";
import { setTextAlign } from "./setTextAlign";
import { toggleBlock } from "./toggleBlock";
import { toggleList } from "./toggleList";
import { toggleMark } from "./toggleMark";
import { updateAttributes } from "./updateAttributes";

export {
  insertNode,
  setTextAlign,
  toggleBlock,
  toggleList,
  toggleMark,
  updateAttributes,
};

declare module "../types" {
  interface ArkpadCommands {
    toggleMark: (type: string | MarkType, attrs?: Record<string, any>) => ArkpadCommand;
    toggleBlock: (type: string | NodeType, attrs?: Record<string, any>) => ArkpadCommand;
    toggleList: (listType: string | NodeType, itemType: string | NodeType) => ArkpadCommand;
    setTextAlign: (align: string) => ArkpadCommand;
    insertNode: (type: string | NodeType, attrs?: Record<string, any>) => ArkpadCommand;
    updateAttributes: (typeOrName: string, attributes: Record<string, any>) => ArkpadCommand;
  }
}
