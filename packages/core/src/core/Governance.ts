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
  ISOLATED = 32, // Cannot be merged or split (CodeBlock, Table)
}

/**
 * Healing actions to resolve structural violations.
 */
export enum HealingAction {
  NONE = "NONE",
  LIFT = "LIFT",
  WRAP = "WRAP",
  DELETE = "DELETE",
}

/**
 * The Governance service handles structural validation and auto-healing.
 * Ensures the document tree follows strict nesting rules.
 */
export class Governance {
  private static hasRole(roleMask: number, role: NodeRole): boolean {
    return (roleMask & role) !== 0;
  }

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
    // 1. ROOT accepts LAYOUT, CONTENT, WIDGET, and ISOLATED (Tables/CodeBlocks)
    if (this.hasRole(parentRole, NodeRole.ROOT)) {
      return (childRole & (NodeRole.LAYOUT | NodeRole.CONTENT | NodeRole.WIDGET | NodeRole.ISOLATED)) !== 0;
    }

    // 2. LAYOUT accepts LAYOUT, CONTENT, WIDGET, and ISOLATED
    if (this.hasRole(parentRole, NodeRole.LAYOUT)) {
      return (childRole & (NodeRole.LAYOUT | NodeRole.CONTENT | NodeRole.WIDGET | NodeRole.ISOLATED)) !== 0;
    }

    // 3. CONTENT accepts ATOM, WIDGETS, and other CONTENT (unblocks Lists, Blockquotes, etc.)
    if (this.hasRole(parentRole, NodeRole.CONTENT)) {
      return (childRole & (NodeRole.ATOM | NodeRole.WIDGET | NodeRole.CONTENT)) !== 0;
    }

    // 4. ISOLATED nodes (Tables, CodeBlocks) act as containers
    if (this.hasRole(parentRole, NodeRole.ISOLATED)) {
      return (childRole & (NodeRole.LAYOUT | NodeRole.CONTENT | NodeRole.ATOM | NodeRole.WIDGET)) !== 0;
    }

    // 5. ATOM cannot accept anything (Leaf)
    if (this.hasRole(parentRole, NodeRole.ATOM)) {
      return false;
    }

    return false;
  }

  /**
   * Resolves the healing action required for a child-parent violation.
   */
  static resolveHealingAction(parentRole: number, childRole: number): HealingAction {
    // If child is LAYOUT/CONTENT and parent is CONTENT, we must LIFT it out.
    if (
      this.hasRole(parentRole, NodeRole.CONTENT) &&
      (childRole & (NodeRole.LAYOUT | NodeRole.CONTENT)) !== 0
    ) {
      return HealingAction.LIFT;
    }

    // If child is ATOM and parent is ROOT/LAYOUT, we must WRAP it in CONTENT (Paragraph).
    if (
      childRole === NodeRole.ATOM &&
      (this.hasRole(parentRole, NodeRole.ROOT) || this.hasRole(parentRole, NodeRole.LAYOUT))
    ) {
      return HealingAction.WRAP;
    }

    // If it's a structural orphan that can't be lifted or wrapped, DELETE.
    return HealingAction.DELETE;
  }

  /**
   * Resolves a numeric bitmask role for a ProseMirror node.
   */
  static resolveRole(node: PMNode): number {
    const spec = node.type.spec as any;

    // 1. Explicit Role from Extension
    if (spec.role) return spec.role;

    // 2. Structural Helpers
    let role = 0;
    if (spec.isLayout) role |= NodeRole.LAYOUT;
    if (spec.isWidget) role |= NodeRole.WIDGET;
    if (spec.code || spec.isolating) role |= NodeRole.ISOLATED;

    if (role !== 0) return role;

    // 3. Fallbacks
    if (node.type.name === "doc") return NodeRole.ROOT;
    if (node.isLeaf || node.isText) return NodeRole.ATOM;

    return NodeRole.CONTENT;
  }
}
