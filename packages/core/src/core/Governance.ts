import { PMNode } from "..";

/**
 * Structural roles for nodes in the Arkpad engine.
 * Used for fast bitmask-based governance validation.
 */
export enum NodeRole {
  ATOM = 1, // Leaf nodes (Text, Br)
  CONTENT = 2, // Basic content (Paragraph, Heading)
  WIDGET = 4, // Self-contained features (Image, Video, Table)
  LAYOUT = 8, // Structural containers (Section, Column, Grid)
  ROOT = 16, // The document root
}

/**
 * The Governance service handles structural validation and auto-healing.
 * Ensures the document tree follows strict nesting rules.
 */
export class Governance {
  /**
   * Checks if a parent node can accept a child node based on their roles.
   * This is a high-performance bitmask comparison.
   */
  static canAccept(parentRole: number, childRole: number, allowedMask?: number): boolean {
    // If an explicit mask is provided, use it
    if (allowedMask !== undefined) {
      return (allowedMask & childRole) !== 0;
    }

    // Default "Best of Best" Industry Rules:
    // 1. ROOT accepts LAYOUT and CONTENT
    if (parentRole === NodeRole.ROOT) {
      return (childRole & (NodeRole.LAYOUT | NodeRole.CONTENT | NodeRole.WIDGET)) !== 0;
    }

    // 2. LAYOUT accepts LAYOUT, CONTENT, and WIDGET
    if (parentRole === NodeRole.LAYOUT) {
      return (childRole & (NodeRole.LAYOUT | NodeRole.CONTENT | NodeRole.WIDGET)) !== 0;
    }

    // 3. CONTENT accepts ATOM and specialized inline WIDGETS
    if (parentRole === NodeRole.CONTENT) {
      return (childRole & (NodeRole.ATOM | NodeRole.WIDGET)) !== 0;
    }

    // 4. ATOM cannot accept anything (Leaf)
    if (parentRole === NodeRole.ATOM) {
      return false;
    }

    return false;
  }

  /**
   * Resolves a numeric bitmask role for a ProseMirror node.
   */
  static resolveRole(node: PMNode): number {
    const spec = node.type.spec as any;

    // 1. Explicit Role from Extension
    if (spec.role) return spec.role;

    // 2. Structural Helpers
    if (spec.isLayout) return NodeRole.LAYOUT;
    if (spec.isWidget) return NodeRole.WIDGET;

    // 3. Fallbacks
    if (node.type.name === "doc") return NodeRole.ROOT;
    if (node.isLeaf || node.isText) return NodeRole.ATOM;

    return NodeRole.CONTENT;
  }

  /**
   * Automatically heals invalid document structures by wrapping or relocating nodes.
   * This is what makes the engine "Immortal".
   */
  static heal(node: PMNode): PMNode {
    // This will be implemented in Step 4 with full ProseMirror Transform logic.
    // For now, it returns the node as-is.
    return node;
  }
}
