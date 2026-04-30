import { Extension } from "./Extension";

export interface CharacterCountOptions {
  limit?: number;
}

export interface CharacterCountStorage {
  characters: number;
  words: number;
}

export const CharacterCount = Extension.create<CharacterCountOptions, CharacterCountStorage>({
  name: "characterCount",

  addOptions() {
    return {
      limit: undefined,
    };
  },

  addStorage() {
    return {
      characters: 0,
      words: 0,
    };
  },

  onTransaction({ editor, transaction }) {
    if (!transaction.docChanged) return;

    const text = editor.getText();
    this.storage.characters = text.length;

    const wordCount = [...text.matchAll(/\S+/g)].length;

    this.storage.words = wordCount;
  },
});
