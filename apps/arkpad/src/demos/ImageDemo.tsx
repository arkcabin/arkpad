import { Image as ImageExtension } from "@arkpad/extension-image";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Image as ImageIcon, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function ImageDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, ImageExtension],
    content: `
      <h1>Images</h1>
      <p>The image extension allows you to embed external images into your document with control over alignment and width.</p>
      <div class="ark-image-container ark-align-center" style="width: 100%; display: flex; justify-content: center; margin: 1.5rem auto;">
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" style="max-width: 100%; height: auto; border-radius: 8px;" alt="Coding" />
      </div>
      <p>Try selecting the image above and using the alignment buttons in the toolbar.</p>
    `,
  });

  const insertRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    editor?.commands.setImage({
      src: `https://picsum.photos/seed/${randomId}/800/400`,
      alt: "Random Image",
      align: "center",
      width: "100%",
    });
  };

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Image"
      description="Embeds images with alignment and scaling controls."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center gap-1">
            <button
              onClick={insertRandomImage}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-2 text-xs font-medium mr-2"
              title="Insert Random Image"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Add Image</span>
            </button>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton
              command="updateImage"
              args={[{ align: "left" }]}
              name="image"
              attrs={{ align: "left" }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </EditorButton>

            <EditorButton
              command="updateImage"
              args={[{ align: "center" }]}
              name="image"
              attrs={{ align: "center" }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </EditorButton>

            <EditorButton
              command="updateImage"
              args={[{ align: "right" }]}
              name="image"
              attrs={{ align: "right" }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </EditorButton>
          </div>
          <div className="p-8">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}
