import React from "react";
import { LayoutJSON } from "../core/types";
import { blockRegistry } from "../core/registry";

interface RenderProps {
  data: LayoutJSON;
}

export const Render: React.FC<RenderProps> = ({ data }) => {
  if (!data || !data.rows || data.rows.length === 0) return null;

  return (
    <div className="w-full space-y-8 font-sans">
      {data.rows.map((row) => (
        <div key={row.id} className="w-full">
          <div className="grid grid-cols-12 gap-4">
            {row.columns.map((col) => {
              // Safely map column width (1-12) to Tailwind CSS grid classes
              const colSpanClass = {
                1: "col-span-1",
                2: "col-span-2",
                3: "col-span-3",
                4: "col-span-4",
                5: "col-span-5",
                6: "col-span-6",
                7: "col-span-7",
                8: "col-span-8",
                9: "col-span-9",
                10: "col-span-10",
                11: "col-span-11",
                12: "col-span-12",
              }[col.width] || "col-span-12";

              return (
                <div key={col.id} className={colSpanClass}>
                  <div className="flex flex-col space-y-4">
                    {col.blocks.map((block) => {
                      const config = blockRegistry.get(block.type);
                      if (!config) {
                        return (
                          <div key={block.id} className="p-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded">
                            Component "{block.type}" is not registered.
                          </div>
                        );
                      }

                      const BlockComponent = config.component;

                      return (
                        <div key={block.id} className="w-full">
                          <BlockComponent
                            id={block.id}
                            properties={block.properties}
                            updateProperties={() => {}} // Read-only: no updates allowed in renderer view
                            isEditing={false}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
