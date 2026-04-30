import { Extension } from "./Extension";
import { toggleMark, toggleBlock, toggleList, setTextAlign } from "./utils";
export const BaseCommands = Extension.create({
    name: "baseCommands",
    addCommands: () => ({
        toggleMark: (type, attrs) => (props) => {
            return toggleMark(type, attrs)(props.state, props.dispatch);
        },
        toggleBlock: (type, attrs) => (props) => {
            return toggleBlock(type, attrs)(props.state, props.dispatch);
        },
        toggleList: (listType, itemType) => (props) => {
            return toggleList(listType, itemType)(props.state, props.dispatch);
        },
        setTextAlign: (align) => (props) => {
            return setTextAlign(align)(props.state, props.dispatch);
        },
        insertNode: (type, attrs) => (props) => {
            const { state, dispatch } = props;
            const { tr } = state;
            if (dispatch) {
                dispatch(tr.replaceSelectionWith(type.create(attrs)).scrollIntoView());
            }
            return true;
        },
    }),
});
