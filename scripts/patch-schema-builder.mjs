import fs from "node:fs";

const p = "c:/Work/ams/ams-frontend-app/node_modules/@arkpad/core/dist/services/schema/schema-builder.js";
let content = fs.readFileSync(p, "utf8");

// Add debug logging after flattenExtensions
const marker = "const allExtensions = this.flattenExtensions(this.extensions);";
const debugLine = `
        console.log("[Arkpad SchemaBuilder] extensions received:", this.extensions.length, this.extensions.map(e => e?.name || typeof e));
        console.log("[Arkpad SchemaBuilder] allExtensions after flatten:", allExtensions.length, allExtensions.map(e => e?.name || typeof e));`;

content = content.replace(marker, marker + debugLine);
fs.writeFileSync(p, content);
console.log("Patched schema-builder.js");