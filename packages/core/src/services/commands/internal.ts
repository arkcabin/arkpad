import { wrapInList } from "prosemirror-schema-list";
import {
  toggleMark as pmToggleMark,
  setBlockType,
  wrapIn as pmWrapIn,
  lift as pmLift,
} from "prosemirror-commands";
import { type NodeType, type MarkType } from "prosemirror-model";
import { NodeSelection } from "prosemirror-state";

export const toggleMark =
  (type: string | MarkType, attrs?: Record<string, any>) => (props: any) => {
    const markType = typeof type === "string" ? props.state.schema.marks[type] : type;
    if (!markType) return false;
    return pmToggleMark(markType, attrs)(props.state, props.dispatch);
  };

export const wrapIn = (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
  const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
  if (!nodeType) return false;
  return pmWrapIn(nodeType, attrs)(props.state, props.dispatch);
};

export const lift = () => (props: any) => {
  return pmLift(props.state, props.dispatch);
};

export const toggleBlock =
  (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
    const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
    if (!nodeType) return false;

    if (nodeType.isTextblock) {
      return setBlockType(nodeType, attrs)(props.state, props.dispatch);
    }

    // If it's a layout block (not a textblock), we should replace the current node or wrap it
    if (props.dispatch) {
      const isActive = props.editor.isActive(
        typeof type === "string" ? type : nodeType.name,
        attrs
      );
      if (isActive) {
        return pmLift(props.state, props.dispatch);
      }
      return pmWrapIn(nodeType, attrs)(props.state, props.dispatch);
    }
    return true;
  };

export const setTextAlign = (align: string) => (props: any) => {
  const { tr, dispatch, state } = props;
  const { selection } = state;
  const { from, to } = selection;

  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isBlock) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, align });
    }
  });

  if (dispatch) dispatch(tr);
  return true;
};

export const insertNode =
  (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
    const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
    if (!nodeType) return false;
    const node = nodeType.createAndFill(attrs);
    if (!node) return false;
    props.tr.replaceSelectionWith(node);
    return true;
  };

export const updateAttributes =
  (typeOrName: string, attributes: Record<string, any>) => (props: any) => {
    const { tr, state } = props;
    const { selection } = state;
    const { from, to } = selection;

    tr.doc.nodesBetween(from, to, (node, pos) => {
      const type =
        typeof typeOrName === "string"
          ? state.schema.nodes[typeOrName] || state.schema.marks[typeOrName]
          : typeOrName;
      if (node.type === type) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attributes });
      }
    });
    return true;
  };

export const toggleList = (listType: string | NodeType) => (props: any) => {
  const lType = typeof listType === "string" ? props.state.schema.nodes[listType] : listType;
  if (!lType) return false;
  return wrapInList(lType)(props.state, props.dispatch);
};

export const setNode = (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
  const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
  if (!nodeType) return false;

  if (nodeType.isTextblock) {
    const isActive = props.editor.isActive(typeof type === "string" ? type : nodeType.name, attrs);
    if (isActive) {
      return setBlockType(props.state.schema.nodes.paragraph!, attrs)(props.state, props.dispatch);
    }
    return setBlockType(nodeType, attrs)(props.state, props.dispatch);
  }

  if (props.dispatch) {
    const node = nodeType.createAndFill(attrs);
    if (node) {
      props.tr.replaceSelectionWith(node);
    }
  }
  return true;
};

export const insertContent = (content: any) => (props: any) => {
  const { tr, state } = props;
  const node = state.schema.nodeFromJSON(content);

  if (!node) return false;

  // If the selection is at the doc root and invalid for text,
  // insert at the end of the doc instead of replacing selection.
  if (
    state.selection.$from.parent.type.name === "doc" &&
    !state.selection.$from.parent.type.allowsContent(state.schema.nodes.text!)
  ) {
    tr.insert(state.doc.content.size, node);
  } else {
    tr.replaceSelectionWith(node);
  }

  return true;
};

export const deleteNode = (pos?: number) => (props: any) => {
  const { tr, state } = props;
  const position = pos ?? state.selection.from;
  const node = state.doc.nodeAt(position);
  if (!node) return false;
  tr.delete(position, position + node.nodeSize);
  return true;
};

export const duplicateNode = (pos?: number) => (props: any) => {
  const { tr, state } = props;
  const position = pos ?? state.selection.from;
  const node = state.doc.nodeAt(position);
  if (!node) return false;
  const newNode = node.copy(node.content);
  tr.insert(position + node.nodeSize, newNode);
  return true;
};

export const moveNodeUp = (pos?: number) => (props: any) => {
  const { tr, state, dispatch } = props;
  const position = pos ?? state.selection.from;
  const node = state.doc.nodeAt(position);
  if (!node) return false;

  const $pos = state.doc.resolve(position);
  if ($pos.index() === 0) return false;

  const prevNode = $pos.parent.child($pos.index() - 1);
  const prevPos = position - prevNode.nodeSize;

  if (dispatch) {
    tr.delete(position, position + node.nodeSize);
    tr.insert(prevPos, node);
    tr.setSelection(NodeSelection.create(tr.doc, prevPos));
    dispatch(tr);
  }
  return true;
};

export const moveNodeDown = (pos?: number) => (props: any) => {
  const { tr, state, dispatch } = props;
  const position = pos ?? state.selection.from;
  const node = state.doc.nodeAt(position);
  if (!node) return false;

  const $pos = state.doc.resolve(position);
  if ($pos.index() === $pos.parent.childCount - 1) return false;

  const nextNode = $pos.parent.child($pos.index() + 1);
  const nextPos = position + nextNode.nodeSize;

  if (dispatch) {
    tr.delete(position, position + node.nodeSize);
    tr.insert(nextPos, node);
    tr.setSelection(NodeSelection.create(tr.doc, nextPos));
    dispatch(tr);
  }
  return true;
};

export const insertContentAt = (pos: number, content: any) => (props: any) => {
  const { tr, state } = props;
  const node = state.schema.nodeFromJSON(content);
  if (!node) return false;
  tr.insert(pos, node);
  return true;
};
