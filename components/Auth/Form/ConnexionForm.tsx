"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { userLoginSchema } from "@/lib/zod/validator.schema";
import styles from "../AuthForms.module.css";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import FormFeedback from "@/components/Shared/FormFeedback";
import Link from "next/link";

import { getSession, signIn } from "next-auth/react";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";
import DashboardButton from "@/components/Shared/DashboardButton";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCallbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl = rawCallbackUrl?.startsWith("/")
    ? rawCallbackUrl
    : null;
  const signupHref = safeCallbackUrl
    ? `${ROUTES.inscription}?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
    : ROUTES.inscription;

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [signupNotice, setSignupNotice] = useState<{
    email?: string | null;
    plan?: string | null;
  } | null>(null);

  // ✅ Vérifier si l'utilisateur arrive avec un callback ou erreur
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const codeParam = searchParams.get("code");

    if (typeof window !== "undefined") {
      const hasSignupNotice = sessionStorage.getItem("signup_notice_pending");
      const signupEmail = sessionStorage.getItem("signup_notice_email");
      const signupPlan = sessionStorage.getItem("signup_notice_plan");

      if (hasSignupNotice === "1") {
        toast.success("Un e-mail de vérification vous a été envoyé.", {
          id: "signup-email-verification",
          description: "Consultez votre boîte de réception et vos courriers indésirables pour activer votre compte Inkera Studio.",
          duration: 12000,
        });
        setSignupNotice({
          email: signupEmail,
          plan: signupPlan,
        });

        // Message one-shot: on le retire après affichage.
        sessionStorage.removeItem("signup_notice_pending");
        sessionStorage.removeItem("signup_notice_email");
        sessionStorage.removeItem("signup_notice_plan");
      }
    }

    if (errorParam === "CredentialsSignin") {
      if (codeParam && codeParam !== "credentials") {
        setError(codeParam);
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } else if (safeCallbackUrl) {
      setError("Veuillez vous connecter pour continuer.");
    }
  }, [searchParams, safeCallbackUrl]);

  const form = useForm<z.infer<typeof userLoginSchema>>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof userLoginSchema>) => {
    setError("");
    setSuccess("");
    setSignupNotice(null);
    setIsPending(true);

    try {
      // Utiliser NextAuth pour la connexion
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.code && result.code !== "credentials") {
          setError(result.code);
        } else {
          setError("Email ou mot de passe incorrect.");
        }
        setIsPending(false);
        return;
      }

      setSuccess("Connexion réussie !");

      // Récupérer le callbackUrl ou rediriger selon le plan utilisateur.
      let callbackUrl = safeCallbackUrl || ROUTES.dashboard;

      if (!safeCallbackUrl) {
        const session = await getSession();
        const isFreePlan =
          String(session?.user?.saasPlan || "")
            .trim()
            .toUpperCase() === "FREE";

        if (isFreePlan) {
          callbackUrl = "/mon-compte";
        }
      }

      setSuccess("Redirection...");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setError("Impossible de se connecter. Veuillez réessayer plus tard.");
      setIsPending(false);
    }
  };

  return (
    <div>
      <div className={styles.card}>
        <header className={styles.heading}>
          <span className={styles.kicker}><LockKeyhole size={13} />Votre espace Inkera</span>
          <h1>Heureux de vous retrouver.</h1>
          <p>Connectez-vous pour retrouver votre studio et vos projets.</p>
        </header>
        <form method="post" onSubmit={form.handleSubmit(onSubmit)} className={styles.form} aria-busy={isPending}>
          <div className={styles.field}>
            <label htmlFor="mail">Adresse e-mail</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
              <input id="mail" type="email" placeholder="vous@votrestudio.fr" autoComplete="email" autoCapitalize="none" required disabled={isPending}
                className={styles.withIcon} aria-invalid={!!form.formState.errors.email} aria-describedby={form.formState.errors.email ? "login-email-error" : undefined} {...form.register("email")} />
            </div>
            {form.formState.errors.email && <p id="login-email-error" className={styles.error}>{form.formState.errors.email.message}</p>}
          </div>
          <div className={styles.field}>
            <div className={styles.labelRow}><label htmlFor="password">Mot de passe</label><Link href="/motdepasseoublie">Mot de passe oublié ?</Link></div>
            <div className={styles.inputWrap}>
              <LockKeyhole size={16} className={styles.inputIcon} aria-hidden="true" />
              <input id="password" type={showPassword ? "text" : "password"} placeholder="Votre mot de passe" autoComplete="current-password" required disabled={isPending}
                className={styles.withIcon} aria-invalid={!!form.formState.errors.password} aria-describedby={form.formState.errors.password ? "login-password-error" : undefined} {...form.register("password")} />
              <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword} aria-controls="password">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {form.formState.errors.password && <p id="login-password-error" className={styles.error}>{form.formState.errors.password.message}</p>}
          </div>
          <div className="space-y-3">
            {error === "Veuillez vous connecter pour continuer." ? <FormFeedback variant="info" title="Connexion requise" message={error} /> : <FormError title="Connexion impossible" message={error} />}
            {signupNotice && <FormSuccess title="Compte créé avec succès" message={`${signupNotice.email ? `Un e-mail de vérification a été envoyé à ${signupNotice.email}.` : "Un e-mail de vérification vous a été envoyé."} Confirmez votre adresse avant de vous connecter.`}>
              {signupNotice.plan && signupNotice.plan !== "FREE" && <p>Le plan {signupNotice.plan} sera activé après validation du paiement Stripe. En attendant, votre compte reste en version FREE.</p>}
            </FormSuccess>}
            <FormSuccess title="Connexion réussie" message={success} />
          </div>
          <DashboardButton type="submit" className="w-full" disabled={isPending}>
            {isPending ? <><LoaderCircle size={16} className="animate-spin" />{success ? "Redirection…" : "Connexion…"}</> : <>Se connecter<ArrowRight size={16} /></>}
          </DashboardButton>
        </form>
      </div>
      <p className={styles.footnote}>Vous découvrez Inkera ? <Link href={signupHref}>Créer un compte</Link></p>
    </div>
  );
};
