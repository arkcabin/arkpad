import { Schema } from "prosemirror-model";
/**
 * The minimal core schema for Arkpad.
 * This is designed to be "feature-blind", providing only the absolute essentials.
 * All other nodes and marks are injected dynamically via Solo Extensions.
 */
export declare const arkpadSchema: Schema<"doc" | "paragraph" | "text", never>;
