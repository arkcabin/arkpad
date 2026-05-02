import { Node as PMNode } from "prosemirror-model";
import { ArkpadCommandProps } from "../types";

/**
 * Updates attributes of the currently selected node or mark.
 * @param typeOrName The name of the node or mark type.
 * @param attributes The attributes to update.
 */
export const updateAttributes =
  (typeOrName: string, attributes: Record<string, any>) =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    const { selection } = state;
    const { $from, from, to } = selection;
    const schema = state.schema;

    const nodeType = schema.nodes[typeOrName];
    const markType = schema.marks[typeOrName];

    if (nodeType) {
      // Find the node in selection or parent
      let pos = -1;
      let node: PMNode | null = null;

      if ((selection as any).node && (selection as any).node.type === nodeType) {
        pos = from;
        node = (selection as any).node;
      } else {
        // Look for parent node
        for (let d = $from.depth; d >= 0; d--) {
          if ($from.node(d).type === nodeType) {
            pos = $from.before(d);
            node = $from.node(d);
            break;
          }
        }
      }

      if (node && pos !== -1) {
        if (dispatch) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            ...attributes,
          });
        }
        return true;
      }
    }

    if (markType) {
      if (dispatch) {
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (!node.isText && !node.type.allowsMarkType(markType)) return;

          const existingMark = node.marks.find((m) => m.type === markType);
          const mergedAttrs = { ...existingMark?.attrs, ...attributes };

          tr.addMark(
            Math.max(pos, from),
            Math.min(pos + node.nodeSize, to),
            markType.create(mergedAttrs)
          );
        });
      }
      return true;
    }

    return false;
  };
