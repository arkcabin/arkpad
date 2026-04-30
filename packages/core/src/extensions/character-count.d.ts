import { Extension } from "./Extension";
export interface CharacterCountOptions {
    limit?: number;
}
export interface CharacterCountStorage {
    characters: number;
    words: number;
}
export declare const CharacterCount: Extension<CharacterCountOptions, CharacterCountStorage>;
