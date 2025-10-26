import { describe, it, expect } from "vitest";
import { isBlank, isValidNumber, isValidOptionalNumber, isValidOptionalNumberWithRange } from "@/lib/validation/validation";

describe("validation utils", () => {
  it("isBlank detects null/undefined/empty string", () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank(0)).toBe(false);
    expect(isBlank("")).toBe(true);
    expect(isBlank("   ")).toBe(true);
    expect(isBlank("x")).toBe(false);
  });

  it("isValidNumber supports number and numeric strings", () => {
    expect(isValidNumber(1)).toBe(true);
    expect(isValidNumber(1.5)).toBe(true);
    expect(isValidNumber("1")).toBe(true);
    expect(isValidNumber(" 2.5 ")).toBe(true);
    expect(isValidNumber("abc")).toBe(false);
    expect(isValidNumber(0 / 0)).toBe(false);
  });

  it("isValidNumber returns false for empty or whitespace-only strings", () => {
    expect(isValidNumber("")).toBe(false);
    expect(isValidNumber("   ")).toBe(false);
  });

  it("isValidOptionalNumber allows blank", () => {
    expect(isValidOptionalNumber(null)).toBe(true);
    expect(isValidOptionalNumber(undefined)).toBe(true);
    expect(isValidOptionalNumber("")).toBe(true);
    expect(isValidOptionalNumber("  ")).toBe(true);
    expect(isValidOptionalNumber("12")).toBe(true);
    expect(isValidOptionalNumber("x")).toBe(false);
  });

  it("isValidOptionalNumberWithRange checks bounds", () => {
    expect(isValidOptionalNumberWithRange(null, {})).toBe(true);
    expect(isValidOptionalNumberWithRange("", {})).toBe(true);
    expect(isValidOptionalNumberWithRange("5", { min: 1, max: 10 })).toBe(true);
    expect(isValidOptionalNumberWithRange(0, { minExclusive: 0 })).toBe(false);
    expect(isValidOptionalNumberWithRange(1, { minExclusive: 0 })).toBe(true);
    expect(isValidOptionalNumberWithRange(11, { max: 10 })).toBe(false);
    expect(isValidOptionalNumberWithRange(10, { maxExclusive: 10 })).toBe(false);
  });

  it("isValidOptionalNumberWithRange rejects non-numeric and min violations", () => {
    expect(isValidOptionalNumberWithRange("x", {})).toBe(false);
    expect(isValidOptionalNumberWithRange(0, { min: 1 })).toBe(false);
  });
});
