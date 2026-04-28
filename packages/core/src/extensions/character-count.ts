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
      
      // Super fast word count using regex match without creating massive arrays
      let wordCount = 0;
      const matches = text.matchAll(/\S+/g);
      for (const _ of matches) {
        wordCount++;
      }
      
      this.storage.words = wordCount;
    }
  },
};
