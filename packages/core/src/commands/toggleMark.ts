import { ArkpadCommandProps } from "../types";
import { MarkType } from "prosemirror-model";
import { toggleMark as pmToggleMark } from "prosemirror-commands";

/**
 * Toggles a mark on the current selection.
 * @param type The mark type or its name.
 * @param attrs The mark attributes.
 */
export const toggleMark = (type: string | MarkType, attrs: Record<string, any> = {}) => 
  (props: ArkpadCommandProps) => {
    const { state, dispatch } = props;
    const markType = typeof type === "string" ? state.schema.marks[type] : type;
    
    if (!markType) return false;

    // If we are checking for "canRun" (dispatch is undefined)
    if (!dispatch) {
      return state.selection.$from.parent.type.allowsMarkType(markType);
    }

    return pmToggleMark(markType, attrs)(state, dispatch);
  };
