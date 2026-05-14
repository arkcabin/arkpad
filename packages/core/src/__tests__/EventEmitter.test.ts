import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "../core/EventEmitter";

describe("EventEmitter", () => {
  it("registers and calls a listener", () => {
    const emitter = new EventEmitter();
    const fn = vi.fn();
    emitter.on("test", fn);
    emitter.emit("test", "arg1");
    expect(fn).toHaveBeenCalledWith("arg1");
  });

  it("removes a listener via off", () => {
    const emitter = new EventEmitter();
    const fn = vi.fn();
    emitter.on("test", fn);
    emitter.off("test", fn);
    emitter.emit("test");
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls listener only once with once()", () => {
    const emitter = new EventEmitter();
    const fn = vi.fn();
    emitter.once("test", fn);
    emitter.emit("test");
    emitter.emit("test");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("supports multiple listeners on same event", () => {
    const emitter = new EventEmitter();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    emitter.on("test", fn1);
    emitter.on("test", fn2);
    emitter.emit("test");
    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).toHaveBeenCalledOnce();
  });

  it("does not throw when emitting with no listeners", () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit("nonexistent")).not.toThrow();
  });

  it("cleans up all listeners for an event", () => {
    const emitter = new EventEmitter();
    const fn = vi.fn();
    emitter.on("test", fn);
    emitter.off("test", fn);
    emitter.emit("test");
    expect(fn).not.toHaveBeenCalled();
  });
});
