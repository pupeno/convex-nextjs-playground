import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { zodToConvex } from "convex-helpers/server/zod";
import { CompetitionValidator } from "../../lib/validation/competitions";

const competitionArgs = zodToConvex(CompetitionValidator);

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("competitions"),
    _creationTime: v.number(),
    ...competitionArgs.fields
  })),
  handler: async (ctx) => {
    return await ctx.db.query("competitions").collect();
  },
});

export const create = mutation({
  args: competitionArgs,
  returns: v.id("competitions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("competitions", {
      title: args.title,
      fee: args.fee,
    });
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
      ...competitionArgs.fields
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("competitions"),
    ...competitionArgs.fields
  },
  returns: v.id("competitions"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: {id: v.id("competitions")},
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
