import React from "react";
import {
  useArkpadEditor,
  ArkpadStudio,
  ArkpadCanvas,
  StudioBlockLibrary,
  StudioPropertyInspector,
} from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";
import { useStudio } from "../Router";

export function BuilderDemo() {
  const { device, previewMode, isSidebarOpen, isPropertyPanelOpen } = useStudio();

  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content:
      "<h1>Clean Start</h1><p>This is a fresh editor instance. Let's build the builder step by step.</p>",
    contentTag: "div",
    editable: true,
    autofocus: true,
  });

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
