import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";
import type { SetApi, SetValues } from "../../lib/validation/sets";
import { validateSet } from "../../lib/validation/sets";
import type { ValidationResult } from "../../lib/validation/validation";
import { valuesFromApiToDatabase } from "../schema";
import type { Id } from "../_generated/dataModel";

/**
 * The shape of sets when being input to the server. Critically, these accept
 * `null` which is the correct way to transmit blank fields. `undefined` is
 * silently dropped by Convex and `""` loses the types.
 *
 * See also @SetsOutputV for the shape of sets when being output from the server.
 */
const SetsInputV = {
  name: v.string(),
  mandatoryNumber: v.number(),
  uniqueNumber: v.number(),
  optionalNumber: v.union(v.number(), v.null()),
  optionalPositiveNumber: v.union(v.number(), v.null()),
};

/**
 * The shape of sets when being output from the server. Critically, these return
 * `undefined` which is how Convex represents blank fields in the database.
 *
 * See also @SetsInputV for the shape of sets when being input to the server.
 */
const SetsOutputV = {
  name: v.string(),
  mandatoryNumber: v.number(),
  uniqueNumber: v.number(),
  optionalNumber: v.optional(v.number()),
  optionalPositiveNumber: v.optional(v.number()),
};

/**
 * Server side validation for sets.
 *
 * @todo merge all the errors from the two validations for a better user experience.
 */
async function serverValidateSet(
  input: SetApi,
  ctx: MutationCtx,
  options?: { excludeId?: Id<"sets"> },
): Promise<ValidationResult<SetValues>> {
  const base = validateSet(input);
  if (!base.ok) {
    return { ok: false, errors: base.errors };
  }
  // Uniqueness check for uniqueNumber
  const existing = await ctx.db
    .query("sets")
    .withIndex("by_uniqueNumber", (q) => q.eq("uniqueNumber", input.uniqueNumber))
    .unique();
  if (existing && (!options?.excludeId || existing._id !== options.excludeId)) {
    return { ok: false, errors: { uniqueNumber: "This value is already in use." } };
  }
  return { ok: true, value: base.value };
}

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("sets"),
      _creationTime: v.number(),
      ...SetsOutputV,
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("sets").collect();
  },
});

export const create = mutation({
  args: SetsInputV,
  returns: v.union(
    v.object({ ok: v.literal(true), value: v.id("sets") }),
    v.object({ ok: v.literal(false), errors: v.record(v.string(), v.string()) }),
  ),
  handler: async (ctx, set) => {
    const result = await serverValidateSet(set, ctx);
    if (!result.ok) {
      return { ok: false as const, errors: result.errors };
    }
    const id = await ctx.db.insert("sets", valuesFromApiToDatabase(result.value));
    return { ok: true as const, value: id };
  },
});

export const get = query({
  args: {
    id: v.id("sets"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("sets"),
      _creationTime: v.number(),
      ...SetsOutputV,
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("sets"),
    ...SetsInputV,
  },
  returns: v.union(
    v.object({ ok: v.literal(true), value: v.id("sets") }),
    v.object({ ok: v.literal(false), errors: v.record(v.string(), v.string()) }),
  ),
  handler: async (ctx, args) => {
    const { id, ...set } = args;
    const validated = await serverValidateSet(set, ctx, { excludeId: id });
    if (!validated.ok) {
      return { ok: false as const, errors: validated.errors };
    }
    await ctx.db.patch(id, valuesFromApiToDatabase(validated.value));
    return { ok: true as const, value: id };
  },
});

export const remove = mutation({
  args: { id: v.id("sets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
