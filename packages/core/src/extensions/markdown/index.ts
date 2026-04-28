import { Extension } from "../../extensions-types";
import { Plugin, PluginKey } from "prosemirror-state";
import { DOMParser, Slice } from "prosemirror-model";
import { markdownToHtml } from "./parser";

export function createMarkdownPaste(): Extension {
  return {
    name: "markdownPaste",
    addProseMirrorPlugins: () => [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain");
            const html = event.clipboardData?.getData("text/html");

            if (!text) return false;

            // Simple heuristic to see if it's markdown
            const isMarkdown = /^(#+|[\*\+-] |\[[ x]\] |> |==|\*\*|_|~~|`|---|___|\*\*\*)/m.test(
              text
            );

            // If it's not markdown, or if it's rich HTML (contains tags other than simple wrappers), let PM handle it
            if (!isMarkdown) return false;
            if (
              html &&
              (html.includes("<h") ||
                html.includes("<ul") ||
                html.includes("<li") ||
                html.includes("<strong"))
            ) {
              return false;
            }

            const convertedHtml = markdownToHtml(text);

            // Parse converted HTML and insert it
            const parser = DOMParser.fromSchema(view.state.schema);
            const element = document.createElement("div");
            element.innerHTML = convertedHtml;
            const doc = parser.parse(element);

            const tr = view.state.tr.replaceSelection(new Slice(doc.content, 0, 0));
            view.dispatch(tr);

            return true;
          },
        },
      }),
    ],
  };
}
