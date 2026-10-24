import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, LayoutDashboard, Newspaper, Palette, ShieldCheck, Shapes, UsersRound } from "lucide-react";
import DashboardStats from "@/components/Admin/DashboardStats";
import AdminPageHeader from "@/components/Admin/AdminPageHeader";

const shortcuts = [
  { href: "/admin/users", title: "Utilisateurs", description: "Comptes, ancienneté et informations de contact.", icon: UsersRound },
  { href: "/admin/verification", title: "Dossiers de vérification", description: "Consulter les pièces et traiter les demandes.", icon: ShieldCheck },
  { href: "/admin/styles", title: "Styles de tatouage", description: "Un catalogue cohérent pour les portfolios.", icon: Palette },
  { href: "/admin/categories", title: "Catégories", description: "Organiser les contenus et leur visibilité.", icon: Shapes },
  { href: "/admin/articles", title: "Articles", description: "Rédiger et gérer les publications Inkera.", icon: Newspaper },
  { href: "/admin/stats", title: "Statistiques", description: "Évolution des inscriptions et de l’activité.", icon: ChartNoAxesCombined },
];

export default function AdminPage() {
  return <div className="admin-page">
    <AdminPageHeader icon={<LayoutDashboard size={16} />} title="Vue d’ensemble" />
    <DashboardStats />
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-medium text-white font-two">Votre espace de gestion</h2><span className="admin-muted hidden sm:inline">Accès rapides</span></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shortcuts.map(({ href, title, description, icon: Icon }) => <Link href={href} key={href} className="admin-shortcut"><Icon size={22} strokeWidth={1.5} /><div className="min-w-0 flex-1"><strong>{title}</strong><p>{description}</p></div><ArrowUpRight size={16} /></Link>)}</div>
    </section>
  </div>;
}
