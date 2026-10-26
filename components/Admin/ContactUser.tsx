"use client";

import { sendAdminEmailToClientAction } from "@/lib/queries/admin";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Mail, Send, X } from "lucide-react";
import styles from "./AdminShell.module.css";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface ContactUserProps {
	userId: string;
	clientId?: string;
	userEmail?: string;
	userLabel?: string;
	className?: string;
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
	className,
}: ContactUserProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dialog = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const subjectId = useId();
	const messageId = useId();

	useEffect(() => {
		setMounted(true);
	}, []);
	useEffect(() => {
		if (mounted && isOpen) dialog.current?.showModal();
	}, [mounted, isOpen]);

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

	return <>
		<button type="button" onClick={() => setIsOpen(true)} className={className || "admin-button"}><Mail size={13} aria-hidden="true" />Contacter</button>
		{mounted && isOpen && createPortal(
			<dialog ref={dialog} className={`${styles.dialog} ${styles.contactDialog}`} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!loading) { setIsOpen(false); resetForm(); } }}>
				<div className={styles.dialogHeader}><div><h2 id={titleId}>Contacter l’utilisateur</h2><p className="mt-2">{userLabel}{userEmail && <span className="block text-xs text-white/45">{userEmail}</span>}</p></div><button type="button" className="admin-button self-start" aria-label="Fermer" disabled={loading} onClick={() => { setIsOpen(false); resetForm(); }}><X size={15} /></button></div>
				<form onSubmit={event => { event.preventDefault(); void handleSend(); }}>
					<div><p className="mb-2 text-[11px] text-white/45">Partir d’un modèle</p><div className="flex flex-wrap gap-2">{suggestions.map(suggestion => <button type="button" key={suggestion.label} className="admin-button !min-h-8 !px-2.5 !py-1 !text-[11px]" disabled={loading} onClick={() => applySuggestion(suggestion)}>{suggestion.label}</button>)}</div></div>
					<label className="admin-label" htmlFor={subjectId}>Objet<input id={subjectId} className="admin-field mt-2" value={subject} onChange={event => setSubject(event.target.value)} placeholder="Objet de votre message" required disabled={loading} /></label>
					<label className="admin-label" htmlFor={messageId}>Message<textarea id={messageId} className="admin-field mt-2 resize-y" value={message} onChange={event => setMessage(event.target.value)} rows={8} placeholder="Votre message…" required disabled={loading} /></label>
					<div className={styles.dialogActions}><button type="button" autoFocus className="admin-button" disabled={loading} onClick={() => { setIsOpen(false); resetForm(); }}>Annuler</button><button type="submit" className="admin-button admin-button-primary" disabled={loading || !subject.trim() || !message.trim()}><Send size={14} />{loading ? "Envoi…" : "Envoyer l’e-mail"}</button></div>
				</form>
			</dialog>, document.body)}
	</>;
}
