import {
  isBlank,
  isValidNumber,
  isValidOptionalNumber,
  isValidOptionalNumberWithRange,
  type ValidationResult,
} from "./validation";

export type SetValues = {
  name: string;
  mandatoryNumber: string | number | null | undefined;
  uniqueNumber: string | number | null | undefined;
  optionalNumber: string | number | null | undefined;
  optionalPositiveNumber: string | number | null | undefined;
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

  // uniqueNumber
  if (isBlank(set.uniqueNumber)) {
    errors.uniqueNumber = "This field is required.";
  } else if (!isValidNumber(set.uniqueNumber as string | number)) {
    errors.uniqueNumber = "Must be a number.";
  }

  // optionalNumber
  if (!isValidOptionalNumber(set.optionalNumber)) {
    errors.optionalNumber = "Must be a number or empty.";
  }

  // optionalPositiveNumber (> 0)
  if (!isValidOptionalNumberWithRange(set.optionalPositiveNumber, { minExclusive: 0 })) {
    errors.optionalPositiveNumber = "Must be a positive number or empty.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: set };
}
