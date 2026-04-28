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
    container.className = "task-item flex items-start gap-2 list-none py-0 leading-none";
    if (isChecked) container.classList.add("checked");

    this.checkboxContainer = document.createElement("div");
    // Pointer-events: none ensures clicks in the "gap" hit the text area
    this.checkboxContainer.className = "flex-shrink-0 flex items-center justify-center select-none pointer-events-none mt-[3px]";
    this.checkboxContainer.contentEditable = "false";
    container.appendChild(this.checkboxContainer);

    const contentDOM = document.createElement("div");
    contentDOM.className = "flex-1 min-w-0 text-[15px]";
    this.updateContentStyles(contentDOM, isChecked, node);
    this.contentDOM = contentDOM;
    container.appendChild(contentDOM);

    this.dom = container;
    this.mountReact();
  }

  private updateContentStyles(el: HTMLElement, isChecked: boolean, node: PMNode) {
    const align = node.firstChild?.attrs.align || "left";

    // Apply alignment classes
    el.classList.remove("text-left", "text-center", "text-right", "text-justify");
    el.classList.add(`text-${align}`);

    // Apply checkmark styles
    if (isChecked) {
      el.style.color = "var(--editor-text-muted)";
      el.classList.add("line-through", "opacity-70");
    } else {
      el.style.color = "var(--editor-text)";
      el.classList.remove("line-through", "opacity-70");
    }
  }

  private mountReact() {
    this.reactRoot = createRoot(this.checkboxContainer);
    this.reactRoot.render(
      <div className="pointer-events-auto">
        <Checkbox checked={this.node.attrs.checked} onCheckedChange={this.handleChange} />
      </div>
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
  };

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false;

    const isChecked = node.attrs.checked;

    if (this.node.attrs.checked !== isChecked && this.reactRoot) {
      this.reactRoot.render(
        <div className="pointer-events-auto">
          <Checkbox checked={isChecked} onCheckedChange={this.handleChange} />
        </div>
      );
    }

    this.node = node;
    this.dom.classList.toggle("checked", isChecked);
    this.updateContentStyles(this.contentDOM, isChecked, node);

    return true;
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
