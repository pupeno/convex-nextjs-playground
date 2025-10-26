import { describe, it, expect } from "vitest";
import { validateSet, type SetValues } from "@/lib/validation/sets";

function base(overrides: Partial<SetValues> = {}): SetValues {
  return {
    name: "A",
    mandatoryNumber: 1,
    uniqueNumber: 2,
    optionalNumber: null,
    optionalPositiveNumber: null,
    ...overrides,
  };
}

describe("validateSet", () => {
  it("accepts valid values", () => {
    const res = validateSet(base());
    expect(res.ok).toBe(true);
  });

  it("requires name", () => {
    const res = validateSet(base({ name: "  " }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.name).toBeDefined();
  });

  it("requires mandatoryNumber numeric", () => {
    const res = validateSet(base({ mandatoryNumber: "x" }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.mandatoryNumber).toContain("number");
  });

  it("requires uniqueNumber numeric", () => {
    const res = validateSet(base({ uniqueNumber: "x" }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.uniqueNumber).toContain("number");
  });

  it("optionalNumber may be blank or numeric", () => {
    expect(validateSet(base({ optionalNumber: "" })).ok).toBe(true);
    expect(validateSet(base({ optionalNumber: "  " })).ok).toBe(true);
    expect(validateSet(base({ optionalNumber: "5" })).ok).toBe(true);
    expect(validateSet(base({ optionalNumber: "x" })).ok).toBe(false);
  });

  it("optionalPositiveNumber must be > 0 when provided", () => {
    expect(validateSet(base({ optionalPositiveNumber: null })).ok).toBe(true);
    expect(validateSet(base({ optionalPositiveNumber: "" })).ok).toBe(true);
    expect(validateSet(base({ optionalPositiveNumber: 0 })).ok).toBe(false);
    expect(validateSet(base({ optionalPositiveNumber: 1 })).ok).toBe(true);
  });
});
