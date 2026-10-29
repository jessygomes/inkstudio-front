import { deleteOwnedUploads } from "@/lib/upload-security";

export async function POST(request: Request) {
  return deleteOwnedUploads(request, false);
}
