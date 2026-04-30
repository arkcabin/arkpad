import { setBlockType, lift, wrapIn, toggleMark as pmToggleMark } from "prosemirror-commands";
import { wrapInList, liftListItem } from "prosemirror-schema-list";
import { InputRule } from "prosemirror-inputrules";
export function markInputRule(regexp, markType, getAttrs) {
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
export function isMarkActive(state, type) {
    const { from, to, empty, $from } = state.selection;
    if (empty) {
        return !!type.isInSet(state.storedMarks || $from.marks());
    }
    return state.doc.rangeHasMark(from, to, type);
}
/**
 * Checks if a node is active in the current selection.
 */
export function isNodeActive(state, type, attrs = {}) {
    const { from, to, empty, $from } = state.selection;
    // Look up the parent tree of the selection
    for (let depth = $from.depth; depth >= 0; depth--) {
        const node = $from.node(depth);
        if (node.type === type) {
            const hasMatchingAttrs = Object.entries(attrs).every(([key, value]) => node.attrs[key] === value);
            if (hasMatchingAttrs) {
                return true;
            }
        }
    }
    // Fallback: If it's a range selection, check if the range contains the node type
    if (!empty) {
        let foundInRange = false;
        state.doc.nodesBetween(from, to, (node) => {
            if (foundInRange)
                return false;
            if (node.type === type) {
                const hasMatchingAttrs = Object.entries(attrs).every(([key, value]) => node.attrs[key] === value);
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
export function getMarkAttributes(state, type) {
    const { from, to, $from, empty } = state.selection;
    const marks = empty ? $from.marks() || state.storedMarks : [];
    if (empty && marks) {
        const mark = marks.find((m) => m.type === type);
        return mark ? mark.attrs : null;
    }
    let attrs = null;
    state.doc.nodesBetween(from, to, (node) => {
        const mark = node.marks.find((m) => m.type === type);
        if (mark)
            attrs = mark.attrs;
    });
    return attrs;
}
/**
 * Gets attributes of a node in the current selection.
 */
export function getNodeAttributes(state, type) {
    const { from, to, $from, empty } = state.selection;
    let attrs = null;
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
 * Smart toggle for marks.
 */
export function toggleMark(type, attrs = {}) {
    return pmToggleMark(type, attrs);
}
/**
 * Smart toggle for block nodes.
 */
export function toggleBlock(type, attrs = {}) {
    return (state, dispatch) => {
        const { $from } = state.selection;
        let isActive = false;
        for (let depth = $from.depth; depth >= 0; depth--) {
            const node = $from.node(depth);
            if (node.type === type) {
                const hasMatchingAttrs = Object.entries(attrs).every(([k, v]) => node.attrs[k] === v);
                if (hasMatchingAttrs) {
                    isActive = true;
                    break;
                }
            }
        }
        if (isActive) {
            if (type.name === "blockquote") {
                return lift(state, dispatch);
            }
            return setBlockType(state.schema.nodes.paragraph, {
                align: $from.parent.attrs.align || "left",
            })(state, dispatch);
        }
        if (type.name === "blockquote") {
            return wrapIn(type)(state, dispatch);
        }
        return setBlockType(type, attrs)(state, dispatch);
    };
}
/**
 * Smart toggle for list nodes.
 */
export function toggleList(listType, itemType) {
    return (state, dispatch) => {
        const { $from, $to } = state.selection;
        const range = $from.blockRange($to);
        if (!range)
            return false;
        // Search for the list node at all depths
        let listDepth = -1;
        for (let d = $from.depth; d >= 0; d--) {
            const node = $from.node(d);
            const name = node.type.name.toLowerCase();
            if (name.includes("list") && !name.includes("item")) {
                listDepth = d;
                break;
            }
        }
        if (listDepth > -1) {
            const currentList = $from.node(listDepth);
            if (currentList.type === listType) {
                // Same type: Toggle off by lifting
                return liftListItem(itemType)(state, dispatch);
            }
            else {
                // Different type: Switch it
                if (dispatch) {
                    const listPos = $from.before(listDepth);
                    const listNode = state.doc.nodeAt(listPos);
                    if (listNode) {
                        const tr = state.tr;
                        const items = [];
                        listNode.content.forEach((item) => {
                            // If it's already an item, convert it to the target item type
                            // otherwise wrap it
                            if (item.type.name.toLowerCase().includes("item")) {
                                items.push(itemType.create(item.attrs, item.content));
                            }
                            else {
                                items.push(itemType.create(null, item));
                            }
                        });
                        const newList = listType.create(currentList.attrs, items);
                        dispatch(tr.replaceWith(listPos, listPos + listNode.nodeSize, newList).scrollIntoView());
                    }
                }
                return true;
            }
        }
        return wrapInList(listType)(state, dispatch);
    };
}
/**
 * Command to set text alignment.
 */
export function setTextAlign(align) {
    return (state, dispatch) => {
        const { from, to } = state.selection;
        const tr = state.tr;
        let modified = false;
        state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isTextblock) {
                // More robust check for align attribute existence
                if (node.type.spec.attrs && "align" in node.type.spec.attrs) {
                    if (node.attrs.align !== align) {
                        tr.setNodeMarkup(pos, undefined, { ...node.attrs, align });
                        modified = true;
                    }
                }
            }
        });
        if (modified) {
            if (dispatch)
                dispatch(tr);
            return true;
        }
        return false;
    };
}
