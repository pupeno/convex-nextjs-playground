export type ValidationSuccess<T> = { ok: true; value: T };
export type ValidationFailure = { ok: false; errors: Record<string, string> };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function isValidBlankableNumber(value: string | number | null | undefined): boolean {
  if (value == null || typeof value === "undefined") {
    return true;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return true;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed);
  }
  return Number.isFinite(value);
}
