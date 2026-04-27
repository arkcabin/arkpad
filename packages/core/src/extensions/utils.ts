import { setBlockType, lift, wrapIn } from "prosemirror-commands";
import { wrapInList, liftListItem } from "prosemirror-schema-list";

/**
 * Smart toggle for block nodes.
 */
export function toggleBlock(type: any, attrs: Record<string, any> = {}) {
  return (state: any, dispatch: any) => {
    const { $from } = state.selection;
    
    let isActive = false;
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type === type) {
        const hasMatchingAttrs = Object.entries(attrs).every(([k, v]) => node.attrs[k] === v);
        if (hasMatchingAttrs) {
          isActive = true;
          break;
        }
      }
    }

    if (isActive) {
      if (type.name === 'blockquote') {
        return lift(state, dispatch);
      }
      return setBlockType(state.schema.nodes.paragraph!)(state, dispatch);
    }
    
    if (type.name === 'blockquote') {
      return wrapIn(type)(state, dispatch);
    }
    
    return setBlockType(type, attrs)(state, dispatch);
  };
}

/**
 * Smart toggle for list nodes.
 */
export function toggleList(listType: any, itemType: any) {
  return (state: any, dispatch: any) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    if (!range) return false;

    // Search for the list node at all depths
    let listDepth = -1;
    for (let d = $from.depth; d >= 0; d--) {
      const node = $from.node(d);
      if (node.type.name.toLowerCase().includes('list')) {
        listDepth = d;
        break;
      }
    }

    if (listDepth > -1) {
      const currentList = $from.node(listDepth);
      if (currentList.type === listType) {
        // Same type: Toggle off by lifting
        return liftListItem(itemType)(state, dispatch);
      } else {
        // Different type: Switch it
        if (dispatch) {
          const listPos = $from.before(listDepth);
          dispatch(state.tr.setNodeMarkup(listPos, listType));
        }
        return true;
      }
    }

    return wrapInList(listType)(state, dispatch);
  };
}
