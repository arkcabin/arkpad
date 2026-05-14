import { Schema } from "prosemirror-model";
import { arkpadSchema } from "./core-schema";
import { ArkpadExtension } from "../../api";
import { Node } from "../../sdk/Node";
import { Mark } from "../../sdk/Mark";

/**
 * SchemaBuilder dynamically constructs a ProseMirror schema from Arkpad extensions.
 * Follows the Tiptap extension manager architecture for maximum stability and performance.
 */
export class SchemaBuilder {
  private extensions: ArkpadExtension[];
  private static schemaCache = new Map<string, Schema>();

  constructor(extensions: ArkpadExtension[]) {
    this.extensions = extensions;
  }

  /**
   * Builds and returns the ProseMirror schema.
   */
  build(): Schema {
    // 1. Flatten all extensions (including nested ones) with recursion protection
    const allExtensions = this.flattenExtensions(this.extensions);

    // 2. Sort extensions by priority (Tiptap standard: higher priority runs later/overwrites)
    allExtensions.sort((a, b) => (a.priority || 100) - (b.priority || 100));

    // 3. Check Cache (Tiptap standard: unique key for unique extension set)
    const cacheKey = JSON.stringify(allExtensions.map((ext, i) => ext.name || `anon_${i}`));
    if (SchemaBuilder.schemaCache.has(cacheKey)) {
      return SchemaBuilder.schemaCache.get(cacheKey)!;
    }

    // Initialize with base schema (doc, paragraph, text)
    let nodes = arkpadSchema.spec.nodes as any;
    let marks = arkpadSchema.spec.marks as any;

    const getKeys = (map: any) => {
      const k: string[] = [];
      if (map && typeof map.forEach === "function") {
        // OrderedMap.forEach signature is (key, value)
        // Map.forEach signature is (value, key)
        // We detect OrderedMap via constructor name or by checking arguments if needed.
        // In Arkpad, nodes/marks are always OrderedMaps from prosemirror-model.
        map.forEach((key: any, value: any) => {
          if (typeof key === "string") {
            k.push(key);
          } else if (typeof value === "string") {
            // Fallback for native Map if it somehow leaked in
            k.push(value);
          }
        });
      } else if (map && typeof map === "object") {
        return Object.keys(map);
      }
      return k;
    };

    console.log("🏁 [Arkpad] Build started. Initial nodes:", getKeys(nodes));
    console.log("🏁 [Arkpad] Build started. Initial marks:", getKeys(marks));

    // Phase 1: Collect Base Nodes & Marks
    allExtensions.forEach((ext) => {
      // 1. Check for specialized Node/Mark classes
      if (ext instanceof Node) {
        const name = String(ext.name);

        // SECURITY GATE: Prevent invalid node names from crashing the schema
        if (
          !ext.name ||
          typeof ext.name !== "string" ||
          name === "[object Object]" ||
          !/^[a-zA-Z0-9_-]+$/.test(name)
        ) {
          console.error(
            `🚨 [Arkpad] CRITICAL: Extension attempted to register invalid node name: "${name}"`,
            {
              extension: ext,
              nameField: ext.name,
              stack: new Error().stack,
            }
          );
          return;
        }

        // CRITICAL: Skip reserved nodes that are already in the base schema
        if (name === "text") return;

        const config = (ext as any).config;
        const spec = this.processNodeSpec(name, {
          content: config.content,
          marks: config.marks,
          group: config.group,
          inline: config.inline,
          atom: config.atom,
          selectable: config.selectable,
          draggable: config.draggable,
          code: config.code,
          whitespace: config.whitespace,
          defining: config.defining,
          isolating: config.isolating,
          attrs: this.collectAttributes(ext),
          trailingNode: config.trailingNode,
          // Governance Metadata (Passed to PM NodeSpec)
          isLayout: config.isLayout,
          isWidget: config.isWidget,
          role: config.role,
          allowedRoles: config.allowedRoles,
        });

        if ((ext as any).config.renderHTML) {
          spec.toDOM = (node: any) =>
            (ext as any).renderHTML({
              node,
              HTMLAttributes: this.getHTMLAttributes(node.attrs, ext),
            });
        }

        if ((ext as any).config.parseHTML) {
          spec.parseDOM = (ext as any).parseHTML().map((p: any) => ({
            tag: p.tag,
            style: p.style,
            getAttrs: (dom: HTMLElement) => {
              const attrs = p.getAttrs ? p.getAttrs(dom) : {};
              const parsedAttrs: Record<string, any> = { ...attrs };

              const localAttrs = ext.addAttributes?.() || {};
              Object.entries(localAttrs).forEach(([key, config]) => {
                if (config.parseHTML) {
                  parsedAttrs[key] = config.parseHTML(dom);
                }
              });

              return parsedAttrs;
            },
            priority: p.priority,
          }));
        }

        nodes = nodes.get(name) ? nodes.update(name, spec) : nodes.addToEnd(name, spec);
      } else if (ext instanceof Mark) {
        const name = String(ext.name);

        if (
          !ext.name ||
          typeof ext.name !== "string" ||
          name === "[object Object]" ||
          !/^[a-zA-Z0-9_-]+$/.test(name)
        ) {
          console.error(
            `🚨 [Arkpad] CRITICAL: Extension attempted to register invalid mark name: "${name}"`,
            {
              extension: ext,
              nameField: ext.name,
              stack: new Error().stack,
            }
          );
          return;
        }

        // COLLISION PREVENTION: Check if this mark name is already used as a node
        if (nodes.get(name)) {
          console.error(
            `🚨 [Arkpad] Collision: "${name}" is already defined as a node. Skipping mark registration.`
          );
          return;
        }

        const config = (ext as any).config;
        const spec: any = {
          inclusive: config.inclusive,
          excludes: config.excludes,
          group: config.group,
          spanning: config.spanning,
          code: config.code,
          attrs: this.collectAttributes(ext),
        };

        if ((ext as any).config.renderHTML) {
          spec.toDOM = (mark: any) =>
            (ext as any).renderHTML({
              node: mark,
              HTMLAttributes: this.getHTMLAttributes(mark.attrs, ext),
            });
        }

        if ((ext as any).config.parseHTML) {
          spec.parseDOM = (ext as any).parseHTML().map((p: any) => ({
            tag: p.tag,
            style: p.style,
            getAttrs: (dom: HTMLElement) => {
              const attrs = p.getAttrs ? p.getAttrs(dom) : {};
              const parsedAttrs: Record<string, any> = { ...attrs };

              const localAttrs = ext.addAttributes?.() || {};
              Object.entries(localAttrs).forEach(([key, config]) => {
                if (config.parseHTML) {
                  parsedAttrs[key] = config.parseHTML(dom);
                }
              });

              return parsedAttrs;
            },
            priority: p.priority,
          }));
        }

        marks = marks.get(name) ? marks.update(name, spec) : marks.addToEnd(name, spec);
      }

      // 2. Legacy addNodes/addMarks support
      if (ext.addNodes) {
        const extNodes = ext.addNodes();
        if (extNodes && typeof extNodes === "object" && !Array.isArray(extNodes)) {
          Object.entries(extNodes).forEach(([rawName, spec]) => {
            const name = String(rawName);
            // SECURITY GATE: Prevent invalid node names from crashing the schema
            if (
              !rawName ||
              typeof rawName !== "string" ||
              name === "[object Object]" ||
              !/^[a-zA-Z0-9_-]+$/.test(name)
            ) {
              console.error(
                `🚨 [Arkpad] CRITICAL: Extension attempted to register invalid legacy node name: "${name}"`,
                {
                  extension: ext,
                  rawName: rawName,
                  stack: new Error().stack,
                }
              );
              return;
            }

            // COLLISION PREVENTION: Check if this node name is already used as a mark
            if (marks.get(name)) {
              console.error(
                `🚨 [Arkpad] Collision: "${name}" is already defined as a mark. Skipping legacy node registration.`
              );
              return;
            }

            const processedSpec = this.processNodeSpec(name, spec);
            nodes = nodes.get(name)
              ? nodes.update(name, processedSpec)
              : nodes.addToEnd(name, processedSpec);
          });
        }
      }

      if (ext.addMarks) {
        const extMarks = ext.addMarks();
        if (extMarks && typeof extMarks === "object" && !Array.isArray(extMarks)) {
          Object.entries(extMarks).forEach(([rawName, spec]) => {
            const name = String(rawName);
            // SECURITY GATE: Prevent invalid mark names from crashing the schema
            if (
              !rawName ||
              typeof rawName !== "string" ||
              name === "[object Object]" ||
              !/^[a-zA-Z0-9_-]+$/.test(name)
            ) {
              console.error(
                `🚨 [Arkpad] CRITICAL: Extension attempted to register invalid legacy mark name: "${name}"`,
                {
                  extension: ext,
                  rawName: rawName,
                  stack: new Error().stack,
                }
              );
              return;
            }

            // COLLISION PREVENTION: Check if this mark name is already used as a node
            if (nodes.get(name)) {
              console.error(
                `🚨 [Arkpad] Collision: "${name}" is already defined as a node. Skipping legacy mark registration.`
              );
              return;
            }

            marks = marks.get(name) ? marks.update(name, spec) : marks.addToEnd(name, spec);
          });
        }
      }
    });

    // Phase 2: Schema Extensions (Decorators)
    allExtensions.forEach((ext) => {
      if (ext.extendNodeSchema) {
        nodes.forEach((name: string, spec: any) => {
          const newSpec = ext.extendNodeSchema!(spec, name);
          if (newSpec) {
            nodes = nodes.update(name, newSpec);
          }
        });
      }
      if (ext.extendMarkSchema) {
        marks.forEach((name: string, spec: any) => {
          const newSpec = ext.extendMarkSchema!(spec, name);
          if (newSpec) {
            marks = marks.update(name, newSpec);
          }
        });
      }
    });

    // Phase 3: Global Attributes (The Tiptap "Power-Up")
    const globalAttributes = this.collectGlobalAttributes(allExtensions);

    nodes = this.enhanceSchemaElements(nodes, globalAttributes, "node");
    marks = this.enhanceSchemaElements(marks, globalAttributes, "mark");

    // --- FINAL SANITY CHECK ---
    const debugInfo: any[] = [];
    nodes.forEach((name: string, spec: any) => {
      debugInfo.push({
        name,
        inline: !!spec.inline,
        group: spec.group,
        content: spec.content,
      });
    });

    if (typeof window !== "undefined") {
      (window as any).__ARKPAD_SCHEMA_DEBUG__ = debugInfo;
      console.log("🛠️ Arkpad Schema Build Plan:", debugInfo);
    }

    // --- FINAL SANITIZATION: Ensure no invalid keys exist ---
    const sanitizeMap = (map: any, label: string) => {
      let result = map;
      const keys = getKeys(map);
      keys.forEach((key: string) => {
        if (
          key === "[object Object]" ||
          key === "undefined" ||
          key === "null" ||
          !/^[a-zA-Z0-9_-]+$/.test(key)
        ) {
          console.error(`☢️ [Arkpad] SANITIZER: Purging invalid ${label} key: "${key}"`);
          if (typeof result.remove === "function") {
            result = result.remove(key);
          } else if (typeof result === "object") {
            delete result[key];
          }
        }
      });
      return result;
    };

    nodes = sanitizeMap(nodes, "node");
    marks = sanitizeMap(marks, "mark");

    // --- NUCLEAR PURGE: Force-remove [object Object] if it somehow leaked through ---
    if (nodes.get("[object Object]")) {
      console.error("☢️ NUCLEAR PURGE: Removing '[object Object]' from nodes!");
      nodes = nodes.remove("[object Object]");
    }
    if (marks.get("[object Object]")) {
      console.error("☢️ NUCLEAR PURGE: Removing '[object Object]' from marks!");
      marks = marks.remove("[object Object]");
    }

    try {
      const schema = new Schema({ nodes, marks });
      SchemaBuilder.schemaCache.set(cacheKey, schema);
      return schema;
    } catch (error: any) {
      console.error("❌ PROSEMIRROR SCHEMA BUILD FAILED");
      console.error("Error:", error.message);

      if (typeof window !== "undefined") {
        (window as any).ARKPAD_EDITOR_ERROR = error.message;

        const errorDiv = document.createElement("div");
        errorDiv.id = "arkpad-critical-error";
        errorDiv.style.cssText =
          "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);color:#ff4d4d;padding:40px;z-index:9999;overflow:auto;font-family:monospace;line-height:1.5;font-size:14px;";

        let nodesList = "";
        nodes.forEach((name: string, spec: any) => {
          nodesList += `- [${spec.inline ? "INLINE" : "BLOCK"}] ${name} (group: ${spec.group || "none"}) (content: ${spec.content || "none"})\n`;
        });

        errorDiv.innerHTML = `
          <h1 style="color:#ff4d4d;margin-top:0">🚨 Arkpad Schema Initialization Failed</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <hr style="border-color:#333">
          <pre>${nodesList}</pre>
        `;
        document.body.appendChild(errorDiv);
      }

      console.error("--- Node Configuration Dump ---");
      nodes.forEach((name: string, spec: any) => {
        const isInline = !!spec.inline;
        const groups = spec.group || "none";
        console.error(
          `- [${isInline ? "INLINE" : "BLOCK"}] ${name} (group: ${groups}) (content: ${spec.content || "none"})`
        );
      });
      throw error;
    }
  }

