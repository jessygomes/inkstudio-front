/* eslint-disable @typescript-eslint/no-require-imports -- Execute actual TypeScript handlers with isolated external services. */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { createHmac } = require("node:crypto");
const root = path.join(__dirname, "..");
const single = require("../package.json").name.includes("public");
const application = single ? "public" : "pro";
let currentSession, backendStatus, backendData, calls, deletions, storageResult, failFetch;

function load(file, imports = {}) {
  const testModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, {
    exports: testModule.exports, module: testModule, Buffer, process, Date, Response, URL, AbortSignal,
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (failFetch) throw new Error("private upstream failure");
      return Response.json(backendData, { status: backendStatus });
    },
    require(name) {
      if (Object.hasOwn(imports, name)) return imports[name];
      if (name === "node:crypto") return require(name);
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return testModule.exports;
}
const security = load("lib/auth-security.ts");
const helpers = load("lib/upload-security.ts", {
  "@/lib/upload-permits": { uploadControl: async () => ({success:true}) },
  "@/auth": { auth: async () => currentSession },
  "@/lib/auth-security": security,
  "uploadthing/server": { UTApi: class {
    async deleteFiles(keys, options) { deletions.push({ keys, options }); return storageResult; }
  } },
});
const route = load("app/api/uploadthing/delete/route.ts", { "@/lib/upload-security": helpers });
function session(exp = Math.floor(Date.now() / 1000) + 3600) {
  return { user: { id: "owner", role: single ? "client" : "user_salon" }, expires: new Date(Date.now() + 3600000).toISOString(), accessToken: `header.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature` };
}
function request(body = single ? { key: "owned.png" } : { fileKeys: ["owned.png"] }, headers = {}, raw = false) {
  return new Request("https://site.example.test/api/uploadthing/delete", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: raw ? body : JSON.stringify(body) });
}
beforeEach(() => {
  currentSession = session(); backendStatus = 201; backendData = { authorized: true };
  calls = []; deletions = []; failFetch = false; storageResult = { success: true, deletedCount: 1 };
  process.env.NEXT_PUBLIC_BACK_URL = "https://backend.example.test";
  process.env.UPLOAD_OWNERSHIP_SECRET = "tests-only-ownership-secret-at-least-32-bytes";
});

