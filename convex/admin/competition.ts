import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("competitions").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    fee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const competitionId = await ctx.db.insert("competitions", {
      title: args.title,
      fee: args.fee,
    });
    return competitionId;
  },
});

export const get = query({
  args: {
    id: v.id("competitions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("competitions"),
    title: v.optional(v.string()),
    fee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("competitions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
