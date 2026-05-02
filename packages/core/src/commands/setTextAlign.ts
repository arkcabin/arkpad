import { ArkpadCommandProps } from "../types";

/**
 * Sets text alignment for the current selection.
 * @param align The alignment value (e.g., 'left', 'center', 'right', 'justify').
 */
export const setTextAlign = (align: string) => 
  (props: ArkpadCommandProps) => {
    const { state, dispatch, tr } = props;
    const { from, to } = state.selection;
    let modified = false;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isTextblock) {
        // More robust check for align attribute existence
        if (node.type.spec.attrs && "align" in node.type.spec.attrs) {
          if (node.attrs.align !== align) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, align });
            modified = true;
          }
        }
      }
    });

    if (modified) {
      if (dispatch) dispatch(tr);
      return true;
    }

    return false;
  };
