"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiFileUserLine } from "react-icons/ri";
import { fetchAppointmentById } from "@/lib/queries/appointment";

interface JitsiAPI {
  dispose: () => void;
  addEventListener: (event: string, handler: (data?: unknown) => void) => void;
  removeEventListener: (
    event: string,
    handler: (data?: unknown) => void
  ) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: {
      new (domain: string, options: Record<string, unknown>): JitsiAPI;
    };
  }
}

export default function JitsiMeeting() {
  const { id } = useParams(); // récupère l'ID du rendez-vous depuis l'URL
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger le script Jitsi
  const loadJitsiScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      if (window.JitsiMeetExternalAPI) {
        setJitsiLoaded(true);
        resolve();
        return;
      }

      // Vérifier si le script est déjà en cours de chargement
      const existingScript = document.querySelector(
        'script[src="https://meet.jit.si/external_api.js"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setJitsiLoaded(true);
          resolve();
        });
        existingScript.addEventListener("error", () => {
          reject(new Error("Failed to load Jitsi script"));
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        // Vérifier que l'API est bien disponible
        if (window.JitsiMeetExternalAPI) {
          setJitsiLoaded(true);
          resolve();
        } else {
          reject(new Error("Jitsi API not available after script load"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load Jitsi script"));
      document.head.appendChild(script);
    });
  };

  // Fonction pour initialiser Jitsi Meet
  const initJitsi = (
    roomName: string,
    appointmentInfo: Record<string, unknown> | null
  ): JitsiAPI | null => {
    console.log("🔍 Recherche du container jitsi-container...");
    const container = document.getElementById("jitsi-container");
    if (!container) {
      console.error("❌ Container jitsi-container introuvable !");
      return null;
    }

    // Extraire juste le nom de la salle depuis l'URL complète
    const roomId = roomName.includes("meet.jit.si/")
      ? roomName.split("meet.jit.si/")[1]
      : roomName;

    // Vérifier que l'API Jitsi est disponible
    if (!window.JitsiMeetExternalAPI) {
      console.error("❌ JitsiMeetExternalAPI non disponible !");
      return null;
    }
    console.log("✅ JitsiMeetExternalAPI disponible");

    const domain = "meet.jit.si";
    const options = {
      roomName: roomId,
      parentNode: container,
      width: "100%",
      height: "100%",
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
      },
      userInfo: {
        displayName: `RDV ${appointmentInfo?.title || "Tattoo"} - ${
          (appointmentInfo?.client as { firstName?: string })?.firstName ||
          "Client"
        }`,
      },
    };

    console.log("⚙️ Configuration Jitsi:", options);

    try {
      console.log("🚀 Création de l'instance JitsiMeetExternalAPI...");
      const api = new window.JitsiMeetExternalAPI(domain, options);
      console.log("✅ Instance créée avec succès:", api);

      // Événements Jitsi
      api.addEventListener("readyToClose", () => {
        console.log("🔴 Fermeture de la salle");
        api.dispose();
      });

      api.addEventListener("participantJoined", (participant: unknown) => {
        console.log("👤 Participant rejoint:", participant);
      });

      api.addEventListener("participantLeft", (participant: unknown) => {
        console.log("👋 Participant parti:", participant);
      });

      api.addEventListener("videoConferenceJoined", () => {
        console.log("🎥 Connexion vidéo établie");
        setJitsiLoaded(true);
      });

      return api;
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation de Jitsi:", error);
      return null;
    }
  };

  // Premier useEffect pour charger les données et le script
  useEffect(() => {
    async function loadData() {
      try {
        console.log("🔍 Récupération des données du rendez-vous...");
        const data = await fetchAppointmentById(id as string);
        console.log("📋 Données du rendez-vous:", data);

        if (!data?.visio || !data?.visioRoom) {
          console.log("❌ Pas de visio ou de salle configurée");
          setLoading(false);
          return;
        }

        console.log("✅ Rendez-vous en visio trouvé:", data.visioRoom);
        setRoom(data.visioRoom);
        setAppointmentData(data);

        // Charger le script Jitsi
        console.log("📦 Chargement du script Jitsi...");
        await loadJitsiScript();
        console.log("✅ Script Jitsi chargé avec succès");

        // Tout est prêt, on peut arrêter le loading
        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur chargement rendez-vous:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Deuxième useEffect pour initialiser Jitsi une fois que tout est chargé
  useEffect(() => {
    let jitsiApi: JitsiAPI | null = null;

    async function initJitsiMeet() {
      // Attendre que room et appointmentData soient disponibles
      if (!room || !appointmentData || loading) {
        return;
      }

      try {
        // Attendre un peu plus pour s'assurer que le DOM est complètement rendu
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Vérifier que l'API est disponible
        if (!window.JitsiMeetExternalAPI) {
          throw new Error("JitsiMeetExternalAPI n'est pas disponible");
        }

        // Initialiser Jitsi Meet
        jitsiApi = initJitsi(room, appointmentData);

        if (jitsiApi) {
          console.log("✅ Jitsi Meet initialisé avec succès");
        } else {
          throw new Error("Échec de l'initialisation de Jitsi Meet");
        }
      } catch (err) {
        console.error("❌ Erreur initialisation Jitsi:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    }

    initJitsiMeet();

    // Cleanup
    return () => {
      if (jitsiApi) {
        try {
          console.log("🧹 Nettoyage de Jitsi Meet...");
          jitsiApi.dispose();
        } catch (error) {
          console.log("⚠️ Erreur lors du nettoyage de Jitsi:", error);
        }
      }
    };
  }, [room, appointmentData, loading]);

  if (loading)
    return (
      <section>
        <div className="my-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
          <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
                VisioRoom
              </h1>
              <p className="text-white/70 text-xs font-one mt-1">
                Rejoignez votre rendez-vous en visioconférence
              </p>
            </div>
          </div>
        </div>

        <div className="h-full w-full flex items-center justify-center">
          <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
            <p className="text-white/60 font-two text-xs text-center">
              {error
                ? `Erreur: ${error}`
                : "Initialisation de la salle de visio..."}
            </p>
          </div>
        </div>
      </section>
    );

  if (!room)
    return (
      <section>
        <div className="my-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
          <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
              <RiFileUserLine
                size={20}
                className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
                VisioRoom
              </h1>
              <p className="text-white/70 text-xs font-one mt-1">
                Rejoignez votre rendez-vous en visioconférence
              </p>
            </div>
          </div>

          {/* Boutons d'action responsive */}
        </div>

        <div className="h-full w-full flex">
          <div className="mt-4 w-full rounded-2xl shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-white font-one text-lg sm:text-xl text-center">
              Aucun rendez-vous en visioconférence trouvé.
            </p>
          </div>
        </div>
      </section>
    );

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-noir-900 via-noir-800 to-noir-900">
      {/* Header de la salle de visio */}
      <div className="mb-6 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              {(appointmentData?.title as string) || "VisioRoom"}
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Rendez-vous en visioconférence -{" "}
              {jitsiLoaded ? "Connexion établie" : "Connexion en cours..."}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs font-one border border-green-400/30">
            En ligne
          </div>
        </div>
      </div>

      {/* Container de la vidéo Jitsi */}
      <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden">
        <div
          id="jitsi-container"
          className="w-full h-[calc(100vh-200px)] min-h-[500px]"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          {!jitsiLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-white/60 font-one text-sm">
                  Initialisation de la salle de visio...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="my-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/20">
        <h3 className="text-blue-300 font-one text-sm font-semibold mb-2">
          💡 Instructions
        </h3>
        <ul className="text-blue-200/80 text-xs font-one space-y-1">
          <li>• Autorisez l&apos;accès à votre caméra et microphone</li>
          <li>
            • Utilisez les contrôles en bas de l&apos;écran pour gérer
            audio/vidéo
          </li>
          <li>• Le chat est disponible pour échanger des messages</li>
          <li>• Cliquez sur &quot;Raccrocher&quot; pour quitter la salle</li>
        </ul>
      </div>
    </section>
  );
}
