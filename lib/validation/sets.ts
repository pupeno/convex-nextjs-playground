import {
  isBlank,
  isValidNumber,
  isValidOptionalNumber,
  isValidOptionalNumberWithRange,
  type ValidationResult
} from "./validation";

/**
 * This is the superset of all set types for the purpose of validation. It
 * accepts all forms of blank fields, `""`, `null`, and `undefined`, because
 * validation may happen on the form or on the server after the API.
 *
 * See also:
 * * @SetApi for the type of the sets when they are being serialized through the API.
 * * @SetFormValues for the type for sets used in the form.
 */
export type SetValues = {
  name: string;
  mandatoryNumber: string | number | null | undefined;
  uniqueNumber: string | number | null | undefined;
  optionalNumber: string | number | null | undefined;
  optionalPositiveNumber: string | number | null | undefined;
};

/**
 * This is the type of the sets when they are being serialized through the API.
 *
 * Most notably, it uses `null`s to represent blank fields.
 *
 * See also:
 * * @SetsValues for the superset of all set types for the purpose of validation.
 * * @SetFormValues for the type for sets used in the form.
 */
export type SetApi = {
  name: string;
  mandatoryNumber: number;
  uniqueNumber: number;
  optionalNumber: number | null;
  optionalPositiveNumber: number | null;
};

export function validateSet<T extends SetValues>(set: T): ValidationResult<T> {
  const errors: Partial<Record<keyof SetValues, string>> = {};

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
