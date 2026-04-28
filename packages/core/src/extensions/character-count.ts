import { ArkpadExtension as Extension } from "../types";

export interface CharacterCountOptions {
  limit?: number;
}

export interface CharacterCountStorage {
  characters: number;
  words: number;
}

export const CharacterCount: Extension = {
  name: "characterCount",

  addStorage() {
    return {
      characters: 0,
      words: 0,
    };
  },

  onUpdate({ editor }) {
    const text = editor.getText();
    if (this.storage) {
      this.storage.characters = text.length;
      this.storage.words = text.split(/\s+/).filter((s) => s.length > 0).length;
    }
  },
};
