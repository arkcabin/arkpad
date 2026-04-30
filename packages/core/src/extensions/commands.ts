import { Extension } from "./Extension";
import { toggleMark, toggleBlock, toggleList, setTextAlign } from "./utils";
import { type NodeType } from "prosemirror-model";

export const BaseCommands = Extension.create({
  name: "baseCommands",

  addCommands: () => ({
    toggleMark: (type: any, attrs: any) => (props: any) => {
      return toggleMark(type, attrs)(props.state, props.dispatch);
    },
    toggleBlock: (type: any, attrs: any) => (props: any) => {
      return toggleBlock(type, attrs)(props.state, props.dispatch);
    },
    toggleList: (listType: NodeType, itemType: NodeType) => (props: any) => {
      return toggleList(listType, itemType)(props.state, props.dispatch);
    },
    setTextAlign: (align: string) => (props: any) => {
      return setTextAlign(align)(props.state, props.dispatch);
    },
    insertNode: (type: NodeType, attrs: any) => (props: any) => {
      const { state, dispatch } = props;
      const { tr } = state;
      if (dispatch) {
        dispatch(tr.replaceSelectionWith(type.create(attrs)).scrollIntoView());
      }
      return true;
    },
  }),
});
