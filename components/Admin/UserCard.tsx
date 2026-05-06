"use client";

import { FiMail, FiPhone, FiMapPin, FiCalendar } from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  salonName?: string | null;
  phone: string | null;
  city: string | null;
  postalCode: string | null;
  image: string | null;
  description: string | null;
  verifiedSalon?: boolean;
  saasPlan?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserCardProps {
  user: User;
  type: "salon" | "client";
  onDetails?: (user: User) => void;
}

export default function UserCard({ user, type, onDetails }: UserCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPlanBadgeClasses = (plan?: string) => {
    switch (plan?.toUpperCase()) {
      case "FREE":
        return "border-white/15 bg-white/8 text-white/75";
      case "PRO":
      case "STARTER":
        return "border-primary-400/35 bg-primary-500/15 text-primary-400";
      case "BUSINESS":
      case "PREMIUM":
        return "border-tertiary-400/35 bg-tertiary-500/15 text-tertiary-400";
      case "ENTERPRISE":
        return "border-cuatro-500/35 bg-cuatro-500/15 text-cuatro-500";
      default:
        return "border-white/15 bg-white/8 text-white/75";
    }
  };

  const displayName =
    type === "salon"
      ? user.salonName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "Sans nom"
      : `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Sans nom";

  return (
    <article className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/6 to-transparent p-4 shadow-lg transition-all duration-300 hover:border-tertiary-400/35 hover:shadow-xl">
      <div className="mb-3 flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white/55 font-one">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white font-one">
              {displayName}
            </h3>
            {type === "salon" && user.verifiedSalon && (
              <LuShieldCheck
                className="mt-0.5 flex-shrink-0 text-tertiary-400"
                size={16}
                title="Salon vérifié"
              />
            )}
          </div>

          <p className="mt-0.5 truncate text-[11px] text-white/55 font-one">
            {type === "salon" ? "Compte salon" : "Compte client"}
          </p>

          {type === "salon" && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {user.saasPlan && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase font-one ${getPlanBadgeClasses(
                    user.saasPlan,
                  )}`}
                >
                  {user.saasPlan}
                </span>
              )}
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-one ${
                  user.verifiedSalon
                    ? "text-tertiary-400 border-tertiary-400/50 bg-tertiary-500/10"
                    : "text-white/50 border-white/20 bg-white/5"
                }`}
              >
                {user.verifiedSalon ? "Vérifié" : "Non vérifié"}
              </span>
            </div>
          )}
        </div>
      </div>

      {user.description && type === "salon" && (
        <p className="mb-3 line-clamp-1 rounded-2xl text-[11px] text-white/65 font-one">
          {user.description}
        </p>
      )}

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-2.5 py-2 text-[12px] text-white/75">
          <FiMail className="flex-shrink-0 text-white/45" size={13} />
          <span className="truncate font-one">{user.email}</span>
        </div>

        {user.phone && (
          <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-2.5 py-2 text-[12px] text-white/75">
            <FiPhone className="flex-shrink-0 text-white/45" size={13} />
            <span className="font-one">{user.phone}</span>
          </div>
        )}

        {(user.city || user.postalCode) && (
          <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-2.5 py-2 text-[12px] text-white/75">
            <FiMapPin className="flex-shrink-0 text-white/45" size={13} />
            <span className="font-one">
              {user.postalCode && `${user.postalCode} `}
              {user.city}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-1 text-[10px] text-white/45 font-one">
          <FiCalendar size={11} />
          <span className="font-one">
            Inscrit le {formatDate(user.createdAt)}
          </span>
        </div>

        {type === "salon" ? (
          <Link
            href={`/admin/users/${user.id}`}
            className="rounded-2xl border border-tertiary-400/35 bg-tertiary-500/15 px-3 py-1 text-[11px] font-medium text-tertiary-400 transition-colors duration-300 hover:bg-tertiary-500/25 font-one"
          >
            Détails
          </Link>
        ) : (
          <button
            onClick={() => onDetails?.(user)}
            className="rounded-2xl border border-tertiary-400/35 bg-tertiary-500/15 px-3 py-1 text-[11px] font-medium text-tertiary-400 transition-colors duration-300 hover:bg-tertiary-500/25 font-one"
          >
            Détails
          </button>
        )}
      </div>
    </article>
  );
}
