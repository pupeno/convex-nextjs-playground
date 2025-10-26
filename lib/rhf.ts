import type { FieldErrors, FieldValues } from "react-hook-form";
import type { ValidationErrors } from "./validation/validation";

type FormValue = string | number | boolean | null | undefined | FormValue[] | { [key: string]: FormValue };
type FormValuesRecord = Record<string, FormValue>;

/**
 * Convert validation errors from the format used by validation functions,
 * client and server side, which is essentially a key value pair, to the
 * format needed by React Hook Form, which is different.
 *
 * For examples of the functions that generate these errors, see
 *  * `validateSet` in `lib/validation/sets.ts`
 *  * `serverValidateSet` in `convex/admin/sets.ts`
 */
export function errorsFromApiToForm<TFieldValues extends FieldValues>(
  values: TFieldValues,
  errors: ValidationErrors,
): FieldErrors<TFieldValues> {
  const resultErrors: Partial<Record<keyof TFieldValues, { type: "validate"; message: string }>> = {};

  for (const key of Object.keys(values) as Array<keyof TFieldValues>) {
    const message = errors[key as string];
    if (message) {
      resultErrors[key] = { type: "validate", message };
    }
  }
  return resultErrors as FieldErrors<TFieldValues>;
}

/**
 * Convert values from the format used by React Hook Form, to the format used by
 * the API. The gist is that React Hook Form uses `""` for blanks, while the API
 * uses `null`.
 */
export function valuesFromFormToApi<TOut extends FormValuesRecord>(values: FormValuesRecord): TOut {
  const out: Partial<TOut> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") {
      const s = value.trim();
      if (s === "") {
        out[key as keyof TOut] = null as TOut[keyof TOut];
      } else {
        const n = Number(s);
        const castValue = (Number.isFinite(n) ? n : s) as TOut[keyof TOut];
        out[key as keyof TOut] = castValue;
      }
    } else {
      out[key as keyof TOut] = value as TOut[keyof TOut];
    }
  }
  return out as TOut;
}

/**
 * Convert values from the format used by the API, to the format used by React
 * Hook Form. The gist is that React Hook Form uses `""` for blanks, while the
 * API uses `null`.
 */
export function valuesFromApiToForm<TShape extends Record<string, string>>(
  shape: TShape,
  input: FormValuesRecord,
): TShape {
  const out: Partial<TShape> = {};
  for (const key of Object.keys(shape) as Array<keyof TShape>) {
    const v = input[key as string];
    out[key] = (v == null ? "" : String(v)) as TShape[typeof key];
  }
  return out as TShape;
}
