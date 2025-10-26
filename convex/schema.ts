import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sets: defineTable({
    name: v.string(),
    mandatoryNumber: v.number(),
    uniqueNumber: v.number(),
    optionalNumber: v.optional(v.number()),
    optionalPositiveNumber: v.optional(v.number()),
  }).index("by_uniqueNumber", ["uniqueNumber"]),
});

/**
 * Converts a structure from using `null` values to using `undefined` values.
 *
 * Helpful when translating API payloads that drop `undefined` fields (forcing
 * explicit `null`s) into data suitable for `patch`, which rejects `null`s and
 * needs explicit `undefined`s to clear optional fields.
 */
export function valuesFromApiToDatabase<TOut extends Record<string, unknown>>(obj: Record<string, unknown>): TOut {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === null ? undefined : v;
  }
  return out as TOut;
}
