import { Schema } from "prosemirror-model";
import { ArkpadExtension } from "./types";
/**
 * SchemaBuilder dynamically constructs a ProseMirror schema from Arkpad extensions.
 * It also applies global attributes to nodes and marks.
 */
export declare class SchemaBuilder {
    private extensions;
    constructor(extensions: ArkpadExtension[]);
    /**
     * Builds and returns the ProseMirror schema.
     */
    build(): Schema;
    private collectGlobalAttributes;
    private enhanceNodes;
    private enhanceMarks;
}
