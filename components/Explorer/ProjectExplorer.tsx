"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Compass,
  ImageIcon,
  Info,
  MessageSquare,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
import styles from "./ProjectExplorer.module.css";
import ProjectDetails from "./ProjectDetails";
import {
  ExploredProject,
  ExploreResult,
  exploreProjects,
  proposeProject,
  getProjectFilterOptions,
} from "@/lib/queries/projects";

const filterField =
  "h-10 w-full min-w-0 rounded-xl border border-white/10 bg-black/15 px-3 text-xs text-white placeholder:text-white/40 transition-colors hover:border-white/20 focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20 [color-scheme:dark]";
const sizes: Record<string, string> = {
  SMALL: "Petite",
  MEDIUM: "Moyenne",
  LARGE: "Grande",
};
const proposalStates: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
  ACCEPTED: { label: "Acceptée", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  REFUSED: { label: "Refusée", className: "border-red-400/20 bg-red-400/10 text-red-300" },
};
function ProposalBadge({ status }: { status: string }) {
  const state = proposalStates[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] ${state?.className || "border-white/10 text-white/50"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{state?.label || status}</span>;
}
export default function ProjectExplorer() {
  const [tab, setTab] = useState<"explore" | "proposals">("explore");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [conceptOpen, setConceptOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({ page: "1" });
  const [result, setResult] = useState<ExploreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ExploredProject | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [options, setOptions] = useState<{
    styles: string[];
    categories: string[];
  }>({ styles: [], categories: [] });
  useEffect(() => {
    void getProjectFilterOptions()
      .then(setOptions)
      .catch(() => {});
  }, []);
  const sequence = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => !["page", "scope", "proposalStatus"].includes(key) && value,
  ).length;
  const load = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true);
    setError("");
    try {
      const data = await exploreProjects({ ...filters, scope: tab });
      if (request === sequence.current) setResult(data);
    } catch (error) {
      if (request === sequence.current)
        setError(
          error instanceof Error ? error.message : "Chargement impossible.",
        );
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, [filters, tab]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (selected) dialogRef.current?.showModal();
    else dialogRef.current?.close();
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);
  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({
      ...Object.fromEntries(
        [...new FormData(event.currentTarget)].map(([key, value]) => [
          key,
          String(value).trim(),
        ]),
      ),
      page: "1",
    });
  }
  function changeTab(next: "explore" | "proposals") {
    if (next === tab) return;
    sequence.current++;
    setLoading(true);
    setError("");
    setTab(next);
    setFilters({ page: "1" });
    formRef.current?.reset();
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    setSending(true);
    try {
      await proposeProject(selected.id, message.trim());
      toast.success("Demande envoyée. Le client pourra accepter ou refuser.");
      setSelected(null);
      setMessage("");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="min-h-screen space-y-6 bg-noir-700 px-3 pb-24 pt-5 font-one text-white lg:px-6 lg:pb-12 lg:pt-7 xl:px-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="shrink-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-tertiary-400">Explorer</p>
          <div className="relative mt-1.5 flex w-fit items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-white">Les projets clients</h1>
            <div onMouseEnter={() => setConceptOpen(true)} onMouseLeave={() => setConceptOpen(false)}
              onKeyDown={event => { if (event.key === "Escape") setConceptOpen(false); }}>
              <button type="button" aria-label="Comprendre les projets clients" aria-describedby={conceptOpen ? "explorer-concept" : undefined}
                onFocus={() => setConceptOpen(true)} onBlur={() => setConceptOpen(false)} onClick={() => setConceptOpen(true)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-tertiary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400">
                <Info size={16} aria-hidden="true" />
              </button>
              {conceptOpen && <div className="absolute left-0 top-full z-50 w-[min(22rem,calc(100vw-3rem))] pt-2">
                <div id="explorer-concept" role="tooltip" className="rounded-2xl border border-white/10 bg-[#191918] p-4 text-xs leading-relaxed text-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                  <p className="mb-1.5 font-semibold text-white">Des projets à réaliser ensemble</p>
                  Les clients partagent leurs idées de tatouage et recherchent un professionnel pour les réaliser. Explorez les projets, puis envoyez une proposition personnalisée. Le client peut l’accepter ou la refuser. S’il accepte, vous pouvez échanger dans la messagerie. Retrouvez sa réponse dans « Mes propositions ».
                </div>
              </div>}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-white/45">Trouvez votre prochain projet et suivez vos propositions.</p>
        </div>
      <div className="flex min-w-0 flex-col gap-3 xl:flex-1 xl:flex-row xl:items-center xl:justify-end">
      <div role="group" aria-label="Vue des projets" className="flex w-full shrink-0 gap-1 rounded-2xl border border-white/10 bg-black/15 p-1 xl:w-auto">
        {([ ["explore", "Explorer", Compass], ["proposals", "Mes propositions", MessageSquare] ] as const).map(([value, label, Icon]) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => changeTab(value)} className={`inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-tertiary-400 xl:flex-none ${tab === value ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><Icon size={14} aria-hidden="true" />{label}</button>)}
      </div>
      <form
        key={tab}
        ref={formRef}
        onSubmit={search}
        onReset={() => setFilters({ page: "1" })}
        aria-label="Filtres des projets"
        className="min-w-0 xl:flex-none"
      >
        <ApplicationToolbar className="!overflow-visible sm:!flex-row">
          <div className="relative flex w-full min-w-0 flex-wrap items-center gap-2 md:flex-nowrap">
            <div className="relative order-2 shrink-0">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-label="Filtres"
                aria-expanded={filtersOpen}
                title="Filtres"
                className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border transition-colors ${filtersOpen || activeFilterCount > 0 ? "border-tertiary-400/50 bg-tertiary-400/15 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                {activeFilterCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary-400 text-[10px] text-white">{activeFilterCount}</span>}
              </button>
              <div className={`${filtersOpen ? "flex" : "hidden"} absolute left-0 top-full z-30 mt-2 w-56 flex-col gap-2 rounded-2xl border border-white/10 bg-noir-500 p-3 shadow-xl`}>
          {tab === "proposals" && <label className="min-w-0"><span className="sr-only">Statut de la proposition</span><select name="proposalStatus" className={filterField}><option value="" className="bg-noir-500">Tous les statuts</option>{Object.entries(proposalStates).map(([value, state]) => <option key={value} value={value} className="bg-noir-500">{state.label}</option>)}</select></label>}
          {[
            ["size", "Taille", "Toutes les tailles"],
            ["category", "Catégorie", "Catégorie"],
            ["style", "Style", "Style"],
            ["hashtag", "Hashtag", "#Hashtag"],
          ].map(([name, label, placeholder]) => (
            <label key={name} className="min-w-0">
              <span className="sr-only">{label}</span>
              {name === "size" ? (
                <select name="size" className={filterField}>
                  <option value="" className="bg-noir-500">Toutes les tailles</option>
                  {Object.entries(sizes).map(([value, sizeLabel]) => (
                    <option key={value} value={value} className="bg-noir-500">
                      {sizeLabel}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={name}
                  list={
                    name === "category" || name === "style"
                      ? `project-filter-${name}`
                      : undefined
                  }
                  maxLength={
                    name === "city" ? 120 : name === "category" ? 100 : 60
                  }
                  placeholder={placeholder}
                  className={filterField}
                />
              )}
            </label>
          ))}
              </div>
            </div>
            <div className="order-1 min-w-0 flex-1 md:w-56 md:flex-none">
              <label className="relative block">
                <span className="sr-only">Ville</span>
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
                <input name="city" maxLength={120} placeholder="Rechercher une ville" className={`${filterField} !h-10 !rounded-2xl pl-9`} />
              </label>
            </div>
            <div className="order-3 flex w-full shrink-0 gap-2 md:w-auto">
              <DashboardButton type="reset" variant="secondary" disabled={loading} className="h-10 !min-w-0 flex-1 px-3 md:flex-none" aria-label="Réinitialiser les filtres">
                <RotateCcw size={15} aria-hidden="true" />
              </DashboardButton>
              <DashboardButton type="submit" disabled={loading} className="h-10 !min-w-0 flex-1 whitespace-nowrap px-3 md:flex-none">
                <Search size={15} aria-hidden="true" /> Rechercher
              </DashboardButton>
            </div>
          </div>
        </ApplicationToolbar>
        <datalist id="project-filter-category">
          {options.categories.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <datalist id="project-filter-style">
          {options.styles.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </form>
      </div>
      </header>
      {error ? (
        <div role="alert" className="rounded-xl border border-red-300/30 p-4">
          <p>{error}</p>
          <button
            onClick={() => void load()}
            className="mt-2 min-h-11 underline"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <div
          role="status"
          aria-label="Chargement des projets"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] motion-safe:animate-pulse"
            >
              <div className="aspect-[16/9] bg-white/5" />
              <div className="space-y-3 p-3.5">
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
                <div className="h-3 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-3">
              {tab === "proposals" && <button type="button" onClick={() => void load()} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 text-xs text-white/50 hover:text-white"><RotateCcw size={13} aria-hidden="true" /> Actualiser</button>}
              <span className="client-header-count">{result?.total || 0} {tab === "proposals" ? "proposition" : "projet"}{result?.total === 1 ? "" : "s"}</span>
            </div>
          </div>
          {!result?.data.length && (
            <div className="dashboard-empty-state flex flex-col items-center px-5 py-14 text-center">
              <Search
                size={30}
                className="mb-4 text-tertiary-400"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold">
                {tab === "proposals" ? "Aucune proposition à afficher" : "Aucun projet pour le moment"}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-white/50">
                {tab === "proposals" ? "Retrouvez ici vos propositions et la réponse des clients. Explorez les projets pour proposer vos services." : activeFilterCount
                  ? "Essayez une autre ville ou élargissez vos critères pour découvrir davantage de projets."
                  : "Les nouveaux projets des clients apparaîtront ici. Revenez bientôt pour les découvrir."}
              </p>
              {(activeFilterCount > 0 || filters.proposalStatus) && (
                <DashboardButton
                  variant="secondary"
                  onClick={() => formRef.current?.reset()}
                  className="mt-5 min-h-11"
                >
                  Effacer les filtres
                </DashboardButton>
              )}
            </div>
          )}
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {result?.data.map((project) => (
              <article
                key={project.id}
                className="client-card group overflow-hidden rounded-2xl transition-all duration-200 hover:border-tertiary-400/30 hover:shadow-lg hover:shadow-black/20"
              >
                <button
                  onClick={() => {
                    setMessage("");
                    setSelected(project);
                  }}
                  className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary-400"
                >
                  <div className="relative w-full overflow-hidden">
                    {project.images[0] ? (
                      <div className="relative aspect-[16/9] bg-black/20">
                        <Image
                          src={project.images[0].url}
                          alt={project.images[0].caption || project.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="grid aspect-[16/9] place-items-center bg-white/5 text-white/40">
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon
                            size={24}
                            className="text-tertiary-400/50"
                            aria-hidden="true"
                          />
                          <span className="text-xs">
                            Un projet à imaginer ensemble
                          </span>
                        </div>
                      </div>
                    )}
                    {project.images.length > 0 && (
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/65 px-2 py-1 text-[10px] text-white/85 backdrop-blur-sm">
                        <ImageIcon size={12} aria-hidden="true" />
                        {project.images.length} inspiration
                        {project.images.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex w-full flex-1 flex-col gap-2.5 p-3.5">
                    <h3 className="line-clamp-1 break-words text-base font-semibold transition-colors group-hover:text-tertiary-400">
                      {project.name}
                    </h3>
                    <p className="line-clamp-1 text-xs text-white/45">
                      {[
                        project.projectCity,
                        project.projectCategory,
                        sizes[project.projectSize || ""],
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Projet à découvrir"}
                    </p>
                    <p className="line-clamp-2 break-words text-xs leading-5 text-white/65">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ...project.projectStyles,
                        ...project.projectHashtags.map((t) => `#${t}`),
                      ]
                        .slice(0, 3)
                        .map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="max-w-full truncate rounded-md border border-tertiary-400/10 bg-tertiary-400/5 px-2 py-0.5 text-[10px] text-tertiary-400/85"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                    {project.proposals.length > 0 && (
                      <div><ProposalBadge status={project.proposals[0].status} /></div>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-white/65">
                      <span>Voir le projet</span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 text-tertiary-400 transition-colors group-hover:bg-tertiary-400/10">
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
          {result && result.totalPages > 1 && (
            <nav
              aria-label="Pages des projets"
              className="flex items-center justify-center gap-4"
            >
              <button
                disabled={result.page <= 1}
                onClick={() =>
                  setFilters({ ...filters, page: String(result.page - 1) })
                }
                className="min-h-11 disabled:opacity-40"
              >
                Précédent
              </button>
              <span>
                {result.page} / {result.totalPages}
              </span>
              <button
                disabled={result.page >= result.totalPages}
                onClick={() =>
                  setFilters({ ...filters, page: String(result.page + 1) })
                }
                className="min-h-11 disabled:opacity-40"
              >
                Suivant
              </button>
            </nav>
          )}
        </>
      )}
      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          if (sending) e.preventDefault();
          else setSelected(null);
        }}
        onClose={() => {
          if (!sending) setSelected(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && !sending) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)
              setSelected(null);
          }
        }}
        className={`${styles.drawer} font-one`}
        aria-labelledby="project-title"
      >
        {selected && <ProjectDetails key={selected.id} project={selected} sending={sending} message={message}
          onMessageChange={setMessage} onSend={send} onClose={() => setSelected(null)} />}
      </dialog>
    </section>
  );
}
