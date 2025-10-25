import { isValidBlankableNumber, type ValidationResult } from "./validation";

export type SetValues = {
  name: string;
  number1: string | number | null | undefined;
  number2: string | number | null | undefined;
};

export function validateSet<T extends SetValues>(data: T): ValidationResult<T> {
  const errors: Record<string, string> = {};

  if (data.name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (!isValidBlankableNumber(data.number1)) {
    errors.number1 = "Must be a number or empty.";
  }

  if (!isValidBlankableNumber(data.number2)) {
    errors.number2 = "Must be a number or empty.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: data };
}
