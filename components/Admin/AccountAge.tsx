import { getMembershipDuration } from "@/lib/admin-membership";

export default function AccountAge({
  createdAt,
}: {
  createdAt?: string | null;
}) {
  const age = getMembershipDuration(createdAt);
  if (!age) return <span className="admin-muted">Date indisponible</span>;
  return (
    <span
      className="inline-block whitespace-nowrap"
      title={`${age.totalDays} jour${age.totalDays > 1 ? "s" : ""} depuis l’inscription`}
    >
      <span className="block text-sm font-medium text-white">{age.label}</span>
      <time dateTime={age.since} className="mt-1 block text-xs text-white/50">
        Depuis le{" "}
        {new Date(age.since).toLocaleDateString("fr-FR", {
          timeZone: "Europe/Paris",
        })}
      </time>
    </span>
  );
}
