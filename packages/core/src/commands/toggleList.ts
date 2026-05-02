import { ArkpadCommandProps } from "../types";
import { NodeType } from "prosemirror-model";
import { wrapInList, liftListItem } from "prosemirror-schema-list";

/**
 * Toggles a list type for the current selection.
 * @param listType The list node type or its name.
 * @param itemType The list item node type or its name.
 */
export const toggleList = (listType: string | NodeType, itemType: string | NodeType) => 
  (props: ArkpadCommandProps) => {
    const { state, dispatch } = props;
    const list = typeof listType === "string" ? state.schema.nodes[listType] : listType;
    const item = typeof itemType === "string" ? state.schema.nodes[itemType] : itemType;
    
    if (!list || !item) return false;

    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    if (!range) return false;

    // Dry-run check for UI enabled state
    if (!dispatch) {
      return !!wrapInList(list)(state);
    }

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
      if (currentList.type === list) {
        // Same type: Toggle off by lifting
        return liftListItem(item)(state, dispatch);
      } else {
        // Different type: Switch it
        if (dispatch) {
          const listPos = $from.before(listDepth);
          const listNode = state.doc.nodeAt(listPos);

          if (listNode) {
            const tr = state.tr;
            const items: any[] = [];

            listNode.content.forEach((li) => {
              // If it's already an item, convert it to the target item type
              // otherwise wrap it
              if (li.type.name.toLowerCase().includes("item")) {
                items.push(item.create(li.attrs, li.content));
              } else {
                items.push(item.create(null, li));
              }
            });

            const newList = list.create(currentList.attrs, items);
            dispatch(
              tr.replaceWith(listPos, listPos + listNode.nodeSize, newList).scrollIntoView()
            );
          }
        }
        return true;
      }
    }

    return wrapInList(list)(state, dispatch);
  };
