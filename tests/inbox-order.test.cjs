/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness for the TypeScript server actions. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, imports = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const context = { exports: {}, URLSearchParams, process, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  }, ...imports.globals };
  vm.runInNewContext(outputText, context);
  return context.exports;
}

const sorting = load("lib/utils/sort-inbox-threads.ts");
const thread = (id, unreadCount, lastMessageAt) => ({ id, unreadCount, lastMessageAt });

test("unread first, latest incoming or outgoing message next, without mutating the list", () => {
  const input = [thread("read-old", 0, "2026-10-20"), thread("unread-old", 9, "2026-10-21"), thread("read-new", 0, "2026-10-28"), thread("unread-new", 1, "2026-10-27")];
  const original = [...input];
  assert.deepEqual(Array.from(sorting.sortInboxThreads(input), item => item.id), ["unread-new", "unread-old", "read-new", "read-old"]);
  assert.deepEqual(input, original);
  input[1].unreadCount = 0;
  assert.deepEqual(Array.from(sorting.sortInboxThreads(input), item => item.id), ["unread-new", "read-new", "unread-old", "read-old"]);
});

test("missing or invalid dates sort last with deterministic ties", () => {
  assert.deepEqual(Array.from(sorting.sortInboxThreads([thread("b", 0, "invalid"), thread("c", 0, "2026-10-28"), thread("a", 0, null)]), item => item.id), ["c", "a", "b"]);
});

test("sorting precedes pagination, including unread threads beyond the first 100 results", async () => {
  const dataset = Array.from({ length: 240 }, (_, index) => thread(String(index).padStart(3, "0"), index >= 110 && index < 235 ? 1 : 0, new Date(Date.UTC(2026, 9, 28) - index * 60000).toISOString()));
  const calls = [];
  const api = load("lib/queries/inbox.action.ts", {
    "../session": { getAuthHeaders: async () => ({ Authorization: "Bearer test" }) },
    "../utils/sort-inbox-threads": sorting,
    globals: { fetch: async url => {
      const query = new URL(url).searchParams;
      assert.equal(query.get("search"), "client");
      assert.equal(query.get("channel"), "INKERA");
      calls.push(query);
      const items = query.get("unreadOnly") === "true" ? dataset.filter(item => item.unreadCount > 0) : dataset;
      const page = Number(query.get("page"));
      const limit = Number(query.get("limit"));
      return { ok: true, json: async () => ({ data: items.slice((page - 1) * limit, page * limit), total: items.length, totalPages: Math.ceil(items.length / limit), page, limit }) };
    }, process: { env: { NEXT_PUBLIC_BACK_URL: "https://example.test" } } },
  });
  const expected = sorting.sortInboxThreads(dataset);
  for (const page of [1, 7, 12]) {
    const result = await api.getInboxThreadsAction({ page, limit: 20, search: "client", channel: "INKERA" });
    assert.deepEqual(Array.from(result.data, item => item.id), Array.from(expected.slice((page - 1) * 20, page * 20), item => item.id));
    assert.equal(result.total, 240);
    assert.equal(result.totalPages, 12);
  }
  assert.ok(calls.some(query => query.get("unreadOnly") === "true" && query.get("page") === "2"));
  const unread = await api.getInboxThreadsAction({ unreadOnly: true, page: 2, limit: 20, search: "client", channel: "INKERA" });
  assert.equal(unread.total, 125);
  assert.equal(unread.data[0].id, "130");
});
