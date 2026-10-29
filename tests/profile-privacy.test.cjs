/* eslint-disable @typescript-eslint/no-require-imports -- Execute the actual server actions without a Next runtime. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function actions(status = 200) {
  const testModule = { exports: {} };
  const calls = [];
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../lib/queries/user.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, {
    module: testModule, exports: testModule.exports, URL, URLSearchParams,
    process: { env: { NEXT_PUBLIC_BACK_URL: "https://backend.example.test" } },
    require(name) { assert.equal(name, "../session"); return { getAuthHeaders: async () => ({ Authorization: "Bearer test-session" }) }; },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return Response.json(status === 200 ? { id: "owner", email: "owner@example.test" } : { message: "Forbidden" }, { status });
    },
  });
  return { api: testModule.exports, calls };
}
for (const [action, suffix] of [["getUserInfoAction", "private"], ["getUserParamAction", "param"]]) {
  test(`${action} uses an authenticated private route without caching`, async () => {
    const { api, calls } = actions();
    const result = await api[action]("owner");
    assert.equal(result.ok, true);
    assert.equal(calls[0].url, `https://backend.example.test/users/owner/${suffix}`);
    assert.equal(calls[0].options.headers.Authorization, "Bearer test-session");
    assert.equal(calls[0].options.cache, "no-store");
    assert.equal(result.data.email, "owner@example.test");
  });
  test(`${action} encodes a supplied identifier as one path segment`, async () => {
    const { api, calls } = actions();
    await api[action]("other/profile?query=1");
    assert.equal(calls[0].url, `https://backend.example.test/users/other%2Fprofile%3Fquery%3D1/${suffix}`);
  });
  test(`${action} preserves an authorization failure instead of reporting success`, async () => {
    const { api } = actions(403);
    const result = await api[action]("victim");
    assert.equal(result.ok, false);
    assert.equal(result.status, 403);
  });
}
