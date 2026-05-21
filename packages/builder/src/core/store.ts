import { createStore } from "zustand";
import { PageBlock, PageConfig, NormalizedPageConfig, BlockProperties } from "./types";
import { blockRegistry } from "./registry";

// Unique ID Generator
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper functions for normalization
export function normalizeBlocks(blocks: PageBlock[]): {
  flatBlocks: Record<string, PageBlock>;
  rootIds: string[];
} {
  const flatBlocks: Record<string, PageBlock> = {};
  const rootIds: string[] = [];

  function traverse(block: PageBlock, parentId?: string) {
    const { children, ...rest } = block;
    const childIds = (children || []).map((child) =>
      typeof child === "string" ? child : child.id
    );

    flatBlocks[block.id] = {
      ...rest,
      parentId,
    } as any;

    if (children) {
      children.forEach((child) => {
        if (typeof child !== "string") {
          traverse(child, block.id);
        }
      });
    }

    // Replace children with IDs in the flat map
    (flatBlocks[block.id] as any).children = childIds;
  }

  blocks.forEach((block) => {
    rootIds.push(block.id);
    traverse(block);
  });

  return { flatBlocks, rootIds };
}

export function denormalizeBlocks(
  rootIds: string[],
  flatBlocks: Record<string, PageBlock>
): PageBlock[] {
  function hydrate(id: string): PageBlock {
    const block = flatBlocks[id];
    if (!block) {
      return null as any;
    }

    const childIds = (block as any).children as string[] | undefined;
    const children = (childIds || []).map((childId) => hydrate(childId)).filter(Boolean);

    return {
      ...block,
      children: children.length > 0 ? children : undefined,
    } as PageBlock;
  }

  return rootIds.map((id) => hydrate(id)).filter(Boolean);
}

export function normalizePageConfig(config: PageConfig): NormalizedPageConfig {
  const { flatBlocks, rootIds } = normalizeBlocks(config.blocks || []);
  return {
    blocks: flatBlocks,
    rootIds,
    propertyProfiles: config.propertyProfiles,
  };
}

export function denormalizePageConfig(normalized: NormalizedPageConfig): PageConfig {
  return {
    blocks: denormalizeBlocks(normalized.rootIds, normalized.blocks),
    propertyProfiles: normalized.propertyProfiles,
  };
}

export interface BuilderState {
  // State
  pageConfig: NormalizedPageConfig | null;
  currentPageSlug: string | null;
  pages: Record<string, NormalizedPageConfig>;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  draggedBlockId: string | null;

  // History State
  past: NormalizedPageConfig[];
  future: NormalizedPageConfig[];

  // Actions
  initPage: (slug: string, defaultConfig: PageConfig, options?: { force?: boolean }) => void;
  setPageConfig: (config: PageConfig) => void;
  selectBlock: (id: string | null) => void;
  setHoveredBlockId: (id: string | null) => void;
  setDraggedBlockId: (id: string | null) => void;

