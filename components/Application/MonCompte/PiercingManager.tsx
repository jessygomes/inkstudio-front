"use client";

import { useState, useEffect, useRef } from "react";
import {
  getPiercingEnumsAction,
  createPiercingZoneAction,
  getPiercingZonesAction,
  deletePiercingZoneAction,
  createPiercingServiceAction,
  updatePiercingServiceAction,
  deletePiercingServiceAction,
  type PiercingZone,
  type PiercingPrice,
} from "@/lib/queries/piercing";
import { Gem, MapPin, Plus, Save, Trash2, LoaderCircle, Check, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PiercingManagerProps {
  onPiercingDataChange?: (data: unknown) => void;
}

export default function PiercingManager({}: PiercingManagerProps) {
  const [piercingZones, setPiercingZones] = useState<PiercingPrice[]>([]);
  const [allAvailableZones, setAllAvailableZones] = useState<PiercingZone[]>(
    [],
  );
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [addingZone, setAddingZone] = useState<PiercingZone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const confirmation = useRef<HTMLDialogElement>(null);
  const [enums, setEnums] = useState<{
    zones?: PiercingZone[];
    oreille?: string[];
    visage?: string[];
    bouche?: string[];
    corps?: string[];
    microdermal?: string[];
  } | null>(null);
  const [services, setServices] = useState<{
    [key: string]: Array<{
      id?: string;
      zone: string;
      price: number;
      description?: string;
      isActive: boolean;
      isModified?: boolean;
      isSaving?: boolean;
    }>;
  }>({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    show: boolean;
    zoneId: string;
    serviceIndex: number;
    serviceName: string;
  }>({ show: false, zoneId: "", serviceIndex: -1, serviceName: "" });

  const labelClass = "mb-1.5 block text-[11px] font-medium text-white/50";
  const fieldClass = "h-10 w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]";
  const zoneLabels: Record<PiercingZone, string> = { OREILLE: "Oreille", VISAGE: "Visage", BOUCHE: "Bouche", CORPS: "Corps", MICRODERMAL: "Microdermal", AUTRE: "Autre" };
  const formatServiceName = (value: string) => value.replaceAll("_", " ").toLocaleLowerCase("fr").replace(/^./, (letter) => letter.toLocaleUpperCase("fr"));

  useEffect(() => {
    if (!deleteConfirmModal.show) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = confirmation.current;
    dialog?.showModal();
    return () => { dialog?.close(); previousFocus?.focus(); };
  }, [deleteConfirmModal.show]);

  useEffect(() => {
    loadPiercingData();
    loadEnums();
  }, []);

  //! CHARGER LES ENUMS
  const loadEnums = async () => {
    const result = await getPiercingEnumsAction();

    if (result.ok && result.data) {
      setEnums(result.data);
      // Charger toutes les zones disponibles depuis l'enum
      setAllAvailableZones(result.data.zones || []);
    } else {
      toast.error("Impossible de charger les zones disponibles.");
    }
  };

  //! CHARGER LES DONNÉES DE PIERCING
  const loadPiercingData = async () => {
    setLoading(true);
    setLoadError(null);
    const result = await getPiercingZonesAction();
    if (result.ok) {
      setPiercingZones(result.data);

      // Marquer les zones déjà configurées comme sélectionnées
      setActiveZoneId((previous) => result.data.some((zone: PiercingPrice) => zone.id === previous) ? previous : result.data[0]?.id || null);

      // Initialiser les services existants
      const existingServices: {
        [key: string]: Array<{
          id?: string;
          zone: string;
          price: number;
          description?: string;
          isActive: boolean;
          isModified?: boolean;
          isSaving?: boolean;
        }>;
      } = {};
      result.data.forEach((zone: PiercingPrice) => {
        existingServices[zone.id] = zone.services.map((service) => ({
          id: service.id,
          zone:
            service.piercingZoneOreille ||
            service.piercingZoneVisage ||
            service.piercingZoneBouche ||
            service.piercingCorps ||
            service.piercingZoneCorps ||
            service.piercingZoneMicrodermal ||
            "",
          price: service.price,
          description: service.description || "",
          isActive: service.isActive,
          isModified: false,
          isSaving: false,
        }));
      });
      setServices(existingServices);
    } else {
      setLoadError(result.message || "Impossible de charger le catalogue.");
    }
    setLoading(false);
  };

  //! GÉRER LA SÉLECTION DES ZONES DE PIERCING
  const addZone = async (zone: PiercingZone) => {
    if (addingZone) return;
    setAddingZone(zone);
    try {
      const result = await createPiercingZoneAction({ piercingZone: zone, isActive: true });
      if (!result.ok || !result.data?.id) { toast.error(result.message || "Impossible d’ajouter la zone."); return; }
      const created = { ...result.data, services: result.data.services || [] } as PiercingPrice;
      setPiercingZones((previous) => [...previous, created]);
      setServices((previous) => ({ ...previous, [created.id]: [] }));
      setActiveZoneId(created.id);
      toast.success("Zone ajoutée au catalogue.");
    } catch { toast.error("Impossible d’ajouter la zone."); }
    finally { setAddingZone(null); }
  };

  const addService = (zoneId: string) => {
    setServices((prev) => ({
      ...prev,
      [zoneId]: [
        ...(prev[zoneId] || []),
        {
          zone: "",
          price: 0,
          description: "",
          isActive: true,
          isModified: true,
          isSaving: false,
        },
      ],
    }));
  };

  const updateService = (
    zoneId: string,
    serviceIndex: number,
    field: string,
    value: string | number | boolean,
  ) => {
    setServices((prev) => ({
      ...prev,
      [zoneId]:
        prev[zoneId]?.map((service, idx) =>
          idx === serviceIndex
            ? { ...service, [field]: value, isModified: true }
            : service,
        ) || [],
    }));
  };

  //! SAUVEGARDER UN SERVICE
  const saveService = async (zoneId: string, serviceIndex: number) => {
    const service = services[zoneId]?.[serviceIndex];
    if (!service || !service.zone || service.price <= 0) {
      toast.error("Choisissez un type de piercing et un tarif supérieur à 0 €.");
      return;
    }

    const zone = piercingZones.find((z) => z.id === zoneId);
    if (!zone) return;

    // Marquer comme en cours de sauvegarde
    setServices((prev) => ({
      ...prev,
      [zoneId]:
        prev[zoneId]?.map((s, idx) =>
          idx === serviceIndex ? { ...s, isSaving: true } : s,
        ) || [],
    }));

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serviceData: any = {
        piercingPriceId: zoneId,
        price: service.price,
        description: service.description || undefined,
        isActive: service.isActive,
      };

      // Ajouter le champ spécifique selon la zone
      if (zone.piercingZone === "OREILLE") {
        serviceData.piercingZoneOreille = service.zone;
      } else if (zone.piercingZone === "VISAGE") {
        serviceData.piercingZoneVisage = service.zone;
      } else if (zone.piercingZone === "BOUCHE") {
        serviceData.piercingZoneBouche = service.zone;
      } else if (zone.piercingZone === "CORPS") {
        serviceData.piercingZoneCorps = service.zone;
      } else if (zone.piercingZone === "MICRODERMAL") {
        serviceData.piercingZoneMicrodermal = service.zone;
      }

      let result;
      if (service.id) {
        // Modifier le service existant
        result = await updatePiercingServiceAction(service.id, serviceData);
      } else {
        // Créer un nouveau service
        result = await createPiercingServiceAction(serviceData);
      }

      if (result.ok) {
        // Marquer comme sauvegardé
        setServices((prev) => ({
          ...prev,
          [zoneId]:
            prev[zoneId]?.map((s, idx) =>
              idx === serviceIndex
                ? {
                    ...s,
                    id: result.data?.id || s.id,
                    isModified: false,
                    isSaving: false,
                  }
                : s,
            ) || [],
        }));
        toast.success("Sauvegardé avec succès !");
      } else {
        toast.error(result.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      // Arrêter l'indicateur de sauvegarde
      setServices((prev) => ({
        ...prev,
        [zoneId]:
          prev[zoneId]?.map((s, idx) =>
            idx === serviceIndex ? { ...s, isSaving: false } : s,
          ) || [],
      }));
    }
  };

  //! SUPPRIMER SERVICE
  const removeService = async (zoneId: string, serviceIndex: number) => {
    const service = services[zoneId]?.[serviceIndex];
    if (!service) return;

    // Si le service a un ID (existe en base), demander confirmation
    if (service.id) {
      const zone = piercingZones.find((z) => z.id === zoneId);
      setDeleteConfirmModal({
        show: true,
        zoneId,
        serviceIndex,
        serviceName: `${zone?.piercingZone} - ${service.zone}${
          service.price ? ` (${service.price}€)` : ""
        }`,
      });
      return;
    }

    // Supprimer directement si pas d'ID (service temporaire)
    setServices((prev) => ({
      ...prev,
      [zoneId]: prev[zoneId]?.filter((_, idx) => idx !== serviceIndex) || [],
    }));
  };

  //! CONFIRMER LA SUPPRESSION
  const closeConfirmation = () => setDeleteConfirmModal({ show: false, zoneId: "", serviceIndex: -1, serviceName: "" });
  const confirmDelete = async () => {
    if (isDeleting) return;
    const { zoneId, serviceIndex } = deleteConfirmModal;
    setIsDeleting(true);
    try {
      if (serviceIndex === -1) {
        const result = await deletePiercingZoneAction(zoneId);
        if (!result.ok) { toast.error(result.message || "Retrait impossible."); return; }
        setPiercingZones((previous) => previous.filter((zone) => zone.id !== zoneId));
        setActiveZoneId(null);
        setServices((previous) => { const next = { ...previous }; delete next[zoneId]; return next; });
        toast.success("Zone retirée du catalogue.");
      } else {
        const service = services[zoneId]?.[serviceIndex];
        if (!service?.id) return;
        const result = await deletePiercingServiceAction(service.id);
        if (!result.ok) { toast.error(result.message || "Suppression impossible."); return; }
        setServices((previous) => ({ ...previous, [zoneId]: previous[zoneId]?.filter((_, index) => index !== serviceIndex) || [] }));
        toast.success("Prestation supprimée.");
      }
      closeConfirmation();
    } catch { toast.error("La suppression a échoué. Veuillez réessayer."); }
    finally { setIsDeleting(false); }
  };

  const getZoneSpecificOptions = (piercingZone: PiercingZone) => {
    if (!enums) return [];

    switch (piercingZone) {
      case "OREILLE":
        return enums.oreille || [];
      case "VISAGE":
        return enums.visage || [];
      case "BOUCHE":
        return enums.bouche || [];
      case "CORPS":
        return enums.corps || [];
      case "MICRODERMAL":
        return enums.microdermal || [];
      default:
        return [];
    }
  };

  const activeZone = piercingZones.find((zone) => zone.id === activeZoneId) || piercingZones[0];
  const availableZones = allAvailableZones.filter((zone) => !piercingZones.some((item) => item.piercingZone === zone));
  const allServices = Object.values(services).flat();
  const pendingCount = allServices.filter((service) => service.isModified).length;
  const activeServices = activeZone ? services[activeZone.id] || [] : [];
  const anySaving = allServices.some((service) => service.isSaving);
  const actionClass = "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

  if (loading) return <div role="status" className="flex min-h-60 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-noir-600 text-xs text-white/45"><LoaderCircle size={17} className="animate-spin" />Chargement du catalogue…</div>;
  if (loadError) return <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5"><p className="text-sm text-red-200">{loadError}</p><button type="button" className={actionClass + " mt-4"} onClick={() => { void loadPiercingData(); void loadEnums(); }}>Réessayer</button></div>;

  return <div className="font-one text-white [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/40"><div className="flex flex-wrap gap-4"><span><strong className="mr-1 text-sm font-medium text-white/80">{piercingZones.length}</strong>zone{piercingZones.length > 1 ? "s" : ""} configurée{piercingZones.length > 1 ? "s" : ""}</span><span><strong className="mr-1 text-sm font-medium text-white/80">{allServices.filter((service) => service.isActive && service.id).length}</strong>prestation{allServices.filter((service) => service.isActive && service.id).length > 1 ? "s" : ""} active{allServices.filter((service) => service.isActive && service.id).length > 1 ? "s" : ""}</span></div>{pendingCount > 0 && <span role="status" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/5 px-2.5 py-1.5 text-amber-300/80"><span className="size-1.5 rounded-full bg-amber-300" />{pendingCount} ligne{pendingCount > 1 ? "s" : ""} à enregistrer</span>}</div>
    <div className="grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-5">
      <aside className="rounded-2xl border border-white/10 bg-noir-600 p-4 xl:sticky xl:top-5">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/75"><MapPin size={14} className="text-white/35" />Zones du catalogue</h2>
        <nav aria-label="Zones de piercing" className="flex gap-1 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
          {piercingZones.map((zone) => <button key={zone.id} type="button" aria-current={activeZone?.id === zone.id ? "true" : undefined} onClick={() => setActiveZoneId(zone.id)} className={"flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs transition xl:w-full " + (activeZone?.id === zone.id ? "border-white/10 bg-white/[0.07] text-white" : "border-transparent text-white/45 hover:bg-white/[0.035] hover:text-white/80")}><Gem size={14} className={activeZone?.id === zone.id ? "text-tertiary-400" : "text-white/25"} /><span className="flex-1">{zoneLabels[zone.piercingZone]}</span><span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">{(services[zone.id] || []).length}</span></button>)}
          {!piercingZones.length && <p className="py-2 text-[11px] text-white/30">Aucune zone configurée.</p>}
        </nav>
        {availableZones.length > 0 && <div className="mt-4 border-t border-white/[0.07] pt-4"><p className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-white/35">Ajouter une zone</p><div className="flex flex-wrap gap-1.5">{availableZones.map((zone) => <button key={zone} type="button" disabled={!!addingZone} onClick={() => void addZone(zone)} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[10px] text-white/55 transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:opacity-40">{addingZone === zone ? <LoaderCircle size={11} className="animate-spin" /> : <Plus size={11} />}{zoneLabels[zone]}</button>)}</div></div>}
        <p className="mt-5 border-t border-white/[0.07] pt-4 text-[11px] leading-5 text-white/35">Sélectionnez une zone, puis ajoutez ses prestations. Chaque ligne s’enregistre séparément.</p>
      </aside>
      <section aria-label="Prestations de la zone" className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-noir-600">
        {activeZone ? <>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5"><div><p className="text-[10px] uppercase tracking-[0.12em] text-white/35">Prestations & tarifs</p><h2 className="mt-1 text-lg font-semibold tracking-tight">{zoneLabels[activeZone.piercingZone]}</h2><p className="mt-1 text-[11px] text-white/40">{activeServices.filter((service) => service.isActive).length} active{activeServices.filter((service) => service.isActive).length > 1 ? "s" : ""} sur {activeServices.length} · Enregistrez pour appliquer vos changements.</p></div><button type="button" onClick={() => addService(activeZone.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-tertiary-400 px-3 py-2 text-xs font-medium text-white transition hover:bg-tertiary-500"><Plus size={14} />Ajouter une prestation</button></header>
          <div className="space-y-3 p-3 sm:p-5">
            {!activeServices.length && <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-4 py-10 text-center"><Gem size={24} className="mx-auto mb-3 text-white/25" /><h3 className="text-sm font-medium text-white/75">La zone est prête à être configurée</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/35">Ajoutez une première prestation, choisissez son type et indiquez son tarif.</p></div>}
            {activeServices.map((service, index) => <div key={service.id || activeZone.id + "-" + index} className="rounded-xl border border-white/[0.08] bg-black/10 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-medium text-white/75"><span className="text-[10px] text-white/25">{String(index + 1).padStart(2, "0")}</span>{service.zone ? formatServiceName(service.zone) : "Nouvelle prestation"}</h3><span className={"text-[10px] " + (service.isModified ? "text-amber-300/75" : "text-white/30")}>{service.isSaving ? "Enregistrement…" : service.isModified ? "Modifications non enregistrées" : "Enregistrée"}</span></div>
              <fieldset disabled={service.isSaving || isDeleting} className="grid min-w-0 grid-cols-2 items-end gap-3 disabled:opacity-60 2xl:grid-cols-[minmax(0,1fr)_100px_110px_auto]">
                <div className="col-span-2 min-w-0 sm:col-span-1 2xl:col-span-1"><label htmlFor={"piercing-type-" + activeZone.id + "-" + index} className={labelClass}>Type de piercing <span className="text-tertiary-400">*</span></label><select id={"piercing-type-" + activeZone.id + "-" + index} value={service.zone} onChange={(event) => updateService(activeZone.id, index, "zone", event.target.value)} className={fieldClass}><option value="">Choisir un type…</option>{getZoneSpecificOptions(activeZone.piercingZone).map((option) => <option key={option} value={option}>{formatServiceName(option)}</option>)}</select></div>
                <div className="min-w-0"><label htmlFor={"piercing-price-" + activeZone.id + "-" + index} className={labelClass}>Tarif (€) <span className="text-tertiary-400">*</span></label><input id={"piercing-price-" + activeZone.id + "-" + index} type="number" min="0" step="0.01" inputMode="decimal" value={service.price} onChange={(event) => updateService(activeZone.id, index, "price", parseFloat(event.target.value) || 0)} className={fieldClass} /></div>
                <div><span className={labelClass}>Disponibilité</span><label className="flex h-10 cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-2.5"><span className={"text-[11px] " + (service.isActive ? "text-emerald-400" : "text-white/35")}>{service.isActive ? "Active" : "Inactive"}</span><input type="checkbox" aria-label="Activer la prestation" checked={service.isActive} onChange={(event) => updateService(activeZone.id, index, "isActive", event.target.checked)} className="peer sr-only" /><span className="relative h-4 w-7 shrink-0 rounded-full bg-white/15 transition after:absolute after:left-0.5 after:top-0.5 after:size-3 after:rounded-full after:bg-white after:transition peer-checked:bg-emerald-500 peer-checked:after:translate-x-3 peer-focus-visible:ring-2 peer-focus-visible:ring-tertiary-400" /></label></div>
                <div className="col-span-2 flex items-center justify-end gap-1.5 sm:col-span-1 2xl:col-span-1"><button type="button" disabled={!service.isModified || service.isSaving || !service.zone || service.price <= 0} onClick={() => void saveService(activeZone.id, index)} className={actionClass + " disabled:opacity-30"}>{service.isSaving ? <LoaderCircle size={13} className="animate-spin" /> : service.isModified ? <Save size={13} /> : <Check size={13} />}{service.isSaving ? "En cours…" : service.isModified ? "Enregistrer" : "Enregistrée"}</button><button type="button" disabled={anySaving} onClick={() => void removeService(activeZone.id, index)} aria-label="Supprimer cette prestation" title="Supprimer cette prestation" className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white/30 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30"><Trash2 size={14} /></button></div>
              </fieldset>
            </div>)}
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3 sm:px-5"><p className="text-[10px] text-white/30">Les prestations inactives restent dans votre catalogue.</p><button type="button" disabled={anySaving || isDeleting} onClick={() => setDeleteConfirmModal({ show: true, zoneId: activeZone.id, serviceIndex: -1, serviceName: zoneLabels[activeZone.piercingZone] })} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[10px] text-white/30 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30"><Trash2 size={12} />Retirer la zone</button></footer>
        </> : <div className="flex min-h-80 flex-col items-center justify-center px-5 py-12 text-center"><div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-tertiary-400"><Gem size={22} /></div><h2 className="text-lg font-semibold tracking-tight">Construisez votre catalogue piercing</h2><p className="mt-2 max-w-md text-xs leading-6 text-white/40">Ajoutez une zone depuis le menu, puis configurez les types de piercing proposés et leurs tarifs.</p><span className="mt-5 inline-flex items-center gap-1 text-[11px] text-white/30">Commencez par une zone<ChevronRight size={12} /></span></div>}
      </section>
    </div>
    <dialog ref={confirmation} aria-labelledby="piercing-confirm-title" onCancel={(event) => { event.preventDefault(); if (!isDeleting) closeConfirmation(); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/15 bg-noir-600 p-0 text-white shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-[2px]">
      <div className="p-5"><div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-red-400/10 text-red-300"><AlertCircle size={18} /></div><h2 id="piercing-confirm-title" className="text-base font-semibold">{deleteConfirmModal.serviceIndex === -1 ? "Retirer cette zone ?" : "Supprimer cette prestation ?"}</h2><p className="mt-2 break-words text-xs leading-6 text-white/50">{deleteConfirmModal.serviceName}</p><p className="mt-2 text-[11px] leading-5 text-white/35">{deleteConfirmModal.serviceIndex === -1 ? "La zone et toutes ses prestations seront supprimées du catalogue." : "Cette prestation sera supprimée du catalogue."}</p></div>
      <div className="flex justify-end gap-2 border-t border-white/10 p-4"><button type="button" disabled={isDeleting} onClick={closeConfirmation} className={actionClass}>Annuler</button><button type="button" disabled={isDeleting} onClick={() => void confirmDelete()} className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-red-400/15 px-3 py-2 text-xs text-red-200 hover:bg-red-400/25 disabled:opacity-40">{isDeleting && <LoaderCircle size={13} className="animate-spin" />}{isDeleting ? "Suppression…" : "Confirmer la suppression"}</button></div>
    </dialog>
  </div>;
}
