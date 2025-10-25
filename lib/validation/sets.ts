import { isBlank, isValidNumber, isValidOptionalNumber, type ValidationResult } from "./validation";

export type SetValues = {
  name: string;
  mandatoryNumber: string | number | null | undefined;
  optionalNumber1: string | number | null | undefined;
  optionalNumber2: string | number | null | undefined;
};

export function validateSet<T extends SetValues>(set: T): ValidationResult<T> {
  const errors: Record<string, string> = {};

  // name
  if (set.name.trim().length === 0) {
    errors.name = "Name is required";
  }

  // mandatoryNumber
  if (isBlank(set.mandatoryNumber)) {
    errors.mandatoryNumber = "This field is required.";
  } else if (!isValidNumber(set.mandatoryNumber as string | number)) {
    errors.mandatoryNumber = "Must be a number.";
  }

  // optionalNumber1
  if (!isValidOptionalNumber(set.optionalNumber1)) {
    errors.optionalNumber1 = "Must be a number or empty.";
  }

  // optionalNumber2
  if (!isValidOptionalNumber(set.optionalNumber2)) {
    errors.optionalNumber2 = "Must be a number or empty.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: set };
}
