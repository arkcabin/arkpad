import { Extension, InputRule } from "@arkpad/core";

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
      textRule(/--$/, "—"),
      textRule(/\.\.\.$/, "…"),
      textRule(/\(c\)$/, "©"),
      textRule(/\(r\)$/, "®"),
      textRule(/\(tm\)$/, "™"),
    ];
  },
});

export default Typography;
