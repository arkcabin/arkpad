import { setBlockType, lift, wrapIn } from "prosemirror-commands";
import { wrapInList, liftListItem } from "prosemirror-schema-list";
import { type MarkType } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";

export function markInputRule(regexp: RegExp, markType: MarkType, getAttrs?: (match: any) => any) {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;
    const m = match.length - 1;

    if (match[m]) {
      const textStart = start + match[0].indexOf(match[m]);
      const textEnd = textStart + match[m].length;
      const attrs = getAttrs ? getAttrs(match) : null;

      tr.addMark(textStart, textEnd, markType.create(attrs));
      tr.delete(textEnd, end);
      tr.delete(start, textStart);
      tr.removeStoredMark(markType);
    }

    return tr;
  });
}

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
      if (type.name === "blockquote") {
        return lift(state, dispatch);
      }
      return setBlockType(state.schema.nodes.paragraph!, {
        align: $from.parent.attrs.align || "left",
      })(state, dispatch);
    }

    if (type.name === "blockquote") {
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
    console.log(`[Arkpad] Smart Toggle Active: switching to ${listType.name}`);
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    if (!range) return false;

    // Search for the list node at all depths
    let listDepth = -1;
    for (let d = $from.depth; d >= 0; d--) {
      const node = $from.node(d);
      const name = node.type.name.toLowerCase();
      if (name.includes("list") && !name.includes("item")) {
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
          const listNode = state.doc.nodeAt(listPos);
          
          if (listNode) {
            console.log(`[Arkpad] Converting ${listNode.type.name} to ${listType.name}`);
            const newItems: any[] = [];
            
            try {
              listNode.forEach((child, offset, index) => {
                console.log(`[Arkpad]   Child ${index}: ${child.type.name}`, child.attrs);
                // Create new item using the target type but preserving the content
                const newItem = itemType.create(null, child.content);
                newItems.push(newItem);
              });
              
              const newList = listType.create(null, newItems);
              dispatch(state.tr.replaceWith(listPos, listPos + listNode.nodeSize, newList));
            } catch (err) {
              console.error("[Arkpad] Conversion failed:", err);
              // Fallback: Just try to wrap/lift normally if deep conversion fails
              return false;
            }
          }
        }
        return true;
      }
    }

    return wrapInList(listType)(state, dispatch);
  };
}
