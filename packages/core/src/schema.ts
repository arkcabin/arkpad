import { Schema, Mark } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";

const nodes = addListNodes(basicSchema.spec.nodes, "paragraph block*", "block");

const marks = basicSchema.spec.marks
  .update("strike", {
    parseDOM: [{ tag: "s" }, { tag: "strike" }, { style: "text-decoration:line-through" }],
    toDOM() { return ["s", 0]; },
  })
  .update("underline", {
    parseDOM: [{ tag: "u" }, { style: "text-decoration:underline" }],
    toDOM() { return ["u", 0]; },
  });

export const arkpadSchema = new Schema({ nodes, marks });