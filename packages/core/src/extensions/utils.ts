import { type MarkType, type NodeType } from "prosemirror-model";
import { type EditorState } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import { NodeSelection, TextSelection, AllSelection } from "prosemirror-state";
import { type Node as PMNode } from "prosemirror-model";

export function markInputRule(regexp: RegExp, markType: MarkType, getAttrs?: (match: any) => any) {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;
    const m = match.length - 1;

    if (match[m]) {
      const textStart = start + match[0].indexOf(match[m]);
      const textEnd = textStart + match[m].length;
      const attrs = getAttrs ? getAttrs(match) : null;

      tr.addMark(textStart, textEnd, markType.create(attrs));
      tr.delete(textEnd, end);
      tr.delete(start, textStart);
      tr.removeStoredMark(markType);
    }

    return tr;
  });
}

/**
 * Checks if a mark is active in the current selection.
 */
export function isMarkActive(state: EditorState, type: MarkType) {
  const { from, to, empty, $from } = state.selection;
  if (empty) {
    return !!type.isInSet(state.storedMarks || $from.marks());
  }
  return state.doc.rangeHasMark(from, to, type);
}

/**
 * Checks if a node is active in the current selection.
 */
export function isNodeActive(state: EditorState, type: NodeType, attrs: Record<string, any> = {}) {
  const { from, to, empty, $from } = state.selection;

  // Look up the parent tree of the selection
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);
    if (node.type === type) {
      const hasMatchingAttrs = Object.entries(attrs).every(
        ([key, value]) => node.attrs[key] === value
      );
      if (hasMatchingAttrs) {
        return true;
      }
    }
  }

  // Fallback: If it's a range selection, check if the range contains the node type
  if (!empty) {
    let foundInRange = false;
    state.doc.nodesBetween(from, to, (node) => {
      if (foundInRange) return false;
      if (node.type === type) {
        const hasMatchingAttrs = Object.entries(attrs).every(
          ([key, value]) => node.attrs[key] === value
        );
        if (hasMatchingAttrs) {
          foundInRange = true;
        }
      }
    });
    return foundInRange;
  }

  return false;
}

/**
 * Gets attributes of a mark in the current selection.
 */
export function getMarkAttributes(state: EditorState, type: MarkType): Record<string, any> | null {
  const { from, to, $from, empty } = state.selection;
  const marks = empty ? $from.marks() || state.storedMarks : [];

  if (empty && marks) {
    const mark = marks.find((m) => m.type === type);
    return mark ? mark.attrs : null;
  }

  let attrs: Record<string, any> | null = null;
  state.doc.nodesBetween(from, to, (node) => {
    const mark = node.marks.find((m) => m.type === type);
    if (mark) attrs = mark.attrs;
  });
  return attrs;
}

/**
 * Gets attributes of a node in the current selection.
 */
export function getNodeAttributes(state: EditorState, type: NodeType): Record<string, any> | null {
  const { from, to, $from, empty } = state.selection;
  let attrs: Record<string, any> | null = null;

  state.doc.nodesBetween(from, to, (node) => {
    if (node.type === type) {
      attrs = node.attrs;
    }
  });

  if (!attrs && empty && $from.parent.type === type) {
    attrs = $from.parent.attrs;
  }

  return attrs;
}


/**
 * Finds the parent node of a selection that matches the predicate.
 */
export function findParentNode(predicate: (node: PMNode) => boolean) {
  return (selection: any) => {
    const { $from } = selection;
    for (let i = $from.depth; i > 0; i--) {
      const node = $from.node(i);
      if (predicate(node)) {
        return {
          pos: i > 0 ? $from.before(i) : 0,
          start: $from.start(i),
          depth: i,
          node,
        };
      }
    }
    return undefined;
  };
}

/**
 * Gets the current position of a node in the document.
 */
export function getPos(node: PMNode, state: EditorState): number | undefined {
  let pos: number | undefined;
  state.doc.descendants((n, p) => {
    if (n === node) {
      pos = p;
      return false;
    }
    return true;
  });
  return pos;
}

/**
 * Checks if the selection is a NodeSelection.
 */
export function isNodeSelection(selection: any): selection is NodeSelection {
  return selection instanceof NodeSelection;
}

/**
 * Checks if the selection is a TextSelection.
 */
export function isTextSelection(selection: any): selection is TextSelection {
  return selection instanceof TextSelection;
}

/**
 * Checks if the selection is an AllSelection.
 */
export function isAllSelection(selection: any): selection is AllSelection {
  return selection instanceof AllSelection;
}

/**
 * Finds all child nodes of a parent that match the predicate.
 */
export function findChildNodes(
  node: PMNode,
  predicate: (node: PMNode) => boolean
): { node: PMNode; pos: number }[] {
  const result: { node: PMNode; pos: number }[] = [];
  node.content.forEach((child, offset) => {
    if (predicate(child)) {
      result.push({ node: child, pos: offset });
    }
  });
  return result;
}
