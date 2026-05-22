import React from "react";
import { TopNav } from "../components/navigation/TopNav";
import { BLOCK_LIBRARY } from "../features/builder/blockLibrary";
import { BlockRenderer } from "../features/builder/BlockRenderer";
import { PropertiesPanel } from "../features/builder/PropertiesPanel";
import type { Block, BlockType } from "../features/builder/types";

let idCounter = 1;
function uid() {
  return `blk-${Date.now()}-${idCounter++}`;
}

function createBlock(type: BlockType): Block {
  const meta = BLOCK_LIBRARY.find((b) => b.type === type)!;
  return { id: uid(), type, props: { ...meta.defaultProps } } as Block;
}

export function BuilderPage() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [draggingNewType, setDraggingNewType] = React.useState<BlockType | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  function addBlock(type: BlockType, atIndex?: number) {
    const block = createBlock(type);
    setBlocks((prev) => {
      const next = [...prev];
      if (atIndex !== undefined) next.splice(atIndex, 0, block);
      else next.push(block);
      return next;
    });
    setSelectedId(block.id);
  }

  function updateBlock(updated: Block) {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    setBlocks((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      if (item) next.splice(toIndex, 0, item);
      return next;
    });
  }

  function duplicateBlock(id: string) {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const copy: Block = { ...block, id: uid(), props: { ...block.props } } as Block;
    const idx = blocks.findIndex((b) => b.id === id);
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
  }

  // ── Drag handlers for sidebar blocks (new) ──
  function onSidebarDragStart(type: BlockType) {
    setDraggingNewType(type);
    setDraggingId(null);
  }

  // ── Drag handlers for canvas blocks (reorder) ──
  function onCanvasDragStart(id: string) {
    setDraggingId(id);
    setDraggingNewType(null);
  }

  function onDropZone(index: number) {
    if (draggingNewType) {
      addBlock(draggingNewType, index);
    } else if (draggingId) {
      const fromIndex = blocks.findIndex((b) => b.id === draggingId);
      if (fromIndex !== -1 && fromIndex !== index) {
        moveBlock(fromIndex, index);
      }
    }
    setDragOverIndex(null);
    setDraggingId(null);
    setDraggingNewType(null);
  }

  return (
    <div className={`builder-app ${theme}`}>
      {/* Top bar */}
      <header className="builder-topbar">
        <div className="builder-topbar-left">
          <TopNav />
        </div>
        <div className="builder-topbar-center">
          <span className="builder-topbar-title">Page Builder</span>
        </div>
        <div className="builder-topbar-right">
          <button
            type="button"
            className="bldr-action-btn"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <button
            type="button"
            className="bldr-action-btn bldr-action-btn-primary"
            onClick={() => alert("Export: " + JSON.stringify(blocks, null, 2))}
          >
            Export JSON
          </button>
        </div>
      </header>

      <div className="builder-body">
        {/* Left: Block Library */}
        <aside className="builder-sidebar">
          <div className="sidebar-section-title">Blocks</div>
          <div className="sidebar-blocks">
            {BLOCK_LIBRARY.map((meta) => (
              <div
                key={meta.type}
                className="sidebar-block-item"
                draggable
                onDragStart={() => onSidebarDragStart(meta.type)}
                onClick={() => addBlock(meta.type)}
              >
                <span className="sidebar-block-icon">{meta.icon}</span>
                <span className="sidebar-block-label">{meta.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Canvas */}
        <main className="builder-canvas-wrap">
          <div className="builder-canvas">
            {blocks.length === 0 && dragOverIndex === null && (
              <div className="canvas-empty">
                <div className="canvas-empty-icon">⊞</div>
                <div className="canvas-empty-text">Drag a block from the left panel</div>
                <div className="canvas-empty-sub">or click any block to add it</div>
              </div>
            )}

            {/* Drop zone at top */}
            <div
              className={`canvas-drop-zone ${dragOverIndex === 0 ? "active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(0); }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={() => onDropZone(0)}
            />

            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <div
                  className={`canvas-block ${
                    selectedId === block.id ? "selected" : ""
                  } ${draggingId === block.id ? "dragging" : ""}`}
                  draggable
                  onDragStart={() => onCanvasDragStart(block.id)}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(block.id); }}
                >
                  <div className="canvas-block-toolbar">
                    <button
                      type="button"
                      className="canvas-block-btn"
                      title="Move up"
                      disabled={index === 0}
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, index - 1); }}
                    >↑</button>
                    <button
                      type="button"
                      className="canvas-block-btn"
                      title="Move down"
                      disabled={index === blocks.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, index + 1); }}
                    >↓</button>
                    <button
                      type="button"
                      className="canvas-block-btn"
                      title="Duplicate"
                      onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                    >⧉</button>
                    <button
                      type="button"
                      className="canvas-block-btn canvas-block-btn-del"
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                    >✕</button>
                  </div>
                  <div className="canvas-block-inner">
                    <BlockRenderer block={block} />
                  </div>
                </div>

                {/* Drop zone after each block */}
                <div
                  className={`canvas-drop-zone ${dragOverIndex === index + 1 ? "active" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index + 1); }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={() => onDropZone(index + 1)}
                />
              </React.Fragment>
            ))}
          </div>
        </main>

        {/* Right: Properties */}
        <aside className="builder-props">
          {selectedBlock ? (
            <PropertiesPanel block={selectedBlock} onChange={updateBlock} />
          ) : (
            <div className="props-empty">
              <div className="props-empty-icon">☰</div>
              <div>Select a block to edit its properties</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
