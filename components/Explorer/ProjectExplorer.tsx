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
  Hash,
  ListFilter,
  Palette,
  Ruler,
  SlidersHorizontal,
  X,
} from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import FilterSelect from "@/components/Shared/FilterSelect";
import styles from "./ProjectExplorer.module.css";
import ProjectDetails from "./ProjectDetails";
import {
  ExploredProject,
  ExploreResult,
  exploreProjects,
  proposeProject,
  getProjectFilterOptions,
} from "@/lib/queries/projects";

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
  const [cityInput, setCityInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false); // panneau « Filtres » (taille, style, hashtag)
  const filtersRef = useRef<HTMLDivElement>(null);
  const [hashtagInput, setHashtagInput] = useState("");
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
  useEffect(() => {
    if (!filtersOpen) return;
    const outside = (event: PointerEvent) => { if (!filtersRef.current?.contains(event.target as Node)) setFiltersOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setFiltersOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [filtersOpen]);
  const panelFilterCount = ["size", "style", "hashtag"].filter((key) => filters[key]).length;
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
  // Un filtre s'applique dès qu'il change (listes) ou à la validation / à la sortie du champ (ville, hashtag).
  function setFilter(key: string, value: string) {
    setFilters((current) => ({ ...current, [key]: value.trim(), page: "1" }));
  }
  function clearFilters() {
    setCityInput("");
    setHashtagInput("");
    setFilters({ page: "1" });
  }
  function changeTab(next: "explore" | "proposals") {
    if (next === tab) return;
    sequence.current++;
    setLoading(true);
    setError("");
    setTab(next);
    clearFilters();
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
      <div className="flex min-w-0 xl:flex-1 xl:justify-end">
      <div role="search" aria-label="Filtres des projets" className="relative z-10 flex w-full flex-wrap items-center gap-2 font-one xl:justify-end">
        <div role="tablist" aria-label="Vue des projets" className="inline-flex w-full shrink-0 gap-1 rounded-xl bg-white/[0.05] p-1 sm:w-auto">
          {([ ["explore", "Explorer", Compass], ["proposals", "Mes propositions", MessageSquare] ] as const).map(([value, label, Icon]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => changeTab(value)} className={"inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-tertiary-400 xl:flex-none " + (tab === value ? "bg-tertiary-400/15 text-tertiary-400" : "text-white/50 hover:bg-white/5 hover:text-white")}><Icon size={14} aria-hidden="true" />{label}</button>)}
        </div>
        <label className={"relative flex h-10 w-full shrink-0 items-center rounded-xl text-xs transition focus-within:ring-2 focus-within:ring-tertiary-400/40 sm:w-56 " + (cityInput ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]")}>
          <Search size={14} className="pointer-events-none absolute left-3 opacity-60" aria-hidden="true" />
          <input name="city" aria-label="Ville" maxLength={120} value={cityInput} onChange={(event) => setCityInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") setFilter("city", cityInput); }} onBlur={() => setFilter("city", cityInput)} placeholder="Rechercher une ville" className="h-full w-full bg-transparent pl-9 pr-3 text-xs text-inherit outline-none placeholder:text-white/40" />
        </label>
        {tab === "proposals" && <div className="w-full sm:w-44">
          <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${filters.proposalStatus ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Statut de la proposition" placeholder="Tous les statuts" unit="statut" icon={<ListFilter size={14} aria-hidden="true" />} multiple={false} align="right"
            selected={filters.proposalStatus ? [filters.proposalStatus] : []}
            options={Object.entries(proposalStates).map(([value, state]) => ({ value, label: state.label }))}
            onApply={(values) => setFilter("proposalStatus", values[0] || "")} />
        </div>}
        <div ref={filtersRef} className="relative shrink-0">
          <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)} className={`flex h-10 w-full items-center gap-2 rounded-xl px-3 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 sm:w-auto ${panelFilterCount > 0 || filtersOpen ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`}>
            <SlidersHorizontal size={14} aria-hidden="true" />Filtres{panelFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-md bg-tertiary-400/20 px-1 text-[10px] font-semibold">{panelFilterCount}</span>}
          </button>
          {filtersOpen && <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] space-y-2 rounded-2xl bg-noir-700 p-3 shadow-xl shadow-black/40">
            <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${filters.size ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Taille" placeholder="Toutes les tailles" unit="taille" icon={<Ruler size={14} aria-hidden="true" />} multiple={false} align="left"
              selected={filters.size ? [filters.size] : []}
              options={Object.entries(sizes).map(([value, label]) => ({ value, label }))}
              onApply={(values) => setFilter("size", values[0] || "")} />
            <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${filters.style ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Style" placeholder="Tous les styles" unit="style" icon={<Palette size={14} aria-hidden="true" />} multiple={false} align="left"
              selected={filters.style ? [filters.style] : []}
              options={options.styles.map((name) => ({ value: name, label: name }))}
              onApply={(values) => setFilter("style", values[0] || "")} />
            <label className={"relative flex h-10 w-full items-center rounded-xl text-xs transition focus-within:ring-2 focus-within:ring-tertiary-400/40 " + (hashtagInput ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]")}>
              <Hash size={14} className="pointer-events-none absolute left-3 opacity-60" aria-hidden="true" />
              <input name="hashtag" aria-label="Hashtag" maxLength={60} value={hashtagInput} onChange={(event) => setHashtagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") setFilter("hashtag", hashtagInput); }} onBlur={() => setFilter("hashtag", hashtagInput)} placeholder="Hashtag" className="h-full w-full bg-transparent pl-9 pr-3 text-xs text-inherit outline-none placeholder:text-white/40" />
            </label>
          </div>}
        </div>
        {(activeFilterCount > 0 || filters.proposalStatus) && <RdvActionButton tone="danger" icon={X} onClick={clearFilters} disabled={loading} className="!w-auto shrink-0">Effacer</RdvActionButton>}
      </div>
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
              className="overflow-hidden rounded-2xl bg-white/[0.04] motion-safe:animate-pulse"
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
                  onClick={clearFilters}
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
                className="client-card group overflow-hidden rounded-2xl !border-0 transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
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
                    {/* Badge posé sur la photo : couleurs fixes, car « white » / « black » sont inversés par le thème clair. */}
                    {project.images.length > 0 && (
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-[#000000b3] px-2 py-1 text-[10px] font-medium text-[#ffffff] backdrop-blur-sm">
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
                    <div className="mt-auto flex items-center justify-between pt-2.5 text-[11px] text-white/65">
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
