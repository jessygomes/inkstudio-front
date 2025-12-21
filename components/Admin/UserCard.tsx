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

  const getPlanColor = (plan?: string) => {
    switch (plan?.toUpperCase()) {
      case "FREE":
        return "text-white/50";
      case "STARTER":
        return "text-primary-400";
      case "PREMIUM":
        return "text-tertiary-400";
      case "ENTERPRISE":
        return "text-cuatro-500";
      default:
        return "text-white/50";
    }
  };

  const displayName =
    type === "salon"
      ? user.salonName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "Sans nom"
      : `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Sans nom";

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-tertiary-400/50 hover:from-white/15 transition-all duration-300 p-5 shadow-lg">
      {/* Header with Image */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 font-bold font-one text-xl">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-one font-bold text-lg truncate">
              {displayName}
            </h3>
            {type === "salon" && user.verifiedSalon && (
              <LuShieldCheck
                className="text-tertiary-400 flex-shrink-0"
                size={20}
                title="Salon vérifié"
              />
            )}
          </div>

          {type === "salon" && (
            <div className="flex items-center gap-2 flex-wrap">
              {user.saasPlan && (
                <p
                  className={`text-xs font-one font-medium uppercase ${getPlanColor(
                    user.saasPlan
                  )}`}
                >
                  Plan {user.saasPlan}
                </p>
              )}
              <span
                className={`text-[11px] font-one font-semibold px-2 py-0.5 rounded-full border ${
                  user.verifiedSalon
                    ? "text-tertiary-300 border-tertiary-400/50 bg-tertiary-500/10"
                    : "text-white/50 border-white/20 bg-white/5"
                }`}
              >
                {user.verifiedSalon ? "Vérifié" : "Non vérifié"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <FiMail className="flex-shrink-0" size={14} />
          <span className="truncate font-one">{user.email}</span>
        </div>

        {user.phone && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <FiPhone className="flex-shrink-0" size={14} />
            <span className="font-one">{user.phone}</span>
          </div>
        )}

        {(user.city || user.postalCode) && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <FiMapPin className="flex-shrink-0" size={14} />
            <span className="font-one">
              {user.postalCode && `${user.postalCode} `}
              {user.city}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-1 text-white/50 text-xs">
          <FiCalendar size={12} />
          <span className="font-one">
            Inscrit le {formatDate(user.createdAt)}
          </span>
        </div>

        {type === "salon" ? (
          <Link
            href={`/admin/users/${user.id}`}
            className="px-3 py-1 bg-tertiary-500/20 hover:bg-tertiary-500/30 border border-tertiary-400/30 hover:border-tertiary-400/50 text-tertiary-400 rounded-lg transition-all duration-300 text-xs font-one font-medium"
          >
            Détails
          </Link>
        ) : (
          <button
            onClick={() => onDetails?.(user)}
            className="px-3 py-1 bg-tertiary-500/20 hover:bg-tertiary-500/30 border border-tertiary-400/30 hover:border-tertiary-400/50 text-tertiary-400 rounded-lg transition-all duration-300 text-xs font-one font-medium"
          >
            Détails
          </button>
        )}
      </div>
    </div>
  );
}
