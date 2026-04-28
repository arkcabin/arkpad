import { ArkpadEditor, Essentials } from "../packages/core/src/index";

// Mock the DOM for JSDOM-like behavior if needed, but ArkpadEditor needs a real element.
// However, we can just test the Extension logic directly.

async function test() {
  console.log("Testing UniqueId Extension...");

  // We'll mock a minimal environment
  const element = { appendChild: () => {}, contains: () => false } as any;

  const editor = new ArkpadEditor({
    element,
    extensions: [Essentials],
    content: "<h1>Hello</h1><p>World</p>",
  });

  const json = editor.getJSON();
  console.log("Generated JSON:", JSON.stringify(json, null, 2));

  const hasIds = json.content?.every((node: any) => node.attrs && node.attrs.id);
  if (hasIds) {
    console.log("✅ Success: All block nodes have IDs.");
  } else {
    console.error("❌ Failure: Some block nodes are missing IDs.");
  }

  // Test split
  editor.runCommand("toggleBold"); // just to do something
  // In a real environment, we'd press Enter. Here we can set content with same IDs and see if they regenerate.
  const duplicateJson = JSON.parse(JSON.stringify(json));
  editor.setContent(duplicateJson, "json");
  
  const newJson = editor.getJSON();
  console.log("JSON after reloading same IDs (should remain same or regenerate if we had duplicate detection):", JSON.stringify(newJson, null, 2));
}

test().catch(console.error);
