import { Node, ArkpadCommandProps } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setColumns: (options?: { columns?: number; gap?: string }) => void;
    addColumn: () => void;
    removeColumn: (index?: number) => void;
  }
}

export const Columns = Node.create({
  name: "columns",

  group: "block",
  content: "column+",
  isLayout: true,
  defining: true,

  addAttributes() {
    return {
      gap: {
        default: "1rem",
        parseHTML: element => element.style.gap,
        renderHTML: attributes => {
          return { style: `gap: ${attributes.gap}` };
        },
      },
      align: {
        default: "top",
        parseHTML: element => element.style.alignItems,
        renderHTML: attributes => {
          const alignmentMap: Record<string, string> = {
            top: "flex-start",
            middle: "center",
            bottom: "flex-end",
          };
          return { style: `align-items: ${alignmentMap[attributes.align] || "flex-start"}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='columns']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ["div", { "data-type": "columns", class: "ark-columns", ...HTMLAttributes }, 0];
  },

  onInit() {
    this.editor.blockRegistry.registerBlock({
      type: "columns",
      label: "2 Columns",
      category: "layout",
      create: (options: any) => {
        const count = options?.columns || 2;
        const columns = Array.from({ length: count }, () => ({
          type: "column",
          content: [{ type: "paragraph" }],
        }));

        return {
          type: "columns",
          attrs: { gap: options?.gap || "1rem" },
          content: columns,
        };
      },
      styleConfig: {
        backgroundColor: false,
      },
    });
  },

  addCommands() {
    return {
      setColumns:
        (options?: { columns?: number; gap?: string }) =>
        ({ chain }: ArkpadCommandProps) => {
          const count = options?.columns || 2;
          const columns = Array.from({ length: count }, () => ({
            type: "column",
            content: [{ type: "paragraph" }],
          }));

          return chain()
            .insertContent({
              type: this.name,
              attrs: { gap: options?.gap || "1rem" },
              content: columns,
            })
            .run();
        },
      addColumn:
        () =>
        ({ state, dispatch, chain }: ArkpadCommandProps) => {
          const { selection } = state;
          const pos = selection.$from.before(selection.$from.depth);
          const node = state.doc.nodeAt(pos);

          if (node?.type.name !== "columns") {
            return false;
          }

          if (dispatch) {
            return chain()
              .command(({ tr }) => {
                const columnNode = state.schema.nodes.column?.createAndFill();
                if (!columnNode) return false;
                tr.insert(pos + node.nodeSize - 1, columnNode);
                return true;
              })
              .run();
          }

          return true;
        },
      removeColumn:
        (index?: number) =>
        ({ state, dispatch, chain }: ArkpadCommandProps) => {
          const { selection } = state;
          const pos = selection.$from.before(selection.$from.depth);
          const node = state.doc.nodeAt(pos);

          if (node?.type.name !== "columns") {
            return false;
          }

          const targetIndex = index !== undefined ? index : selection.$from.index(selection.$from.depth);

          if (dispatch) {
            // Don't remove the last column
            if (node.childCount <= 1) return false;

            return chain()
              .command(({ tr }) => {
                let currentPos = pos + 1;
                for (let i = 0; i < targetIndex; i++) {
                  currentPos += node.child(i).nodeSize;
                }
                tr.delete(currentPos, currentPos + node.child(targetIndex).nodeSize);
                return true;
              })
              .run();
          }

          return true;
        },
    };
  },
});

export const Column = Node.create({
  name: "column",

  content: "block+",
  group: "block",
  defining: true,

  addAttributes() {
    return {
      width: {
        default: "50%",
        parseHTML: element => element.style.width,
        renderHTML: attributes => {
          return { style: `width: ${attributes.width}` };
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='column']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ["div", { "data-type": "column", class: "ark-column", ...HTMLAttributes }, 0];
  },
});

export const ColumnsExtension = [Columns, Column];
export default ColumnsExtension;
