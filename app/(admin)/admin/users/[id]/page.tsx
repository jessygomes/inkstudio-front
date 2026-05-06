import { getSalonById } from "@/lib/queries/admin";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiChevronLeft,
  FiExternalLink,
  FiUsers,
} from "react-icons/fi";
import VerificationDocumentsSection from "@/components/Admin/VerificationDocumentsSection";
import PageHeader from "@/components/Shared/PageHeader";

// Page serveur : nécessite l'auth admin via le layout parent
export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getSalonById(id);

  if (!result.ok) {
    // Rediriger vers la liste si l'ID est invalide ou l'API renvoie une erreur
    redirect("/admin/users");
  }

  type HoursSlot = { start: string; end: string };
  type HoursMap = Partial<
    Record<
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday",
      HoursSlot | null
    >
  >;

  type VerificationDoc = {
    id?: string;
    type?: string;
    name?: string;
    fileUrl?: string;
    url?: string;
    status?: string;
    createdAt?: string;
  };

  type Tattooer = {
    id: string;
    name?: string;
    img?: string;
    description?: string;
    hours?: string | HoursMap;
    phone?: string;
    instagram?: string;
    skills?: string[];
    style?: string[];
    rdvBookingEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };

  type Salon = {
    id: string;
    salonName?: string;
    firstName?: string;
    lastName?: string;
    saasPlan?: string;
    verifiedSalon?: boolean;
    image?: string;
    email?: string;
    phone?: string;
    city?: string;
    postalCode?: string;
    createdAt?: string;
    updatedAt?: string;
    description?: string;
    salonHours?: string | HoursMap;
    Tatoueur?: Tattooer[];
    SalonVerificationDocument?: VerificationDoc[];
    documents?: VerificationDoc[];
    user?: Salon;
  };

  const raw = result as unknown as Record<string, unknown> & { ok: boolean };
  const entity = (raw.salon as Salon | undefined) ?? (raw as unknown as Salon); // l'API peut renvoyer {salon} ou l'objet directement
  const salon: Salon = (entity.user as Salon | undefined) ?? entity; // certains endpoints renvoient { user, ... }
  const verificationDocs: VerificationDoc[] =
    entity?.documents ??
    (entity as Salon)?.SalonVerificationDocument ??
    salon?.SalonVerificationDocument ??
    [];

  console.log("Salon details:", salon);

  if (!salon) {
    notFound();
  }

  const displayName =
    salon.salonName ||
    `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
    "Sans nom";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const parseHours = (hoursInput?: string | HoursMap): HoursMap => {
    try {
      if (!hoursInput) return {} as HoursMap;
      const obj =
        typeof hoursInput === "string"
          ? (JSON.parse(hoursInput) as HoursMap)
          : (hoursInput as HoursMap);
      return obj || ({} as HoursMap);
    } catch {
      return {} as HoursMap;
    }
  };

  const dayLabels: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  const renderHours = (hoursObj: HoursMap) => {
    type DayKey = keyof HoursMap;
    const order: DayKey[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return (
      <div className="divide-y divide-white/10 rounded-lg overflow-hidden border border-white/10 bg-white/5">
        {order.map((d: DayKey) => {
          const slot = (hoursObj || {})[d] as HoursSlot | null | undefined;
          return (
            <div
              key={d}
              className="flex items-center justify-between px-2.5 py-1.5"
            >
              <span className="text-white/80 text-xs font-one">
                {dayLabels[d]}
              </span>
              {slot && slot.start && slot.end ? (
                <span className="text-white text-xs font-one">
                  {slot.start} - {slot.end}
                </span>
              ) : (
                <span className="text-white/50 text-xs font-one">Fermé</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const tattooers: Tattooer[] =
    (entity as Salon)?.Tatoueur ?? salon?.Tatoueur ?? [];
  const salonHoursObj = parseHours(salon?.salonHours);

  return (
    <div className="wrapper-global pb-10">
      <section className="w-full space-y-3 pt-4">
        <PageHeader
          icon={<FiUsers size={20} className="text-tertiary-400" />}
          title="Fiche Utilisateur"
        >
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15 font-one"
          >
            <FiChevronLeft size={14} /> Retour
          </Link>
        </PageHeader>

        <div className="dashboard-embedded-panel p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-white/10 sm:h-20 sm:w-20">
                {salon.image ? (
                  <Image src={salon.image} alt={displayName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white/55 font-one">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-white font-one sm:text-lg">
                  {displayName}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] uppercase text-white/75 font-one">
                    {salon.saasPlan || "-"}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold font-one ${
                      salon.verifiedSalon
                        ? "border-tertiary-400/45 bg-tertiary-500/15 text-tertiary-300"
                        : "border-white/15 bg-white/8 text-white/65"
                    }`}
                  >
                    {salon.verifiedSalon ? "Verifie" : "Non verifie"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-[11px] text-white/70 font-one sm:text-right">
              <p>ID: <span className="font-mono text-white/60">{salon.id}</span></p>
              <p>Cree le {formatDate(salon.createdAt)}</p>
              <p>Mis a jour le {formatDate(salon.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="dashboard-embedded-panel p-3 sm:p-4 lg:col-span-2">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white font-one sm:text-base">
              <FiMail size={16} className="text-tertiary-400" />
              Informations De Contact
            </h2>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/80 font-one">
                <p className="mb-1 text-[10px] uppercase text-white/45">Email</p>
                <p className="flex items-center gap-2 text-white"><FiMail size={13} className="text-white/55" />{salon.email}</p>
              </div>

              {salon.phone && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/80 font-one">
                  <p className="mb-1 text-[10px] uppercase text-white/45">Telephone</p>
                  <p className="flex items-center gap-2 text-white"><FiPhone size={13} className="text-white/55" />{salon.phone}</p>
                </div>
              )}

              {(salon.city || salon.postalCode) && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/80 font-one md:col-span-2">
                  <p className="mb-1 text-[10px] uppercase text-white/45">Localisation</p>
                  <p className="flex items-center gap-2 text-white"><FiMapPin size={13} className="text-white/55" />{salon.postalCode && `${salon.postalCode} `}{salon.city}</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-embedded-panel p-3 sm:p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white font-one sm:text-base">
              Actions Rapides
            </h3>
            <div className="space-y-2">
              <button className="w-full rounded-xl border border-tertiary-400/35 bg-tertiary-500/15 px-3 py-1.5 text-xs text-white transition-colors hover:bg-tertiary-500/25 font-one">
                Marquer verifie
              </button>
              <button className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15 font-one">
                Contacter
              </button>
              <button className="w-full rounded-xl border border-red-500/35 bg-red-500/12 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/20 font-one">
                Suspendre
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="dashboard-embedded-panel p-3 sm:p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white font-one sm:text-base">
              <FiCalendar size={16} className="text-tertiary-400" />
              Horaires D&apos;ouverture
            </h2>
            {Object.keys(salonHoursObj).length > 0 ? (
              renderHours(salonHoursObj)
            ) : (
              <p className="text-xs text-white/60 font-one">Horaires non renseignes</p>
            )}
          </div>

          {salon.description && (
            <div className="dashboard-embedded-panel p-3 sm:p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white font-one sm:text-base">
                A Propos
              </h2>
              <p className="text-xs leading-relaxed text-white/80 font-one">{salon.description}</p>
            </div>
          )}
        </div>

        <div className="dashboard-embedded-panel p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-one sm:text-base">
              Equipe ({tattooers.length})
            </h2>
            {tattooers.length > 0 && (
              <span className="rounded-xl border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] text-white/75 font-one">
                {tattooers.length} tatoueur{tattooers.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {tattooers.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {tattooers.map((t: Tattooer) => {
                return (
                  <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2">
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10">
                        {t?.img ? (
                          <Image src={t.img} alt={t?.name || "Tatoueur"} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/50 font-one">
                            {(t?.name || "T").charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-white font-one">{t?.name || "Tatoueur"}</p>
                        {t?.description && (
                          <p className="line-clamp-2 text-[10px] text-white/60">{t.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="grid grid-cols-1 gap-1.5 text-[10px] font-one sm:grid-cols-2">
                        {t?.phone && (
                          <p className="flex items-center gap-1.5 text-white/80">
                            <FiPhone size={10} className="text-white/60" /> {t.phone}
                          </p>
                        )}
                        {t?.instagram && (
                          <p className="flex items-center gap-1.5 truncate text-white/80">
                            <FiExternalLink size={10} className="text-white/60" />
                            <a
                              href={t.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate hover:underline"
                              title={t.instagram}
                            >
                              {t.instagram}
                            </a>
                          </p>
                        )}
                      </div>

                      {t?.skills && t.skills.length > 0 && (
                        <div>
                          <p className="mb-0.5 text-[10px] text-white/60">Competences</p>
                          <div className="flex flex-wrap gap-1">
                            {t.skills.map((s, i) => (
                              <span
                                key={i}
                                className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/80"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {t?.style && t.style.length > 0 && (
                        <div>
                          <p className="mb-0.5 text-[10px] text-white/60">Styles</p>
                          <div className="flex flex-wrap gap-1">
                            {t.style.map((s, i) => (
                              <span
                                key={i}
                                className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/80"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(t?.createdAt || t?.updatedAt) && (
                        <div className="flex items-center gap-2 text-[9px] text-white/50">
                          {t?.createdAt && <span>Cree le {formatDate(t.createdAt)}</span>}
                          {t?.updatedAt && <span>• Mis a jour le {formatDate(t.updatedAt)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-white/60 font-one">Aucun tatoueur enregistre pour ce salon</p>
          )}
        </div>

        <VerificationDocumentsSection documents={verificationDocs} />
      </section>
    </div>
  );
}
