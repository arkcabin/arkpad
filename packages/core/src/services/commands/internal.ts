import { wrapInList } from "prosemirror-schema-list";
import { toggleMark as pmToggleMark, setBlockType, } from "prosemirror-commands";
import { type NodeType, type MarkType } from "prosemirror-model";


export const toggleMark = (type: string | MarkType, attrs?: Record<string, any>) => (props: any) => {
  const markType = typeof type === "string" ? props.state.schema.marks[type] : type;
  if (!markType) return false;
  return pmToggleMark(markType, attrs)(props.state, props.dispatch);
};

export const toggleBlock = (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
  const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
  if (!nodeType) return false;
  return setBlockType(nodeType, attrs)(props.state, props.dispatch);
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

export const insertNode = (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
  const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
  if (!nodeType) return false;
  const node = nodeType.createAndFill(attrs);
  if (!node) return false;
  props.tr.replaceSelectionWith(node);
  return true;
};

export const updateAttributes = (typeOrName: string, attributes: Record<string, any>) => (props: any) => {
  const { tr, state } = props;
  const { selection } = state;
  const { from, to } = selection;
  
  tr.doc.nodesBetween(from, to, (node, pos) => {
    const type = typeof typeOrName === "string" ? state.schema.nodes[typeOrName] || state.schema.marks[typeOrName] : typeOrName;
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
  return setBlockType(nodeType, attrs)(props.state, props.dispatch);
};

