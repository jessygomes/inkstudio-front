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
} from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import VerificationDocumentsSection from "@/components/Admin/VerificationDocumentsSection";

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
    <div className="bg-noir-700 min-h-screen px-3 lg:px-20 py-6 flex flex-col gap-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-noir-700/90 via-noir-600/70 to-noir-500/60" />
        <div className="relative p-4 md:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-white/10 ring-2 ring-tertiary-400/40">
              {salon.image ? (
                <Image
                  src={salon.image}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 font-bold font-one text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-white/60 font-one uppercase tracking-wide">
                Salon
              </p>
              <h1 className="text-xl md:text-2xl font-extrabold font-one bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-white/80 mt-0.5">
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 font-one uppercase text-[10px] tracking-wide">
                  {salon.saasPlan || "-"}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-md border text-[10px] font-one tracking-wide ${
                    salon.verifiedSalon
                      ? "text-tertiary-300 border-tertiary-400/50 bg-tertiary-500/10"
                      : "text-white/50 border-white/20 bg-white/5"
                  }`}
                >
                  {salon.verifiedSalon ? (
                    <span className="inline-flex items-center gap-1">
                      <LuShieldCheck size={14} /> Vérifié
                    </span>
                  ) : (
                    "Non vérifié"
                  )}
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 font-one text-xs transition-colors"
          >
            <FiChevronLeft size={14} /> Retour
          </Link>
        </div>
      </div>

      {/* Top section: Profile Info + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile info */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg">
            <h2 className="text-base font-one font-bold text-white mb-3 flex items-center gap-2">
              <FiMail size={16} className="text-tertiary-400" />
              Informations de contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80 font-one">
              <div className="space-y-2">
                <div>
                  <p className="text-white/50 text-xs mb-1 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="flex items-center gap-2 text-white">
                    <FiMail size={14} className="text-white/60" /> {salon.email}
                  </p>
                </div>
                {salon.phone && (
                  <div>
                    <p className="text-white/50 text-xs mb-1 uppercase tracking-wide">
                      Téléphone
                    </p>
                    <p className="flex items-center gap-2 text-white">
                      <FiPhone size={14} className="text-white/60" />{" "}
                      {salon.phone}
                    </p>
                  </div>
                )}
                {(salon.city || salon.postalCode) && (
                  <div>
                    <p className="text-white/50 text-xs mb-1 uppercase tracking-wide">
                      Localisation
                    </p>
                    <p className="flex items-center gap-2 text-white">
                      <FiMapPin size={14} className="text-white/60" />
                      <span>
                        {salon.postalCode && `${salon.postalCode} `}
                        {salon.city}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-white/50 text-[10px] mb-0.5 uppercase tracking-wide">
                    Créé le
                  </p>
                  <p className="flex items-center gap-2 text-white text-xs">
                    <FiCalendar size={12} className="text-white/60" />
                    {formatDate(salon.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] mb-0.5 uppercase tracking-wide">
                    Dernière mise à jour
                  </p>
                  <p className="flex items-center gap-2 text-white text-xs">
                    <FiCalendar size={12} className="text-white/60" />
                    {formatDate(salon.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] mb-0.5 uppercase tracking-wide">
                    Identifiant
                  </p>
                  <p className="text-white/70 text-[10px] font-mono">
                    {salon.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg">
            <h3 className="text-sm font-one font-bold text-white mb-3">
              Actions rapides
            </h3>
            <div className="space-y-1.5 text-sm">
              <button className="w-full px-3 py-1.5 rounded-lg bg-tertiary-500/20 hover:bg-tertiary-500/30 border border-tertiary-400/30 hover:border-tertiary-400/50 text-white font-one text-xs transition-colors">
                ✓ Marquer vérifié
              </button>
              <button className="w-full px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-one text-xs transition-colors">
                ✉ Contacter
              </button>
              <button className="w-full px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 font-one text-xs transition-colors">
                ⚠ Suspendre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle section: Hours & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Horaires du salon */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg">
          <h2 className="text-base font-one font-bold text-white mb-3 flex items-center gap-2">
            <FiCalendar size={16} className="text-tertiary-400" />
            Horaires d&apos;ouverture
          </h2>
          {Object.keys(salonHoursObj).length > 0 ? (
            renderHours(salonHoursObj)
          ) : (
            <p className="text-white/60 text-sm font-one">
              Horaires non renseignés
            </p>
          )}
        </div>

        {/* Description */}
        {salon.description && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg">
            <h2 className="text-base font-one font-bold text-white mb-2">
              À propos
            </h2>
            <p className="text-white/80 text-xs font-one leading-relaxed">
              {salon.description}
            </p>
          </div>
        )}
      </div>

      {/* Tattooers section - full width */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-one font-bold text-white flex items-center gap-2">
            👤 Équipe ({tattooers.length})
          </h2>
          {tattooers.length > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15 text-white/80 text-[10px] font-one">
              {tattooers.length} tatoueur{tattooers.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {tattooers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tattooers.map((t: Tattooer) => {
              return (
                <div
                  key={t.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/15 flex-shrink-0">
                      {t?.img ? (
                        <Image
                          src={t.img}
                          alt={t?.name || "Tatoueur"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50 font-one">
                          {(t?.name || "T").charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-one text-xs truncate">
                        {t?.name || "Tatoueur"}
                      </p>
                      {t?.description && (
                        <p className="text-white/60 text-[10px] line-clamp-2">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-one">
                      {t?.phone && (
                        <p className="flex items-center gap-1.5 text-white/80">
                          <FiPhone size={10} className="text-white/60" />{" "}
                          {t.phone}
                        </p>
                      )}
                      {t?.instagram && (
                        <p className="flex items-center gap-1.5 text-white/80 truncate">
                          <FiExternalLink size={10} className="text-white/60" />
                          <a
                            href={t.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate"
                            title={t.instagram}
                          >
                            {t.instagram}
                          </a>
                        </p>
                      )}
                    </div>

                    {t?.skills && t.skills.length > 0 && (
                      <div>
                        <p className="text-white/60 text-[10px] mb-0.5">
                          Compétences
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {t.skills.map((s, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80 text-[9px] uppercase tracking-wide"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {t?.style && t.style.length > 0 && (
                      <div>
                        <p className="text-white/60 text-[10px] mb-0.5">
                          Styles
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {t.style.map((s, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80 text-[9px] uppercase tracking-wide"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(t?.createdAt || t?.updatedAt) && (
                      <div className="flex items-center gap-2 text-[9px] text-white/50">
                        {t?.createdAt && (
                          <span>Créé le {formatDate(t.createdAt)}</span>
                        )}
                        {t?.updatedAt && (
                          <span>• Mis à jour le {formatDate(t.updatedAt)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white/60 text-sm font-one">
            Aucun tatoueur enregistré pour ce salon
          </p>
        )}
      </div>

      {/* Verification Documents - full width */}
      <VerificationDocumentsSection documents={verificationDocs} />
    </div>
  );
}
