import React, { useState, useMemo } from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { Table, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import clsx from "clsx";

interface MockRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  [key: string]: any;
}

const DEFAULT_ROWS: MockRow[] = [
  { id: "1", name: "Vartik Anand", email: "vartik@example.com", role: "Developer", status: "Active" },
  { id: "2", name: "Shashank Sahu", email: "shashank@example.com", role: "Designer", status: "Active" },
  { id: "3", name: "John Doe", email: "john@example.com", role: "Contributor", status: "Inactive" },
  { id: "4", name: "Jane Smith", email: "jane@example.com", role: "Manager", status: "Active" },
  { id: "5", name: "Bob Johnson", email: "bob@example.com", role: "Subscriber", status: "Inactive" },
];

const DEFAULT_COLUMNS = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status" },
];

export const TableBlock: React.FC<BlockComponentProps> = ({
  id,
  props = {},
  styles = {},
  isEditing,
  updateBlock,
}) => {
  const {
    titleText = "Records List",
    showTitle = true,
    showSearch = true,
    showPagination = true,
    dense = false,
    columnsJson = "",
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = dense ? 5 : 3;

  // Parse columns config or fallback to default
  const columns = useMemo(() => {
    if (columnsJson && typeof columnsJson === "string") {
      try {
        const parsed = JSON.parse(columnsJson);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Fallback silently to default
      }
    }
    return DEFAULT_COLUMNS;
  }, [columnsJson]);

  // Filter & Paginate mock rows
  const filteredRows = useMemo(() => {
    return DEFAULT_ROWS.filter((row) => {
      const searchLower = searchQuery.toLowerCase();
      return columns.some((col) => {
        const val = row[col.accessorKey];
        return val && String(val).toLowerCase().includes(searchLower);
      });
    });
  }, [searchQuery, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  return (
    <div
      className={clsx(
        "w-full flex flex-col bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs font-mono uppercase transition-all duration-150 rounded-none",
        styles.className
      )}
      style={{
        width: styles.width,
        height: styles.height,
        marginTop: styles.marginTop,
        marginRight: styles.marginRight,
        marginBottom: styles.marginBottom,
        marginLeft: styles.marginLeft,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
      }}
    >
      {/* Header controls (Title & Search) */}
      {(showTitle || showSearch) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-neutral-300 dark:border-neutral-800 p-3 gap-2.5">
          {showTitle && (
            <h3 className="text-[10px] font-bold tracking-widest text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
              <Table className="w-3.5 h-3.5 opacity-70" />
              <span>{titleText}</span>
            </h3>
          )}

          {showSearch && (
            <div className="relative flex items-center w-full sm:w-48">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-neutral-450 dark:text-neutral-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={isEditing}
                className="w-full pl-8 pr-2.5 py-1 text-[10px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 rounded-none transition-all duration-150"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Grid View */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2 text-[10px] font-bold tracking-wider text-neutral-600 dark:text-neutral-400 border-r border-neutral-300 last:border-r-0 dark:border-neutral-800"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rIdx) => (
                <tr
                  key={row.id}
                  className={clsx(
                    "border-b border-neutral-300 dark:border-neutral-800 last:border-b-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors",
                    rIdx % 2 === 1 && "bg-neutral-50/20 dark:bg-neutral-900/5"
                  )}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-4 py-2.5 text-[10px] text-neutral-800 dark:text-neutral-200 border-r border-neutral-300 last:border-r-0 dark:border-neutral-800"
                    >
                      {row[col.accessorKey] !== undefined ? String(row[col.accessorKey]) : "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-600 tracking-wider"
                >
                  No records match query
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && (
        <div className="flex items-center justify-between border-t border-neutral-300 dark:border-neutral-800 p-2.5 text-[9px] text-neutral-500 font-bold select-none">
          <div>
            Showing {filteredRows.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || isEditing}
              className="p-1 hover:bg-neutral-150 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none border border-neutral-300 dark:border-neutral-850"
            >
              <ChevronsLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1 || isEditing}
              className="p-1 hover:bg-neutral-150 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none border border-neutral-300 dark:border-neutral-850"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages || isEditing}
              className="p-1 hover:bg-neutral-150 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none border border-neutral-300 dark:border-neutral-850"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || isEditing}
              className="p-1 hover:bg-neutral-150 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none border border-neutral-300 dark:border-neutral-850"
            >
              <ChevronsRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const TableBlockConfig: BlockConfig = {
  type: "table",
  name: "Data Table Grid",
  description: "Monochrome HUD tabular list viewer for collection data.",
  icon: Table,
  component: TableBlock,
  defaultProps: {
    titleText: "Records List",
    showTitle: true,
    showSearch: true,
    showPagination: true,
    dense: false,
    columnsJson: "",
  },
  defaultStyles: {
    width: "100%",
  },
  editorFields: [
    {
      name: "titleText",
      label: "Table Title Label",
      type: "text",
      defaultValue: "Records List",
    },
    {
      name: "showTitle",
      label: "Display Table Title",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "showSearch",
      label: "Display Search Bar",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "showPagination",
      label: "Display Pagination Footer",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "dense",
      label: "Dense Rows Layout (Compact)",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "columnsJson",
      label: "Columns Schema JSON",
      type: "textarea",
      defaultValue: "",
      placeholder: '[{"accessorKey": "name", "header": "Name"}]',
      description: "Optional custom column overrides formatted in JSON array format.",
    },
  ],
};
