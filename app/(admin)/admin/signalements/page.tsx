import Link from "next/link";
import { getAuthHeaders } from "@/lib/session";

type Report = {
  id: string;
  reason: string;
  createdAt: string;
  client: { id: string; email: string };
  professional: { id: string; salonName?: string; email: string };
  proposal?: { message: string; moodboard: { name: string } };
};
export default async function ProjectReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/admin/project-reports?page=${page}`,
    { headers: await getAuthHeaders(), cache: "no-store" },
  );
  if (!response.ok)
    return <p role="alert">Impossible de charger les signalements.</p>;
  const result: {
    data: Report[];
    total: number;
    page: number;
    totalPages: number;
  } = await response.json();
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">Signalements des projets</h1>
      <p>{result.total} signalement(s)</p>
      {result.data.map((report) => (
        <article
          key={report.id}
          className="space-y-3 rounded-xl border border-white/15 p-4"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <Link
              className="underline"
              href={`/admin/users/${report.professional.id}`}
            >
              {report.professional.salonName || report.professional.email}
            </Link>
            <time>
              {new Date(report.createdAt).toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
              })}
            </time>
          </div>
          <p>
            Signalé par{" "}
            <Link
              className="underline"
              href={`/admin/users/${report.client.id}`}
            >
              {report.client.email}
            </Link>
          </p>
          <p className="whitespace-pre-wrap">{report.reason}</p>
          {report.proposal && (
            <details>
              <summary className="cursor-pointer">
                Demande liée · {report.proposal.moodboard.name}
              </summary>
              <p className="mt-2 whitespace-pre-wrap">
                {report.proposal.message}
              </p>
            </details>
          )}
        </article>
      ))}
      {result.totalPages > 1 && (
        <nav aria-label="Pages des signalements" className="flex gap-4">
          {page > 1 && <Link href={`?page=${page - 1}`}>Précédent</Link>}
          <span>
            {page} / {result.totalPages}
          </span>
          {page < result.totalPages && (
            <Link href={`?page=${page + 1}`}>Suivant</Link>
          )}
        </nav>
      )}
    </section>
  );
}
