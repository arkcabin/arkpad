import { Node as PMNode, Fragment } from "prosemirror-model";
/**
 * A custom serializer to convert ProseMirror nodes back to Markdown.
 */
export declare class MarkdownSerializer {
    serialize(content: PMNode | Fragment): string;
    private serializeNode;
    private serializeChildren;
    private serializeText;
    private serializeList;
}
export declare const defaultMarkdownSerializer: MarkdownSerializer;
