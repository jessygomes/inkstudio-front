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
  FiClock,
  FiExternalLink,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import VerificationDocumentsSection from "@/components/Admin/VerificationDocumentsSection";
import DeleteUser from "@/components/Admin/DeleteUser";
import ContactUser from "@/components/Admin/ContactUser";
import PageHeader from "@/components/Shared/PageHeader";

// Page serveur : nécessite l'auth admin via le layout parent
export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getSalonById(id);

  console.log(result);

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

  type ClientProfile = {
    pseudo?: string;
    birthDate?: string;
    city?: string;
    postalCode?: string;
  };

  type Salon = {
    id: string;
    role?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    salonName?: string;
    salonHours?: string | HoursMap;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    profileImage?: string;
    image?: string;
    description?: string;
    verifiedSalon?: boolean;
    saasPlan?: string;
    createdAt?: string;
    updatedAt?: string;
    Tatoueur?: Tattooer[];
    clientProfile?: ClientProfile;
    SalonVerificationDocument?: VerificationDoc[];
    documents?: VerificationDoc[];
    user?: Salon;
  };

  const raw = result as unknown as Record<string, unknown> & { ok: boolean };
  const entity = (raw.salon as Salon | undefined) ?? (raw as unknown as Salon); // l'API peut renvoyer {salon} ou l'objet directement
  const salon: Salon = (entity.user as Salon | undefined) ?? entity; // certains endpoints renvoient { user, ... }
  const entityRecord = entity as unknown as Record<string, unknown>;
  const hasNestedUser = Boolean(entityRecord?.user);
  const clientIdForContact =
    hasNestedUser && typeof entityRecord?.id === "string" && entityRecord.id !== salon.id
      ? entityRecord.id
      : undefined;
  const verificationDocs: VerificationDoc[] =
    entity?.documents ??
    (entity as Salon)?.SalonVerificationDocument ??
    salon?.SalonVerificationDocument ??
    [];

  if (!salon) {
    notFound();
  }

  const displayName =
    salon.salonName ||
    `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
    "Sans nom";

  const roleLabel =
    salon.role === "user_tatoueur" ? "Compte tatoueur" : "Compte salon";

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
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {order.map((d: DayKey) => {
          const slot = (hoursObj || {})[d] as HoursSlot | null | undefined;
          const start = slot?.start;
          const end = slot?.end;
          const isOpen = Boolean(start && end);
          return (
            <div
              key={d}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"
            >
              <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">
                {dayLabels[d]}
              </p>
              {isOpen ? (
                <p className="mt-1 text-xs text-white font-one">
                  {start} - {end}
                </p>
              ) : (
                <p className="mt-1 text-xs text-white/55 font-one">Fermé</p>
              )}
              <div className="mt-1 flex items-center gap-1 text-[10px] font-one">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOpen ? "bg-tertiary-400" : "bg-white/35"
                  }`}
                />
                <span className={isOpen ? "text-tertiary-300" : "text-white/45"}>
                  {isOpen ? "Ouvert" : "Fermé"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const tattooers: Tattooer[] =
    (entity as Salon)?.Tatoueur ?? salon?.Tatoueur ?? [];
  const salonHoursObj = parseHours(salon?.salonHours);

  const approvedDocsCount = verificationDocs.filter((doc) => {
    const status = (doc?.status || "").toLowerCase();
    return (
      status === "approved" ||
      status === "approuve" ||
      status === "validé" ||
      status === "valide"
    );
  }).length;
  const pendingDocsCount = verificationDocs.length - approvedDocsCount;
  const completionRate =
    verificationDocs.length > 0
      ? Math.round((approvedDocsCount / verificationDocs.length) * 100)
      : 0;

  return (
    <div className="wrapper-global pb-10">
      <section className="w-full space-y-4 pt-4">
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

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
          <div className="relative h-44 sm:h-56 lg:h-64">
            {salon.image ? (
              <Image
                src={salon.image}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-noir-700 via-black/40 to-black/10" />
          </div>

          <div className="relative px-4 pb-4 pt-0 sm:px-5 sm:pb-5 lg:px-6">
            <div className="-mt-11 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative mx-auto h-[100px] w-[100px] overflow-hidden rounded-[26px] border border-white/20 bg-black/35 shadow-2xl sm:mx-0 sm:h-[116px] sm:w-[116px]">
                  {salon.profileImage ? (
                    <Image
                      src={salon.profileImage}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-white/12 to-white/4 text-3xl font-one text-white/90">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="truncate text-xl font-semibold text-white font-one sm:text-2xl">
                      {displayName}
                    </h1>
                    {salon.verifiedSalon && (
                      <span className="inline-flex items-center rounded-full border border-tertiary-400/35 bg-tertiary-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-tertiary-300 font-one">
                        Vérifié
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 font-one">
                      {roleLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] text-white/75 font-one">
                      Plan {salon.saasPlan || "-"}
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold font-one ${salon.verifiedSalon ? "border-tertiary-400/45 bg-tertiary-500/15 text-tertiary-500" : "border-white/15 bg-white/8 text-white/65"}`}>
                      {salon.verifiedSalon ? "Vérifié" : "Non vérifié"}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] text-white/70 font-one">
                      Créé le {formatDate(salon.createdAt)}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] text-white/70 font-one">
                      Mis à jour le {formatDate(salon.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto xl:justify-end">
                <ContactUser
                  userId={salon.id}
                  clientId={clientIdForContact}
                  userEmail={salon.email}
                  userLabel={displayName}
                />
                <button className="cursor-pointer whitespace-nowrap rounded-2xl border border-tertiary-400/35 bg-tertiary-500/15 px-3 py-1.5 text-xs text-white transition-colors hover:bg-tertiary-500/25 font-one">
                  Marquer vérifié
                </button>
                <button className="cursor-pointer whitespace-nowrap rounded-2xl border border-red-500/35 bg-red-500/12 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/20 font-one">
                  Suspendre
                </button>
                <DeleteUser userId={salon.id} userLabel={displayName} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <div className="space-y-4">
            {salon.description && (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 sm:p-5">
                <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                  Description
                </p>
                <p className="text-xs leading-relaxed text-white/82 font-two whitespace-pre-line">
                  {salon.description}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 sm:p-5">
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                  Contact principal
                </p>
                <div className="space-y-2 text-xs text-white/80 font-one">
                  {(salon.firstName || salon.lastName) && (
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                      <span className="text-white/55 text-[10px] uppercase tracking-wide w-16 shrink-0 font-one">Nom</span>
                      <span className="truncate">{salon.firstName} {salon.lastName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                    <FiMail size={13} className="text-white/55 shrink-0" />
                    <span className="truncate">{salon.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                    <FiPhone size={13} className="text-white/55 shrink-0" />
                    <span>{salon.phone || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 sm:p-5">
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                  Localisation
                </p>
                <div className="space-y-2 text-xs text-white/80 font-one">
                  {salon.address && (
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                      <FiMapPin size={13} className="text-white/55 shrink-0" />
                      <span className="truncate">{salon.address},</span>
                      <span>{salon.postalCode && `${salon.postalCode} `}{salon.city || "-"}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                    <FiCalendar size={13} className="text-white/55 shrink-0" />
                    <span>Client depuis {formatDate(salon.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 sm:p-5 md:col-span-2">
                <h2 className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                  <FiClock size={14} className="text-tertiary-400" />
                  Horaires d&apos;ouverture
                </h2>
                {Object.keys(salonHoursObj).length > 0 ? (
                  renderHours(salonHoursObj)
                ) : (
                  <p className="text-xs text-white/60 font-one">
                    Horaires non renseignés
                  </p>
                )}
              </div>
            </div>

            {tattooers.length > 0 && (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                    Équipe
                  </p>
                  <span className="rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] text-white/70 font-one">
                    {tattooers.length} tatoueur{tattooers.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                  {tattooers.map((t: Tattooer) => (
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
                            {t?.createdAt && <span>Créé le {formatDate(t.createdAt)}</span>}
                            {t?.updatedAt && <span>• Mis à jour le {formatDate(t.updatedAt)}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                  Documents de vérification
                </p>
                {verificationDocs.length > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-white/55 font-one">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                      {approvedDocsCount} validés
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                      {pendingDocsCount} en attente
                    </span>
                  </div>
                )}
              </div>
              <VerificationDocumentsSection documents={verificationDocs} />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4 sm:p-5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
              Résumé admin
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase text-white/45 font-one">Rôle</p>
                <p className="mt-0.5 text-sm text-white font-one">{roleLabel}</p>
                <p className="mt-1 text-[10px] text-white/55 font-one">
                  {salon.role || "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase text-white/45 font-one">Plan</p>
                <p className="mt-0.5 text-sm text-white font-one">{salon.saasPlan || "-"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase text-white/45 font-one">Documents</p>
                <p className="mt-0.5 text-sm text-white font-one">{verificationDocs.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase text-white/45 font-one">Complétion</p>
                <p className="mt-0.5 text-sm text-white font-one">{completionRate}%</p>
              </div>
              <div className="rounded-2xl border border-tertiary-400/25 bg-tertiary-500/10 px-3 py-2.5">
                <p className="text-[10px] uppercase text-tertiary-500/80 font-one">Validés</p>
                <p className="mt-0.5 text-sm text-tertiary-500 font-one">{approvedDocsCount}</p>
              </div>
              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5">
                <p className="text-[10px] uppercase text-amber-300/80 font-one">En attente</p>
                <p className="mt-0.5 text-sm text-amber-300 font-one">{pendingDocsCount}</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/70 font-one">
                <FiShield size={12} className="text-tertiary-300" />
                Progression de validation
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tertiary-400 to-tertiary-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/65 font-one">
                {completionRate}% des documents validés
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-one">
                Informations techniques
              </p>
              <div className="mt-2 space-y-1 text-xs text-white/70 font-one">
                <p className="truncate">
                  ID: <span className="font-mono text-white/60">{salon.id}</span>
                </p>
                <p>Créé le {formatDate(salon.createdAt)}</p>
                <p>Mis à jour le {formatDate(salon.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
