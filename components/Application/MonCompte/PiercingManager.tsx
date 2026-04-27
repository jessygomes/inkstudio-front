"use client";

import { useState, useEffect } from "react";
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
import { FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

interface PiercingManagerProps {
  onPiercingDataChange?: (data: unknown) => void;
}

export default function PiercingManager({}: PiercingManagerProps) {
  const [piercingZones, setPiercingZones] = useState<PiercingPrice[]>([]);
  const [allAvailableZones, setAllAvailableZones] = useState<PiercingZone[]>(
    [],
  );
  const [selectedZones, setSelectedZones] = useState<PiercingZone[]>([]);
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

  const sectionTitleClass =
    "mb-2 text-[12px] font-semibold tracking-wider text-white font-one";
  const labelClass =
    "mb-1 block text-[10px] uppercase tracking-wider text-white/45 font-one";
  const fieldClass =
    "w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one";

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
    }
  };

  //! CHARGER LES DONNÉES DE PIERCING
  const loadPiercingData = async () => {
    setLoading(true);
    const result = await getPiercingZonesAction();
    if (result.ok) {
      setPiercingZones(result.data);

      // Marquer les zones déjà configurées comme sélectionnées
      const configuredZones = result.data.map(
        (z: PiercingPrice) => z.piercingZone,
      );
      setSelectedZones(configuredZones);

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
            "",
          price: service.price,
          description: service.description || "",
          isActive: service.isActive,
          isModified: false,
          isSaving: false,
        }));
      });
      setServices(existingServices);
    }
    setLoading(false);
  };

  //! GÉRER LA SÉLECTION DES ZONES DE PIERCING
  const toggleZoneSelection = async (zone: PiercingZone) => {
    const isCurrentlySelected = selectedZones.includes(zone);

    if (isCurrentlySelected) {
      // Supprimer la zone
      const zoneToDelete = piercingZones.find((z) => z.piercingZone === zone);
      if (zoneToDelete) {
        const result = await deletePiercingZoneAction(zoneToDelete.id);
        if (result.ok) {
          setSelectedZones((prev) => prev.filter((z) => z !== zone));
          await loadPiercingData();
        }
      }
    } else {
      // Ajouter la zone
      const result = await createPiercingZoneAction({
        piercingZone: zone,
        isActive: true,
      });

      if (result.ok) {
        setSelectedZones((prev) => [...prev, zone]);
        await loadPiercingData();
      }
    }
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
      alert("Veuillez remplir tous les champs requis");
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
        serviceData.piercingCorps = service.zone;
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
  const confirmDelete = async () => {
    const { zoneId, serviceIndex } = deleteConfirmModal;
    const service = services[zoneId]?.[serviceIndex];

    if (service?.id) {
      try {
        await deletePiercingServiceAction(service.id);
        toast.success("Service supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression");
      }
    }

    // Supprimer de l'interface
    setServices((prev) => ({
      ...prev,
      [zoneId]: prev[zoneId]?.filter((_, idx) => idx !== serviceIndex) || [],
    }));

    // Fermer la modale
    setDeleteConfirmModal({
      show: false,
      zoneId: "",
      serviceIndex: -1,
      serviceName: "",
    });
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

  if (loading) {
    return (
      <div className="dashboard-embedded-section p-3">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-1/4 rounded bg-white/15"></div>
          <div className="h-4 w-1/2 rounded bg-white/15"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-2.5">
      <div>
        <h4 className={sectionTitleClass}>
          Zones de piercing proposées
        </h4>

        {/* Sélection des zones globales */}
        <div className="dashboard-embedded-section mb-2.5 p-3">
          <p className="mb-2 text-[11px] text-white/60 font-one">
            Sélectionnez les zones de piercing que votre salon propose :
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {allAvailableZones.map((zone) => {
              const isSelected = selectedZones.includes(zone);
              return (
                <label
                  key={zone}
                  className={`cursor-pointer flex items-center justify-center rounded-[10px] border px-2.5 py-1.5 text-[11px] font-one transition
                    ${
                      isSelected
                        ? "border-tertiary-400/40 bg-tertiary-500/20 text-tertiary-500"
                        : "border-white/15 bg-white/10 text-white/85 hover:bg-white/15"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleZoneSelection(zone)}
                    className="sr-only"
                  />
                  {zone}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Configuration des prix pour les zones sélectionnées */}
      {selectedZones.length === 0 ? (
        <div className="dashboard-empty-state rounded-2xl border border-white/10 p-5 text-center">
          <p className="text-xs text-white/60 font-one">
            Sélectionnez au moins une zone pour configurer les prix
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h5 className={sectionTitleClass}>
            Configuration des prix
          </h5>
          {piercingZones.map((zone) => (
            <div
              key={zone.id}
              className="dashboard-embedded-section rounded-xl p-3"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-white font-medium text-sm font-one">
                  {zone.piercingZone}
                </span>
                <span className="rounded-[10px] border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] text-white/55 font-one">
                  {(services[zone.id] || []).filter((s) => s.isActive).length}{" "}
                  actif(s) / {(services[zone.id] || []).length} total
                </span>
              </div>

              {/* Services pour cette zone */}
              <div className="space-y-1.5">
                {(services[zone.id] || []).map((service, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/4 p-2.5"
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_96px_78px_auto_auto] sm:items-end">
                      <div>
                        <label className={labelClass}>
                        Type spécifique
                        </label>
                        <select
                          value={service.zone}
                          onChange={(e) =>
                            updateService(zone.id, idx, "zone", e.target.value)
                          }
                          className={fieldClass}
                        >
                          <option value="">Sélectionner...</option>
                          {getZoneSpecificOptions(zone.piercingZone).map(
                            (option: string) => (
                              <option
                                key={option}
                                value={option}
                                className="bg-noir-700"
                              >
                                {option}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                        Prix (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.price}
                          onChange={(e) =>
                            updateService(
                              zone.id,
                              idx,
                              "price",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className={fieldClass}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                        Actif
                        </label>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={service.isActive}
                            onChange={(e) =>
                              updateService(
                                zone.id,
                                idx,
                                "isActive",
                                e.target.checked,
                              )
                            }
                            className="peer sr-only"
                          />
                          <div
                            className={`h-5 w-9 rounded-full transition-colors ${
                              service.isActive ? "bg-tertiary-500" : "bg-white/20"
                            } peer-checked:after:translate-x-4 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all`}
                          ></div>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => saveService(zone.id, idx)}
                        disabled={
                          !service.isModified ||
                          service.isSaving ||
                          !service.zone ||
                          service.price <= 0
                        }
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-xs transition-colors ${
                          service.isModified && service.zone && service.price > 0
                            ? "cursor-pointer border border-green-500/35 bg-green-500/20 text-green-300 hover:bg-green-500/30"
                            : "cursor-not-allowed border border-white/10 bg-white/8 text-white/30"
                        }`}
                      >
                        {service.isSaving ? "..." : "✓"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeService(zone.id, idx)}
                        className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-red-500/35 bg-red-500/15 text-red-300 transition-colors hover:bg-red-500/25"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addService(zone.id)}
                  className="cursor-pointer inline-flex h-9 w-full items-center justify-center gap-1 rounded-[10px] border border-dashed border-white/20 bg-white/4 text-xs text-white/60 transition-colors hover:border-tertiary-400/50 hover:text-tertiary-300 font-one"
                >
                  <FaPlus className="h-3 w-3" />
                  Ajouter un service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-[2px] p-3 md:p-4 lg:flex lg:items-center lg:justify-center">
          <div className="dashboard-embedded-panel w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-[#1a1a1a] shadow-2xl">
            <div className="dashboard-embedded-header px-4 py-3">
              <h3 className="text-base font-semibold text-white font-one">
                Confirmer la suppression
              </h3>
            </div>

            <div className="space-y-2.5 p-3">
              <p className="text-xs text-white/80 font-one">
              Êtes-vous sûr de vouloir supprimer ce service de piercing ?
              </p>

              <div className="rounded-xl border border-white/10 bg-white/6 p-2.5">
                <p className="text-xs font-medium text-tertiary-300 font-one">
                  {deleteConfirmModal.serviceName}
                </p>
              </div>
            </div>

            <div className="dashboard-embedded-footer flex gap-2 p-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmModal({
                    show: false,
                    zoneId: "",
                    serviceIndex: -1,
                    serviceName: "",
                  })
                }
                className="flex-1 rounded-[14px] border border-white/12 bg-white/8 px-3 py-2 text-[11px] text-white/85 transition-colors hover:bg-white/12 font-one"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-[11px] text-white transition-colors hover:from-red-600 hover:to-red-700 font-one"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
