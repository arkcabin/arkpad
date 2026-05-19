import { describe, it, expect } from "vitest";
import { Governance, NodeRole, HealingAction } from "../core/Governance";

function mockNode(role: number) {
  return { type: { spec: { role } } } as any;
}

describe("Governance", () => {
  describe("canAccept", () => {
    it("ROOT accepts LAYOUT, CONTENT, WIDGET, ISOLATED", () => {
      expect(Governance.canAccept(NodeRole.ROOT, NodeRole.LAYOUT)).toBe(true);
      expect(Governance.canAccept(NodeRole.ROOT, NodeRole.CONTENT)).toBe(true);
      expect(Governance.canAccept(NodeRole.ROOT, NodeRole.WIDGET)).toBe(true);
      expect(Governance.canAccept(NodeRole.ROOT, NodeRole.ISOLATED)).toBe(true);
    });

    it("ROOT rejects ATOM", () => {
      expect(Governance.canAccept(NodeRole.ROOT, NodeRole.ATOM)).toBe(false);
    });

    it("CONTENT accepts ATOM and WIDGET", () => {
      expect(Governance.canAccept(NodeRole.CONTENT, NodeRole.ATOM)).toBe(true);
      expect(Governance.canAccept(NodeRole.CONTENT, NodeRole.WIDGET)).toBe(true);
    });

    it("CONTENT rejects LAYOUT and ISOLATED", () => {
      expect(Governance.canAccept(NodeRole.CONTENT, NodeRole.LAYOUT)).toBe(false);
      expect(Governance.canAccept(NodeRole.CONTENT, NodeRole.ISOLATED)).toBe(false);
    });

    it("ATOM rejects everything", () => {
      expect(Governance.canAccept(NodeRole.ATOM, NodeRole.ATOM)).toBe(false);
      expect(Governance.canAccept(NodeRole.ATOM, NodeRole.CONTENT)).toBe(false);
    });

    it("respects explicit allowedMask", () => {
      expect(
        Governance.canAccept(NodeRole.CONTENT, NodeRole.LAYOUT, NodeRole.LAYOUT | NodeRole.CONTENT)
      ).toBe(true);
      expect(Governance.canAccept(NodeRole.CONTENT, NodeRole.ATOM, NodeRole.LAYOUT)).toBe(false);
    });

    it("ISOLATED acts as container", () => {
      expect(Governance.canAccept(NodeRole.ISOLATED, NodeRole.LAYOUT)).toBe(true);
      expect(Governance.canAccept(NodeRole.ISOLATED, NodeRole.CONTENT)).toBe(true);
      expect(Governance.canAccept(NodeRole.ISOLATED, NodeRole.ATOM)).toBe(true);
    });
  });

  describe("resolveHealingAction", () => {
    it("LIFTS LAYOUT out of CONTENT", () => {
      expect(Governance.resolveHealingAction(NodeRole.CONTENT, NodeRole.LAYOUT)).toBe(
        HealingAction.LIFT
      );
    });

    it("LIFTS CONTENT out of CONTENT", () => {
      expect(Governance.resolveHealingAction(NodeRole.CONTENT, NodeRole.CONTENT)).toBe(
        HealingAction.LIFT
      );
    });

    it("WRAPS ATOM in ROOT", () => {
      expect(Governance.resolveHealingAction(NodeRole.ROOT, NodeRole.ATOM)).toBe(
        HealingAction.WRAP
      );
    });

    it("WRAPS ATOM in LAYOUT", () => {
      expect(Governance.resolveHealingAction(NodeRole.LAYOUT, NodeRole.ATOM)).toBe(
        HealingAction.WRAP
      );
    });

    it("DELETES other violations", () => {
      expect(Governance.resolveHealingAction(NodeRole.ATOM, NodeRole.CONTENT)).toBe(
        HealingAction.DELETE
      );
    });
  });

  describe("resolveRole", () => {
    it("extracts explicit role from spec", () => {
      const node = mockNode(NodeRole.WIDGET);
      expect(Governance.resolveRole(node)).toBe(NodeRole.WIDGET);
    });

    it("returns ROOT for doc node", () => {
      const node = { type: { name: "doc", spec: {} }, isLeaf: false, isText: false } as any;
      expect(Governance.resolveRole(node)).toBe(NodeRole.ROOT);
    });

    it("returns ATOM for leaf nodes", () => {
      const node = { type: { name: "text", spec: {} }, isLeaf: true, isText: false } as any;
      expect(Governance.resolveRole(node)).toBe(NodeRole.ATOM);
    });

    it("returns CONTENT as default fallback", () => {
      const node = { type: { name: "custom", spec: {} }, isLeaf: false, isText: false } as any;
      expect(Governance.resolveRole(node)).toBe(NodeRole.CONTENT);
    });
  });
});