  /**
   * Processes a node specification to ensure it follows Arkpad's structural governance.
   * This includes forcing block-level nodes to be non-inline and promoting groups.
   */
  private processNodeSpec(name: string, spec: any): any {
    const processedSpec = { ...spec };

    // Resolve Effective Role
    const effectiveRole =
      processedSpec.role || (processedSpec.isLayout ? 8 : processedSpec.isWidget ? 4 : 0);

    // Detect Block Status
    const groupList = processedSpec.group ? processedSpec.group.split(" ") : [];
    const hasBlockGroup =
      groupList.includes("block") || groupList.includes("layout") || groupList.includes("widget");
    const isBlockLevel = (effectiveRole & (2 | 4 | 8 | 16 | 32)) !== 0 || hasBlockGroup;

    if (isBlockLevel) {
      // PRO-TIP: ProseMirror crashes if a block-level node is marked as inline.
      processedSpec.inline = false;

      const roles: string[] = ["block"];
      if (effectiveRole & 8 || processedSpec.isLayout) roles.push("layout");
      if (effectiveRole & 4 || processedSpec.isWidget) roles.push("widget");

      processedSpec.group = Array.from(new Set([...groupList, ...roles])).join(" ");
    }

    return processedSpec;
  }

  private collectGlobalAttributes(allExtensions: ArkpadExtension[]) {
    const globals: any[] = [];
    allExtensions.forEach((ext) => {
      if (ext.addGlobalAttributes) {
        globals.push(...ext.addGlobalAttributes());
      }
    });
    return globals;
  }

