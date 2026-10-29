import { uploadControl } from "@/lib/upload-permits";
import { createHmac } from "node:crypto";
import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-security";
import { UTApi } from "uploadthing/server";

const application = "pro";
const privateHeaders = { "Cache-Control": "private, no-store" };
const respond = (status: number, body: object) => Response.json(body, { status, headers: privateHeaders });

function ownershipSecret() {
  const secret = process.env.UPLOAD_OWNERSHIP_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error("Upload ownership unavailable");
  return secret;
}

export async function uploadOwner(allowGuest = false): Promise<string | null> {
  const session = await auth();
  if (!hasUsableSession(session)) {
    if (allowGuest) return null;
    throw new Error("Authentication required");
  }
  ownershipSecret();
  return session.user.id;
}

export async function registerUpload(ownerUserId: string | null, key: string) {
  // Guest booking uploads have no account owner and cannot use account deletion.
  if (!ownerUserId) return;
  const timestamp = Date.now();
  const signature = createHmac("sha256", ownershipSecret())
    .update(JSON.stringify([application, ownerUserId, key, timestamp])).digest("hex");
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/uploads/register`, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(10_000),
    headers: { "Content-Type": "application/json", "x-upload-signature": signature },
    body: JSON.stringify({ application, ownerUserId, key, timestamp }),
  });
  if (!response.ok) throw new Error("Upload ownership registration failed");
}

export async function authorizeUploadDeletion(fileKeys: string[], accessToken: string, ownerUserId?: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/uploads/authorize-deletion`, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(10_000),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ application, fileKeys, ...(ownerUserId ? { ownerUserId } : {}) }),
  });
  if (!response.ok) return response.status === 401 ? 401 : response.status === 403 ? 403 : 503;
  const result: unknown = await response.json();
  return result && typeof result === "object" && "authorized" in result && result.authorized === true ? 200 : 503;
}

export async function deleteOwnedUploads(request: Request, singleKey = false) {
  try {
    const session = await auth();
    if (!hasUsableSession(session)) return respond(401, { success: false, error: "Authentication required" });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return respond(403, { success: false, error: "Forbidden origin" });
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      return respond(400, { success: false, error: "JSON required" });
    }
    let body: unknown;
    try { body = await request.json(); } catch { return respond(400, { success: false, error: "Invalid JSON" }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return respond(400, { success: false, error: "Invalid file keys" });
    const field = singleKey ? "key" : "fileKeys";
    const value = (body as Record<string, unknown>)[field];
    const keys = singleKey ? [value] : value;
    if (Object.keys(body).some((key) => key !== field) || !Array.isArray(keys) || keys.length < 1 || keys.length > 20 ||
      keys.some((key) => typeof key !== "string" || key.length > 512 || !/^[a-zA-Z0-9_.-]+$/.test(key)) || new Set(keys).size !== keys.length) {
      return respond(400, { success: false, error: "Invalid file keys" });
    }
    const fileKeys = keys as string[];
    const status = await authorizeUploadDeletion(fileKeys, session.accessToken);
    if (status !== 200) return respond(status, { success: false, error: "File deletion not authorized" });
    const result = await new UTApi().deleteFiles(fileKeys, { keyType: "fileKey" });
    if (!result.success) return respond(502, { success: false, error: "Storage deletion failed" });
    await uploadControl("deleted", { keys: fileKeys });
    return respond(200, { success: true, result });
  } catch {
    return respond(503, { success: false, error: "File deletion unavailable" });
  }
}
