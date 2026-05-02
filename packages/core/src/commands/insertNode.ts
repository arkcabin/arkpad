import { ArkpadCommandProps } from "../types";
import { NodeType } from "prosemirror-model";

/**
 * Inserts a node at the current selection.
 * @param type The node type or its name.
 * @param attrs The node attributes.
 */
export const insertNode = (type: string | NodeType, attrs: Record<string, any> = {}) => 
  (props: ArkpadCommandProps) => {
    const { state, dispatch, tr } = props;
    const nodeType = typeof type === "string" ? state.schema.nodes[type] : type;
    
    if (!nodeType) return false;

    const { $from } = state.selection;
    const index = $from.index();

    if (!$from.parent.canReplaceWith(index, index, nodeType)) {
      return false;
    }

    if (dispatch) {
      dispatch(tr.replaceSelectionWith(nodeType.create(attrs)).scrollIntoView());
    }
    return true;
  };
