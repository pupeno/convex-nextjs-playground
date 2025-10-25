import type { FieldErrors, FieldValues } from "react-hook-form";

type ResultLike = { ok: true } | { ok: false; errors: Record<string, string> };

function isResultLike(x: unknown): x is ResultLike {
  return typeof x === "object" && x !== null && "ok" in x;
}

export function toFieldErrors<TFieldValues extends FieldValues>(
  values: TFieldValues,
  result: ResultLike | Record<string, string>,
): FieldErrors<TFieldValues> {
  const resultErrors: Partial<Record<keyof TFieldValues, { type: "validate"; message: string }>> = {};

  const errors: Record<string, string> | undefined = isResultLike(result)
    ? result.ok
      ? undefined
      : result.errors
    : result;

  for (const key of Object.keys(values) as Array<keyof TFieldValues>) {
    const message = errors?.[key as string];
    if (message) {
      resultErrors[key] = { type: "validate", message };
    }
  }
  return resultErrors as FieldErrors<TFieldValues>;
}

export function fromFormValues<TOut extends Record<string, unknown>>(values: Record<string, unknown>): TOut {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") {
      const s = value.trim();
      if (s === "") {
        out[key] = null;
      } else {
        const n = Number(s);
        out[key] = Number.isFinite(n) ? n : s;
      }
    } else {
      out[key] = value as any;
    }
  }
  return out as TOut;
}

export function toFormValues<TShape extends Record<string, string>>(
  shape: TShape,
  input: Record<string, unknown>,
): TShape {
  const out: any = {};
  for (const key of Object.keys(shape) as Array<keyof TShape>) {
    const v = input[key as string];
    out[key] = v == null ? "" : String(v);
  }
  return out as TShape;
}