  updateBlock: (id: string, updates: Partial<PageBlock>) => void;
  addBlock: (block: PageBlock, parentId?: string) => void;
  removeBlock: (id: string) => void;
  moveBlock: (activeId: string, overId: string, position?: "before" | "after" | "inside") => void;
  duplicateBlock: (id: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;

  // Helpers
  getNestedConfig: () => PageConfig | null;
}

// Helper to push history states cleanly
const updatePageConfig = (
  set: any,
  get: any,
  updater: (config: NormalizedPageConfig) => NormalizedPageConfig
) => {
  const state = get();
  if (!state.pageConfig) return;

  const nextConfig = updater(state.pageConfig);
  if (JSON.stringify(state.pageConfig) === JSON.stringify(nextConfig)) return;

  const currentPageSlug = state.currentPageSlug;

  set((prev: any) => ({
    past: [...prev.past.slice(-49), prev.pageConfig],
    future: [],
    pageConfig: nextConfig,
    pages: currentPageSlug
      ? {
          ...prev.pages,
          [currentPageSlug]: nextConfig,
        }
      : prev.pages,
  }));
};

export const createBuilderStore = (initialConfig?: PageConfig) => {
  const initialNormalized = initialConfig
    ? normalizePageConfig(initialConfig)
    : { blocks: {}, rootIds: [] };

  return createStore<BuilderState>((set, get) => ({
    pageConfig: initialNormalized,
    currentPageSlug: "default",
    pages: { default: initialNormalized },
    selectedBlockId: null,
    hoveredBlockId: null,
    draggedBlockId: null,

    past: [],
    future: [],

    initPage: (slug, defaultConfig, options) => {
      const setHydratedState = (config: PageConfig) => {
        const normalized = normalizePageConfig(config);
        set((state) => {
          const keepSelected =
            state.currentPageSlug === slug &&
            !!state.selectedBlockId &&
            !!normalized.blocks[state.selectedBlockId];

          return {
            currentPageSlug: slug,
            pageConfig: normalized,
            pages: {
              ...state.pages,
              [slug]: normalized,
            },
            selectedBlockId: keepSelected ? state.selectedBlockId : null,
            hoveredBlockId: null,
            draggedBlockId: null,
            past: [],
            future: [],
          };
        });
      };

      if (options?.force) {
        setHydratedState(defaultConfig);
        return;
      }

      const cached = get().pages[slug];
      if (cached && Object.keys(cached.blocks).length > 0) {
        set(() => ({
          currentPageSlug: slug,
          pageConfig: cached,
          selectedBlockId: null,
          hoveredBlockId: null,
          draggedBlockId: null,
          past: [],
          future: [],
        }));
        return;
      }

      setHydratedState(defaultConfig);
    },

    setPageConfig: (config) => {
      const normalized = normalizePageConfig(config);
      set((state) => ({
        pageConfig: normalized,
        pages: state.currentPageSlug
          ? {
              ...state.pages,
              [state.currentPageSlug]: normalized,
            }
          : state.pages,
        past: [],
        future: [],
      }));
    },

    selectBlock: (id) => set({ selectedBlockId: id }),
    setHoveredBlockId: (id) => set({ hoveredBlockId: id }),
    setDraggedBlockId: (id) => set({ draggedBlockId: id }),

    updateBlock: (id, updates) => {
      updatePageConfig(set, get, (pageConfig) => {
        if (!pageConfig.blocks[id]) return pageConfig;

        const updatedBlock = {
          ...pageConfig.blocks[id],
          ...updates,
          // Merge props and styles if provided
          props: updates.props
            ? { ...pageConfig.blocks[id].props, ...updates.props }
            : pageConfig.blocks[id].props,
          styles: updates.styles
            ? { ...pageConfig.blocks[id].styles, ...updates.styles }
            : pageConfig.blocks[id].styles,
        } as PageBlock;

        return {
          ...pageConfig,
          blocks: {
            ...pageConfig.blocks,
            [id]: updatedBlock,
          },
        };
      });
    },

    addBlock: (block, parentId) => {
      updatePageConfig(set, get, (pageConfig) => {
        const id = block.id;
        const newBlocks = { ...pageConfig.blocks };
        let newRootIds = [...pageConfig.rootIds];

        // Spread block first, then override parentId and children (no duplicate keys)
        newBlocks[id] = {
          props: {},
          styles: {},
          ...block,
          parentId,
          children: block.children || [],
        };

        if (!parentId) {
          newRootIds.push(id);
        } else {
          const parent = newBlocks[parentId];
          if (parent) {
            const parentChildren = Array.isArray(parent.children) ? [...parent.children] : [];
            newBlocks[parentId] = {
              ...parent,
              children: [...parentChildren, id] as string[],
            };
          }
        }

        return {
          ...pageConfig,
          blocks: newBlocks,
          rootIds: newRootIds,
        };
      });

      set({ selectedBlockId: block.id });
    },

    removeBlock: (id) => {
      const { pageConfig } = get();
      if (!pageConfig || !pageConfig.blocks[id]) return;

      updatePageConfig(set, get, (currentConfig) => {
        const newBlocks = { ...currentConfig.blocks };
        const blockToRemove = newBlocks[id];
        if (!blockToRemove) return currentConfig;
        const parentId = blockToRemove.parentId;

        const collectIds = (blockId: string, ids: string[] = []) => {
          ids.push(blockId);
          const children = (newBlocks[blockId] as any)?.children as string[];
          if (children && Array.isArray(children)) {
            children.forEach((childId) => collectIds(childId, ids));
          }
          return ids;
        };

        const idsToDelete = collectIds(id);
        idsToDelete.forEach((deleteId) => delete newBlocks[deleteId]);

        let newRootIds = currentConfig.rootIds;
        if (!parentId) {
          newRootIds = currentConfig.rootIds.filter((rid) => rid !== id);
        } else if (newBlocks[parentId]) {
          const parent = newBlocks[parentId];
          newBlocks[parentId] = {
            ...parent,
            children: ((parent.children as string[]) || []).filter((cid) => cid !== id),
          };
        }

        return {
          ...currentConfig,
          blocks: newBlocks,
          rootIds: newRootIds,
        };
      });

      set((state) => ({
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      }));
    },

    moveBlock: (activeId, overId, position = "before") => {
      const { pageConfig } = get();
      if (!pageConfig || !pageConfig.blocks[activeId] || activeId === overId) return;

      // Prevent circular nested drops
      const isDescendant = (parent: string, child: string): boolean => {
        let current = pageConfig.blocks[child]?.parentId;
        while (current) {
          if (current === parent) return true;
          current = pageConfig.blocks[current]?.parentId;
        }
        return false;
      };

      if (overId !== "root-canvas" && isDescendant(activeId, overId)) {
        console.warn("Circular reference: Cannot drop a block inside one of its descendants.");
        return;
      }

      updatePageConfig(set, get, (currentConfig) => {
        const newBlocks = { ...currentConfig.blocks };
        let newRootIds = [...currentConfig.rootIds];

        const existingActive = newBlocks[activeId];
        if (!existingActive) return currentConfig;
        const activeBlock: typeof existingActive = { ...existingActive };
        const oldParentId = activeBlock.parentId;

        // 1. Remove from old parent list or root list
        if (!oldParentId) {
          newRootIds = newRootIds.filter((id) => id !== activeId);
        } else if (newBlocks[oldParentId]) {
          newBlocks[oldParentId] = {
            ...newBlocks[oldParentId],
            children: ((newBlocks[oldParentId].children as string[]) || []).filter(
              (id) => id !== activeId
            ),
          };
        }

        // 2. Insert into new parent list or root list
        if (overId === "root-canvas") {
          newRootIds.push(activeId);
          activeBlock.parentId = undefined;
        } else if (position === "inside") {
          const target = newBlocks[overId];
          if (target) {
            newBlocks[overId] = {
              ...target,
              children: [...((target.children as string[]) || []), activeId],
            };
            activeBlock.parentId = overId;
          }
        } else {
          // Reordering before or after target block
          const targetBlock = newBlocks[overId];
          const newParentId = targetBlock?.parentId;
          activeBlock.parentId = newParentId;

          if (!newParentId) {
            const index = newRootIds.indexOf(overId);
            const insertIndex = position === "after" ? index + 1 : index;
            newRootIds.splice(insertIndex, 0, activeId);
          } else if (newBlocks[newParentId]) {
            const parent = newBlocks[newParentId];
            const children = [...((parent.children as string[]) || [])];
            const index = children.indexOf(overId);
            const insertIndex = position === "after" ? index + 1 : index;
            children.splice(insertIndex, 0, activeId);
            newBlocks[newParentId] = {
              ...parent,
              children,
            };
          }
        }

        newBlocks[activeId] = activeBlock;

        return {
          ...currentConfig,
          blocks: newBlocks,
          rootIds: newRootIds,
        };
      });
    },

    duplicateBlock: (id) => {
      const { pageConfig } = get();
      if (!pageConfig || !pageConfig.blocks[id]) return;

      let newBlockId = `block-${generateId()}`;

      updatePageConfig(set, get, (currentConfig) => {
        const newBlocks = { ...currentConfig.blocks };
        let newRootIds = [...currentConfig.rootIds];
        const blockToDuplicate = newBlocks[id];
        if (!blockToDuplicate) return currentConfig;
        const parentId = blockToDuplicate.parentId;

        // Recursive helper to clone a block and all its descendants
        const cloneRecursive = (originalId: string, newParent?: string): string => {
          const orig = newBlocks[originalId];
          if (!orig) return originalId;
          const clonedId = `block-${generateId()}`;

          const childrenIds = ((orig.children as string[]) || []).map((cid) =>
            cloneRecursive(cid, clonedId)
          );

          newBlocks[clonedId] = {
            ...orig,
            id: clonedId,
            parentId: newParent,
            children: childrenIds,
            props: JSON.parse(JSON.stringify(orig.props ?? {})),
            styles: JSON.parse(JSON.stringify(orig.styles ?? {})),
          };

          return clonedId;
        };

        newBlockId = cloneRecursive(id, parentId);

        if (!parentId) {
          const index = newRootIds.indexOf(id);
          newRootIds.splice(index + 1, 0, newBlockId);
        } else if (newBlocks[parentId]) {
          const parent = newBlocks[parentId];
          const children = [...((parent.children as string[]) || [])];
          const index = children.indexOf(id);
          children.splice(index + 1, 0, newBlockId);
          newBlocks[parentId] = {
            ...parent,
            children,
          };
        }

        return {
          ...currentConfig,
          blocks: newBlocks,
          rootIds: newRootIds,
        };
      });

      set({ selectedBlockId: newBlockId });
    },

    undo: () => {
      const { past, pageConfig, future } = get();
      if (past.length === 0 || !pageConfig) return;

      const previous = past[past.length - 1];
      if (!previous) return;
      const newPast = past.slice(0, past.length - 1);
      const currentPageSlug = get().currentPageSlug;

      set({
        past: newPast,
        pageConfig: previous,
        future: [pageConfig, ...future],
        selectedBlockId: null,
        pages: currentPageSlug
          ? ({ ...get().pages, [currentPageSlug]: previous } as Record<string, NormalizedPageConfig>)
          : get().pages,
      });
    },

    redo: () => {
      const { past, pageConfig, future } = get();
      if (future.length === 0 || !pageConfig) return;

      const next = future[0];
      if (!next) return;
      const newFuture = future.slice(1);
      const currentPageSlug = get().currentPageSlug;

      set({
        past: [...past, pageConfig],
        pageConfig: next,
        future: newFuture,
        selectedBlockId: null,
        pages: currentPageSlug
          ? ({ ...get().pages, [currentPageSlug]: next } as Record<string, NormalizedPageConfig>)
          : get().pages,
      });
    },

    getNestedConfig: () => {
      const { pageConfig } = get();
      if (!pageConfig) return null;
      return denormalizePageConfig(pageConfig);
    },
  }));
};