for (const kind of ["missing", "expired", "error", "missing-user"]) {
  test(`deletion rejects ${kind} session without contacting storage`, async () => {
    currentSession = kind === "missing" ? null : kind === "expired" ? session(1) : kind === "error" ? { ...session(), error: "AccessTokenExpired" } : { ...session(), user: {} };
    const result = await route.POST(request());
    assert.equal(result.status, 401);
    assert.equal(result.headers.get("cache-control"), "private, no-store");
    assert.equal(calls.length, 0); assert.equal(deletions.length, 0);
  });
}
test("a verified owner can delete with the unchanged request contract", async () => {
  const result = await route.POST(request());
  assert.equal(result.status, 200);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.application, application);
  assert.equal(body.fileKeys[0], "owned.png");
  assert.equal(body.ownerUserId, undefined);
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${currentSession.accessToken}`);
  assert.equal(calls[0].options.cache, "no-store");
  assert.equal(deletions.length, 1);
  assert.equal(deletions[0].keys[0], "owned.png");
  assert.equal(deletions[0].options.keyType, "fileKey");
});
for (const status of [401, 403, 500]) {
  test(`backend ${status} prevents every storage deletion`, async () => {
    backendStatus = status;
    const result = await route.POST(request());
    assert.equal(result.status, status === 500 ? 503 : status);
    assert.equal(deletions.length, 0);
  });
}
test("a successful HTTP response without explicit authorization fails closed", async () => {
  backendData = { authorized: false };
  assert.equal((await route.POST(request())).status, 503);
  assert.equal(deletions.length, 0);
});
test("backend network errors are generic and cannot trigger storage deletion", async () => {
  failFetch = true;
  const result = await route.POST(request());
  assert.equal(result.status, 503);
  assert.ok(!(await result.text()).includes("private upstream"));
  assert.equal(deletions.length, 0);
});
test("foreign browser origins are rejected", async () => {
  assert.equal((await route.POST(request(undefined, { origin: "https://attacker.example.test" }))).status, 403);
  assert.equal(calls.length, 0); assert.equal(deletions.length, 0);
});
test("same-origin requests are accepted", async () => {
  assert.equal((await route.POST(request(undefined, { origin: "https://site.example.test" }))).status, 200);
});
test("non-JSON requests are rejected", async () => {
  assert.equal((await route.POST(request(undefined, { "content-type": "text/plain" }))).status, 400);
  assert.equal(deletions.length, 0);
});
test("invalid JSON is rejected", async () => {
  assert.equal((await route.POST(request("{", {}, true))).status, 400);
  assert.equal(deletions.length, 0);
});
const invalid = single ? [null, {}, { key: 5 }, { key: "" }, { key: "https://host/f/key" }, { key: "x".repeat(513) }, { key: "owned.png", ownerUserId: "victim" }] : [null, {}, { fileKeys: [] }, { fileKeys: [5] }, { fileKeys: ["owned.png", "owned.png"] }, { fileKeys: ["x".repeat(513)] }, { fileKeys: Array.from({ length: 21 }, (_, i) => `key${i}`) }, { fileKeys: ["owned.png"], ownerUserId: "victim" }];
invalid.forEach((body, index) => test(`invalid deletion payload ${index} never reaches the backend`, async () => {
  assert.equal((await route.POST(request(body))).status, 400);
  assert.equal(calls.length, 0); assert.equal(deletions.length, 0);
}));
test("storage errors do not produce a success response", async () => {
  storageResult = { success: false, deletedCount: 0 };
  assert.equal((await route.POST(request())).status, 502);
});
test("callback registration is signed with server identity and application scope", async () => {
  await helpers.registerUpload("owner", "owned.png");
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.ownerUserId, "owner"); assert.equal(body.application, application);
  assert.equal(calls[0].options.headers["x-upload-signature"], createHmac("sha256", process.env.UPLOAD_OWNERSHIP_SECRET).update(JSON.stringify([application, "owner", "owned.png", body.timestamp])).digest("hex"));
  assert.equal(calls[0].options.headers.Authorization, undefined);
});
test("registration failure is propagated instead of acknowledging ownership", async () => {
  backendStatus = 503;
  await assert.rejects(helpers.registerUpload("owner", "owned.png"));
});
test("missing secret blocks authenticated uploads before storage", async () => {
  delete process.env.UPLOAD_OWNERSHIP_SECRET;
  await assert.rejects(helpers.uploadOwner());
});
test("upload identity comes from the trusted session", async () => {
  assert.equal(await helpers.uploadOwner(), "owner");
});
test("guest uploads never claim an account owner", async () => {
  currentSession = null;
  assert.equal(await helpers.uploadOwner(true), null);
  await helpers.registerUpload(null, "guest.png");
  assert.equal(calls.length, 0);
  await assert.rejects(helpers.uploadOwner(false));
});
test("every real upload route prepares quota before minting URLs and completes its reservation", async () => {
  const routes = [], operations = [];
  const fake = { createUploadthing: () => () => {
    const item = {}; routes.push(item);
    const builder = { input() { return builder; }, middleware(fn) { item.middleware = fn; return builder; }, onUploadComplete(fn) { item.complete = fn; return item; } };
    return builder;
  }};
  const permits = { uploadContextSchema: {}, prepareUpload: async (route, files, input) => { operations.push(['prepare',route,files,input]); return {userId:'owner',reservations:['permit']}; }, finishUpload: async (file, metadata) => { operations.push(['complete',file,metadata]); } };
  load("app/api/uploadthing/core.ts", { "uploadthing/next": fake, "@/lib/upload-permits": permits });
  assert.equal(routes.length, single ? 1 : 3);
  for (const item of routes) {
    const metadata = await item.middleware({files:[{size:10,type:'image/png'}],input:{}});
    await item.complete({metadata,file:{key:'owned.png',customId:'permit',size:10,ufsUrl:'https://example.test/f/owned.png'}});
  }
  assert.equal(operations.filter(item => item[0] === 'prepare').length, routes.length);
  assert.equal(operations.filter(item => item[0] === 'complete').length, routes.length);
});

if (!single) for (const status of [200, 403]) test(`admin account cleanup respects ownership authorization ${status}`, async () => {
  backendData = { image: "https://utfs.io/f/owned.png" };
  const checks = [];
  const admin = load("lib/queries/admin.ts", {
    "@/lib/upload-security": { authorizeUploadDeletion: async (keys, token, owner) => { checks.push({ keys, token, owner }); return status; } },
    "../session": { getAuthHeaders: async () => ({ Authorization: "Bearer admin-token" }) },
    "uploadthing/server": { UTApi: class { async deleteFiles(keys) { deletions.push(keys); return storageResult; } } },
  });
  await admin.deleteAdminUserAction("target-owner");
  assert.equal(checks.length, 1);
  assert.equal(checks[0].keys[0], "owned.png");
  assert.equal(checks[0].owner, "target-owner");
  assert.equal(checks[0].token, "admin-token");
  assert.equal(deletions.length, status === 200 ? 1 : 0);
});
if (!single) for (const denyLast of [false, true]) test(`admin cleanup validates every batch before deletion (deny last: ${denyLast})`, async () => {
  backendData = { images: Array.from({ length: 25 }, (_, i) => `https://test-app.ufs.sh/f/file-${i}.png`), description: "https://attacker.example.test/utfs.io/f/victim.png" };
  const checks = [];
  const admin = load("lib/queries/admin.ts", {
    "@/lib/upload-security": { authorizeUploadDeletion: async (keys) => { checks.push(keys); return denyLast && checks.length === 2 ? 403 : 200; } },
    "../session": { getAuthHeaders: async () => ({ Authorization: "Bearer admin-token" }) },
    "uploadthing/server": { UTApi: class { async deleteFiles(keys) { assert.equal(checks.length, 2); deletions.push(keys); return storageResult; } } },
  });
  await admin.deleteAdminUserAction("target-owner");
  assert.equal(checks.length, 2);
  assert.equal(checks[0].length, 20); assert.equal(checks[1].length, 5);
  assert.equal(deletions.length, denyLast ? 0 : 2);
});
