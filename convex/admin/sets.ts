import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isValidBlankableNumber, type ValidationResult } from "../../lib/validation/validation";
import { type Set } from "../../lib/validation/sets";

const setArgs = {
  title: v.string(),
  number1: v.optional(v.union(v.number(), v.null())),
  number2: v.optional(v.union(v.number(), v.null())),
};

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("sets"),
      _creationTime: v.number(),
      ...setArgs,
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("sets").collect();
  },
});

export const create = mutation({
  args: setArgs,
  returns: v.id("sets"),
  handler: async (ctx, args) => {
    const result = validateSetBackend(args);
    if (!result.ok) {
      throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
    }
    return await ctx.db.insert("sets", result.value);
  },
});

export const get = query({
  args: {
    id: v.id("sets"),
  },
  returns: v.union(
    v.object({
      _id: v.id("sets"),
      _creationTime: v.number(),
      ...setArgs,
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("sets"),
    ...setArgs,
  },
  returns: v.id("sets"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const result = validateSetBackend(updates as Set);
    if (!result.ok) {
      throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
    }
    await ctx.db.patch(id, result.value);
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

function validateSetBackend(set: Set): ValidationResult<Set> {
  const errors: Record<string, string> = {};

  if (set.title.trim().length === 0) {
    errors.title = "Title is required";
  }

  if (!isValidBlankableNumber(set.number1)) {
    errors.number1 = "Must be a number or empty.";
  }

  if (!isValidBlankableNumber(set.number2)) {
    errors.number2 = "Must be a number or empty.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: set };
}
