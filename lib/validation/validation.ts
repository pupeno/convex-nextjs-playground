export type ValidationSuccess<T> = { ok: true; value: T };
export type ValidationFailure = { ok: false; errors: Record<string, string> };
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
    return Number.isFinite(value); }
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
