import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  competitions: defineTable({
    title: v.string(),
    number1: v.optional(v.number()),
    number2: v.optional(v.number()),
  }),
});
