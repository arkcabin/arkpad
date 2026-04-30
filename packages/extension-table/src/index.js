import { Extension } from "@arkpad/core";
import { tableEditing, columnResizing, addColumnBefore, addColumnAfter, deleteColumn, addRowBefore, addRowAfter, deleteRow, deleteTable, mergeCells, splitCell, toggleHeaderColumn, toggleHeaderRow, toggleHeaderCell, setCellAttr, fixTables, tableNodes } from "prosemirror-tables";
export const Table = Extension.create({
    name: "table",
    addOptions() {
        return {
            resizable: false,
            lastColumnResizable: true,
            allowTableNodeSelection: false,
        };
    },
    addNodes() {
        return tableNodes({
            tableGroup: 'block',
            cellContent: 'block+',
            cellAttributes: {
                background: {
                    default: null,
                    getFromDOM(dom) {
                        return dom.style.backgroundColor || null;
                    },
                    setDOMAttr(value, attrs) {
                        if (value)
                            attrs.style = (attrs.style || '') + `background-color: ${value};`;
                    },
                },
            },
        });
    },
    addCommands() {
        return {
            insertTable: ({ rows = 3, cols = 3, withHeaderRow = true } = {}) => (props) => {
                const { state, dispatch } = props;
                const { schema } = state;
                const type = schema.nodes.table;
                if (!type)
                    return false;
                const rowType = schema.nodes.table_row;
                const cellType = schema.nodes.table_cell;
                const headerType = schema.nodes.table_header;
                const rows_nodes = [];
                for (let i = 0; i < rows; i++) {
                    const cells = [];
                    for (let j = 0; j < cols; j++) {
                        const type = (withHeaderRow && i === 0) ? headerType : cellType;
                        cells.push(type.createAndFill());
                    }
                    rows_nodes.push(rowType.create(null, cells));
                }
                const table = type.create(null, rows_nodes);
                if (dispatch)
                    dispatch(state.tr.replaceSelectionWith(table).scrollIntoView());
                return true;
            },
            addColumnBefore: () => (props) => addColumnBefore(props.state, props.dispatch),
            addColumnAfter: () => (props) => addColumnAfter(props.state, props.dispatch),
            deleteColumn: () => (props) => deleteColumn(props.state, props.dispatch),
            addRowBefore: () => (props) => addRowBefore(props.state, props.dispatch),
            addRowAfter: () => (props) => addRowAfter(props.state, props.dispatch),
            deleteRow: () => (props) => deleteRow(props.state, props.dispatch),
            deleteTable: () => (props) => deleteTable(props.state, props.dispatch),
            mergeCells: () => (props) => mergeCells(props.state, props.dispatch),
            splitCell: () => (props) => splitCell(props.state, props.dispatch),
            toggleHeaderColumn: () => (props) => toggleHeaderColumn(props.state, props.dispatch),
            toggleHeaderRow: () => (props) => toggleHeaderRow(props.state, props.dispatch),
            toggleHeaderCell: () => (props) => toggleHeaderCell(props.state, props.dispatch),
            setCellAttr: (name, value) => (props) => setCellAttr(name, value)(props.state, props.dispatch),
            fixTables: () => (props) => {
                const tr = fixTables(props.state);
                if (tr && props.dispatch) {
                    props.dispatch(tr);
                    return true;
                }
                return false;
            },
        };
    },
    addProseMirrorPlugins() {
        const plugins = [tableEditing()];
        if (this.options.resizable) {
            plugins.push(columnResizing({
                handleWidth: 5,
                cellMinWidth: 25,
                lastColumnResizable: this.options.lastColumnResizable,
            }));
        }
        return plugins;
    },
});
