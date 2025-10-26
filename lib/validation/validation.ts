export type ValidationSuccess<T> = { ok: true; value: T };
export type ValidationErrors = Record<string, string>;
export type ValidationFailure = { ok: false; errors: ValidationErrors };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function isBlank(value: string | number | null | undefined): boolean {
  if (value == null || typeof value === "undefined") {
    return true;
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return false;
}

export function isValidNumber(value: string | number): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return false;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed);
}

export function isValidOptionalNumber(value: string | number | null | undefined): boolean {
  return isBlank(value) || isValidNumber(value as string | number);
}

export function isValidOptionalNumberWithRange(
  value: string | number | null | undefined,
  {
    min,
    minExclusive,
    max,
    maxExclusive,
  }: { min?: number; minExclusive?: number; max?: number; maxExclusive?: number },
): boolean {
  if (isBlank(value)) return true;
  if (!isValidNumber(value as string | number)) return false;
  const n = typeof value === "number" ? value : Number((value as string).trim());
  if (min != null && Number.isFinite(min) && n < min) {
    return false;
  }
  if (minExclusive != null && Number.isFinite(minExclusive) && n <= minExclusive) {
    return false;
  }
  if (max != null && Number.isFinite(max) && n > max) {
    return false;
  }
  if (maxExclusive != null && Number.isFinite(maxExclusive) && n >= maxExclusive) {
    return false;
  }
  return true;
}
