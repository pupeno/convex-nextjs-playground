import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateSet } from "../../lib/validation/sets";
import { toDatabase } from "../schema";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { SetValues } from "../../lib/validation/sets";

const SetsInputV = {
  name: v.string(),
  mandatoryNumber: v.number(),
  uniqueNumber: v.number(),
  optionalNumber: v.union(v.number(), v.null()),
  optionalPositiveNumber: v.union(v.number(), v.null()),
};

const SetsOutputV = v.object({
  _id: v.id("sets"),
  _creationTime: v.number(),
  name: v.string(),
  mandatoryNumber: v.number(),
  uniqueNumber: v.number(),
  optionalNumber: v.optional(v.number()),
  optionalPositiveNumber: v.optional(v.number()),
});

async function serverValidateSet(
  input: SetValues,
  ctx: MutationCtx,
  options?: { excludeId?: Id<"sets"> },
): Promise<{ ok: true; value: SetValues } | { ok: false; errors: Record<string, string> }> {
  const base = validateSet(input);
  if (!base.ok) {
    return { ok: false, errors: base.errors };
  }
  // Uniqueness check for uniqueNumber
  const unique =
    typeof input.uniqueNumber === "number"
      ? input.uniqueNumber
      : Number(String(input.uniqueNumber ?? "").trim());
  const existing = await ctx.db
    .query("sets")
    .withIndex("by_uniqueNumber", (q) => q.eq("uniqueNumber", unique))
    .unique();
  if (existing && (!options?.excludeId || existing._id !== options.excludeId)) {
    return { ok: false, errors: { uniqueNumber: "This value is already in use." } };
  }
  return { ok: true, value: base.value };
}

export const list = query({
  args: {},
  returns: v.array(SetsOutputV),
  handler: async (ctx) => {
    return await ctx.db.query("sets").collect();
  },
});

export const create = mutation({
  args: SetsInputV,
  returns: v.union(
    v.object({ ok: v.literal(true), id: v.id("sets") }),
    v.object({ ok: v.literal(false), errors: v.record(v.string(), v.string()) }),
  ),
  handler: async (ctx, args) => {
    const result = await serverValidateSet(args, ctx);
    if (!result.ok) {
      return { ok: false as const, errors: result.errors };
    }
    const id = await ctx.db.insert("sets", toDatabase(result.value));
    return { ok: true as const, id };
  },
});

export const get = query({
  args: {
    id: v.id("sets"),
  },
  returns: v.union(SetsOutputV, v.null()),
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
    v.object({ ok: v.literal(true), id: v.id("sets") }),
    v.object({ ok: v.literal(false), errors: v.record(v.string(), v.string()) }),
  ),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const validated = await serverValidateSet(updates, ctx, { excludeId: id });
    if (!validated.ok) return { ok: false as const, errors: validated.errors };
    await ctx.db.patch(id, toDatabase(validated.value));
    return { ok: true as const, id };
  },
});

export const remove = mutation({
  args: { id: v.id("sets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
