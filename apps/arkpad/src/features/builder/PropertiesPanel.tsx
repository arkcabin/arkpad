import React from "react";
import type { Block } from "./types";

interface Props {
  block: Block;
  onChange: (updated: Block) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="prop-input" {...props} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return <select className="prop-select" {...rest}>{children}</select>;
}

function AlignField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Align">
      <div className="prop-align-row">
        {(["left", "center", "right"] as const).map((a) => (
          <button
            key={a}
            type="button"
            className={`prop-align-btn ${value === a ? "active" : ""}`}
            onClick={() => onChange(a)}
          >
            {a === "left" ? "⬛⬜⬜" : a === "center" ? "⬜⬛⬜" : "⬜⬜⬛"}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function PropertiesPanel({ block, onChange }: Props) {
  function patch(partial: Partial<Block["props"]>) {
    onChange({ ...block, props: { ...block.props, ...partial } } as Block);
  }

  return (
    <div className="props-panel">
      <div className="props-panel-header">
        <span className="props-panel-title">Properties</span>
        <span className="props-panel-type">{block.type}</span>
      </div>

      <div className="props-panel-body">
        {block.type === "heading" && (
          <>
            <Field label="Text">
              <Input value={block.props.html} onChange={(e) => patch({ html: e.target.value })} />
            </Field>
            <Field label="Level">
              <Select
                value={block.props.level}
                onChange={(e) => patch({ level: Number(e.target.value) as 1 | 2 | 3 })}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </Select>
            </Field>
            <AlignField value={block.props.align} onChange={(v) => patch({ align: v as "left" | "center" | "right" })} />
          </>
        )}

        {block.type === "text" && (
          <>
            <Field label="Text">
              <textarea
                className="prop-textarea"
                value={block.props.html}
                rows={5}
                onChange={(e) => patch({ html: e.target.value })}
              />
            </Field>
            <AlignField value={block.props.align} onChange={(v) => patch({ align: v as "left" | "center" | "right" })} />
          </>
        )}

        {block.type === "image" && (
          <>
            <Field label="Image URL">
              <Input value={block.props.src} placeholder="https://..." onChange={(e) => patch({ src: e.target.value })} />
            </Field>
            <Field label="Alt text">
              <Input value={block.props.alt} onChange={(e) => patch({ alt: e.target.value })} />
            </Field>
            <Field label="Width">
              <Input value={block.props.width} placeholder="100%" onChange={(e) => patch({ width: e.target.value })} />
            </Field>
            <AlignField value={block.props.align} onChange={(v) => patch({ align: v as "left" | "center" | "right" })} />
          </>
        )}

        {block.type === "button" && (
          <>
            <Field label="Label">
              <Input value={block.props.html} onChange={(e) => patch({ html: e.target.value })} />
            </Field>
            <Field label="Link URL">
              <Input value={block.props.href} placeholder="https://..." onChange={(e) => patch({ href: e.target.value })} />
            </Field>
            <Field label="Style">
              <Select value={block.props.variant} onChange={(e) => patch({ variant: e.target.value as "primary" | "secondary" | "outline" })}>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </Select>
            </Field>
            <AlignField value={block.props.align} onChange={(v) => patch({ align: v as "left" | "center" | "right" })} />
          </>
        )}

        {block.type === "divider" && (
          <>
            <Field label="Color">
              <input type="color" value={block.props.color} className="prop-color" onChange={(e) => patch({ color: e.target.value })} />
            </Field>
            <Field label="Thickness (px)">
              <Input type="number" min={1} max={10} value={block.props.thickness} onChange={(e) => patch({ thickness: Number(e.target.value) })} />
            </Field>
            <Field label="Style">
              <Select value={block.props.style} onChange={(e) => patch({ style: e.target.value as "solid" | "dashed" | "dotted" })}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </Select>
            </Field>
          </>
        )}

        {block.type === "columns" && (
          <>
            <Field label="Columns">
              <Select value={block.props.count} onChange={(e) => {
                const count = Number(e.target.value) as 2 | 3;
                const children = Array.from({ length: count }, (_, i) => block.props.children[i] ?? []);
                patch({ count, children });
              }}>
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
              </Select>
            </Field>
            <Field label="Gap (px)">
              <Input type="number" min={0} max={80} value={block.props.gap} onChange={(e) => patch({ gap: Number(e.target.value) })} />
            </Field>
          </>
        )}

        {block.type === "video" && (
          <>
            <Field label="Video URL">
              <Input value={block.props.url} placeholder="YouTube or video URL..." onChange={(e) => patch({ url: e.target.value })} />
            </Field>
          </>
        )}

        {block.type === "spacer" && (
          <Field label="Height (px)">
            <Input type="number" min={8} max={400} value={block.props.height} onChange={(e) => patch({ height: Number(e.target.value) })} />
          </Field>
        )}

        {block.type === "quote" && (
          <>
            <Field label="Quote text">
              <textarea className="prop-textarea" value={block.props.html} rows={4} onChange={(e) => patch({ html: e.target.value })} />
            </Field>
            <Field label="Author">
              <Input value={block.props.author} placeholder="Author name" onChange={(e) => patch({ author: e.target.value })} />
            </Field>
          </>
        )}
      </div>
    </div>
  );
}
