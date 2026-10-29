/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node verification and maintenance. */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm");
const ts = require("typescript"),
  { createHmac } = require("node:crypto");
const root = path.join(__dirname, "..");
const application = require("../package.json").name.includes("public")
  ? "public"
  : "pro";
const marker = Symbol("UTFiles");
let session, calls, deleted, failAction, storageSuccess, jar;
const secret = "upload-permit-tests-only-secret-at-least-32-bytes";
function load(file, imports) {
  const testModule = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    {
      module: testModule,
      exports: testModule.exports,
      Buffer,
      process,
      Date,
      URL,
      Response,
      AbortSignal,
      require: (name) => {
        if (name in imports) return imports[name];
        if (["node:crypto", "zod"].includes(name)) return require(name);
        throw Error(name);
      },
      fetch: async (url, options) => {
        const envelope = JSON.parse(options.body),
          payload = JSON.parse(envelope.payload);
        const action = url.split("/").at(-1);
        calls.push({ action, options, envelope, payload });
        if (failAction === "network") throw new Error("network timeout");
        if (action === failAction) return Response.json({}, { status: 409 });
        return Response.json(
          action === "prepare"
            ? {
                reservations: payload.files.map((_, i) => `permit-${i}`),
                ownerUserId: options.headers.Authorization ? "owner" : null,
              }
            : { success: true },
        );
      },
    },
  );
  return testModule.exports;
}
const security = load("lib/auth-security.ts", {});
const helpers = load("lib/upload-permits.ts", {
  "@/auth": { auth: async () => session },
  "@/lib/auth-security": security,
  "next/headers": {
    cookies: async () => ({
      get: (name) => (jar.has(name) ? { value: jar.get(name) } : undefined),
      set: (name, value) => jar.set(name, value),
    }),
  },
  "uploadthing/server": {
    UTFiles: marker,
    UploadThingError: class extends Error {
      constructor(value) {
        super(value.message);
      }
    },
    UTApi: class {
      async deleteFiles(keys) {
        deleted.push(keys);
        return { success: storageSuccess };
      }
    },
  },
});
beforeEach(() => {
  process.env.UPLOAD_OWNERSHIP_SECRET = secret;
  process.env.NEXT_PUBLIC_BACK_URL = "https://backend.example.test";
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url");
  session = {
    user: {
      id: "owner",
      role: application === "pro" ? "user_salon" : "client",
    },
    accessToken: `test.${payload}.signature`,
    expires: new Date(Date.now() + 3600000).toISOString(),
  };
  calls = [];
  deleted = [];
  jar = new Map();
  failAction = null;
  storageSuccess = true;
});
const files = [{ name: "photo.png", type: "image/png", size: 10 }];
test("the real context parser rejects identity fields and limits context length", () => {
  assert.equal(
    helpers.uploadContextSchema.safeParse({ ownerUserId: "victim" }).success,
    false,
  );
  assert.equal(
    helpers.uploadContextSchema.safeParse({ followUpToken: "x".repeat(129) })
      .success,
    false,
  );
});
test("reserves through the signed backend channel using the session JWT and sets per-file custom IDs", async () => {
  const metadata = await helpers.prepareUpload("imageUploader", files, {});
  assert.equal(metadata.userId, "owner");
  assert.equal(metadata[marker][0].customId, "permit-0");
  const call = calls[0];
  assert.equal(call.action, "prepare");
  assert.equal(
    call.options.headers.Authorization,
    `Bearer ${session.accessToken}`,
  );
  assert.equal(call.payload.ownerUserId, undefined);
  const expected = createHmac("sha256", secret)
    .update(
      JSON.stringify([
        "upload-v2",
        "prepare",
        application,
        call.envelope.payload,
        call.envelope.timestamp,
      ]),
    )
    .digest("hex");
  assert.equal(call.options.headers["x-upload-signature"], expected);
});
test("expired or errored sessions cannot fall back to anonymous uploads", async () => {
  session.error = "AccessTokenExpired";
  await assert.rejects(
    helpers.prepareUpload("imageUploader", files, { bookingSalonId: "salon" }),
  );
  assert.equal(calls.length, 0);
});
test("a failed reservation never mints file metadata", async () => {
  failAction = "prepare";
  await assert.rejects(helpers.prepareUpload("imageUploader", files, {}));
  assert.equal(deleted.length, 0);
});
test("connected booking uploads keep the authenticated owner and omit anonymous context", async () => {
  await helpers.prepareUpload("imageUploader", files, {
    bookingSalonId: "salon",
  });
  assert.equal(calls[0].payload.bookingSalonId, undefined);
  assert.equal(calls[0].payload.guestId, undefined);
});
test("authorized anonymous context is forwarded without inventing an account owner", async () => {
  session = null;
  const input =
    application === "pro"
      ? { followUpToken: "valid-follow-up-token" }
      : { bookingSalonId: "salon" };
  const metadata = await helpers.prepareUpload("imageUploader", files, input);
  assert.equal(metadata.userId, null);
  assert.equal(calls[0].options.headers.Authorization, undefined);
  if (application === "pro")
    assert.equal(calls[0].payload.followUpToken, input.followUpToken);
  else assert.match(calls[0].payload.guestId, /^[a-f0-9-]{36}$/);
});
if (application === "public") {
  test("the signed guest cookie keeps its quota identity across uploads", async () => {
    session = null;
    await helpers.prepareUpload("imageUploader", files, {
      bookingSalonId: "salon",
    });
    const first = calls[0].payload.guestId;
    await helpers.prepareUpload("imageUploader", files, {
      bookingSalonId: "salon",
    });
    assert.equal(calls[1].payload.guestId, first);
  });
  test("a forged guest cookie is replaced rather than trusted", async () => {
    session = null;
    const name =
      process.env.NODE_ENV === "production"
        ? "__Host-inkera-upload-guest-v2"
        : "inkera-upload-guest-v2";
    const forged = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    jar.set(name, `${forged}.${Date.now() + 600000}.${"a".repeat(64)}`);
    await helpers.prepareUpload("imageUploader", files, {
      bookingSalonId: "salon",
    });
    assert.notEqual(calls[0].payload.guestId, forged);
  });
}
test("the completion sends the provider's file size and the matching reservation", async () => {
  await helpers.finishUpload(
    { customId: "permit", key: "file.png", size: 10 },
    { reservations: ["permit"] },
  );
  assert.deepEqual(calls[0].payload, {
    id: "permit",
    key: "file.png",
    size: 10,
  });
  assert.equal(deleted.length, 0);
});
test("a callback cannot complete a reservation outside its metadata", async () => {
  await assert.rejects(
    helpers.finishUpload(
      { customId: "other", key: "file.png", size: 10 },
      { reservations: ["permit"] },
    ),
  );
  assert.equal(calls.filter((call) => call.action === "complete").length, 0);
  assert.equal(deleted.length, 0);
});
test("a rejected completion is cleaned up before any deletion receipt", async () => {
  failAction = "complete";
  await assert.rejects(
    helpers.finishUpload(
      { customId: "permit", key: "file.png", size: 10 },
      { reservations: ["permit"] },
    ),
  );
  assert.equal(deleted.length, 1);
  assert.equal(calls.at(-1).action, "deleted");
});
test("an unconfirmed storage deletion never releases quota", async () => {
  failAction = "complete";
  storageSuccess = false;
  await assert.rejects(
    helpers.finishUpload(
      { customId: "permit", key: "file.png", size: 10 },
      { reservations: ["permit"] },
    ),
  );
  assert.equal(calls.filter((call) => call.action === "deleted").length, 0);
});

test("an ambiguous completion timeout keeps storage intact for a later safe cleanup", async () => {
  failAction = "network";
  await assert.rejects(
    helpers.finishUpload(
      { customId: "permit", key: "file.png", size: 10 },
      { reservations: ["permit"] },
    ),
  );
  assert.equal(deleted.length, 0);
});
