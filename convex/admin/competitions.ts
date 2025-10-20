import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("competitions"),
    _creationTime: v.number(),
    title: v.string(),
    fee: v.optional(v.number()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("competitions").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    fee: v.optional(v.number()),
  },
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
      title: v.string(),
      fee: v.optional(v.number()),
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
    title: v.optional(v.string()),
    fee: v.optional(v.number()),
  },
  returns: v.id("competitions"),
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
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
