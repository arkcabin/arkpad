import fs from "node:fs";

const p = "c:/Work/ams/ams-frontend-app/node_modules/@arkpad/react/dist/components/ui/EditorButton.js";
const newContent = `import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import { useArkpadContext } from "../editor/context";
import { useEditorState } from "../../hooks/useEditorState";
export const EditorButton = ({ command, args = [], name, attrs, children, className = "", activeClassName = "active", ...props }) => {
    const editor = useArkpadContext();
    const selector = useCallback((s) => ({
        isActive: s.isActive(name || command, attrs),
        canRun: s.canRunCommand(command, ...args),
    }), [name, command, attrs, args]);
    const equalityFn = useCallback((a, b) => a?.isActive === b?.isActive && a?.canRun === b?.canRun, []);
    const state = useEditorState(editor, selector, equalityFn);
    const { isActive, canRun } = state ?? { isActive: false, canRun: false };
    return (_jsx("button", { type: "button", onMouseDown: (e) => e.preventDefault(), onClick: () => {
            console.log("[Arkpad EditorButton] clicked", { command, args, hasEditor: !!editor, canRun, isActive });
            if (!editor) return;
            const result = editor.runCommand(command, ...args);
            console.log("[Arkpad EditorButton] runCommand result:", result);
        }, disabled: !!props.disabled || !editor, className: (className + " " + (isActive ? activeClassName : "")).trim(), "data-arkpad-ignore": "true", ...props, children: children }));
};
`;
fs.writeFileSync(p, newContent);
console.log("Patched EditorButton.js");