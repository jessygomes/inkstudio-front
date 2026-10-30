import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, FileText, ShieldCheck, Scale } from "lucide-react";
import Header from "@/components/Shared/Header";
import Footer from "@/components/Shared/Footer/Footer";
import DashboardButton from "@/components/Shared/DashboardButton";
import s from "./LegalPage.module.css";

type LegalPageProps = {
  kind: "terms" | "notices" | "privacy";
  title: string;
  accent: string;
  description: string;
  sections: { id: string; title: string }[];
  children: ReactNode;
};
const documents = [
  { kind: "terms", href: "/cgu-cgv", label: "CGU & CGV", Icon: FileText },
  { kind: "notices", href: "/mentions-legales", label: "Mentions légales", Icon: Scale },
  { kind: "privacy", href: "/politique-de-confidentialite", label: "Confidentialité & cookies", Icon: ShieldCheck },
];

export default function LegalPage({ kind, title, accent, description, sections, children }: LegalPageProps) {
  return <div className={s.page}>
    <div className="fixed left-0 top-0 z-50 w-full"><Header /></div>
    <main id="document-top">
      <header className={s.hero}>
        <div className={s.wrap}>
          <Link href="/" className={s.breadcrumb}>INKERA Studio <span aria-hidden="true">/</span> Informations légales</Link>
          <span className={s.eyebrow}>Un cadre clair pour avancer ensemble</span>
          <h1>{title}<br /><span className={s.gradient}>{accent}</span></h1>
          <p>{description}</p>
          <div className={s.heroMeta}><span>{sections.length} rubriques</span><span aria-hidden="true">·</span><a href={`#${sections[0].id}`}>Consulter le document <ArrowDown size={14} aria-hidden="true" /></a></div>
        </div>
      </header>
      <div className={s.wrap}>
        <nav className={s.documents} aria-label="Documents légaux">{documents.map(({ kind: documentKind, href, label, Icon }) => <Link key={href} href={href} aria-current={kind === documentKind ? "page" : undefined} className={kind === documentKind ? s.currentDocument : undefined}><Icon size={17} aria-hidden="true" />{label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</nav>
        <div className={s.layout}>
          <aside className={s.sidebar}>
            <nav className={s.contents} aria-label="Sommaire du document"><span className={s.eyebrow}>Dans ce document</span><ol>{sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a></li>)}</ol><a className={s.backTop} href="#document-top">Retour en haut ↑</a></nav>
          </aside>
          <div className={s.document}>{children}</div>
        </div>
        <section className={s.contact} aria-label="Contact concernant les documents légaux"><div><span className={s.eyebrow}>Besoin d’un éclaircissement ?</span><h2>Continuons l’échange.</h2><p>Pour toute question sur ces informations, contactez l’équipe INKERA.</p></div><DashboardButton href="/contactez-nous" variant="secondary">Contacter l’équipe <ArrowUpRight size={16} /></DashboardButton></section>
      </div>
    </main>
    <Footer />
  </div>;
}
