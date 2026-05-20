import { Extension, InputRule, Plugin } from "@arkpad/core";

function textRule(regex: RegExp, replace: string) {
  return new InputRule(regex, (state, match, start, end) => {
    const tr = state.tr;
    tr.replaceWith(start, end, state.schema.text(replace));
    return tr;
  });
}

export const Typography = Extension.create({
  name: "typography",

  addInputRules() {
    return [
      textRule(/---$/, "\u2014"),
      textRule(/--$/, "\u2013"),
      textRule(/\.\.\.$/, "\u2026"),
      textRule(/->$/, "\u2192"),
      textRule(/<-$/, "\u2190"),
      textRule(/=>$/, "\u21D2"),
      textRule(/<=$/, "\u21D0"),
      textRule(/\(c\)$/, "\u00A9"),
      textRule(/\(r\)$/, "\u00AE"),
      textRule(/\(tm\)$/, "\u2122"),
      textRule(/1\/2$/, "\u00BD"),
      textRule(/1\/4$/, "\u00BC"),
      textRule(/3\/4$/, "\u00BE"),
      textRule(/!=$/, "\u2260"),
      textRule(/\+-$/, "\u00B1"),
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleTextInput(view: any, from: number, to: number, text: string) {
            if (text !== '"' && text !== "'") return false;

            const { state } = view;
            const charBefore = state.doc.textBetween(Math.max(0, from - 1), from);
            const isOpening = !charBefore || /[\s({[]/.test(charBefore);

            if (text === '"') {
              view.dispatch(state.tr.insertText(isOpening ? "\u201C" : "\u201D", from, to));
            } else {
              view.dispatch(state.tr.insertText(isOpening ? "\u2018" : "\u2019", from, to));
            }
            return true;
          },
        },
      }),
    ];
  },
});

export default Typography;
