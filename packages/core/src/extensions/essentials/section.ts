import { Node } from "../../sdk/Node";
import { setBlockType } from "prosemirror-commands";

/**
 * Section node - The primary layout container for the page builder.
 * It holds other block-level elements like Paragraphs, Columns, and Media.
 */
export function createSection(): Node {
  return Node.create({
    name: "section",
    group: "block layout",
    content: "block*", // Must contain at least one block (e.g. a paragraph)
    
    addAttributes() {
      return {
        id: { default: null },
        padding: { default: "60px 0" },
        backgroundColor: { default: "transparent" },
        maxWidth: { default: "1200px" },
      };
    },

    parseHTML() {
      return [
        {
          tag: "section.ark-section",
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      return ["section", { ...HTMLAttributes, class: "ark-section" }, 0];
    },

    addCommands: () => ({
      setSection: () => (props: any) => {
        const { state, dispatch } = props;
        const section = state.schema.nodes.section;
        if (!section) return false;
        
        return setBlockType(section)(state, dispatch);
      },
      insertSection: () => (props: any) => {
        const { state, dispatch } = props;
        const { tr } = state;
        const section = state.schema.nodes.section;
        const p = state.schema.nodes.paragraph;
        
        if (!section || !p) return false;

        const newNode = section.create(null, [p.create()]);
        if (dispatch) {
          dispatch(tr.replaceSelectionWith(newNode).scrollIntoView());
        }
        return true;
      }
    }),
  });
}
