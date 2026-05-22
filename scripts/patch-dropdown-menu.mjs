import fs from "node:fs";

const p = "c:/Work/ams/ams-frontend-app/node_modules/@arkpad/react/dist/components/ui/DropdownMenu.js";
let content = fs.readFileSync(p, "utf8");

if (content.includes("editor.focus();")) {
  console.log("DropdownMenu.js already patched");
  process.exit(0);
}

const pattern = /^\s{4}const handleClick = useCallback\(\(\) => \{\r?\n\s{8}if \(command && editor\) \{\r?\n\s{12}const cmdArgs = args.length > 0 \? args : attrs \? \[attrs\] : \[\];\r?\n\s{12}editor\.runCommand\(command, \.\.\.cmdArgs\);\r?\n\s{8}\}\r?\n\s{8}setOpen\(false\);\r?\n\s{4}\}, \[command, args, attrs, editor, setOpen\]\);/;

const replacement = `    const handleClick = useCallback(() => {\n        if (command && editor) {\n            const cmdArgs = args.length > 0 ? args : attrs ? [attrs] : [];\n            editor.focus();\n            editor.runCommand(command, ...cmdArgs);\n        }\n        setOpen(false);\n    }, [command, args, attrs, editor, setOpen]);`;

if (!pattern.test(content)) {
  throw new Error("Target snippet not found in DropdownMenu.js");
}

content = content.replace(pattern, replacement);
fs.writeFileSync(p, content);
console.log("Patched DropdownMenu.js");