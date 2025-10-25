import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sets: defineTable({
    name: v.string(),
    mandatoryNumber: v.number(),
    number2: v.optional(v.number()),
  }),
});

// Converts a structure from having `null` values to having `undefined` values.
// This is necessary to convert from the API, that silently drops all `undefined` values, so it needs explicit `null`s
// to what needs to be passed to `patch`, which doesn't accept `null`s and requires explicit `undefined`s to blank an
// optional field.
export function toDatabase<TOut extends Record<string, unknown>>(obj: Record<string, unknown>): TOut {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === null ? undefined : v;
  }
  return out as TOut;
}
