"use server";

import { getAuthHeaders } from "../session";

const TATTOUEUR_TEAM_REQUESTS_BASE =
	`${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/team-requests`;

type UpdateSalonLinkedPermissionResult = {
	ok: boolean;
	error: boolean;
	status: number;
	message?: string;
	data?: unknown;
};

export const updateSalonAgendaAccessPermissionAction = async (
	enabled: boolean,
): Promise<UpdateSalonLinkedPermissionResult> => {
	try {
		const headers = await getAuthHeaders();

		const response = await fetch(
			`${TATTOUEUR_TEAM_REQUESTS_BASE}/permissions/agenda-access`,
			{
				method: "PATCH",
				headers,
				body: JSON.stringify({ enabled }),
			},
		);

		const data = await response.json().catch(() => ({}));

		if (!response.ok || data?.error) {
			const message =
				data?.message || `Erreur lors de l'opération (${response.status})`;
			return { ok: false, error: true, status: response.status, message, data };
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			message: data?.message,
			data,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de la permission agenda/RDV:",
			error,
		);
		return {
			ok: false,
			error: true,
			status: 500,
			message: "Impossible de mettre à jour la permission agenda/RDV.",
			data: null,
		};
	}
};

export const updateSalonAppointmentCreationPermissionAction = async (
	enabled: boolean,
): Promise<UpdateSalonLinkedPermissionResult> => {
	try {
		const headers = await getAuthHeaders();

		const response = await fetch(
			`${TATTOUEUR_TEAM_REQUESTS_BASE}/permissions/salon-appointment-creation`,
			{
				method: "PATCH",
				headers,
				body: JSON.stringify({ enabled }),
			},
		);

		const data = await response.json().catch(() => ({}));

		if (!response.ok || data?.error) {
			const message =
				data?.message || `Erreur lors de l'opération (${response.status})`;
			return { ok: false, error: true, status: response.status, message, data };
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			message: data?.message,
			data,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de la permission de création de RDV:",
			error,
		);
		return {
			ok: false,
			error: true,
			status: 500,
			message: "Impossible de mettre à jour la permission de création de RDV.",
			data: null,
		};
	}
};
