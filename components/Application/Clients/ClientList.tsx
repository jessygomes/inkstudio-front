"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { AppointmentProps, ClientProps } from "@/lib/type";
import React, { CSSProperties, useEffect, useState } from "react";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import BarLoader from "react-spinners/BarLoader";
import CreateOrUpdateClient from "./CreateOrUpdateClient";
import DeleteClient from "./DeleteClient";

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

  // Debug pour voir quels modaux sont ouverts
  useEffect(() => {
    console.log("État des modaux:", {
      isModalOpen,
      isModalDeleteOpen,
      isFullInfoModalOpen,
    });
  }, [isModalOpen, isModalDeleteOpen, isFullInfoModalOpen]);

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

  console.log("Clients:", clients);

  return (
    <section>
      <div>
        <div className="flex justify-between gap-4 items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client"
            className="w-[200px] border border-gray-300 rounded-2xl pl-4 py-1 text-xs text-white"
          />

          <button
            onClick={handleCreate}
            className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
          >
            Nouveau client
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2 px-4 py-2 text-white font-one text-xs font-semibold tracking-widest">
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
              className="grid grid-cols-6 gap-2 px-4 py-4 border-b border-white/30 hover:bg-primary-500"
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
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[700px] max-h-[80vh] p-6 rounded-lg overflow-y-auto">
              <h2 className="text-lg font-one text-noir-500 font-bold mb-4">
                {clientForInfos.firstName} {clientForInfos.lastName}
              </h2>
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-xs">
                  <strong>Email:</strong> {clientForInfos.email}
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Téléphone:</strong> {clientForInfos.phone}
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Date de naissance:</strong>{" "}
                  {clientForInfos.birthDate
                    ? new Date(clientForInfos.birthDate).toLocaleDateString(
                        "fr-FR"
                      )
                    : "Non renseignée"}
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Adresse:</strong>{" "}
                  {clientForInfos.address
                    ? clientForInfos.address
                    : "Non renseignée"}
                </p>
              </div>
              {/* Section Rendez-vous */}
              <div className="mb-4">
                <button
                  onClick={() => setShowAppointments(!showAppointments)}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-800 font-semibold text-sm">
                    📅 Rendez-vous ({clientForInfos.appointments.length})
                  </span>
                  {showAppointments ? (
                    <IoChevronUp className="text-gray-600" />
                  ) : (
                    <IoChevronDown className="text-gray-600" />
                  )}
                </button>

                {showAppointments && (
                  <div className="mt-3 space-y-3 pl-4">
                    {clientForInfos.appointments.length === 0 ? (
                      <p className="text-gray-500 text-xs">Aucun rendez-vous</p>
                    ) : (
                      clientForInfos.appointments.map(
                        (rdv: AppointmentProps, index: number) => (
                          <div
                            key={index}
                            className="border border-blue-200 p-3 rounded-lg bg-blue-50"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <p className="text-gray-600 text-xs">
                                <strong>Date:</strong>{" "}
                                {new Date(rdv.start).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <strong>Heure:</strong>{" "}
                                {new Date(rdv.start).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {new Date(rdv.end).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <strong>Prestation:</strong> {rdv.prestation}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <strong>Titre:</strong> {rdv.title}
                              </p>
                            </div>
                            {rdv.description && (
                              <p className="text-xs text-orange-600 mt-2">
                                <strong>Description:</strong> {rdv.description}
                              </p>
                            )}
                          </div>
                        )
                      )
                    )}
                  </div>
                )}
              </div>
              {/* Section Historique des tatouages */}
              <div className="mb-4">
                <button
                  onClick={() => setShowTattooHistory(!showTattooHistory)}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-800 font-semibold text-sm">
                    🎨 Historique des tatouages (0)
                  </span>
                  {showTattooHistory ? (
                    <IoChevronUp className="text-gray-600" />
                  ) : (
                    <IoChevronDown className="text-gray-600" />
                  )}
                </button>

                {showTattooHistory && (
                  <div className="mt-3 space-y-3 pl-4">
                    <p className="text-gray-500 text-xs">
                      Aucun historique de tatouage disponible
                    </p>
                    {/* TODO: Ajouter la logique pour afficher les tatouages */}
                  </div>
                )}
              </div>
              {/* Section Historique médical */}
              <div className="mb-4">
                <button
                  onClick={() => setShowTattooCare(!showTattooCare)}
                  className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-800 font-semibold text-sm">
                    🏥 Historique médical
                  </span>
                  {showTattooCare ? (
                    <IoChevronUp className="text-gray-600" />
                  ) : (
                    <IoChevronDown className="text-gray-600" />
                  )}
                </button>

                {showTattooCare && (
                  <div className="mt-3 space-y-3 pl-4">
                    {clientForInfos.medicalHistory ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-red-200 p-3 rounded-lg bg-red-50">
                            <p className="text-gray-700 text-xs font-semibold mb-1">
                              Allergies
                            </p>
                            <p className="text-gray-600 text-xs">
                              {clientForInfos.medicalHistory.allergies ||
                                "Aucune allergie connue"}
                            </p>
                          </div>

                          <div className="border border-red-200 p-3 rounded-lg bg-red-50">
                            <p className="text-gray-700 text-xs font-semibold mb-1">
                              Problèmes de santé
                            </p>
                            <p className="text-gray-600 text-xs">
                              {clientForInfos.medicalHistory.healthIssues ||
                                "Aucun problème de santé signalé"}
                            </p>
                          </div>

                          <div className="border border-red-200 p-3 rounded-lg bg-red-50">
                            <p className="text-gray-700 text-xs font-semibold mb-1">
                              Médicaments
                            </p>
                            <p className="text-gray-600 text-xs">
                              {clientForInfos.medicalHistory.medications ||
                                "Aucun médicament"}
                            </p>
                          </div>

                          <div className="border border-red-200 p-3 rounded-lg bg-red-50">
                            <p className="text-gray-700 text-xs font-semibold mb-1">
                              Historique tatouages
                            </p>
                            <p className="text-gray-600 text-xs">
                              {clientForInfos.medicalHistory.tattooHistory ||
                                "Aucun historique de tatouage"}
                            </p>
                          </div>
                        </div>

                        {/* Grossesse - affiché séparément avec style différent */}
                        <div
                          className={`border p-3 rounded-lg ${
                            clientForInfos.medicalHistory.pregnancy
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-green-200 bg-green-50"
                          }`}
                        >
                          <p className="text-gray-700 text-xs font-semibold mb-1">
                            Grossesse / Allaitement
                          </p>
                          <p
                            className={`text-xs font-semibold ${
                              clientForInfos.medicalHistory.pregnancy
                                ? "text-yellow-700"
                                : "text-green-700"
                            }`}
                          >
                            {clientForInfos.medicalHistory.pregnancy
                              ? "⚠️ Enceinte ou allaite actuellement"
                              : "✅ Non enceinte / n'allaite pas"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">
                        Aucune information médicale disponible
                      </p>
                    )}
                  </div>
                )}
              </div>
              {/* Section Soins reçus */}
              <div className="mb-6">
                <button
                  onClick={() => setShowTattooHistory(!showTattooHistory)}
                  className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-800 font-semibold text-sm">
                    💊 Soins reçus (0)
                  </span>
                  {showTattooHistory ? (
                    <IoChevronUp className="text-gray-600" />
                  ) : (
                    <IoChevronDown className="text-gray-600" />
                  )}
                </button>

                {showTattooHistory && (
                  <div className="mt-3 space-y-3 pl-4">
                    <p className="text-gray-500 text-xs">
                      Aucun soin reçu disponible
                    </p>
                    {/* TODO: Ajouter la logique pour afficher les soins */}
                  </div>
                )}
              </div>{" "}
              <button
                onClick={() => setIsFullInfoModalOpen(false)}
                className="w-full mt-4 text-white font-one tracking-wide text-sm px-4 py-2 bg-secondary-500 hover:bg-secondary-600 hover:border-noir-500 transition-all ease-in-out duration-300 cursor-pointer rounded-3xl"
              >
                Fermer
              </button>
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
