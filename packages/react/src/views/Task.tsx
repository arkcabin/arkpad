import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Node as PMNode } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import type { NodeView } from "@arkpad/core";
import { Checkbox } from "../components/ui/checkbox";

export class TaskView implements NodeView {
  public dom: HTMLElement;
  public contentDOM: HTMLElement;
  private node: PMNode;
  private view: EditorView;
  private getPos: () => number | undefined;
  private reactRoot: Root | null = null;
  private checkboxContainer: HTMLDivElement;

  constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    console.log("TaskView created, getPos:", typeof getPos, "pos:", getPos());

    const isChecked = node.attrs.checked;

    const container = document.createElement("li");
    container.className = `task-item flex items-center list-none py-0 leading-none ${isChecked ? "checked" : ""}`;

    this.checkboxContainer = document.createElement("div");
    this.checkboxContainer.className = "flex-shrink-0 flex items-center justify-center";
    container.appendChild(this.checkboxContainer);

    const contentDOM = document.createElement("div");
    contentDOM.className = `flex-1 min-w-0 transition-all duration-150 text-[16px] ${
      isChecked ? "text-slate-400 line-through opacity-70" : "text-slate-800"
    }`;
    container.appendChild(contentDOM);
    this.contentDOM = contentDOM;

    this.dom = container;
    this.mountReact();
  }

  private mountReact() {
    this.reactRoot = createRoot(this.checkboxContainer);
    this.reactRoot.render(
      <Checkbox checked={this.node.attrs.checked} onCheckedChange={this.handleChange} />
    );
  }

  private handleChange = (checked: boolean | string) => {
    const isChecked = checked === true;
    const pos = this.getPos();
    if (pos === undefined) return;

    const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
      ...this.node.attrs,
      checked: isChecked,
    });
    this.view.dispatch(tr);

    // Immediate visual feedback for "ultra-fast" feel
    this.contentDOM.className = `flex-1 min-w-0 transition-all duration-150 text-[16px] ${
      isChecked ? "text-slate-400 line-through opacity-70" : "text-slate-800"
    }`;
  };

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false;

    if (this.node.attrs.checked !== node.attrs.checked && this.reactRoot) {
      this.reactRoot.render(
        <Checkbox checked={node.attrs.checked} onCheckedChange={this.handleChange} />
      );

      // Update content styles
      this.contentDOM.className = `flex-1 min-w-0 transition-all duration-150 text-[16px] ${
        node.attrs.checked ? "text-slate-400 line-through opacity-70" : "text-slate-800"
      }`;
    }

    this.node = node;
    this.dom.className = `task-item flex items-center list-none py-0 leading-none ${
      node.attrs.checked ? "checked" : ""
    }`;
    return true;
  }

  stopEvent(event: Event) {
    // Capture clicks/events inside the checkbox so they don't move the PM selection
    return this.checkboxContainer.contains(event.target as Node);
  }

  destroy() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }

  ignoreMutation(mutation: MutationRecord) {
    return (
      mutation.target === this.checkboxContainer || this.checkboxContainer.contains(mutation.target)
    );
  }
}
