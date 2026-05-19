"use client";

import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { Image as ImageExtension } from "@arkpad/extension-image";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Image as ImageIcon, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

export function ImageDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, ImageExtension],
    content: `
      <h1>Images</h1>
      <p>The image extension allows you to embed external images with alignment control.</p>
      <div class="ark-image-container ark-align-center" style="width: 100%; display: flex; justify-content: center; margin: 1.5rem auto;">
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" style="max-width: 100%; height: auto; border-radius: 8px;" alt="Coding" />
      </div>
    `,
  });

  const insertRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    editor?.commands.setImage({
      src: `https://picsum.photos/seed/${randomId}/800/400`,
      alt: "Random Image",
      align: "center",
    });
  };

  return (
    <DemoContainer editor={editor}>
      <button
        onClick={insertRandomImage}
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors flex items-center gap-2 text-xs font-medium mr-2"
        title="Insert Random Image"
      >
        <ImageIcon className="w-4 h-4" />
        <span>Add Image</span>
      </button>
      <div className="w-px h-4 bg-fd-border mx-1" />
      <EditorButton
        command="updateImage"
        args={[{ align: "left" }]}
        name="image"
        attrs={{ align: "left" }}
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
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
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
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
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
        activeClassName="active"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </EditorButton>
    </DemoContainer>
  );
}

export const imageCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Image } from "@arkpad/extension-image";
import { Engine } from "@arkpad/core";
import { Image as ImageIcon } from "lucide-react";

export function ImageDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Image],
    content: "<p>Embed images with alignment controls.</p>",
  });

  const insertImage = () => {
    editor?.commands.setImage({
      src: "https://picsum.photos/800/400",
      align: "center",
    });
  };

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 border-b bg-muted/50">
          <button onClick={insertImage} className="p-2 hover:bg-accent rounded">
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;
