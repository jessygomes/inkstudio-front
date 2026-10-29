import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { UTApi, UTFiles, UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-security";

const application = "pro" as "pro" | "public";
export const uploadContextSchema = z
  .object({
    bookingSalonId: z.string().min(1).max(128).optional(),
    followUpToken: z.string().min(1).max(128).optional(),
    consentClientId: z.string().min(1).max(128).optional(),
  })
  .strict();
type Context = z.infer<typeof uploadContextSchema>;

function secret() {
  const value = process.env.UPLOAD_OWNERSHIP_SECRET;
  if (!value || Buffer.byteLength(value) < 32)
    throw new Error("Upload authorization unavailable");
  return value;
}
export async function uploadControl(
  action: "prepare" | "complete" | "deleted" | "abandoned",
  value: object,
  accessToken?: string,
): Promise<unknown> {
  const timestamp = Date.now(),
    payload = JSON.stringify(value);
  const signature = createHmac("sha256", secret())
    .update(
      JSON.stringify(["upload-v2", action, application, payload, timestamp]),
    )
    .digest("hex");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/uploads/${action}`,
    {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "Content-Type": "application/json",
        "x-upload-signature": signature,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ application, payload, timestamp }),
    },
  );
  if (!response.ok) {
    throw Object.assign(
      new UploadThingError({
        code: "FORBIDDEN",
        message:
          response.status === 409
            ? "La limite de transfert est atteinte. Réessayez plus tard."
            : "Le transfert n’est pas autorisé ou est temporairement indisponible.",
      }),
      { cleanupSafe: [400, 401, 403, 404, 409].includes(response.status) },
    );
  }
  return response.json();
}

async function guestIdentity() {
  const jar = await cookies();
  const name =
    process.env.NODE_ENV === "production"
      ? "__Host-inkera-upload-guest-v2"
      : "inkera-upload-guest-v2";
  const value = jar.get(name)?.value || "";
  const [id, expiry, signature] = value.split(".");
  if (
    id &&
    /^[a-f0-9-]{36}$/.test(id) &&
    /^\d{13}$/.test(expiry || "") &&
    Number(expiry) > Date.now() &&
    Number(expiry) <= Date.now() + 31 * 60000 &&
    /^[a-f0-9]{64}$/.test(signature || "")
  ) {
    const expected = createHmac("sha256", secret())
      .update(`upload-guest-v2:${id}:${expiry}`)
      .digest();
    if (timingSafeEqual(expected, Buffer.from(signature, "hex"))) return id;
  }
  const next = randomUUID(),
    expires = Date.now() + 30 * 60000;
  const mac = createHmac("sha256", secret())
    .update(`upload-guest-v2:${next}:${expires}`)
    .digest("hex");
  jar.set(name, `${next}.${expires}.${mac}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 1800,
  });
  return next;
}

export async function prepareUpload(
  route: string,
  files: readonly { name: string; size: number; type: string }[],
  context: Context,
) {
  const session = await auth();
  if (session && !hasUsableSession(session))
    throw new UploadThingError({
      code: "FORBIDDEN",
      message: "Reconnectez-vous pour transférer un fichier.",
    });
  const input = { ...context };
  const connected = hasUsableSession(session);
  // Connected booking images belong to the authenticated uploader account.
  if (connected) delete input.bookingSalonId;
  const guestId =
    !connected && input.bookingSalonId && application === "public"
      ? await guestIdentity()
      : undefined;
  const result = await uploadControl(
    "prepare",
    {
      route,
      files: files.map((file) => ({ size: file.size, type: file.type })),
      ...input,
      ...(guestId ? { guestId } : {}),
    },
    connected ? session.accessToken : undefined,
  );
  if (
    !result ||
    typeof result !== "object" ||
    !("reservations" in result) ||
    !Array.isArray(result.reservations) ||
    result.reservations.length !== files.length ||
    result.reservations.some((id) => typeof id !== "string") ||
    !("ownerUserId" in result)
  )
    throw new Error("Invalid upload authorization");
  const reservations = result.reservations as string[];
  return {
    userId: typeof result.ownerUserId === "string" ? result.ownerUserId : null,
    reservations,
    [UTFiles]: files.map((file, index) => ({
      ...file,
      customId: reservations[index],
    })),
  };
}

export async function finishUpload(
  file: { customId: string | null; key: string; size: number },
  metadata: { reservations: string[] },
) {
  try {
    if (!file.customId || !metadata.reservations.includes(file.customId))
      throw new Error("Upload authorization missing");
    await uploadControl("complete", {
      id: file.customId,
      key: file.key,
      size: file.size,
    });
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("cleanupSafe" in error) ||
      error.cleanupSafe !== true
    )
      throw error;
    // Never release capacity on a timeout alone. Confirm physical deletion first.
    try {
      const deleted = await new UTApi().deleteFiles([file.key]);
      if (deleted.success) await uploadControl("deleted", { keys: [file.key] });
    } catch {
      /* Reserved quota remains held; conservative cleanup can retry. */
    }
    throw error;
  }
}
