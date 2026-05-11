import { Node } from "../../sdk/Node";

/**
 * Columns node - A grid-based container for side-by-side layouts.
 */
export function createColumns(): Node {
  return Node.create({
    name: "columns",
    group: "block layout",
    content: "column+",
    
    addAttributes() {
      return {
        count: { default: 2 },
        gap: { default: "2rem" },
        verticalAlign: { default: "top" },
      };
    },

    parseHTML() {
      return [{ tag: "div.ark-columns" }];
    },

    renderHTML({ HTMLAttributes }) {
      const { count, gap, verticalAlign } = HTMLAttributes;
      return [
        "div", 
        { 
          ...HTMLAttributes, 
          class: "ark-columns",
          style: `display: grid; grid-template-columns: repeat(${count}, 1fr); gap: ${gap}; align-items: ${verticalAlign === 'top' ? 'start' : verticalAlign === 'middle' ? 'center' : 'end'}` 
        }, 
        0
      ];
    },

    addCommands: () => ({
      setColumns: (attrs?: { count: number }) => (props: any) => {
        const { state, dispatch } = props;
        const { tr } = state;
        const columns = state.schema.nodes.columns;
        const column = state.schema.nodes.column;
        const paragraph = state.schema.nodes.paragraph;

        if (!columns || !column || !paragraph) return false;

        const count = attrs?.count || 2;
        const columnNodes: any[] = [];
        for (let i = 0; i < count; i++) {
          columnNodes.push(column.create(null, [paragraph.create()]));
        }

        const newNode = columns.create({ count }, columnNodes);
        if (dispatch) {
          dispatch(tr.replaceSelectionWith(newNode).scrollIntoView());
        }
        return true;
      }
    }),
  });
}

/**
 * Column node - An individual cell within a Columns container.
 */
export function createColumn(): Node {
  return Node.create({
    name: "column",
    content: "block*",
    group: "block column",
    defining: true,
    
    parseHTML() {
      return [{ tag: "div.ark-column" }];
    },

    renderHTML() {
      return ["div", { class: "ark-column" }, 0];
    },
  });
}
