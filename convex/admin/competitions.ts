import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isValidBlankableNumber, type ValidationResult } from "../../lib/validation/validation";
import { type Competition } from "../../lib/validation/competitions";

const competitionArgs = {
  title: v.string(),
  number1: v.optional(v.union(v.number(), v.null())),
  number2: v.optional(v.union(v.number(), v.null())),
};

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("competitions"),
      _creationTime: v.number(),
      ...competitionArgs,
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("competitions").collect();
  },
});

export const create = mutation({
  args: competitionArgs,
  returns: v.id("competitions"),
  handler: async (ctx, args) => {
    const result = validateCompetitionBackend(args);
    if (!result.ok) {
      throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
    }
    return await ctx.db.insert("competitions", result.value);
  },
});

export const get = query({
  args: {
    id: v.id("competitions"),
  },
  returns: v.union(
    v.object({
      _id: v.id("competitions"),
      _creationTime: v.number(),
      ...competitionArgs,
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("competitions"),
    ...competitionArgs,
  },
  returns: v.id("competitions"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const result = validateCompetitionBackend(updates as Competition);
    if (!result.ok) {
      throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
    }
    await ctx.db.patch(id, result.value);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("competitions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

function validateCompetitionBackend(competition: Competition): ValidationResult<Competition> {
  const errors: Record<string, string> = {};

  // title
  if (competition.title.trim().length === 0) {
    errors.title = "Title is required";
  }

  // number1
  if (!isValidBlankableNumber(competition.number1)) {
    errors.number1 = "Must be a number or empty.";
  }

  // number2
  if (!isValidBlankableNumber(competition.number2)) {
    errors.number2 = "Must be a number or empty.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: competition };
}
