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
    content: "block*",
    isLayout: true, // Explicitly mark as layout for Governance
    
    addAttributes() {
      return {
        id: { default: null },
        padding: { default: "60px 0" },
        backgroundColor: { default: "transparent" },
        maxWidth: { default: "1200px" },
        class: { default: null },
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
      const { class: customClass, ...rest } = HTMLAttributes;
      return [
        "section",
        {
          ...rest,
          class: `ark-section ${customClass || ""}`.trim(),
        },
        0,
      ];
    },

    addCommands: () => ({
      setSection: () => (props: any) => {
        return props.editor.commands.insertSection();
      },
      insertSection: (attrs?: any) => (props: any) => {
        const { state, dispatch } = props;
        const { tr } = state;
        const section = state.schema.nodes.section;
        const p = state.schema.nodes.paragraph;
        
        if (!section || !p) return false;

        const newNode = section.createAndFill(attrs || null, [p.create()]);
        if (newNode && dispatch) {
          dispatch(tr.replaceSelectionWith(newNode).scrollIntoView());
        }
        return true;
      }
    }),
  });
}
