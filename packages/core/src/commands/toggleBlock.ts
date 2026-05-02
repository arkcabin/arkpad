import { ArkpadCommandProps } from "../types";
import { NodeType } from "prosemirror-model";
import { setBlockType, lift, wrapIn } from "prosemirror-commands";

/**
 * Toggles a block node type for the current selection.
 * @param type The node type or its name.
 * @param attrs The node attributes.
 */
export const toggleBlock = (type: string | NodeType, attrs: Record<string, any> = {}) => 
  (props: ArkpadCommandProps) => {
    const { state, dispatch } = props;
    const nodeType = typeof type === "string" ? state.schema.nodes[type] : type;
    
    if (!nodeType) return false;

    const { $from } = state.selection;

    // Dry-run check for UI enabled state
    if (!dispatch) {
      return !!setBlockType(nodeType, attrs)(state);
    }

    let isActive = false;
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type === nodeType) {
        const hasMatchingAttrs = Object.entries(attrs).every(([k, v]) => node.attrs[k] === v);
        if (hasMatchingAttrs) {
          isActive = true;
          break;
        }
      }
    }

    if (isActive) {
      if (nodeType.name === "blockquote") {
        return lift(state, dispatch);
      }

      const paragraph = state.schema.nodes.paragraph;
      if (!paragraph) return false;

      return setBlockType(paragraph, {
        align: $from.parent.attrs.align || "left",
      })(state, dispatch);
    }

    if (nodeType.name === "blockquote") {
      return wrapIn(nodeType)(state, dispatch);
    }

    return setBlockType(nodeType, attrs)(state, dispatch);
  };
