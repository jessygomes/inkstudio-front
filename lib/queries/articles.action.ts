"use server";

import { getAuthHeaders } from "../session";

export interface AdminArticle {
	id: string;
	title: string;
	content: string;
	author: string;
	imageUrls: string[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateAdminArticleDto {
	title: string;
	content: string;
	author: string;
	imageUrls: string[];
}

export interface UpdateAdminArticleDto {
	title?: string;
	content?: string;
	author?: string;
	imageUrls?: string[];
}

interface ApiResponse<T = undefined> {
	ok: boolean;
	error: boolean;
	status: number;
	message: string;
	data?: T;
}

export const getAdminArticlesAction = async (): Promise<
	ApiResponse<AdminArticle[]>
> => {
	try {
		const headers = await getAuthHeaders();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACK_URL}/admin/articles`,
			{
				method: "GET",
				headers,
				cache: "no-store",
			},
		);

		const data = await response.json();

		if (!response.ok || (data && data.error)) {
			const message =
				data?.message || `Erreur lors de l'operation (${response.status})`;
			return {
				ok: false,
				error: true,
				status: response.status,
				message,
			};
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			message: "Articles récupérés avec succès",
			data: data as AdminArticle[],
		};
	} catch (error) {
		console.error("Erreur lors de la récupération des articles admin:", error);
		throw error;
	}
};

export const createAdminArticleAction = async (
	payload: CreateAdminArticleDto,
): Promise<ApiResponse<AdminArticle>> => {
	try {
		const headers = await getAuthHeaders();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACK_URL}/admin/articles`,
			{
				method: "POST",
				headers,
				body: JSON.stringify(payload),
			},
		);

		const data = await response.json();

		if (!response.ok || (data && data.error)) {
			const message =
				data?.message || `Erreur lors de l'operation (${response.status})`;
			return {
				ok: false,
				error: true,
				status: response.status,
				message,
			};
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			message: data?.message || "Article créé avec succès",
			data: data?.article as AdminArticle,
		};
	} catch (error) {
		console.error("Erreur lors de la création d'un article:", error);
		throw error;
	}
};

export const updateAdminArticleAction = async (
	id: string,
	payload: UpdateAdminArticleDto,
): Promise<ApiResponse<AdminArticle>> => {
	try {
		const headers = await getAuthHeaders();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACK_URL}/admin/articles/${id}`,
			{
				method: "PATCH",
				headers,
				body: JSON.stringify(payload),
			},
		);

		const data = await response.json();

		if (!response.ok || (data && data.error)) {
			const message =
				data?.message || `Erreur lors de l'operation (${response.status})`;
			return {
				ok: false,
				error: true,
				status: response.status,
				message,
			};
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			message: data?.message || "Article mis à jour avec succès",
			data: data?.article as AdminArticle,
		};
	} catch (error) {
		console.error("Erreur lors de la mise à jour de l'article:", error);
		throw error;
	}
};

export const deleteAdminArticleAction = async (
	id: string,
): Promise<ApiResponse> => {
	try {
		const headers = await getAuthHeaders();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACK_URL}/admin/articles/${id}`,
			{
				method: "DELETE",
				headers,
			},
		);

		const data = await response.json();

		if (!response.ok || (data && data.error)) {
			const message =
				data?.message || `Erreur lors de l'operation (${response.status})`;
			return {
				ok: false,
				error: true,
				status: response.status,
				message,
			};
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			message: data?.message || "Article supprimé avec succès",
		};
	} catch (error) {
		console.error("Erreur lors de la suppression de l'article:", error);
		throw error;
	}
};
