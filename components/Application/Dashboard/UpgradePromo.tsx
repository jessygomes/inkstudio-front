import {
  BarChart3,
  CalendarCheck,
  ArrowRight,
  MessageCircle,
  PenTool,
  Sparkles,
  Users,
  Package,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type UpgradePromoProps = {
  isSalon: boolean;
};

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: CalendarCheck,
    title: "Rendez-vous",
    text: "Planning, confirmations et notifications automatiques",
  },
  {
    icon: PenTool,
    title: "Suivi de dessin",
    text: "Partagez les avancées et faites valider chaque étape par vos clients",
  },
  {
    icon: Users,
    title: "Clients",
    text: "Fiches, historique et suivi des séances",
  },
  {
    icon: MessageCircle,
    title: "Messagerie",
    text: "Toutes vos conversations clients au même endroit",
  },
  {
    icon: Package,
    title: "Stocks & produits",
    text: "Gardez le contrôle sur votre matériel",
  },
  {
    icon: BarChart3,
    title: "Statistiques",
    text: "Remplissage, revenus et annulations en un coup d'œil",
  },
];

export default function UpgradePromo({ isSalon }: UpgradePromoProps) {
  const planName = isSalon ? "BUSINESS" : "PRO";

  return (
    <section className="dashboard-panel relative overflow-hidden rounded-2xl border border-white/10 bg-noir-600 p-5 lg:p-6">

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-tertiary-400/30 bg-tertiary-400/10 px-3 py-1 font-one text-xs font-medium text-tertiary-400">
              <Sparkles size={13} />
              INKERA {planName}
            </span>
            <h2 className="font-two text-xl font-semibold text-white lg:text-2xl">
              Passez à la vitesse supérieure
            </h2>
            <p className="mt-2 font-one text-sm leading-6 text-white/65">
              {isSalon
                ? "Pilotez votre salon et vos tatoueurs avec tous les outils métier : organisation, suivi client, communication et performance."
                : "Débloquez les outils métier pour piloter votre activité au quotidien : organisation, suivi client, communication et performance."}
            </p>
          </div>

          <Link
            href="/parametres"
            className="dashboard-command dashboard-command-primary group self-start lg:self-auto"
          >
            Passer à {planName}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.025]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-one text-sm font-semibold text-white">
                  {title}
                </p>
                <p className="mt-0.5 font-one text-xs leading-5 text-white/55">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
