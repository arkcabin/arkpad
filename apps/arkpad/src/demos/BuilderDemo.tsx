import React from "react";
import {
  useArkpadEditor,
  ArkpadStudio,
  ArkpadCanvas,
  StudioBlockLibrary,
  StudioPropertyInspector,
} from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";
import { Document } from "@arkpad/core";
import { useStudio } from "../Router";

export function BuilderDemo() {
  const { device, previewMode, isSidebarOpen, isPropertyPanelOpen } = useStudio();

  const editor = useArkpadEditor({
    extensions: [
      Document.configure({
        content: "block*",
        attributes: {
          title: { default: "Untitled Architecture" },
          theme: { default: "light" },
          maxWidth: { default: "1200px" },
        },
      }),
      StarterKit,
    ],
    content: {
      type: "doc",
      attrs: {
        title: "My Arkpad Studio Project",
        theme: "light",
      },
      content: [],
    },
    editable: true,
    autofocus: true,
  });

  React.useEffect(() => {
    if (editor) {
      (window as any).editor = editor;
    }
  }, [editor]);

  return (
    <ArkpadStudio
      editor={editor}
      leftSidebar={<StudioBlockLibrary />}
      rightSidebar={<StudioPropertyInspector />}
      isSidebarOpen={isSidebarOpen}
      isPropertyPanelOpen={isPropertyPanelOpen}
      previewMode={previewMode}
    >
      <ArkpadCanvas editor={editor} device={device as "desktop" | "tablet" | "mobile"} />
    </ArkpadStudio>
  );
}
