import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sets: defineTable({
    title: v.string(),
    number1: v.optional(v.union(v.number(), v.null())),
    number2: v.optional(v.union(v.number(), v.null())),
  }),
});
