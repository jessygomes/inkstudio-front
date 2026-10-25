"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Compass,
  ImageIcon,
  MessageSquare,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
import styles from "./ProjectExplorer.module.css";
import {
  ExploredProject,
  ExploreResult,
  exploreProjects,
  proposeProject,
  getProjectFilterOptions,
} from "@/lib/queries/projects";

const field =
  "mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20 [color-scheme:dark]";
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
          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white">Les projets clients</h1>
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
            if (event.clientX < bounds.left || event.clientX > bounds.right)
              setSelected(null);
          }
        }}
        className={`${styles.drawer} font-one`}
        aria-labelledby="project-title"
      >
        {selected && (
          <>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-noir-500 px-5 py-5 sm:px-7">
              <div className="min-w-0">
                <p className="client-list-eyebrow mb-2 flex items-center gap-2">
                  <Compass size={14} aria-hidden="true" /> Le projet du client
                </p>
                <h2
                  id="project-title"
                  className="break-words text-2xl font-semibold tracking-tight"
                >
                  {selected.name}
                </h2>
              </div>
              <button
                disabled={sending}
                onClick={() => setSelected(null)}
                aria-label="Fermer le projet"
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Compass
                    size={16}
                    className="text-tertiary-400"
                    aria-hidden="true"
                  />{" "}
                  Son envie, votre inspiration
                </h3>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-white/65">
                  {selected.description ||
                    "Le client n’a pas encore ajouté de description."}
                </p>
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    ["Ville", selected.projectCity],
                    ["Taille", sizes[selected.projectSize || ""]],
                    ["Catégorie", selected.projectCategory],
                    ["Emplacement", selected.projectBodyPlacement],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"
                    >
                      <dt className="text-xs text-white/40">{label}</dt>
                      <dd className="mt-1 break-words text-sm text-white/85">
                        {value || "Non précisé"}
                      </dd>
                    </div>
                  ))}
                </dl>
                {selected.projectMobility && (
                  <p className="mt-2 text-sm text-white/60">
                    Mobilité :{" "}
                    {selected.projectMobility === "RADIUS"
                      ? `${selected.projectRadiusKm} km autour de la ville`
                      : selected.projectMobility === "ANYWHERE"
                        ? "Partout"
                        : "Ne se déplace pas"}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {[
                    ...selected.projectStyles,
                    ...selected.projectHashtags.map((t) => `#${t}`),
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-tertiary-400/15 bg-tertiary-400/5 px-2.5 py-1 text-xs text-tertiary-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
              <section className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <ImageIcon
                      size={16}
                      className="text-tertiary-400"
                      aria-hidden="true"
                    />{" "}
                    Inspirations et notes du client
                  </h3>
                  <span className="client-header-count">
                    {selected.images.length} image
                    {selected.images.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selected.images.map((img, index) => (
                    <figure
                      key={img.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
                    >
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Agrandir l’inspiration ${index + 1} (nouvel onglet)`}
                        className="relative block h-44 bg-black/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary-400 sm:h-40"
                      >
                        <Image
                          src={img.url}
                          alt={img.caption || selected.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 350px"
                          className="object-contain"
                        />
                      </a>
                      <figcaption className="space-y-2 border-t border-white/10 p-3">
                        <p className="flex items-center gap-2 text-[11px] font-semibold text-tertiary-400">
                          <MessageSquare
                            size={13}
                            className="shrink-0"
                            aria-hidden="true"
                          />{" "}
                          Note du client · Inspiration {index + 1}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-xs leading-5 text-white/65">
                          {img.caption?.trim() ||
                            "Le client n’a pas ajouté de note pour cette image."}
                        </p>
                      </figcaption>
                    </figure>
                  ))}
                  {!selected.images.length && (
                    <div className="dashboard-empty-state p-6 text-center text-sm text-white/45 sm:col-span-2">
                      Le client n’a pas encore ajouté d’image d’inspiration.
                    </div>
                  )}
                </div>
              </section>
              <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare
                      size={16}
                      className="text-tertiary-400"
                      aria-hidden="true"
                    />{" "}
                    Donnez vie à ce projet
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-white/45">
                    Présentez votre univers et votre approche au client.
                  </p>
                </div>
                {selected.proposals.length ? (
                  <div className="rounded-xl border border-white/15 p-3">
                    <div className="mb-3"><ProposalBadge status={selected.proposals[0].status} /></div>
                    <p className="text-sm text-white/65">{selected.proposals[0].status === "ACCEPTED" ? "Le client a accepté votre proposition. Poursuivez votre échange dans la messagerie." : selected.proposals[0].status === "REFUSED" ? "Le client n’a pas retenu votre proposition pour ce projet." : "Votre proposition a été envoyée. Vous retrouverez ici la réponse du client."}</p>
                    {selected.proposals[0].status === "ACCEPTED" &&
                      selected.proposals[0].conversationId && (
                        <Link
                          href={`/messagerie/${selected.proposals[0].conversationId}`}
                          className="mt-2 inline-block min-h-11 py-2 underline"
                        >
                          Ouvrir la conversation
                        </Link>
                      )}
                  </div>
                ) : (
                  <form onSubmit={send} className="space-y-3">
                    <label className="block text-sm">
                      Votre premier message
                      <textarea
                        required
                        minLength={1}
                        maxLength={3000}
                        disabled={sending}
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={field}
                        placeholder="Présentez-vous et expliquez votre approche du projet…"
                      />
                    </label>
                    <p className="text-xs text-white/60">
                      Une seule demande par projet. Le client choisit d’accepter
                      ou de refuser. Votre message sera ajouté à une
                      conversation uniquement après son acceptation. Si une
                      conversation existe déjà, elle sera réutilisée à ce
                      moment-là.
                    </p>
                    <DashboardButton
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="min-h-11 w-full sm:w-auto"
                    >
                      {sending ? "Envoi…" : "Proposer mes services"}
                    </DashboardButton>
                  </form>
                )}
              </section>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
