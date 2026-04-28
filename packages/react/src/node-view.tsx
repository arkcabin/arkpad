import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Node as PMNode } from "prosemirror-model";
import type { EditorView, NodeView, ViewMutationRecord } from "prosemirror-view";

export interface ReactNodeViewProps {
  node: PMNode;
  view: EditorView;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

export interface ReactNodeViewOptions {
  name: string;
  component: React.ComponentType<ReactNodeViewProps>;
  tagName?: string;
  className?: string;
  contentDOM?: boolean;
}

/**
 * A bridge class that connects ProseMirror's NodeView lifecycle to React.
 */
export class ReactNodeView implements NodeView {
  public dom: HTMLElement;
  public contentDOM?: HTMLElement;
  public node: PMNode;
  public view: EditorView;
  public getPos: () => number | undefined;
  public reactRoot: Root | null = null;
  public component: React.ComponentType<ReactNodeViewProps>;

  constructor(
    node: PMNode,
    view: EditorView,
    getPos: () => number | undefined,
    options: ReactNodeViewOptions
  ) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.component = options.component;

    // Create the outer DOM element
    this.dom = document.createElement(options.tagName || "div");
    if (options.className) {
      this.dom.className = options.className;
    }

    // Create a container for React
    const reactContainer = document.createElement("div");
    reactContainer.setAttribute("data-react-container", "");
    reactContainer.style.display = "flex";
    reactContainer.style.alignItems = "center";
    reactContainer.style.cursor = "pointer";
    this.dom.appendChild(reactContainer);

    // If the node has content, create a contentDOM element
    if (options.contentDOM) {
      this.contentDOM = document.createElement("div");
      this.contentDOM.setAttribute("data-node-view-content", "");
      this.dom.appendChild(this.contentDOM);
    }

    this.reactRoot = createRoot(reactContainer);
    this.render();
  }

  public updateAttributes = (attrs: Record<string, unknown>) => {
    const pos = this.getPos();
    if (pos === undefined) return;

    const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
      ...this.node.attrs,
      ...attrs,
    });
    this.view.dispatch(tr);
  };

  public render() {
    const Component = this.component;
    const props: ReactNodeViewProps = {
      node: this.node,
      view: this.view,
      getPos: this.getPos,
      updateAttributes: this.updateAttributes,
    };

    // Update DOM classes for state-based styling (e.g., checked)
    if (this.node.attrs.checked) {
      this.dom.classList.add("checked");
    } else {
      this.dom.classList.remove("checked");
    }

    if (this.reactRoot) {
      this.reactRoot.render(<Component {...props} />);
    }
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.render();
    return true;
  }

  destroy() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }

  public ignoreMutation(mutation: ViewMutationRecord) {
    // Ignore mutations inside our React-managed DOM
    return this.dom.contains(mutation.target);
  }
}

/**
 * Creates a NodeView constructor for a React component.
 */
export function createReactNodeView(options: ReactNodeViewOptions) {
  return (node: PMNode, view: EditorView, getPos: () => number | undefined) => {
    return new ReactNodeView(node, view, getPos, options) as NodeView;
  };
}
