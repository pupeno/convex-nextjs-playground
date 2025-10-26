import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

describe("convex admin/sets", () => {
  it("list returns all docs", async () => {
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      // seed one doc
      const id = await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      });
      expect(id).toBeTruthy();
    });
    const results = await t.query(api.admin.sets.list, {});
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("A");
  });

  it("create validates and inserts", async () => {
    const t = convexTest(schema);
    const res = await t.mutation(api.admin.sets.create, {
      name: "A",
      mandatoryNumber: 1,
      uniqueNumber: 10,
      optionalNumber: null,
      optionalPositiveNumber: null,
    });
    expect(res.ok).toBe(true);
  });

  it("create enforces unique uniqueNumber", async () => {
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      });
    });
    const res = await t.mutation(api.admin.sets.create, {
      name: "B",
      mandatoryNumber: 2,
      uniqueNumber: 10,
      optionalNumber: null,
      optionalPositiveNumber: null,
    });
    expect(res.ok).toBe(false);
    if (res.ok === false) expect(res.errors.uniqueNumber).toBeDefined();
  });

  it("get returns a specific doc or null", async () => {
    const t = convexTest(schema);
    let insertedId!: Id<"sets">;
    await t.run(async (ctx) => {
      insertedId = await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      });
    });
    const got = await t.query(api.admin.sets.get, { id: insertedId });
    expect(got?.name).toBe("A");
    const missing = await t.query(api.admin.sets.get, { id: "9999;sets" as Id<"sets"> });
    expect(missing).toBeNull();
  });

  it("update validates, checks uniqueness excluding self, and patches", async () => {
    const t = convexTest(schema);
    let insertedId!: Id<"sets">;
    await t.run(async (ctx) => {
      insertedId = await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      });
    });
    const res = await t.mutation(api.admin.sets.update, {
      id: insertedId,
      name: "A2",
      mandatoryNumber: 2,
      uniqueNumber: 10,
      optionalNumber: null,
      optionalPositiveNumber: null,
    });
    expect(res.ok).toBe(true);
  });

  it("update rejects uniqueNumber collision with another doc", async () => {
    const t = convexTest(schema);
    let bId!: Id<"sets">;
    await t.run(async (ctx) => {
      await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      });
      bId = await ctx.db.insert("sets", {
        name: "B",
        mandatoryNumber: 2,
        uniqueNumber: 20,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      });
    });
    const res = await t.mutation(api.admin.sets.update, {
      id: bId,
      name: "B",
      mandatoryNumber: 2,
      uniqueNumber: 10, // collide with A
      optionalNumber: null,
      optionalPositiveNumber: null,
    });
    expect(res.ok).toBe(false);
    if (res.ok === false) expect(res.errors.uniqueNumber).toBeDefined();
  });

  it("remove deletes doc", async () => {
    const t = convexTest(schema);
    let insertedId!: Id<"sets">;
    await t.run(async (ctx) => {
      insertedId = await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      });
    });
    await t.mutation(api.admin.sets.remove, { id: insertedId });
    const list = await t.query(api.admin.sets.list, {});
    expect(list).toHaveLength(0);
  });

  it("create returns validation errors for invalid input", async () => {
    const t = convexTest(schema);
    const res = await t.mutation(api.admin.sets.create, {
      name: "",
      mandatoryNumber: 1,
      uniqueNumber: 20,
      optionalNumber: null,
      optionalPositiveNumber: null,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toHaveProperty("name");
    }
  });
});
