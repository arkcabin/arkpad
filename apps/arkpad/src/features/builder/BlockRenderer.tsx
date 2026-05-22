import React from "react";
import type { Block } from "./types";

interface Props {
  block: Block;
}

export function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case "heading": {
      const { text, level, align } = block.props;
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      return <Tag style={{ textAlign: align, margin: 0 }}>{text}</Tag>;
    }

    case "text":
      return (
        <p style={{ textAlign: block.props.align, margin: 0, lineHeight: 1.7 }}>
          {block.props.text}
        </p>
      );

    case "image": {
      const { src, alt, width, align } = block.props;
      return (
        <div
          style={{
            display: "flex",
            justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
          }}
        >
          {src ? (
            <img src={src} alt={alt} style={{ width, maxWidth: "100%", borderRadius: 6 }} />
          ) : (
            <div className="bldr-img-placeholder">
              <span>🖼</span>
              <span>No image URL set</span>
            </div>
          )}
        </div>
      );
    }

    case "button": {
      const { label, href, variant, align } = block.props;
      return (
        <div style={{ textAlign: align }}>
          <a href={href} className={`bldr-btn bldr-btn-${variant}`} onClick={(e) => e.preventDefault()}>
            {label}
          </a>
        </div>
      );
    }

    case "divider":
      return (
        <hr
          style={{
            border: "none",
            borderTop: `${block.props.thickness}px ${block.props.style} ${block.props.color}`,
            margin: "8px 0",
          }}
        />
      );

    case "columns": {
      const { count, gap, children } = block.props;
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${count}, 1fr)`,
            gap,
          }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bldr-column-cell">
              {(children[i] ?? []).length === 0 ? (
                <span className="bldr-column-empty">Column {i + 1}</span>
              ) : (
                (children[i] ?? []).map((child) => (
                  <BlockRenderer key={child.id} block={child} />
                ))
              )}
            </div>
          ))}
        </div>
      );
    }

    case "video": {
      const { url } = block.props;
      if (!url)
        return (
          <div className="bldr-img-placeholder">
            <span>▶</span>
            <span>No video URL set</span>
          </div>
        );
      const embedUrl = url.includes("youtube.com") || url.includes("youtu.be")
        ? url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")
        : url;
      return (
        <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: 8, overflow: "hidden" }}>
          <iframe
            src={embedUrl}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            title="video"
          />
        </div>
      );
    }

    case "spacer":
      return <div style={{ height: block.props.height }} />;

    case "quote":
      return (
        <blockquote className="bldr-quote">
          <p>"{block.props.text}"</p>
          {block.props.author && <cite>— {block.props.author}</cite>}
        </blockquote>
      );

    default:
      return null;
  }
}
