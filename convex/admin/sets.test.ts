import { describe, it, expect, vi, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";

type Doc = {
  _id: string;
  _creationTime: number;
  name: string;
  mandatoryNumber: number;
  uniqueNumber: number;
  optionalNumber?: number;
  optionalPositiveNumber?: number;
};

function mockCtx(docs: Doc[] = []) {
  const byId = new Map(docs.map((d) => [d._id, d] as const));
  return {
    db: {
      query: vi.fn().mockImplementation((table: string) => {
        if (table !== "sets") throw new Error("Unexpected table");
        const api = {
          withIndex: vi.fn().mockImplementation((_name: string, cb: (q: any) => any) => {
            const filter = { eq: (_field: string, value: number) => ({ value }) };
            const res = cb({ eq: (_field: string, value: number) => ({ value }) });
            const match = docs.find((d) => d.uniqueNumber === res.value);
            return { unique: vi.fn().mockResolvedValue(match ?? null) };
          }),
          collect: vi.fn().mockResolvedValue(docs),
        };
        return api;
      }),
      insert: vi.fn().mockImplementation((_table: string, values: any) => {
        const id = `sets_${Math.random().toString(36).slice(2)}`;
        const doc: Doc = {
          _id: id,
          _creationTime: Date.now(),
          name: values.name,
          mandatoryNumber: values.mandatoryNumber,
          uniqueNumber: values.uniqueNumber,
          optionalNumber: values.optionalNumber,
          optionalPositiveNumber: values.optionalPositiveNumber,
        };
        docs.push(doc);
        byId.set(id, doc);
        return Promise.resolve(id);
      }),
      get: vi.fn().mockImplementation((id: string) => Promise.resolve(byId.get(id) ?? null)),
      patch: vi.fn().mockImplementation((id: string, updates: any) => {
        const d = byId.get(id);
        if (!d) throw new Error("not found");
        Object.assign(d, updates);
        return Promise.resolve();
      }),
      delete: vi.fn().mockImplementation((id: string) => {
        const d = byId.get(id);
        if (d) {
          byId.delete(id);
          const i = docs.findIndex((x) => x._id === id);
          if (i >= 0) docs.splice(i, 1);
        }
        return Promise.resolve();
      }),
    },
  } as any;
}

describe("convex admin/sets", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

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
      } as any);
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
      } as any);
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
    let insertedId: any;
    await t.run(async (ctx) => {
      insertedId = await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      } as any);
    });
    const got = await t.query(api.admin.sets.get, { id: insertedId });
    expect(got?.name).toBe("A");
    const missing = await t.query(api.admin.sets.get, { id: "9999;sets" } as any);
    expect(missing).toBeNull();
  });

  it("update validates, checks uniqueness excluding self, and patches", async () => {
    const t = convexTest(schema);
    let insertedId: any;
    await t.run(async (ctx) => {
      insertedId = await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      } as any);
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

  it("remove deletes doc", async () => {
    const t = convexTest(schema);
    let insertedId: any;
    await t.run(async (ctx) => {
      insertedId = await ctx.db.insert("sets", {
        name: "A",
        mandatoryNumber: 1,
        uniqueNumber: 10,
        optionalNumber: undefined,
        optionalPositiveNumber: undefined,
      } as any);
    });
    await t.mutation(api.admin.sets.remove, { id: insertedId });
    const list = await t.query(api.admin.sets.list, {});
    expect(list).toHaveLength(0);
  });
});
