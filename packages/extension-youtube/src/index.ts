import { Node, ArkpadCommandProps, PMNode, Plugin, NodeRole } from "@arkpad/core";
import { YoutubeNodeView } from "./YoutubeView";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setYoutubeVideo: (options: { src: string; width?: string; height?: string }) => void;
  }
}

export interface YoutubeOptions {
  width: string;
  height: string;
  HTMLAttributes: Record<string, any>;
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

export function isYoutubeUrl(text: string): boolean {
  return /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}$/.test(
    text.trim()
  );
}

export const Youtube = Node.create<YoutubeOptions>({
  name: "youtube",
  role: NodeRole.WIDGET,

  addOptions() {
    return {
      width: "100%",
      height: "480",
      HTMLAttributes: {},
    };
  },

  inline: false,
  group: "block",
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
      align: {
        default: "center", // left, center, right
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='youtube']",
        getAttrs: (dom: any) => ({
          src: dom.getAttribute("data-src"),
          width: dom.getAttribute("data-width") || this.options.width,
          height: dom.getAttribute("data-height") || this.options.height,
          align: dom.getAttribute("data-align") || "center",
        }),
      },
      {
        tag: "iframe[src*=youtube]",
        getAttrs: (dom: any) => ({
          src: dom.getAttribute("src"),
          width: dom.getAttribute("width") || this.options.width,
          height: dom.getAttribute("height") || this.options.height,
          align: "center",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    const { src, width, height, align } = HTMLAttributes;
    const embedUrl = getYoutubeEmbedUrl(src) || src;

    return [
      "div",
      {
        "data-type": "youtube",
        "data-src": src,
        "data-width": width,
        "data-height": height,
        "data-align": align,
        class: `ark-youtube-container ark-align-${align}`,
        style: `width: ${width}; display: flex; justify-content: ${
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"
        }; margin: 1.5rem auto;`,
      },
      [
        "div",
        {
          class: "ark-youtube-wrapper",
          style: "position: relative; width: 100%; padding-bottom: 56.25%;",
        },
        [
          "iframe",
          {
            src: embedUrl,
            width: "100%",
            height: "100%",
            frameborder: "0",
            allowfullscreen: "true",
            allow:
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            style:
              "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;",
            ...this.options.HTMLAttributes,
          },
        ],
      ],
    ];
  },

  addNodeView() {
    return (props: any) => new YoutubeNodeView(props.node, props.view, props.getPos);
  },

  addCommands() {
    return {
      setYoutubeVideo:
        (options: { src: string; width?: string; height?: string }) =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { schema, tr } = state;
          const type = schema.nodes.youtube;
          if (!type) return false;

          if (dispatch) {
            dispatch(
              tr
                .replaceSelectionWith(
                  type.create({
                    src: options.src,
                    width: options.width || this.options.width,
                    height: options.height || this.options.height,
                  })
                )
                .scrollIntoView()
            );
          }

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view: any, event: ClipboardEvent) => {
            const text = event.clipboardData?.getData("text/plain");
            if (!text) return false;

            if (!isYoutubeUrl(text)) return false;

            const type = view.state.schema.nodes.youtube;
            if (!type) return false;

            const tr = view.state.tr.replaceSelectionWith(type.create({ src: text.trim() }));
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});

export default Youtube;
