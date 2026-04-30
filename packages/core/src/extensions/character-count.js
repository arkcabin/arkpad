import { Extension } from "./Extension";
export const CharacterCount = Extension.create({
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
    onUpdate({ editor }) {
        const text = editor.getText();
        this.storage.characters = text.length;
        // Super fast word count using regex matchAll without creating massive arrays
        let wordCount = 0;
        const matches = text.matchAll(/\S+/g);
        while (!matches.next().done) {
            wordCount++;
        }
        this.storage.words = wordCount;
    },
});
