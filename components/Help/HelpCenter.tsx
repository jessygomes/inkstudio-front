"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BookOpen, Boxes, CalendarDays, Check, ChevronDown, Compass, FileText, Gem, HelpCircle, ImageIcon, LayoutDashboard, Lightbulb, List, MapPin, MessageSquare, Package, Palette, Search, Settings2, ShieldCheck, Sparkles, Star, Users, Wallet, X, type LucideIcon } from "lucide-react";
import { helpSections, searchHelpSections } from "@/lib/help-guide";
import styles from "./HelpCenter.module.css";

const icons: Record<string, LucideIcon> = {
  demarrer: BookOpen, dashboard: LayoutDashboard, profil: Users, "reglages-rdv": CalendarDays, horaires: CalendarDays,
  agenda: CalendarDays, demandes: CalendarDays, clients: Users, consentements: ShieldCheck,
  cicatrisation: Check, dessins: Palette, stocks: Boxes, consommables: Package,
  produits: Package, portfolio: ImageIcon, flashs: Sparkles, piercing: Gem, avis: Star,
  factures: FileText, messagerie: MessageSquare, explorer: Compass, equipe: Users,
  "salons-lies": MapPin, autorisations: ShieldCheck, parametres: Settings2,
  abonnement: Wallet, depannage: HelpCircle,
};
const groups = [...new Set(helpSections.map(section => section.group))];
const articleCount = helpSections.reduce((total, section) => total + section.articles.length, 0);
const quickStarts = [
  { section: "profil", article: "modifier", title: "Préparer mon profil", detail: "Coordonnées, prestations et visibilité", Icon: Users },
  { section: "agenda", article: "creer", title: "Créer un rendez-vous", detail: "Du client au choix du créneau", Icon: CalendarDays },
  { section: "salons-lies", article: "rejoindre", title: "Relier un salon ou un artiste", detail: "Demandes, présences et autorisations", Icon: MapPin },
  { section: "explorer", article: "concept", title: "Comprendre Explorer", detail: "Du projet client à la proposition", Icon: Compass },
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("demarrer");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["demarrer--parcours"]));
  const contentRef = useRef<HTMLDivElement>(null);
  const searching = Boolean(query.trim());
  const results = useMemo(() => searchHelpSections(query), [query]);
  const displayed = searching ? results : activeSection === "all" ? helpSections : helpSections.filter(section => section.id === activeSection);
  const visibleIds = displayed.flatMap(section => section.articles.map(article => `${section.id}--${article.id}`));
  const allExpanded = visibleIds.length > 0 && visibleIds.every(id => expanded.has(id));
  const resultCount = results.reduce((total, section) => total + section.articles.length, 0);

  function chooseSection(id: string, article?: string) {
    setActiveSection(id);
    setQuery("");
    if (article) setExpanded(current => new Set(current).add(`${id}--${article}`));
    contentRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }

  function toggle(id: string) {
    setExpanded(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return <main className={styles.page}>
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroTop}><span className={styles.eyebrow}><BookOpen size={13} aria-hidden="true" />Le guide Inkera Studio</span><span className={styles.guideCount}>{helpSections.length} rubriques · {articleCount} fiches pratiques</span></div>
        <h1>Comment pouvons-nous vous aider ?</h1>
        <p className={styles.heroDescription}>Prenez vos repères, découvrez chaque outil et retrouvez les étapes pour avancer simplement dans votre activité.</p>
        <div className={styles.search}>
          <Search size={19} aria-hidden="true" />
          <label htmlFor="help-search" className="sr-only">Rechercher dans tout le guide d’utilisation</label>
          <input id="help-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Essayez « créer un RDV », « stock », « relier un salon »…" autoComplete="off" aria-controls="help-content" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche"><X size={16} /></button>}
        </div>
        <p className={styles.availability}><ShieldCheck size={13} aria-hidden="true" />Le guide est accessible à tous les comptes. Certaines fonctions dépendent de votre offre et de vos autorisations.</p>
      </header>

      {!searching && <section className={styles.quickStarts} aria-label="Parcours rapides">
        {quickStarts.map(({ section, article, title, detail, Icon }) => <button type="button" key={section} onClick={() => chooseSection(section, article)}>
          <span className={styles.quickIcon}><Icon size={17} aria-hidden="true" /></span><span><strong>{title}</strong><small>{detail}</small></span><ArrowDown size={14} aria-hidden="true" />
        </button>)}
      </section>}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav aria-label="Rubriques du guide">
            <div className={styles.navHeading}><span>Tout comprendre</span><BookOpen size={13} aria-hidden="true" /></div>
            <button type="button" onClick={() => chooseSection("all")} className={styles.navItem} aria-current={!searching && activeSection === "all" ? "page" : undefined}><List size={15} aria-hidden="true" /><span>Tout le guide</span><small>{articleCount}</small></button>
            {groups.map(group => <div key={group} className={styles.navGroup}>
              <p>{group}</p>
              {helpSections.filter(section => section.group === group).map(section => {
                const Icon = icons[section.id] || BookOpen;
                return <button type="button" key={section.id} onClick={() => chooseSection(section.id)} className={styles.navItem} aria-current={!searching && activeSection === section.id ? "page" : undefined}>
                  <Icon size={15} aria-hidden="true" /><span>{section.title}</span><small>{section.articles.length}</small>
                </button>;
              })}
            </div>)}
          </nav>
        </aside>

        <div id="help-content" ref={contentRef} className={styles.content}>
          <div className={styles.contentToolbar}>
            <p role="status" aria-live="polite">{searching ? `${resultCount} fiche${resultCount > 1 ? "s" : ""} pour « ${query.trim()} »` : activeSection === "all" ? "Toutes les rubriques du guide" : "Les réponses, étape par étape"}</p>
            {visibleIds.length > 0 && <button type="button" onClick={() => setExpanded(current => {
              const next = new Set(current);
              visibleIds.forEach(id => { if (allExpanded) next.delete(id); else next.add(id); });
              return next;
            })}>{allExpanded ? "Tout refermer" : "Tout déplier"}<ChevronDown size={13} aria-hidden="true" /></button>}
          </div>

          {displayed.length === 0 ? <div className={styles.empty}>
            <Search size={28} aria-hidden="true" /><h2>Aucune fiche ne correspond à votre recherche</h2><p>Essayez un mot plus simple, comme « rendez-vous », « client », « stock » ou « salon ».</p><button type="button" onClick={() => setQuery("")}>Revenir aux rubriques</button>
          </div> : displayed.map(section => {
            const Icon = icons[section.id] || BookOpen;
            return <section key={section.id} className={styles.section} aria-labelledby={`help-section-${section.id}`}>
              <header className={styles.sectionHeader}>
                <span className={styles.sectionIcon}><Icon size={21} aria-hidden="true" /></span>
                <div><p className={styles.eyebrow}>{section.group}</p><h2 id={`help-section-${section.id}`}>{section.title}</h2><p>{section.description}</p></div>
              </header>
              <div className={styles.articles}>
                {section.articles.map((article, index) => {
                  const id = `${section.id}--${article.id}`;
                  return <details key={id} id={id} open={expanded.has(id)} className={styles.article}>
                    <summary onClick={event => { event.preventDefault(); toggle(id); }}><span className={styles.articleNumber}>{String(index + 1).padStart(2, "0")}</span><h3>{article.title}</h3><ChevronDown size={16} aria-hidden="true" /></summary>
                    <div className={styles.articleBody}>
                      {article.body.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                      {article.steps && <ol className={styles.steps}>{article.steps.map((step, stepIndex) => <li key={stepIndex}><span aria-hidden="true">{stepIndex + 1}</span><p>{step}</p></li>)}</ol>}
                      {article.tip && <div className={styles.tip}><Lightbulb size={16} aria-hidden="true" /><p>{article.tip}</p></div>}
                    </div>
                  </details>;
                })}
              </div>
              {section.id !== "depannage" && <Link href={section.href} className={styles.sectionLink}>Ouvrir {section.title === "Bien démarrer" ? "mon profil" : section.title.toLocaleLowerCase("fr-FR")}<ArrowUpRight size={14} aria-hidden="true" /></Link>}
            </section>;
          })}

          {!searching && activeSection !== "depannage" && <div className={styles.bottomHelp}><HelpCircle size={19} aria-hidden="true" /><div><strong>Vous ne retrouvez pas ce que vous cherchez ?</strong><p>Consultez les questions fréquentes ou recherchez un mot dans tout le guide.</p></div><button type="button" onClick={() => chooseSection("depannage")}>Questions fréquentes<ArrowUpRight size={14} aria-hidden="true" /></button></div>}
        </div>
      </div>
    </div>
  </main>;
}
