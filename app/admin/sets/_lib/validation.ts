import { isValidBlankableNumber, type ValidationResult } from "@/lib/validation/validation";
import type { SetFormValues } from "./form";

export function validateSetFrontend(data: SetFormValues): ValidationResult<SetFormValues> {
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
