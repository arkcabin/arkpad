import { Selection, Plugin, Extension } from "@arkpad/core";

export const DragDrop = Extension.create({
  name: "dragDrop",

  onDrop(event: DragEvent) {
    if (!event.dataTransfer) {
      return false;
    }

    const blockType = event.dataTransfer.getData("application/x-arkpad-block");

    if (!blockType) {
      return false;
    }

    const { editor } = this;
    const { view } = editor;

    // Get the drop position
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

    if (!pos) {
      return false;
    }

    event.preventDefault();

    // Clean up drag-active class
    view.dom.classList.remove("drag-active");

    // Build chain - each method returns a NEW chain, so we must reassign
    let chain = editor.chain();

    // Set text selection at the drop point
    chain = chain.command(({ tr }: { tr: any }) => {
      const $pos = tr.doc.resolve(pos.pos);
      const selection = Selection.near($pos);
      tr.setSelection(selection);
      return true;
    });

    // Insert the block based on type
    switch (blockType) {
      case "section":
        chain = chain.insertContent({
          type: "section",
          content: [{ type: "paragraph" }],
        });
        break;
      case "columns":
        chain = chain.insertContent({
          type: "paragraph",
          content: [{ type: "text", text: "2 Columns Placeholder" }],
        });
        break;
      case "heading":
        chain = chain.toggleHeading({ level: 2 });
        break;
      case "text":
        chain = chain.setParagraph();
        break;
      case "divider":
        chain = chain.setHorizontalRule();
        break;
      case "quote":
        chain = chain.toggleBlockquote();
        break;
      case "list":
        chain = chain.toggleBulletList();
        break;
      case "code":
        chain = chain.toggleCodeBlock();
        break;
      default:
        chain = chain.insertContent({
          type: "paragraph",
          content: [{ type: "text", text: `New ${blockType}` }],
        });
    }

    return chain.run();
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            dragover: (view: any, event: any) => {
              const blockType = event.dataTransfer?.getData("application/x-arkpad-block");
              if (blockType) {
                view.dom.classList.add("drag-active");
              }
              return false;
            },
            dragleave: (view: any) => {
              view.dom.classList.remove("drag-active");
              return false;
            },
          },
        },
      }),
    ];
  },
});

export default DragDrop;
