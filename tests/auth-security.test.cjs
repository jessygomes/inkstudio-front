/* eslint-disable @typescript-eslint/no-require-imports -- Node harness exercises the actual TypeScript auth callbacks. */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const semver = require("semver");
const professional = require("../package.json").name === "inkstudio-front";
const kind = professional ? "professional" : "client";
const role = professional ? "user_salon" : "client";
const envKeys = ["NODE_ENV", "AUTH_URL", "NEXTAUTH_URL", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_BACK_URL"];
const originalEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
let fetchCalls;
let profileResponse;
let fetchError;

function load(file, imports = {}) {
  const testModule = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(output, {
    module: testModule, exports: testModule.exports, process, Buffer, URL, URLSearchParams, Date, AbortSignal,
    console: { log() {}, warn() {}, error() {} },
    fetch: async (...args) => {
      fetchCalls.push(args);
      if (fetchError) throw fetchError;
      return profileResponse;
    },
    require(name) { assert.ok(name in imports, `Unexpected import: ${name}`); return imports[name]; },
  });
  return testModule.exports;
}

const security = load("lib/auth-security.ts");
const plain = value => JSON.parse(JSON.stringify(value));
function backendToken(claims = {}) {
  return ["test-header", Buffer.from(JSON.stringify({
    userId: "owner", role, exp: Math.floor(Date.now() / 1000) + 3600, ...claims,
  })).toString("base64url"), "test-signature"].join(".");
}
const token = () => ({ id: "owner", role, email: "owner@example.test", accessToken: backendToken(), name: "Original", saasPlan: "FREE" });
const session = () => ({ user: { id: "owner", role }, accessToken: backendToken(), expires: new Date(Date.now() + 3600000).toISOString() });
const backendProfile = () => ({ id: "owner", role, email: "owner@example.test", displayName: "Verified profile", salonName: "Verified salon", firstName: "Verified", lastName: "Owner", saasPlan: "PRO", verifiedSalon: true, phone: "123", clientProfile: { id: "profile", pseudo: "Verified client" } });
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });

function authOptions() {
  let options;
  load("auth.ts", {
    "next-auth": value => { options = value; return { handlers: {}, auth() {}, signIn() {}, signOut() {} }; },
    "./auth.config": { providers: [] },
    "./lib/auth-security": security,
  });
  return options;
}

