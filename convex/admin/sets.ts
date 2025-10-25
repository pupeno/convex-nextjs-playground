import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateSet } from "../../lib/validation/sets";
import { toDatabase } from "../schema";

const SetsInputV = {
  name: v.string(),
  mandatoryNumber: v.number(),
  optionalNumber1: v.union(v.number(), v.null()),
  optionalNumber2: v.union(v.number(), v.null()),
  optionalPositiveNumber: v.union(v.number(), v.null()),
};

const SetsOutputV = v.object({
  _id: v.id("sets"),
  _creationTime: v.number(),
  name: v.string(),
  mandatoryNumber: v.number(),
  optionalNumber1: v.optional(v.number()),
  optionalNumber2: v.optional(v.number()),
  optionalPositiveNumber: v.optional(v.number()),
});

export const list = query({
  args: {},
  returns: v.array(SetsOutputV),
  handler: async (ctx) => {
    return await ctx.db.query("sets").collect();
  },
});

export const create = mutation({
  args: SetsInputV,
  returns: v.id("sets"),
  handler: async (ctx, args) => {
    const result = validateSet(args);
    if (!result.ok) {
      throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
    }
    return await ctx.db.insert("sets", toDatabase(result.value));
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
  returns: v.id("sets"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const result = validateSet(updates);
    if (!result.ok) {
      throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
    }
    await ctx.db.patch(id, toDatabase(result.value));
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("sets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
