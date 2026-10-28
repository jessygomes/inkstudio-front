import FollowUpResponse from "@/components/FollowUp/FollowUpResponse";

export default async function FollowUpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <FollowUpResponse key={token} token={token} />;
}
