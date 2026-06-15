"use client";

import { sendAdminEmailToClientAction } from "@/lib/queries/admin";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface ContactUserProps {
	userId: string;
	clientId?: string;
	userEmail?: string;
	userLabel?: string;
}

interface MessageSuggestion {
	label: string;
	subject: string;
	message: string;
}

const suggestions: MessageSuggestion[] = [
	{
		label: "Profil incomplet indépendant",
		subject: "Complétez votre profil pour améliorer votre visibilité",
		message:
			"Bonjour,\n\nPensez à compléter les informations de votre profil (description, coordonnées, images, prestations). Un profil complet apparaît mieux au public et améliore votre visibilité sur la plateforme.\n\nMerci et bonne journée.",
	},
		{
		label: "Profil incomplet salon",
		subject: "Complétez votre profil pour améliorer votre visibilité",
		message:
			"Bonjour,\n\nPensez à compléter les informations de votre profil (description, coordonnées, images, prestations). Un profil complet apparaît mieux au public et améliore votre visibilité sur la plateforme.\n\nChaque tatoueur de votre salon peut avoir son profil relié à votre salon, ce qui évite d'ajouter les portfolios de chaque tatoueur manuellement.\n\nS'ils ne sont pas encore inscrits, vous pouvez créer votre équipe depuis votre profil, mais vos tatoueurs n'auront pas de profil dédié tant qu'ils ne seront pas inscrits.\n\nMerci et bonne journée.",
	},
	{
		label: "Documents en attente",
		subject: "Vérification de votre compte - documents à compléter",
		message:
			"Bonjour,\n\nNous vous invitons à compléter vos documents de vérification afin de finaliser votre profil. Cela vous permettra d'améliorer votre crédibilité et votre visibilité auprès des clients.\n\nMerci de votre retour.",
	},
	{
		label: "Mise à jour infos",
		subject: "Mettez à jour vos informations de contact",
		message:
			"Bonjour,\n\nNous vous recommandons de vérifier et mettre à jour vos informations de contact pour faciliter la prise de rendez-vous et améliorer votre présence en ligne.\n\nCordialement.",
	},
];

export default function ContactUser({
	userId,
	clientId,
	userEmail,
	userLabel = "cet utilisateur",
}: ContactUserProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const defaultSuggestion = useMemo(() => suggestions[0], []);
	const [subject, setSubject] = useState(defaultSuggestion.subject);
	const [message, setMessage] = useState(defaultSuggestion.message);

	const applySuggestion = (suggestion: MessageSuggestion) => {
		setSubject(suggestion.subject);
		setMessage(suggestion.message);
	};

	const resetForm = () => {
		setSubject(defaultSuggestion.subject);
		setMessage(defaultSuggestion.message);
	};

	const handleSend = async () => {
		if (loading) return;

		if (!subject.trim() || !message.trim()) {
			toast.error("Le sujet et le message sont obligatoires");
			return;
		}

		setLoading(true);

		try {
			const result = await sendAdminEmailToClientAction({
				id: userId,
				userId,
				clientId,
				subject: subject.trim(),
				message: message.trim(),
			});

			if (!result.ok) {
				toast.error(result.message || "Envoi impossible");
				return;
			}

			toast.success(result.message || "Email envoyé");
			setIsOpen(false);
			resetForm();
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors de l'envoi de l'email");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="cursor-pointer w-full whitespace-nowrap rounded-2xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15 font-one"
			>
				Contacter
			</button>

			{mounted &&
				isOpen &&
				createPortal(
					<div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-noir-500 p-4 shadow-2xl">
						<h3 className="text-sm font-semibold text-white font-one">
							Envoyer un email
						</h3>
						<p className="mt-1 text-xs text-white/70 font-one">
							Destinataire: {userLabel}
							{userEmail ? ` (${userEmail})` : ""}
						</p>

						<div className="mt-3 flex flex-wrap gap-1.5">
							{suggestions.map((suggestion) => (
								<button
									key={suggestion.label}
									type="button"
									onClick={() => applySuggestion(suggestion)}
									disabled={loading}
											className="cursor-pointer whitespace-nowrap rounded-xl border border-white/15 bg-white/8 px-2.5 py-1 text-[11px] text-white/85 transition-colors hover:bg-white/12 font-one"
								>
									{suggestion.label}
								</button>
							))}
						</div>

						<div className="mt-3 space-y-2">
							<div>
								<label className="text-[11px] text-white/70 font-one">Sujet</label>
								<input
									value={subject}
									onChange={(event) => setSubject(event.target.value)}
									disabled={loading}
									className="mt-1 w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
									placeholder="Objet de l'email"
								/>
							</div>

							<div>
								<label className="text-[11px] text-white/70 font-one">Message</label>
								<textarea
									value={message}
									onChange={(event) => setMessage(event.target.value)}
									disabled={loading}
									rows={8}
									className="mt-1 w-full resize-none rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
									placeholder="Votre message..."
								/>
							</div>
						</div>

						<div className="mt-4 flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => {
									setIsOpen(false);
									resetForm();
								}}
								disabled={loading}
								className="cursor-pointer whitespace-nowrap rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/85 transition-colors hover:bg-white/12 font-one disabled:opacity-50"
							>
								Annuler
							</button>
							<button
								type="button"
								onClick={handleSend}
								disabled={loading}
								className="cursor-pointer whitespace-nowrap rounded-xl border border-tertiary-400/35 bg-tertiary-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-tertiary-500/30 font-one disabled:opacity-50"
							>
								{loading ? "Envoi..." : "Envoyer"}
							</button>
						</div>
					</div>
					</div>,
					document.body
				)}
		</>
	);
}
