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
    []
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
        (z: PiercingPrice) => z.piercingZone
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
    value: string | number | boolean
  ) => {
    setServices((prev) => ({
      ...prev,
      [zoneId]:
        prev[zoneId]?.map((service, idx) =>
          idx === serviceIndex
            ? { ...service, [field]: value, isModified: true }
            : service
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
          idx === serviceIndex ? { ...s, isSaving: true } : s
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
                : s
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
            idx === serviceIndex ? { ...s, isSaving: false } : s
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
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-white/20 rounded w-1/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-tertiary-400 font-one uppercase tracking-wide mb-4">
          🎯 Zones de Piercing Proposées
        </h4>

        {/* Sélection des zones globales */}
        <div className="mb-6">
          <p className="text-xs text-white/70 font-one mb-3">
            Sélectionnez les zones de piercing que votre salon propose :
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allAvailableZones.map((zone) => {
              const isSelected = selectedZones.includes(zone);
              return (
                <label
                  key={zone}
                  className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-one border transition flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-tertiary-500/20 text-white border-tertiary-400/40"
                        : "bg-white/10 text-white border-white/15 hover:bg-white/15"
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
        <p className="text-white/60 text-xs font-one text-center py-4">
          Sélectionnez au moins une zone pour configurer les prix
        </p>
      ) : (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold text-white font-one">
            💰 Configuration des Prix
          </h5>
          {piercingZones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium text-sm font-one">
                  {zone.piercingZone}
                </span>
                <span className="text-xs text-white/60 font-one">
                  {(services[zone.id] || []).filter((s) => s.isActive).length}{" "}
                  actif(s) / {(services[zone.id] || []).length} total
                </span>
              </div>

              {/* Services pour cette zone */}
              <div className="space-y-2">
                {(services[zone.id] || []).map((service, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-white/70 font-one block mb-1">
                        Type spécifique
                      </label>
                      <select
                        value={service.zone}
                        onChange={(e) =>
                          updateService(zone.id, idx, "zone", e.target.value)
                        }
                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400"
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
                          )
                        )}
                      </select>
                    </div>

                    <div className="w-20">
                      <label className="text-xs text-white/70 font-one block mb-1">
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
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400"
                        placeholder="0"
                      />
                    </div>

                    {/* Toggle Actif/Inactif */}
                    <div className="w-16">
                      <label className="text-xs text-white/70 font-one block mb-1">
                        Actif
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={service.isActive}
                          onChange={(e) =>
                            updateService(
                              zone.id,
                              idx,
                              "isActive",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div
                          className={`w-9 h-5 rounded-full peer transition-colors ${
                            service.isActive ? "bg-tertiary-500" : "bg-white/20"
                          } peer-focus:outline-none peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all`}
                        ></div>
                      </label>
                    </div>

                    {/* Bouton Valider */}
                    <button
                      type="button"
                      onClick={() => saveService(zone.id, idx)}
                      disabled={
                        !service.isModified ||
                        service.isSaving ||
                        !service.zone ||
                        service.price <= 0
                      }
                      className={` w-8 h-8 rounded text-xs flex items-center justify-center transition-colors mb-0.5 ${
                        service.isModified && service.zone && service.price > 0
                          ? "cursor-pointer bg-green-500/20 hover:bg-green-500/30 text-green-400"
                          : "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {service.isSaving ? "..." : "✓"}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeService(zone.id, idx)}
                      className="cursor-pointer w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 flex items-center justify-center transition-colors mb-0.5"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addService(zone.id)}
                  className="cursor-pointer w-full p-2 border-2 border-dashed border-white/20 hover:border-tertiary-400/50 rounded-lg text-white/60 hover:text-tertiary-400 transition-colors text-xs font-one flex items-center justify-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Ajouter un service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {deleteConfirmModal.show && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4 rounded-lg">
          <div className="bg-noir-500 rounded-xl p-6 border border-white/20 max-w-md w-full">
            <h3 className="text-white font-semibold mb-4 font-one">
              🗑️ Confirmer la suppression
            </h3>

            <p className="text-white/80 text-sm font-one mb-6">
              Êtes-vous sûr de vouloir supprimer ce service de piercing ?
            </p>

            <div className="bg-white/5 rounded-lg p-3 mb-6 border border-white/10">
              <p className="text-tertiary-400 font-medium text-sm font-one">
                {deleteConfirmModal.serviceName}
              </p>
            </div>

            <div className="flex gap-3">
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
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-one text-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-one text-sm"
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
