import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trash2, Eye, EyeOff, Copy } from "lucide-react";
import { useBuilder } from "../core/BuilderContext";
import { toMarginSideTailwind, toMarginTailwind } from "../core/tailwind-container-maps";
import { BlockStyles } from "../core/types";

interface BlockWrapperProps {
  id: string;
  children: React.ReactNode;
  enabled?: boolean;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  index?: number;
  parentId?: string;
  styles?: BlockStyles;
}

interface BlockControlsProps {
  enabled: boolean;
  id: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  controlsRef: React.RefObject<HTMLDivElement | null>;
  setHoveredBlockId: (id: string | null) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  style?: React.CSSProperties;
}

function BlockControls({
  enabled,
  id,
  label,
  icon: Icon,
  wrapperRef,
  controlsRef,
  setHoveredBlockId,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  style,
}: BlockControlsProps) {
  const selectBlock = useBuilder((s) => s.selectBlock);
  const hoveredBlockId = useBuilder((s) => s.hoveredBlockId);

  return (
    <div
      ref={controlsRef}
      style={style}
      className="fixed z-[70] flex items-center bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-[10px] uppercase tracking-wider font-semibold select-none shadow-sm rounded-none border-solid h-6"
      onPointerEnter={() => {
        if (hoveredBlockId !== id) setHoveredBlockId(id);
      }}
      onPointerLeave={(e) => {
        const nextTarget = e.relatedTarget;
        if (
          nextTarget instanceof Node &&
          (wrapperRef.current?.contains(nextTarget) || controlsRef.current?.contains(nextTarget))
        ) {
          return;
        }
        if (hoveredBlockId === id) setHoveredBlockId(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(id);
      }}
    >
      {/* Label and optional Icon */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 h-full text-neutral-600 dark:text-neutral-400">
        {Icon && <Icon className="w-3 h-3" />}
        <span className="text-[9px] font-bold">{label || "Block"}</span>
      </div>

      {/* Visibility Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="p-1 px-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors border-r border-neutral-200 dark:border-neutral-800 flex items-center justify-center h-full"
        title={enabled ? "Hide Block" : "Show Block"}
      >
        {enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-400" />}
      </button>

      {/* Duplicate */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="p-1 px-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors border-r border-neutral-200 dark:border-neutral-800 flex items-center justify-center h-full"
        title="Duplicate Block"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 px-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-500 hover:text-red-650 dark:hover:text-red-400 transition-colors flex items-center justify-center h-full"
        title="Delete Block"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function BlockWrapper({
  id,
  children,
  enabled = true,
  label,
  icon,
  styles,
}: BlockWrapperProps) {
  const removeBlock = useBuilder((s) => s.removeBlock);
  const updateBlock = useBuilder((s) => s.updateBlock);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const duplicateBlock = useBuilder((s) => s.duplicateBlock);
  const setHoveredBlockId = useBuilder((s) => s.setHoveredBlockId);

  const isSelected = useBuilder((s) => s.selectedBlockId === id);
  const isHovered = useBuilder((s) => s.hoveredBlockId === id);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const [controlsStyle, setControlsStyle] = useState<React.CSSProperties>({
    left: -10000,
    top: -10000,
    visibility: "hidden",
  });
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(id);
  };

  const handleDelete = () => {
    removeBlock(id);
  };

  const handleDuplicate = () => {
    duplicateBlock(id);
  };

  const toggleVisibility = () => {
    updateBlock(id, { enabled: !enabled });
  };

  const showControls = isSelected || isHovered;
  const hasAnyMargin = Boolean(
    styles &&
    (styles.margin !== undefined ||
      styles.marginTop !== undefined ||
      styles.marginRight !== undefined ||
      styles.marginBottom !== undefined ||
      styles.marginLeft !== undefined)
  );

  const marginTop = hasAnyMargin ? toMarginSideTailwind(styles?.marginTop, "top") : null;
  const marginRight = hasAnyMargin ? toMarginSideTailwind(styles?.marginRight, "right") : null;
  const marginBottom = hasAnyMargin ? toMarginSideTailwind(styles?.marginBottom, "bottom") : null;
  const marginLeft = hasAnyMargin ? toMarginSideTailwind(styles?.marginLeft, "left") : null;

  const hasMarginSides = Boolean(
    marginTop?.className ||
    marginTop?.style ||
    marginRight?.className ||
    marginRight?.style ||
    marginBottom?.className ||
    marginBottom?.style ||
    marginLeft?.className ||
    marginLeft?.style
  );

  const margin = hasAnyMargin
    ? hasMarginSides
      ? { className: null, style: null }
      : toMarginTailwind(styles?.margin)
    : { className: null, style: null };

  const getClosestBlockWrapperId = useCallback((target: EventTarget | null) => {
    if (!target) return null;
    const el = target as Element;
    if (!el?.closest) return null;
    const wrapper = el.closest("[data-block-wrapper]") as HTMLElement | null;
    return wrapper?.id ?? null;
  }, []);

  useEffect(() => {
    if (!showControls) return;
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;
    const scrollEl =
      (wrapperEl.closest("#root-canvas") as HTMLElement | null) ??
      document.getElementById("root-canvas");

    let rafId = 0;
    let ro: ResizeObserver | null = null;

    const compute = () => {
      const wrapper = wrapperRef.current;
      const controls = controlsRef.current;
      if (!wrapper || !controls) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      const boundsRect = scrollEl
        ? scrollEl.getBoundingClientRect()
        : document.documentElement.getBoundingClientRect();

      const pad = 4;
      const w = controlsRect.width || controls.offsetWidth || controls.scrollWidth || 150;
      const h = controlsRect.height || controls.offsetHeight || controls.scrollHeight || 24;

      // Position the controls bar right above the wrapper border
      let top = wrapperRect.top - h - 1;
      if (top < boundsRect.top + pad) {
        // Place inside if top is cut off
        top = wrapperRect.top + pad;
        setDockMode("inside");
      } else {
        setDockMode("top");
      }

      let left = wrapperRect.left;
      if (left + w > boundsRect.right - pad) {
        left = boundsRect.right - w - pad;
      }
      if (left < boundsRect.left + pad) {
        left = boundsRect.left + pad;
      }

      setControlsStyle({
        left,
        top,
        visibility: "visible",
      });
    };

    const schedule = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(compute);
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    scrollEl?.addEventListener("scroll", schedule, { passive: true });
    ro = new ResizeObserver(schedule);
    ro.observe(wrapperEl);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", schedule);
      scrollEl?.removeEventListener("scroll", schedule);
      ro?.disconnect();
      ro = null;
    };
  }, [showControls]);

  const customClassName = styles?.className || "";

  return (
    <div
      ref={wrapperRef}
      id={id}
      data-block-wrapper
      data-selected={isSelected ? "true" : "false"}
      style={{
        ...(margin.style ?? null),
        ...(marginTop?.style ?? null),
        ...(marginRight?.style ?? null),
        ...(marginBottom?.style ?? null),
        ...(marginLeft?.style ?? null),
      }}
      onClick={handleSelect}
      onPointerOverCapture={(e) => {
        const closestId = getClosestBlockWrapperId(e.target);
        if (!closestId || closestId !== id) return;
        setHoveredBlockId(id);
      }}
      onPointerOutCapture={(e) => {
        const nextTarget = e.relatedTarget;
        if (nextTarget instanceof Node) {
          if (controlsRef.current?.contains(nextTarget)) return;
          if (wrapperRef.current?.contains(nextTarget)) return;
        }
        setHoveredBlockId(null);
      }}
      className={`relative group/block-wrapper transition-all duration-155 self-stretch justify-self-stretch max-w-full min-w-0 border rounded-none cursor-pointer ${
        isSelected
          ? "z-[90] border-neutral-900 dark:border-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/40"
          : isHovered
            ? "border-neutral-400 dark:border-neutral-600 bg-neutral-50/20 dark:bg-neutral-900/10"
            : "border-transparent"
      } ${customClassName}`}
    >
      {showControls && typeof document !== "undefined"
        ? createPortal(
            <BlockControls
              enabled={enabled}
              id={id}
              label={label}
              icon={icon}
              wrapperRef={wrapperRef}
              controlsRef={controlsRef}
              setHoveredBlockId={setHoveredBlockId}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onToggleVisibility={toggleVisibility}
              style={controlsStyle}
            />,
            document.body
          )
        : null}

      <div className={!enabled ? "opacity-40 grayscale" : ""}>{children}</div>
    </div>
  );
}
