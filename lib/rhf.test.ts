import { describe, it, expect } from "vitest";
import { toFieldErrors, fromFormValues, toFormValues } from "@/lib/rhf";

describe("rhf helpers", () => {
  it("toFieldErrors maps error messages by keys", () => {
    const values = { a: "", b: "" };
    const result = { ok: false as const, errors: { a: "Err A" } };
    const out = toFieldErrors(values, result);
    expect(out.a?.message).toBe("Err A");
    expect(out.b).toBeUndefined();
  });

  it("fromFormValues trims, converts numbers, and nulls empty strings", () => {
    const out = fromFormValues<{ x: number; y: string; z: number | null }>({ x: " 3 ", y: "abc", z: "  " });
    expect(out.x).toBe(3);
    expect(out.y).toBe("abc");
    expect(out.z).toBeNull();
  });

  it("toFormValues converts nullish to empty strings", () => {
    const shape = { a: "", b: "" };
    const out = toFormValues(shape, { a: 1, b: null });
    expect(out.a).toBe("1");
    expect(out.b).toBe("");
  });
});
