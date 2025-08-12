import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import qs from "query-string";

// ====== URL QUERY PARAMS
export type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

export type RemoveUrlQueryParams = {
  params: string;
  keysToRemove: string[];
};

export type SearchParamProps = {
  page?: number;
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//! Construction d'une chaine de requête URL à partir d'un ensemble de paramètres données :
export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  // On analyse la chaine de requête URL (params) avec qs.parse qui transforme la chaine de requête en objet
  const currentUrl = qs.parse(params);

  // On met à jour la valeur du paramètre (key) avec la valeur (value) donnée en argument
  currentUrl[key] = value;

  // On utilise qs.stringifyUrl pour transformer l'objet en chaine de requête URL
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true } // On ignore les valeurs null
  );
}

//! Suppression des paramètres d'une chaine de requête URL
export function removeKeysFromQuery({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) {
  // On analyse la chaine de requête URL (params) avec qs.parse qui transforme la chaine de requête en objet
  const currentUrl = qs.parse(params);

  // Pour chaque clé dans le tableau keysToRemove, on supprime les clés de l'objet
  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  // On reconstruit l'url après avoir supprimé les clés
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

//! FORMATE DATE
export const formatDateFancy = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) {
    return `Aujourd'hui ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Demain ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (time?: string) => (time ? time.slice(0, 5) : "");
