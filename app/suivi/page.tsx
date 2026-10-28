import { redirect } from "next/navigation";
import FollowUpResponse from "@/components/FollowUp/FollowUpResponse";

// Support the query-string links already sent by email.
export default async function FollowUpLinkPage({ searchParams }: { searchParams: Promise<{ f?: string | string[] }> }) {
  const { f } = await searchParams;
  if (typeof f === "string" && f.trim()) redirect(`/suivi/${encodeURIComponent(f.trim())}`);
  return <FollowUpResponse token="" />;
}