  private enhanceSchemaElements(elements: any, globals: any[], type: "node" | "mark") {
    let enhancedElements = elements;

    // 1. Group global attributes by the types they apply to
    const attributesByTypeName: Record<string, any[]> = {};
    globals.forEach((global) => {
      if (!global.types || !Array.isArray(global.types)) return;
      global.types.forEach((typeName: string) => {
        if (!attributesByTypeName[typeName]) attributesByTypeName[typeName] = [];
        attributesByTypeName[typeName].push(global.attributes || {});
      });
    });

    // 2. Apply all attributes in a single pass per node type
    Object.entries(attributesByTypeName).forEach(([typeName, allAttrs]) => {
      const spec = enhancedElements.get(typeName);
      if (!spec || typeName === "text") return; // Do not modify the base text node!

      // Let's copy it carefully
      const newSpec = { ...spec };

      const renderMethod = "toDOM";

      enhancedElements = enhancedElements.update(typeName, {
        ...newSpec,
        attrs: {
          ...spec.attrs,
          ...Object.assign(
            {},
            ...allAttrs.map((attrs) =>
              Object.fromEntries(
                Object.entries(attrs).map(([key, attr]: [string, any]) => [
                  key,
                  { ...(spec.attrs?.[key] || {}), ...attr },
                ])
              )
            )
          ),
        },
        [renderMethod]: (element: any) => {
          const originalDOM = spec[renderMethod]
            ? spec[renderMethod](element)
            : [type === "node" ? "div" : "span", 0];
          if (!Array.isArray(originalDOM)) return originalDOM;

          const [tag, maybeAttrs, ...rest] = originalDOM;
          const hasAttrs =
            maybeAttrs && typeof maybeAttrs === "object" && !Array.isArray(maybeAttrs);
          const originalAttrs = hasAttrs ? { ...maybeAttrs } : {};
          const content = hasAttrs ? rest : [maybeAttrs, ...rest];

          const newAttrs: Record<string, any> = { ...originalAttrs };

          allAttrs.forEach((attrs) => {
            Object.entries(attrs).forEach(([key, attr]: [string, any]) => {
              if (attr.renderHTML) {
                const rendered = attr.renderHTML(element.attrs);
                if (rendered) {
                  Object.entries(rendered).forEach(([rKey, rVal]) => {
                    if (rKey === "class" && newAttrs["class"]) {
                      newAttrs["class"] = `${newAttrs["class"]} ${rVal}`.trim();
                    } else if (rKey === "style" && newAttrs["style"]) {
                      newAttrs["style"] = `${newAttrs["style"]};${rVal}`.replace(/;;/g, ";");
                    } else {
                      newAttrs[rKey] = rVal;
                    }
                  });
                }
              } else if (element.attrs[key] !== undefined && element.attrs[key] !== null) {
                newAttrs[key] = element.attrs[key];
              }
            });
          });

          return [tag, newAttrs, ...content];
        },
      });
    });

    return enhancedElements;
  }

