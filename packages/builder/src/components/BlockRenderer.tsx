import React, { useContext, createContext } from "react";
import { PageBlock } from "../core/types";
import { blockRegistry } from "../core/registry";
import { useBuilder } from "../core/BuilderContext";
import { BlockWrapper } from "./BlockWrapper";

interface BlockRendererContextValue {
  forceViewMode?: boolean;
  blocks?: Record<string, PageBlock> | PageBlock[];
}

const BlockRendererContext = createContext<BlockRendererContextValue>({});

export const useBlockRendererContext = () => useContext(BlockRendererContext);

export const BlockRendererProvider = BlockRendererContext.Provider;

interface BlockRendererProps {
  blockId?: string;
  block?: PageBlock;
  index?: number;
  forceViewMode?: boolean;
  parentId?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = React.memo(function BlockRenderer({
  blockId,
  block: propBlock,
  index,
  forceViewMode,
  parentId,
}) {
  const updateBlock = useBuilder((s) => s.updateBlock);
  const context = useBlockRendererContext();
  
  const blocksFromStore = useBuilder((s) => s.pageConfig?.blocks);
  const blockFromStore = useBuilder((s) => s.pageConfig?.blocks[blockId || ""]);

  const effectiveForceViewMode = forceViewMode ?? context.forceViewMode;

  // Resolve block from context if not provided
  let block = propBlock;
  if (!block && blockId) {
    if (Array.isArray(context.blocks)) {
      block = context.blocks.find((b) => b.id === blockId);
    } else if (context.blocks && context.blocks[blockId]) {
      block = context.blocks[blockId];
    }
  }

  // Fallback to store if still not found and not forcing view mode
  if (!block && !effectiveForceViewMode) {
    block = blockFromStore;
  }

  const handleUpdate = React.useCallback(
    (newConfig: Partial<PageBlock>) => {
      if (!block) return;
      updateBlock(block.id, newConfig);
    },
    [block, updateBlock]
  );

  const preservedMargins = React.useMemo(() => {
    if (!block) return null;
    const s = block.styles ?? {};
    return {
      margin: s.margin,
      marginTop: s.marginTop,
      marginRight: s.marginRight,
      marginBottom: s.marginBottom,
      marginLeft: s.marginLeft,
    } as const;
  }, [block]);

  const editorBlock = React.useMemo(() => {
    if (!block) return null;
    const s = block.styles;
    if (!s) return block;
    if (
      s.margin === undefined &&
      s.marginTop === undefined &&
      s.marginRight === undefined &&
      s.marginBottom === undefined &&
      s.marginLeft === undefined
    ) {
      return block;
    }

    const stylesWithoutMargins = { ...s };
    delete stylesWithoutMargins.margin;
    delete stylesWithoutMargins.marginTop;
    delete stylesWithoutMargins.marginRight;
    delete stylesWithoutMargins.marginBottom;
    delete stylesWithoutMargins.marginLeft;
    delete stylesWithoutMargins.className;

    return { ...block, styles: stylesWithoutMargins };
  }, [block]);

  const handleUpdateEditor = React.useCallback(
    (newConfig: Partial<PageBlock>) => {
      if (!block || !preservedMargins) return;
      updateBlock(block.id, {
        ...newConfig,
        styles: {
          ...(newConfig.styles ?? {}),
          ...(preservedMargins.margin !== undefined ? { margin: preservedMargins.margin } : null),
          ...(preservedMargins.marginTop !== undefined ? { marginTop: preservedMargins.marginTop } : null),
          ...(preservedMargins.marginRight !== undefined ? { marginRight: preservedMargins.marginRight } : null),
          ...(preservedMargins.marginBottom !== undefined ? { marginBottom: preservedMargins.marginBottom } : null),
          ...(preservedMargins.marginLeft !== undefined ? { marginLeft: preservedMargins.marginLeft } : null),
        },
      });
    },
    [block, preservedMargins, updateBlock]
  );

  const effectiveBlocks = effectiveForceViewMode
    ? (block as any)?.children || context.blocks
    : context.blocks || blocksFromStore;

  if (!block) return null;

  // We are in edit mode if forceViewMode is false
  const isEditing = !effectiveForceViewMode;

  const isRootContainer =
    block.id === "root-container" ||
    block.id === "root-canvas" ||
    (block.type === "container" &&
      Boolean((block.props as { isRoot?: boolean } | undefined)?.isRoot));

  const definition = blockRegistry.get(block.type);

  if (!definition) {
    return (
      <div className="flex items-center gap-2 p-3 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded border-dashed">
        <span>
          Unknown block type:{" "}
          <code className="text-xs bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">
            {block.type}
          </code>
        </span>
      </div>
    );
  }

  const BlockComponent = definition.component;

  if (!isEditing) {
    if (!block.enabled) return null;
    return (
      <BlockRendererProvider
        value={{ forceViewMode: effectiveForceViewMode, blocks: effectiveBlocks }}
      >
        <BlockComponent
          id={block.id}
          props={block.props || {}}
          styles={block.styles}
          interactions={block.interactions}
          isEditing={false}
          updateBlock={handleUpdate}
        />
      </BlockRendererProvider>
    );
  }

  if (isRootContainer) {
    return (
      <BlockRendererProvider
        value={{ forceViewMode: effectiveForceViewMode, blocks: effectiveBlocks }}
      >
        <BlockComponent
          id={block.id}
          props={block.props || {}}
          styles={block.styles}
          interactions={block.interactions}
          isEditing={true}
          updateBlock={handleUpdate}
        />
      </BlockRendererProvider>
    );
  }

  return (
    <BlockRendererProvider
      value={{ forceViewMode: effectiveForceViewMode, blocks: effectiveBlocks }}
    >
      <BlockWrapper
        id={block.id}
        enabled={block.enabled}
        label={definition.name}
        icon={definition.icon}
        index={index}
        parentId={parentId}
        styles={block.styles}
      >
        <BlockComponent
          id={block.id}
          props={editorBlock?.props || {}}
          styles={editorBlock?.styles}
          interactions={editorBlock?.interactions}
          isEditing={true}
          updateBlock={handleUpdateEditor}
        />
      </BlockWrapper>
    </BlockRendererProvider>
  );
});
