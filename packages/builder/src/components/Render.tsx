import React from "react";
import { BlockRenderer } from "./BlockRenderer";
import { BuilderProvider, useBuilder } from "../core/BuilderContext";
import { denormalizePageConfig } from "../core/store";
import { NormalizedPageConfig, PageConfig } from "../core/types";

const isNormalizedPageConfig = (
  data: PageConfig | NormalizedPageConfig
): data is NormalizedPageConfig => {
  return !Array.isArray((data as NormalizedPageConfig).blocks);
};

const RenderInner: React.FC = () => {
  const rootIds = useBuilder((state) => state.pageConfig?.rootIds ?? []);

  if (rootIds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {rootIds.map((id) => (
        <BlockRenderer key={id} blockId={id} forceViewMode />
      ))}
    </div>
  );
};

export const Render: React.FC<{ data: PageConfig | NormalizedPageConfig }> = ({ data }) => {
  const initialConfig = React.useMemo<PageConfig>(
    () => (isNormalizedPageConfig(data) ? denormalizePageConfig(data) : data),
    [data]
  );

  return (
    <BuilderProvider initialConfig={initialConfig}>
      <RenderInner />
    </BuilderProvider>
  );
};