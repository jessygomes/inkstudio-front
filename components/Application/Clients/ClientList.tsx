"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { AppointmentProps, ClientProps } from "@/lib/type";
import React, { CSSProperties, useEffect, useState } from "react";

import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import BarLoader from "react-spinners/BarLoader";
import CreateOrUpdateClient from "./CreateOrUpdateClient";
import DeleteClient from "./DeleteClient";

import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { RiHealthBookLine } from "react-icons/ri";
import { FaFilePen } from "react-icons/fa6";
import { CiCalendarDate, CiUser } from "react-icons/ci";

export default function ClientList() {
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "none",
  };
  const color = "#ff5500";

  //! State pour les clients
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientProps | null>(
    null
  );

  //! Filtre
  const [searchTerm, setSearchTerm] = useState("");

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isFullInfoModalOpen, setIsFullInfoModalOpen] = useState(false);
  const [clientForInfos, setClientForInfos] = useState<ClientProps | null>(
    null
  );

  // États pour les sections dépliantes du modal
  const [showAppointments, setShowAppointments] = useState(false);
  const [showTattooHistory, setShowTattooHistory] = useState(false);
  const [showTattooCare, setShowTattooCare] = useState(false);

  //! Récupère les clients
  const fetchClients = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/clients/salon/${user.id}`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Erreur lors du chargement des clients :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  //! Filtre les clients en fonction du terme de recherche
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  //! Handler pour afficher les réservations
  const handleShowReservations = (client: ClientProps) => {
    setClientForInfos(client);
    setIsFullInfoModalOpen(true);
  };

  //! Handlers pour les actions
  const handleCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: ClientProps) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (client: ClientProps) => {
    setSelectedClient(client);
    setIsModalDeleteOpen(true);
  };

  return (
    <section>
      <div>
        <div className="flex gap-4 items-center mb-6 mt-2">
          <button
            onClick={handleCreate}
            className="cursor-pointer w-[200px] text-center px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
          >
            Nouveau client
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client"
            className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 placeholder:text-xs py-1 px-4 font-one border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-6 gap-2 px-4 py-2 mb-2 bg-white/10 rounded-lg text-white font-one text-xs font-semibold tracking-widest">
          <p>Nom & Prénom</p>
          <p>Email</p>
          <p>Téléphone</p>
          <p>Rendez-vous</p>
        </div>

        {loading ? (
          <div className="w-full flex items-center justify-center">
            <BarLoader
              color={color}
              loading={loading}
              cssOverride={override}
              // size={150}
              width={300}
              height={5}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="grid grid-cols-6 gap-2 px-4 py-3 items-center mb-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300"
            >
              <p className="text-white font-one text-xs">
                {client.lastName} {client.firstName}
              </p>
              <p className="text-white font-one text-xs">{client.email}</p>
              <p className="text-white font-one text-xs">
                {client.phone ? client.phone : "Non renseigné"}
              </p>
              <p className=" text-white font-one text-xs text-left">
                {client.appointments.length} rendez-vous
              </p>
              <button
                onClick={() => handleShowReservations(client)}
                className="cursor-pointer text-white font-one text-xs mx-auto border w-[60px] hover:underline hover:bg-white/10 duration-200 px-2 py-1 rounded-3xl"
              >
                <p>Infos</p>
              </button>
              <div className="flex gap-8 text-xs items-center justify-center">
                <button
                  className="cursor-pointer text-black"
                  onClick={() => handleEdit(client)}
                >
                  <IoCreateOutline
                    size={20}
                    className="text-white hover:text-secondary-500 duration-200"
                  />
                </button>
                <button
                  className="cursor-pointer text-black"
                  onClick={() => handleDelete(client)}
                >
                  {" "}
                  <AiOutlineDelete
                    size={20}
                    className="text-white hover:text-secondary-500 duration-200"
                  />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Modal INFOS CLIENT */}
        {isFullInfoModalOpen && clientForInfos && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-noir-500 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
              {/* Header fixe */}
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white font-one tracking-wide">
                    {clientForInfos.firstName} {clientForInfos.lastName}
                  </h2>
                  <button
                    onClick={() => setIsFullInfoModalOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <span className="cursor-pointer text-white text-xl">×</span>
                  </button>
                </div>
                <p className="text-white/70 mt-2 text-sm">
                  Informations détaillées du client
                </p>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Informations de base */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide mb-2">
                      <CiUser size={20} /> Informations personnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">Email</p>
                        <p className="text-white font-two text-sm">
                          {clientForInfos.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">
                          Téléphone
                        </p>
                        <p className="text-white font-two text-sm">
                          {clientForInfos.phone || "Non renseigné"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">
                          Date de naissance
                        </p>
                        <p className="text-white font-two text-sm">
                          {clientForInfos.birthDate
                            ? new Date(
                                clientForInfos.birthDate
                              ).toLocaleDateString("fr-FR")
                            : "Non renseignée"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">
                          Adresse
                        </p>
                        <p className="text-white font-two text-sm">
                          {clientForInfos.address || "Non renseignée"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section Rendez-vous */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowAppointments(!showAppointments)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <CiCalendarDate size={20} /> Rendez-vous (
                        {clientForInfos.appointments.length})
                      </h3>
                      {showAppointments ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
                      )}
                    </button>

                    {showAppointments && (
                      <div className="space-y-3">
                        {clientForInfos.appointments.length === 0 ? (
                          <p className="text-white/60 text-sm">
                            Aucun rendez-vous
                          </p>
                        ) : (
                          clientForInfos.appointments.map(
                            (rdv: AppointmentProps, index: number) => (
                              <div
                                key={index}
                                className="bg-white/10 p-3 rounded-lg border border-white/20"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Date
                                    </p>
                                    <p className="text-white font-two text-sm">
                                      {new Date(rdv.start).toLocaleDateString(
                                        "fr-FR"
                                      )}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Heure
                                    </p>
                                    <p className="text-white font-two text-sm">
                                      {new Date(rdv.start).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}{" "}
                                      -{" "}
                                      {new Date(rdv.end).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Prestation
                                    </p>
                                    <p className="text-white font-two text-sm">
                                      {rdv.prestation}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Titre
                                    </p>
                                    <p className="text-white font-two text-sm">
                                      {rdv.title}
                                    </p>
                                  </div>
                                </div>
                                {rdv.description && (
                                  <div className="space-y-1 mt-3">
                                    <p className="text-xs text-white/70 font-one">
                                      Description
                                    </p>
                                    <p className="text-tertiary-300 font-two text-sm">
                                      {rdv.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Historique des tatouages */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooHistory(!showTattooHistory)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <FaFilePen size={20} /> Historique des tatouages (0)
                      </h3>
                      {showTattooHistory ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
                      )}
                    </button>

                    {showTattooHistory && (
                      <div className="space-y-3">
                        <p className="text-white/60 text-sm">
                          Aucun historique de tatouage disponible
                        </p>
                        {/* TODO: Ajouter la logique pour afficher les tatouages */}
                      </div>
                    )}
                  </div>

                  {/* Section Historique médical */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooCare(!showTattooCare)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <RiHealthBookLine size={20} /> Historique médical
                      </h3>
                      {showTattooCare ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
                      )}
                    </button>

                    {showTattooCare && (
                      <div className="space-y-4">
                        {clientForInfos.medicalHistory ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Allergies
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory.allergies ||
                                    "Aucune allergie connue"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Problèmes de santé
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory.healthIssues ||
                                    "Aucun problème de santé signalé"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Médicaments
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory.medications ||
                                    "Aucun médicament"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Historique tatouages
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory
                                    .tattooHistory ||
                                    "Aucun historique de tatouage"}
                                </p>
                              </div>
                            </div>

                            {/* Grossesse - affiché séparément avec style différent */}
                            <div
                              className={`p-3 rounded-lg border ${
                                clientForInfos.medicalHistory.pregnancy
                                  ? "border-yellow-400/50 bg-yellow-400/10"
                                  : "border-green-400/50 bg-green-400/10"
                              }`}
                            >
                              <p className="text-xs text-white/70 font-one mb-1">
                                Grossesse / Allaitement
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  clientForInfos.medicalHistory.pregnancy
                                    ? "text-yellow-300"
                                    : "text-green-300"
                                }`}
                              >
                                {clientForInfos.medicalHistory.pregnancy
                                  ? "⚠️ Enceinte ou allaite actuellement"
                                  : "✅ Non enceinte / n'allaite pas"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/60 text-sm">
                            Aucune information médicale disponible
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Soins reçus */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooHistory(!showTattooHistory)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <RiHealthBookLine size={20} /> Soins reçus (0)
                      </h3>
                      {showTattooHistory ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
                      )}
                    </button>

                    {showTattooHistory && (
                      <div className="space-y-3">
                        <p className="text-white/60 text-sm">
                          Aucun soin reçu disponible
                        </p>
                        {/* TODO: Ajouter la logique pour afficher les soins */}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer fixe */}
              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                <button
                  onClick={() => setIsFullInfoModalOpen(false)}
                  className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateOrUpdateClient
          userId={user.id ?? ""}
          onCreate={() => {
            fetchClients();
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingClient={selectedClient ?? undefined}
        />
      )}

      {isModalDeleteOpen && (
        <DeleteClient
          onDelete={() => {
            fetchClients();
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          client={selectedClient ?? undefined}
        />
      )}
    </section>
  );
}
