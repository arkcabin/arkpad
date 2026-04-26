import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";

const nodes = addListNodes(basicSchema.spec.nodes, "paragraph block*", "block");

const marks = basicSchema.spec.marks;

export const arkpadSchema = new Schema({ nodes, marks });