/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Vérification de votre email...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Lien invalide ou incomplet.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/auth/verify-email?token=${token}&email=${email}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setStatus("success");
        setMessage(data.message || "Email vérifié avec succès !");

        setTimeout(() => router.push("/connexion"), 4000);
      } catch (err: unknown) {
        setStatus("error");
        if (err instanceof Error) {
          setMessage(err.message || "Une erreur s'est produite.");
        } else {
          setMessage("Une erreur s'est produite.");
        }
      }
    };

    verify();
  }, [router, searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-10 h-10 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="w-10 h-10 text-green-500" />;
      case "error":
        return <XCircle className="w-10 h-10 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-noir-700">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-4">{getStatusIcon()}</div>
        <h1 className="text-2xl font-semibold font-one tracking-widest text-white">
          Confirmation de l'adresse email
        </h1>
        <p className="mt-4 text-gray-400 font-krub animate-pulse text-sm">
          {message}
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-noir-700">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            <div className="flex justify-center mb-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold font-one tracking-widest text-white">
              Chargement...
            </h1>
          </motion.div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
