"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Gift } from "lucide-react";
import { toast } from "sonner";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import {
  grantAdminSubscription,
  previewAdminSubscription,
  type StripeGiftPreview,
} from "@/lib/queries/admin-subscriptions";
import styles from "./UserSubscriptionEditor.module.css";
const date = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
function price(preview: StripeGiftPreview) {
  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: preview.currency,
  });
  const amount = formatter.format(
    preview.amount /
      10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2),
  );
  const interval =
    (
      { day: "jour", week: "semaine", month: "mois", year: "an" } as Record<
        string,
        string
      >
    )[preview.interval] || preview.interval;
  return (
    amount +
    " / " +
    (preview.intervalCount > 1 ? preview.intervalCount + " " : "") +
    interval
  );
}
export default function UserSubscriptionEditor({
  userId,
  role,
  hasStripeSubscription,
}: {
  userId: string;
  role: "user_salon" | "user_tatoueur";
  hasStripeSubscription: boolean;
}) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("12");
  const [unit, setUnit] = useState<"MONTHS" | "DAYS">("MONTHS");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<StripeGiftPreview | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const plan = role === "user_salon" ? "Business" : "Pro";
  const resetPreview = () => {
    setPreview(null);
    setConfirmed(false);
    setError("");
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (hasStripeSubscription && !preview) {
        const result = await previewAdminSubscription(
          userId,
          Number(duration),
          unit,
        );
        if (!result.ok || !result.preview)
          setError(result.message || "Vérification impossible.");
        else setPreview(result.preview);
        return;
      }
      if (hasStripeSubscription && !confirmed) return;
      const result = await grantAdminSubscription(
        userId,
        Number(duration),
        unit,
        preview?.confirmation,
        preview?.requestId,
      );
      if (!result.ok || !result.subscription) {
        setError(result.message || "Modification impossible.");
        return;
      }
      toast.success(
        result.autoResume
          ? `Offre programmée. Reprise automatique le ${date(result.subscription.endDate)}.`
          : `Abonnement ${plan} offert jusqu’au ${date(result.subscription.endDate)}.`,
      );
      setOpen(false);
      resetPreview();
      router.refresh();
    } catch {
      setError(
        "La demande n’a pas pu être confirmée. Rechargez la fiche pour vérifier l’abonnement.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => {
          resetPreview();
          setOpen(true);
        }}
        aria-label="Modifier l’abonnement"
      >
        <Pencil size={12} aria-hidden="true" />
        Modifier
      </button>
      {open && (
        <SideFormDrawer
          title="Modifier l’abonnement"
          category="Offre accordée par l’administration"
          description={
            hasStripeSubscription
              ? "La période offerte commence après la période déjà payée. La facturation Stripe reprend automatiquement à son terme."
              : "La nouvelle période offerte commence à l’enregistrement et remplace la période actuelle."
          }
          busy={busy}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={styles.secondary}
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Annuler
              </button>
              <button
                type="submit"
                form={formId}
                disabled={
                  busy || (hasStripeSubscription && !!preview && !confirmed)
                }
                className={styles.primary}
              >
                {busy
                  ? "Enregistrement…"
                  : hasStripeSubscription
                    ? preview
                      ? "Confirmer l’offre et la reprise"
                      : "Vérifier les dates et le tarif"
                    : "Enregistrer l’offre gratuite"}
              </button>
            </>
          }
        >
          <form id={formId} onSubmit={submit} className={styles.form}>
            <div className={styles.offer}>
              <Gift size={20} aria-hidden="true" />
              <div>
                <strong>{plan} offert</strong>
                <p>
                  {role === "user_salon"
                    ? "Compte salon"
                    : "Compte tatoueur indépendant"}{" "}
                  · 0 € pendant la période offerte
                </p>
              </div>
            </div>
            <label className={styles.field}>
              Abonnement
              <select value={plan} disabled className={styles.input}>
                <option value={plan}>
                  {plan} — {role === "user_salon" ? "Salon" : "Indépendant"}
                </option>
              </select>
            </label>
            <div className={styles.duration}>
              <label className={styles.field}>
                Durée accordée
                <input
                  type="number"
                  min="1"
                  max={unit === "MONTHS" ? 120 : 3650}
                  step="1"
                  required
                  value={duration}
                  disabled={busy}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    resetPreview();
                  }}
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                Unité
                <select
                  value={unit}
                  disabled={busy}
                  onChange={(e) => {
                    setUnit(e.target.value as "MONTHS" | "DAYS");
                    resetPreview();
                  }}
                  className={styles.input}
                >
                  <option value="MONTHS">Mois</option>
                  <option value="DAYS">Jours</option>
                </select>
              </label>
            </div>
            {preview && (
              <div className={styles.offer} role="status">
                <div>
                  <strong>Dates de l’offre et reprise</strong>
                  <p>Période déjà payée jusqu’au {date(preview.startDate)}.</p>
                  <p>
                    Offre gratuite du {date(preview.startDate)} au{" "}
                    {date(preview.endDate)}.
                  </p>
                  <p>
                    Reprise automatique le {date(preview.endDate)} au tarif de
                    base de {price(preview)}, hors taxes et remises éventuelles.
                  </p>
                </div>
              </div>
            )}
            {preview && (
              <label className={styles.field}>
                <span>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    disabled={busy}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />{" "}
                  Je confirme cette période offerte et la reprise automatique du
                  prélèvement à la date indiquée.
                </span>
              </label>
            )}
            <p className={styles.note}>
              {hasStripeSubscription
                ? "Le tarif et le moyen de paiement existants sont conservés. Aucune nouvelle facturation de période n’est déclenchée à l’enregistrement. Le client pourra toujours résilier son abonnement."
                : "La durée débute aujourd’hui. Aucun paiement ni renouvellement automatique : à l’échéance, le compte repassera en Free."}
            </p>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
          </form>
        </SideFormDrawer>
      )}
    </>
  );
}