  private flattenExtensions(extensions: any[]): ArkpadExtension[] {
    const flattened: ArkpadExtension[] = [];
    const seen = new Set<any>();

    const traverse = (exts: any[]) => {
      exts.forEach((ext) => {
        if (!ext) return;

        // CRITICAL: Recursively flatten arrays
        if (Array.isArray(ext)) {
          traverse(ext);
          return;
        }

        if (typeof ext !== "object" || seen.has(ext)) return;
        seen.add(ext);

        // Security: Skip objects that aren't actually extensions
        if (typeof ext.name !== "string" && !ext.addNodes && !ext.addMarks && !ext.addExtensions) {
          console.warn(
            "⚠️ [Arkpad] Skipping invalid extension object (no name or addNodes/Marks):",
            ext
          );
          return;
        }

        if (ext.addExtensions) {
          try {
            const nested = ext.addExtensions();
            if (Array.isArray(nested)) traverse(nested);
          } catch (e) {
            console.error(
              `[Arkpad] Failed to load nested extensions for ${ext.name || "anonymous"}:`,
              e
            );
          }
        }
        flattened.push(ext);
      });
    };

    traverse(extensions);
    return flattened;
  }

  private collectAttributes(extension: ArkpadExtension): Record<string, any> {
    const attributes = extension.addAttributes ? extension.addAttributes() : {};
    return Object.fromEntries(
      Object.entries(attributes).map(([name, config]) => [name, { default: config.default }])
    );
  }

  private getHTMLAttributes(
    attrs: Record<string, any>,
    extension: ArkpadExtension
  ): Record<string, any> {
    const localAttributes = extension.addAttributes ? extension.addAttributes() : {};
    const HTMLAttributes: Record<string, any> = {};

    Object.entries(localAttributes).forEach(([name, config]) => {
      if (config.rendered === false) return;

      if (config.renderHTML) {
        const rendered = config.renderHTML(attrs);
        if (rendered) Object.assign(HTMLAttributes, rendered);
      } else if (attrs[name] !== undefined && attrs[name] !== null) {
        HTMLAttributes[name] = attrs[name];
      }
    });

    return HTMLAttributes;
  }
}
