import { describe, expect, it } from "vitest";
import { errorsFromApiToForm, valuesFromApiToForm, valuesFromFormToApi } from "@/lib/rhf";

describe("rhf helpers", () => {
  it("toFieldErrors maps error messages by keys", () => {
    const values = { a: "", b: "" };
    const result = { a: "Err A" };
    const out = errorsFromApiToForm(values, result);
    expect(out.a?.message).toBe("Err A");
    expect(out.b).toBeUndefined();
  });

  it("toFieldErrors accepts plain error records", () => {
    const values = { a: "", b: "" };
    const rawErrors = { b: "Err B" };
    const out = errorsFromApiToForm(values, rawErrors);
    expect(out.b?.message).toBe("Err B");
    expect(out.a).toBeUndefined();
  });

  it("fromFormValues trims, converts numbers, and nulls empty strings", () => {
    const out = valuesFromFormToApi<{ x: number; y: string; z: number | null }>({ x: " 3 ", y: "abc", z: "  " });
    expect(out.x).toBe(3);
    expect(out.y).toBe("abc");
    expect(out.z).toBeNull();
  });

  it("fromFormValues preserves non-string values", () => {
    const input = { bool: true, num: 4, nested: { a: 1 } };
    const out = valuesFromFormToApi<typeof input>(input);
    expect(out.bool).toBe(true);
    expect(out.num).toBe(4);
    expect(out.nested).toEqual({ a: 1 });
  });

  it("toFormValues converts nullish to empty strings", () => {
    const shape = { a: "", b: "" };
    const out = valuesFromApiToForm(shape, { a: 1, b: null });
    expect(out.a).toBe("1");
    expect(out.b).toBe("");
  });
});