beforeEach(() => {
  fetchCalls = [];
  fetchError = null;
  profileResponse = response(backendProfile());
  process.env.NEXT_PUBLIC_BACK_URL = "https://backend.example.test";
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NODE_ENV;
});
afterEach(() => {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

test("the installed Auth.js stack meets the DEP-02 security baseline", async () => {
  assert.ok(semver.gte(require("next-auth/package.json").version, "5.0.0-beta.32"));
  const { createRequire } = require("node:module");
  const fromNextAuth = createRequire(require.resolve("next-auth/package.json"));
  const coreEntry = fromNextAuth.resolve("@auth/core");
  const manifest = JSON.parse(fs.readFileSync(path.join(path.dirname(coreEntry), "package.json"), "utf8"));
  assert.ok(semver.gte(manifest.version, "0.41.3"));
});

test("a complete active session is usable", () => {
  assert.equal(security.hasUsableSession(session()), true);
});

for (const [label, value] of [
  ["missing session", null],
  ["configuration error object", { message: "Auth.js configuration error" }],
  ["empty user", { user: {} }],
  ["missing backend token", { user: { id: "owner", role }, expires: new Date(Date.now() + 3600000).toISOString() }],
]) {
  test(`rejects ${label}`, () => assert.equal(security.hasUsableSession(value), false));
}

test("rejects expired or malformed backend credentials and expired sessions", () => {
  for (const accessToken of [backendToken({ exp: 1 }), backendToken({ exp: "9999999999" }), backendToken({ exp: 1e308 }), "malformed"]) {
    assert.equal(security.hasUsableSession({ ...session(), accessToken }), false);
  }
  assert.equal(security.hasUsableSession({ ...session(), error: "AccessTokenExpired" }), false);
  assert.equal(security.hasUsableSession({ ...session(), expires: "2000-01-01T00:00:00Z" }), false);
});

test("initial credentials login preserves the verified backend identity", async () => {
  const backend = token();
  const user = { id: backend.id, role, email: backend.email, name: "Owner", accessToken: backend.accessToken, saasPlan: "FREE" };
  const result = await authOptions().callbacks.jwt({ token: {}, user, account: { provider: "credentials" } });
  assert.equal(result.id, "owner");
  assert.equal(result.role, role);
  assert.equal(result.accessToken, backend.accessToken);
  assert.ok(result.accessTokenExpiry > Date.now());
  assert.equal(fetchCalls.length, 0);
});

test("browser session updates cannot select identity, role, token, plan or verification", async () => {
  const trusted = token();
  const result = await authOptions().callbacks.jwt({
    token: trusted, trigger: "update", session: { user: {
      id: "victim", role: "admin", accessToken: "forged", saasPlan: "BUSINESS", verifiedSalon: false, name: "Injected", accessTokenExpiry: Infinity,
    } },
  });
  assert.equal(result.id, "owner");
  assert.equal(result.role, role);
  assert.equal(result.accessToken, trusted.accessToken);
  assert.notEqual(result.name, "Injected");
  if (professional) {
    assert.equal(result.saasPlan, "PRO");
    assert.equal(result.verifiedSalon, true);
    assert.equal(result.name, "Verified profile");
  } else {
    assert.equal(result.name, "Verified client");
    assert.equal(result.clientProfile.userId, "owner");
  }
  assert.equal(fetchCalls[0][0], "https://backend.example.test/auth");
  assert.equal(fetchCalls[0][1].headers.Authorization, `Bearer ${trusted.accessToken}`);
  assert.equal(fetchCalls[0][1].cache, "no-store");
});

test("refresh keeps the trusted snapshot during a network failure", async () => {
  const trusted = token();
  fetchError = new Error("network unavailable");
  const result = await authOptions().callbacks.jwt({ token: trusted, trigger: "update", session: { user: { role: "admin", name: "Injected" } } });
  assert.equal(result.role, role);
  assert.equal(result.name, "Original");
  assert.equal(result.accessToken, trusted.accessToken);
});

for (const [label, profile] of [
  ["different account", { id: "victim", role, email: "victim@example.test", name: "Injected" }],
  ["different role", { id: "owner", role: "admin", email: "owner@example.test", name: "Injected" }],
  ["business error", { id: "owner", role, email: "owner@example.test", error: true }],
  ["missing profile", null],
]) {
  test(`does not accept a refresh response for ${label}`, async () => {
    profileResponse = response(profile);
    const trusted = token();
    const result = await security.refreshSessionProfile(trusted, kind);
    assert.deepEqual(plain(result), trusted);
  });
}

test("backend authorization failure marks the session unusable", async () => {
  for (const status of [401, 403]) {
    profileResponse = response({}, status);
    const result = await security.refreshSessionProfile(token(), kind);
    assert.equal(result.error, "AccessTokenExpired");
    assert.equal(security.hasUsableSession({ ...session(), error: result.error }), false);
  }
});

test("a browser update cannot revive expired backend credentials", async () => {
  const result = await authOptions().callbacks.jwt({
    token: { ...token(), accessToken: backendToken({ exp: 1 }) }, trigger: "update",
    session: { user: { accessToken: backendToken(), accessTokenExpiry: Infinity, error: undefined } },
  });
  assert.equal(result.error, "AccessTokenExpired");
  assert.equal(fetchCalls.length, 0);
});

test("session callback propagates backend expiration to callers", async () => {
  const result = await authOptions().callbacks.session({ session: session(), token: { ...token(), error: "AccessTokenExpired" } });
  assert.equal(result.error, "AccessTokenExpired");
  assert.equal(security.hasUsableSession(result), false);
});

class NextResponse extends Response {
  static next() { return new NextResponse(null, { status: 200 }); }
  static redirect(url) { return new NextResponse(null, { status: 307, headers: { location: String(url) } }); }
}
function proxyFor(authSession) {
  const imports = {
    "next/server": { NextResponse },
    "@/lib/auth-security": security,
    "@/auth": { auth: professional ? callback => callback : async () => authSession },
  };
  if (professional) {
    imports["@/lib/routes"] = load("lib/routes.ts");
    imports["@/lib/back-office"] = load("lib/back-office.ts");
  }
  const result = load("proxy.ts", imports);
  return pathname => (professional ? result.default : result.proxy)({
    auth: authSession, nextUrl: new URL(`http://localhost${pathname}`), url: `http://localhost${pathname}`,
  });
}

test("proxy refuses missing, error and expired sessions on private pages", async () => {
  const pathname = professional ? "/dashboard" : "/mon-profil";
  const login = professional ? "/connexion" : "/se-connecter";
  for (const invalid of [null, { message: "configuration error" }, { ...session(), error: "AccessTokenExpired" }, { ...session(), accessToken: backendToken({ exp: 1 }) }]) {
    const result = await proxyFor(invalid)(pathname);
    assert.equal(result.status, 307);
    assert.ok(result.headers.get("location").includes(login));
  }
});

test("proxy allows a usable session on private pages", async () => {
  const result = await proxyFor(session())(professional ? "/dashboard" : "/mon-profil");
  assert.equal(result.status, 200);
});

if (professional) {
  test("an Auth.js error object does not redirect the login page to the dashboard", async () => {
    assert.equal((await proxyFor({ message: "configuration error" })("/connexion")).status, 200);
  });
  test("back-office access requires a usable administrator session", async () => {
    const { BACK_OFFICE_PATH } = load("lib/back-office.ts");
    assert.equal((await proxyFor(session())(BACK_OFFICE_PATH)).status, 404);
    const admin = { ...session(), user: { id: "admin", role: "admin" }, accessToken: backendToken({ userId: "admin", role: "admin" }) };
    assert.equal((await proxyFor(admin)(BACK_OFFICE_PATH)).status, 200);
  });
}

test("server auth helpers never expose an expired or error session", async () => {
  const helperFile = professional ? "lib/auth-helpers.ts" : "lib/auth-session.ts";
  for (const invalid of [null, { message: "configuration error" }, { ...session(), error: "AccessTokenExpired" }]) {
    const helpers = load(helperFile, { "@/auth": { auth: async () => invalid }, "./auth-security": security });
    assert.equal(await helpers.isAuthenticated(), false);
    assert.equal(await helpers.getSession(), null);
    assert.equal(await helpers.getCurrentUser(), undefined);
    assert.equal(await helpers.getAccessToken(), undefined);
    assert.equal((await helpers.getAuthHeaders()).Authorization, undefined);
  }
});

test("session cookies use the new namespace, HttpOnly and secure production settings", () => {
  const prefix = professional ? "inkera_pro_session_v2" : "inkera_client_session_v2";
  const development = authOptions().cookies.sessionToken;
  assert.equal(development.name, prefix);
  assert.equal(development.options.httpOnly, true);
  assert.equal(development.options.sameSite, "lax");
  process.env.NODE_ENV = "production";
  const production = authOptions().cookies.sessionToken;
  assert.equal(production.name, `__Secure-${prefix}`);
  assert.equal(production.options.secure, true);
});

if (professional) {
  test("expired-session cleanup removes the new cookies and their chunks", async () => {
    const removed = [];
    const names = ["inkera_pro_session_v2", "__Secure-inkera_pro_session_v2.0", "authjs.session-token", "unrelated-cookie"];
    const actions = load("lib/auth.actions.ts", {
      "@/auth": { signOut: async () => {} },
      "next/headers": { cookies: async () => ({ getAll: () => names.map(name => ({ name })), delete: options => removed.push(options) }) },
    });
    await actions.clearExpiredSession();
    assert.deepEqual(removed.map(item => item.name), names.slice(0, 3));
    assert.equal(removed.find(item => item.name.startsWith("__Secure-")).secure, true);
  });
}

test("old encrypted session cookies cannot authenticate under the new namespace", async () => {
  const { encode, getToken } = await import("next-auth/jwt");
  const secret = "auth-security-tests-only-secret";
  const cookieName = authOptions().cookies.sessionToken.name;
  const oldName = professional ? "authjs.session-token" : "client_access_token";
  const oldCookie = await encode({ token: token(), secret, salt: oldName, maxAge: 3600 });
  for (const name of [oldName, cookieName]) {
    const req = new Request("http://localhost/api/auth/session", { headers: { cookie: `${name}=${oldCookie}` } });
    assert.equal(await getToken({ req, secret, salt: cookieName, cookieName }), null);
  }
  const current = await encode({ token: token(), secret, salt: cookieName, maxAge: 3600 });
  const req = new Request("http://localhost/api/auth/session", { headers: { cookie: `${cookieName}=${current}` } });
  assert.equal((await getToken({ req, secret, salt: cookieName, cookieName })).id, "owner");
});

test("the patched JWT reader tolerates malformed Bearer values without throwing", async () => {
  const { getToken } = await import("next-auth/jwt");
  for (const value of ["%", "%ZZ", "not-a-jwt"]) {
    const req = new Request("http://localhost/api/auth/session", { headers: { authorization: `Bearer ${value}` } });
    assert.equal(await getToken({ req, secret: "test-only-secret", salt: "test-cookie" }), null);
  }
});

if (!professional) {
  test("Google login sends only the ID token to the backend and uses its verified identity", async () => {
    const backend = token();
    profileResponse = response({ id: "owner", role, email: "owner@example.test", firstName: "Verified", lastName: "Owner", access_token: backend.accessToken, clientProfile: { pseudo: "Verified client" } });
    const result = await authOptions().callbacks.jwt({ token: {}, user: { email: "injected@example.test" }, account: { provider: "google", id_token: "signed-google-id-token", access_token: "unused-access-token" }, profile: { email: "injected@example.test" } });
    assert.deepEqual(JSON.parse(fetchCalls[0][1].body), { idToken: "signed-google-id-token" });
    assert.equal(result.id, "owner");
    assert.equal(result.email, "owner@example.test");
    assert.equal(result.accessToken, backend.accessToken);
  });
  test("Google login refuses an access token alone", async () => {
    await assert.rejects(authOptions().callbacks.jwt({ token: {}, account: { provider: "google", access_token: "access-token" } }));
    assert.equal(fetchCalls.length, 0);
  });
}
