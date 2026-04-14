"use client";

import { useCallback, useEffect, useState } from "react";
import { CiCreditCard1 } from "react-icons/ci";
import { toast } from "sonner";
import {
  getInvoicesAction,
  getPortalSessionAction,
  StripeInvoice,
  StripeInvoicesPage,
} from "@/lib/queries/stripe";

const INVOICES_PER_PAGE = 5;

const formatInvoiceDate = (value: string | null) => {
  if (!value) {
    return "Non disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Non disponible";
  }

  return date.toLocaleDateString("fr-FR");
};

const formatInvoicePeriod = (invoice: StripeInvoice) => {
  if (invoice.periodStart && invoice.periodEnd) {
    return `Du ${formatInvoiceDate(invoice.periodStart)} au ${formatInvoiceDate(invoice.periodEnd)}`;
  }

  if (invoice.periodStart) {
    return `À partir du ${formatInvoiceDate(invoice.periodStart)}`;
  }

  if (invoice.createdAt) {
    return `Émise le ${formatInvoiceDate(invoice.createdAt)}`;
  }

  return "Période non disponible";
};

const formatInvoiceAmount = (invoice: StripeInvoice) => {
  if (invoice.amount === null || Number.isNaN(invoice.amount)) {
    return "Montant indisponible";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: (invoice.currency ?? "EUR").toUpperCase(),
  }).format(invoice.amount);
};

const getInvoiceStatusLabel = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return "Payée";
    case "OPEN":
      return "Ouverte";
    case "DRAFT":
      return "Brouillon";
    case "VOID":
      return "Annulée";
    case "UNCOLLECTIBLE":
      return "Impayée";
    default:
      return status ?? "Inconnu";
  }
};

const getInvoiceStatusClassName = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return "bg-green-500/10 text-green-300 border border-green-500/30";
    case "OPEN":
      return "bg-blue-500/10 text-blue-300 border border-blue-500/30";
    case "DRAFT":
      return "bg-white/10 text-white/70 border border-white/20";
    case "VOID":
    case "UNCOLLECTIBLE":
      return "bg-red-500/10 text-red-300 border border-red-500/30";
    default:
      return "bg-white/10 text-white/70 border border-white/20";
  }
};

const DEFAULT_PAGINATION: Omit<StripeInvoicesPage, "invoices"> = {
  total: 0,
  page: 1,
  limit: INVOICES_PER_PAGE,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

interface BillingHistorySectionProps {
  userId: string | null;
  refreshKey?: number;
}

export default function BillingHistorySection({
  userId,
  refreshKey = 0,
}: BillingHistorySectionProps) {
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] =
    useState<Omit<StripeInvoicesPage, "invoices">>(DEFAULT_PAGINATION);

  const fetchInvoices = useCallback(
    async (page: number) => {
      if (!userId) {
        setInvoices([]);
        setInvoicesError(null);
        setIsInvoicesLoading(false);
        setPagination(DEFAULT_PAGINATION);
        return;
      }

      try {
        setIsInvoicesLoading(true);
        setInvoicesError(null);

        const data = await getInvoicesAction(page, INVOICES_PER_PAGE);

        setInvoices(data.invoices);
        setPagination({
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPreviousPage: data.hasPreviousPage,
        });

        if (data.page !== page) {
          setCurrentPage(data.page);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des factures Stripe :",
          error,
        );
        setInvoicesError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les factures Stripe.",
        );
      } finally {
        setIsInvoicesLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [currentPage, fetchInvoices, refreshKey]);

  const handleOpenPortal = async () => {
    if (!userId) {
      return;
    }

    setIsOpeningPortal(true);

    try {
      const { url } = await getPortalSessionAction();
      const portalWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (!portalWindow) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du portail Stripe :", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'ouvrir le portail Stripe.",
      );
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <CiCreditCard1
              size={20}
              className="sm:w-6 sm:h-6 text-tertiary-400"
            />
            <div>
              <h2 className="text-lg sm:text-xl text-white font-one">
                Historique de facturation
              </h2>
              <p className="text-white/60 font-one text-xs sm:text-sm mt-1">
                Consultez vos dernières factures Stripe et gérez vos moyens de
                paiement.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenPortal}
            disabled={isOpeningPortal || !userId}
            className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOpeningPortal ? "Ouverture..." : "Ouvrir le portail Stripe"}
          </button>
        </div>

        {isInvoicesLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-tertiary-400"></div>
            <span className="ml-2 text-white/70 text-sm font-one">
              Chargement des factures...
            </span>
          </div>
        ) : invoicesError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-3">
            <p className="text-red-300 text-sm font-one">{invoicesError}</p>
            <button
              onClick={() => fetchInvoices(currentPage)}
              className="cursor-pointer px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-200 rounded-lg border border-red-500/20 transition-colors font-medium font-one text-xs"
            >
              Réessayer
            </button>
          </div>
        ) : invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-xl border border-white/10 bg-noir-500/30 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white font-one font-semibold text-sm">
                        {formatInvoiceAmount(invoice)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-one ${getInvoiceStatusClassName(invoice.status)}`}
                      >
                        {getInvoiceStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <p className="text-white/70 text-xs font-one">
                      {formatInvoicePeriod(invoice)}
                    </p>
                    <p className="text-white/50 text-xs font-one">
                      Référence: {invoice.number ?? invoice.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-one text-xs"
                      >
                        Télécharger le PDF
                      </a>
                    )}
                    {invoice.hostedUrl && (
                      <a
                        href={invoice.hostedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-tertiary-500/15 hover:bg-tertiary-500/25 text-tertiary-400 rounded-lg border border-tertiary-500/25 transition-colors font-one text-xs"
                      >
                        Voir sur Stripe
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-white/50 text-xs font-one">
                {pagination.total > 0
                  ? `Affichage de ${
                      (pagination.page - 1) * pagination.limit + 1
                    } à ${Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )} sur ${pagination.total} factures`
                  : "Aucune facture à afficher"}
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={!pagination.hasPreviousPage || isInvoicesLoading}
                  className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-white/70 text-xs font-one min-w-[88px] text-center">
                  Page {pagination.page}
                  {pagination.totalPages > 0
                    ? ` / ${pagination.totalPages}`
                    : ""}
                </span>
                <button
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={!pagination.hasNextPage || isInvoicesLoading}
                  className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-noir-500/20 p-4">
            <p className="text-white/70 text-sm font-one">
              Aucune facture Stripe disponible pour le moment.
            </p>
            <p className="text-white/50 text-xs font-one mt-1">
              Dès qu&apos;une facturation est émise, elle apparaîtra ici avec
              les liens PDF et Stripe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
