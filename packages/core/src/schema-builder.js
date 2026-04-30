import { Schema } from "prosemirror-model";
import { arkpadSchema } from "./schema";
/**
 * SchemaBuilder dynamically constructs a ProseMirror schema from Arkpad extensions.
 * It also applies global attributes to nodes and marks.
 */
export class SchemaBuilder {
    extensions;
    constructor(extensions) {
        this.extensions = extensions;
    }
    /**
     * Builds and returns the ProseMirror schema.
     */
    build() {
        // Start with the base specs from arkpadSchema
        let nodes = arkpadSchema.spec.nodes;
        let marks = arkpadSchema.spec.marks;
        const allExtensions = [];
        const seenNames = new Set();
        const flattenExtensions = (exts) => {
            for (const extension of exts) {
                if (!seenNames.has(extension.name)) {
                    allExtensions.push(extension);
                    seenNames.add(extension.name);
                }
                if (extension.addExtensions) {
                    flattenExtensions(extension.addExtensions());
                }
            }
        };
        flattenExtensions(this.extensions);
        // Merge nodes and marks from extensions
        allExtensions.forEach(ext => {
            if (ext.addNodes) {
                const extNodes = ext.addNodes();
                Object.keys(extNodes).forEach(name => {
                    if (nodes.get(name)) {
                        nodes = nodes.update(name, extNodes[name]);
                    }
                    else {
                        nodes = nodes.addToEnd(name, extNodes[name]);
                    }
                });
            }
            if (ext.addMarks) {
                const extMarks = ext.addMarks();
                Object.keys(extMarks).forEach(name => {
                    if (marks.get(name)) {
                        marks = marks.update(name, extMarks[name]);
                    }
                    else {
                        marks = marks.addToEnd(name, extMarks[name]);
                    }
                });
            }
        });
        // Apply Global Attributes
        const globalAttributes = this.collectGlobalAttributes(allExtensions);
        nodes = this.enhanceNodes(nodes, globalAttributes);
        marks = this.enhanceMarks(marks, globalAttributes);
        return new Schema({ nodes, marks });
    }
    collectGlobalAttributes(allExtensions) {
        const globals = [];
        allExtensions.forEach((ext) => {
            if (ext.addGlobalAttributes) {
                globals.push(...ext.addGlobalAttributes());
            }
        });
        return globals;
    }
    enhanceNodes(nodes, globals) {
        let enhancedNodes = nodes;
        globals.forEach((global) => {
            if (!global.types)
                return;
            global.types.forEach((type) => {
                const nodeSpec = enhancedNodes.get(type);
                if (nodeSpec) {
                    enhancedNodes = enhancedNodes.update(type, {
                        ...nodeSpec,
                        attrs: {
                            ...nodeSpec.attrs,
                            ...global.attributes,
                        },
                        toDOM: (node) => {
                            const dom = nodeSpec.toDOM(node);
                            // Apply global attributes to the DOM
                            if (dom && dom[1]) {
                                Object.keys(global.attributes || {}).forEach(key => {
                                    const attr = global.attributes[key];
                                    if (attr && attr.renderHTML) {
                                        const rendered = attr.renderHTML(node.attrs);
                                        if (rendered) {
                                            Object.assign(dom[1], rendered);
                                        }
                                    }
                                    else if (node.attrs[key] !== undefined && node.attrs[key] !== null) {
                                        // Default: add as attribute if not null
                                        dom[1][key] = node.attrs[key];
                                    }
                                });
                            }
                            return dom;
                        }
                    });
                }
            });
        });
        return enhancedNodes;
    }
    enhanceMarks(marks, globals) {
        let enhancedMarks = marks;
        globals.forEach((global) => {
            if (!global.types)
                return;
            global.types.forEach((type) => {
                const markSpec = enhancedMarks.get(type);
                if (markSpec) {
                    enhancedMarks = enhancedMarks.update(type, {
                        ...markSpec,
                        attrs: {
                            ...markSpec.attrs,
                            ...Object.fromEntries(Object.entries(global.attributes || {}).map(([key, attr]) => [
                                key,
                                { default: attr.default },
                            ])),
                        },
                        renderHTML: (mark) => {
                            const dom = markSpec.renderHTML(mark);
                            if (dom && dom[1]) {
                                Object.entries(global.attributes || {}).forEach(([key, attr]) => {
                                    if (attr && attr.renderHTML) {
                                        const rendered = attr.renderHTML(mark.attrs);
                                        if (rendered) {
                                            Object.assign(dom[1], rendered);
                                        }
                                    }
                                    else if (mark.attrs[key] !== undefined && mark.attrs[key] !== null) {
                                        dom[1][key] = mark.attrs[key];
                                    }
                                });
                            }
                            return dom;
                        }
                    });
                }
            });
        });
        return enhancedMarks;
    }
}
