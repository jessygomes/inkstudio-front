/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node verification and maintenance. */
// Dry run by default. Load the application's existing .env.local with Node.
const { createHmac } = require("node:crypto");
const { UTApi } = require("uploadthing/server");
const application = "pro";
async function control(value) {
  const secret = process.env.UPLOAD_OWNERSHIP_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32)
    throw new Error("Upload secret unavailable");
  const payload = JSON.stringify(value),
    timestamp = Date.now();
  const signature = createHmac("sha256", secret)
    .update(
      JSON.stringify([
        "upload-v2",
        "abandoned",
        application,
        payload,
        timestamp,
      ]),
    )
    .digest("hex");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/uploads/abandoned`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-upload-signature": signature,
      },
      body: JSON.stringify({ application, payload, timestamp }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) throw new Error(`Cleanup unavailable (${response.status})`);
  return response.json();
}
(async () => {
  const apply = process.argv.includes("--apply");
  const rows = await control(apply ? { claim: true } : {});
  if (
    !Array.isArray(rows) ||
    rows.some(
      (row) => typeof row.id !== "string" || !/^[a-f0-9-]{36}$/.test(row.id),
    )
  )
    throw new Error("Invalid cleanup response");
  console.log(
    `${rows.length} abandoned uploads older than 24 hours; attached guest uploads and completed account uploads are excluded.`,
  );
  if (!apply) {
    console.log(
      "Dry run. Pass --apply to delete their storage custom IDs and acknowledge successful deletions.",
    );
    return;
  }
  const api = new UTApi();
  const confirmedIds = [];
  for (const row of rows) {
    const result = await api.deleteFiles([row.id], { keyType: "customId" });
    if (result.success) confirmedIds.push(row.id);
    else {
      // Exact provider lookup; a paginated inventory is not a reliable absence proof.
      const lookup = await api.getFileUrls([row.id], { keyType: "customId" });
      if (Array.isArray(lookup.data) && lookup.data.length === 0)
        confirmedIds.push(row.id);
    }
    // No success: retain quota and require storage inspection; never guess absence.
  }
  if (confirmedIds.length) await control({ confirmedIds });
  console.log(
    `${confirmedIds.length} reservations released after storage confirmation; ${rows.length - confirmedIds.length} retained.`,
  );
})().catch(() => {
  console.error("Cleanup failed; unconfirmed reservations remain charged.");
  process.exitCode = 1;
});
