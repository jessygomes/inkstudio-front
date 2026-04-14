"use server";
import { getAuthHeaders } from "../session";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
};

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
};

const pickNumber = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
};

const pickBoolean = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
};

export interface StripeInvoice {
  id: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  pdfUrl: string | null;
  hostedUrl: string | null;
  number: string | null;
  createdAt: string | null;
}

export interface StripeInvoicesPage {
  invoices: StripeInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const normalizeStripeInvoice = (
  invoice: Record<string, unknown>,
  index: number,
): StripeInvoice => {
  const period = isRecord(invoice.period) ? invoice.period : null;
  const createdValue = invoice.created;
  const createdAt =
    typeof createdValue === "number"
      ? new Date(createdValue * 1000).toISOString()
      : pickString(invoice, ["createdAt", "created", "date"]);

  return {
    id: pickString(invoice, ["id"]) ?? `stripe-invoice-${index}`,
    amount: pickNumber(invoice, [
      "amount",
      "total",
      "amountPaid",
      "amount_paid",
    ]),
    currency: pickString(invoice, ["currency"]) ?? "EUR",
    status: pickString(invoice, ["status"]),
    periodStart:
      pickString(invoice, ["periodStart", "period_start"]) ??
      (period ? pickString(period, ["start"]) : null),
    periodEnd:
      pickString(invoice, ["periodEnd", "period_end"]) ??
      (period ? pickString(period, ["end"]) : null),
    pdfUrl: pickString(invoice, [
      "pdfUrl",
      "pdf_url",
      "invoicePdf",
      "invoice_pdf",
    ]),
    hostedUrl: pickString(invoice, [
      "hostedUrl",
      "hosted_url",
      "hostedInvoiceUrl",
      "hosted_invoice_url",
    ]),
    number: pickString(invoice, ["number"]),
    createdAt,
  };
};

const extractInvoices = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (isRecord(payload) && Array.isArray(payload.invoices)) {
    return payload.invoices.filter(isRecord);
  }

  return [];
};

const normalizeInvoicesPage = (
  payload: unknown,
  fallbackPage: number,
  fallbackLimit: number,
): StripeInvoicesPage => {
  const invoices = extractInvoices(payload).map((invoice, index) =>
    normalizeStripeInvoice(invoice, index),
  );

  if (!isRecord(payload)) {
    const total = invoices.length;
    const totalPages = total > 0 ? Math.ceil(total / fallbackLimit) : 0;

    return {
      invoices,
      total,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages,
      hasNextPage: false,
      hasPreviousPage: fallbackPage > 1,
    };
  }

  const total = pickNumber(payload, ["total"]) ?? invoices.length;
  const page = pickNumber(payload, ["page"]) ?? fallbackPage;
  const limit = pickNumber(payload, ["limit"]) ?? fallbackLimit;
  const totalPages =
    pickNumber(payload, ["totalPages", "total_pages"]) ??
    (total > 0 ? Math.ceil(total / limit) : 0);
  const hasNextPage =
    pickBoolean(payload, ["hasNextPage", "has_next_page"]) ?? page < totalPages;
  const hasPreviousPage =
    pickBoolean(payload, ["hasPreviousPage", "has_previous_page"]) ?? page > 1;

  return {
    invoices,
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

export type ChangePlanResult =
  | {
      updated: true;
      plan: string;
      alreadyOnTargetPlan?: boolean;
      message: string;
    }
  | { updated: false; plan: string; url: string; message: string };

export const changePlanAction = async (
  plan: string,
): Promise<ChangePlanResult> => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/stripe/change-plan`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ plan }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.message || `Erreur lors du changement de plan (${response.status})`;
    throw new Error(message);
  }

  return data as ChangePlanResult;
};

export const getInvoicesAction = async (
  page = 1,
  limit = 5,
): Promise<StripeInvoicesPage> => {
  const headers = await getAuthHeaders();
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const params = new URLSearchParams({
    page: String(safePage),
    limit: String(safeLimit),
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/stripe/invoices?${params.toString()}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `Erreur lors de la récupération des factures (${response.status})`,
      ),
    );
  }

  return normalizeInvoicesPage(data, safePage, safeLimit);
};

export const getPortalSessionAction = async (): Promise<{ url: string }> => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/stripe/portal`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `Erreur lors de l'ouverture du portail Stripe (${response.status})`,
      ),
    );
  }

  if (!isRecord(data) || typeof data.url !== "string" || !data.url.trim()) {
    throw new Error("URL du portail Stripe introuvable.");
  }

  return { url: data.url };
};
