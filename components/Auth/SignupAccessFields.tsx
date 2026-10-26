"use client";

import { useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Check, Circle, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import type { step3Schema } from "@/lib/zod/validator.schema";
import styles from "./AuthForms.module.css";

export type SignupAccessValues = z.infer<typeof step3Schema>;

export default function SignupAccessFields({ form, disabled }: { form: UseFormReturn<SignupAccessValues>; disabled: boolean }) {
  const [visible, setVisible] = useState({ password: false, passwordConfirmation: false });
  const [password = "", confirmation = ""] = useWatch({ control: form.control, name: ["password", "passwordConfirmation"] });
  const criteria = [
    { label: "8 caractères minimum", valid: password.length >= 8 },
    { label: "Un chiffre", valid: /\d/.test(password) },
    { label: "Un caractère spécial", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  return <div className={styles.accessFields}>
    <p className={styles.accessIntro}>Dernière étape : indiquez vos coordonnées et créez vos identifiants de connexion. <span>Les champs marqués d’un * sont obligatoires.</span></p>
    <fieldset className={styles.accessSection} disabled={disabled}>
      <legend><UserRound size={15} aria-hidden="true" />Vos coordonnées</legend>
      <div className={styles.accessGrid}>
        {([
          { name: "firstName", label: "Prénom", placeholder: "Votre prénom", complete: "given-name", type: "text", icon: UserRound, required: true },
          { name: "lastName", label: "Nom", placeholder: "Votre nom", complete: "family-name", type: "text", icon: UserRound, required: true },
          { name: "email", label: "Adresse e-mail", placeholder: "vous@votrestudio.fr", complete: "email", type: "email", icon: Mail, required: true },
          { name: "phone", label: "Téléphone", placeholder: "06 12 34 56 78", complete: "tel", type: "tel", icon: Phone, required: false },
        ] as const).map(({ name, label, placeholder, complete, type, icon: Icon, required }) => <div key={name} className={styles.field}>
          <label htmlFor={name}>{label}{required ? " *" : <span className={styles.optional}>Facultatif</span>}</label>
          <div className={styles.inputWrap}>
            <Icon size={15} className={styles.inputIcon} aria-hidden="true" />
            <input id={name} type={type} autoComplete={complete} autoCapitalize={type === "email" ? "none" : undefined} placeholder={placeholder} required={required} className={styles.withIcon}
              aria-invalid={!!form.formState.errors[name]} aria-describedby={form.formState.errors[name] ? `${name}-error` : undefined} {...form.register(name)} />
          </div>
          {form.formState.errors[name] && <p id={`${name}-error`} className={styles.error}>{form.formState.errors[name]?.message}</p>}
        </div>)}
      </div>
      <p className={styles.accessNote}>Un e-mail de vérification vous sera envoyé pour activer votre compte.</p>
    </fieldset>
    <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor="website">Website</label><input id="website" type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
    </div>
    <fieldset className={styles.accessSection} disabled={disabled}>
      <legend><LockKeyhole size={15} aria-hidden="true" />Vos identifiants</legend>
      <div className={styles.field}>
        <label htmlFor="password">Mot de passe *</label>
        <div className={styles.inputWrap}>
          <LockKeyhole size={15} className={styles.inputIcon} aria-hidden="true" />
          <input id="password" type={visible.password ? "text" : "password"} autoComplete="new-password" placeholder="Créez votre mot de passe" minLength={8} required className={styles.withIcon}
            aria-invalid={!!form.formState.errors.password} aria-describedby={`password-criteria${form.formState.errors.password ? " password-error" : ""}`} {...form.register("password")} />
          <button type="button" className={styles.passwordToggle} onClick={() => setVisible(current => ({ ...current, password: !current.password }))}
            aria-label={visible.password ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={visible.password} aria-controls="password">{visible.password ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        {form.formState.errors.password && <p id="password-error" className={styles.error}>{form.formState.errors.password.message}</p>}
      </div>
      <ul id="password-criteria" className={styles.passwordCriteria}>{criteria.map(({ label, valid }) => <li key={label} data-valid={valid}>
        {valid ? <Check size={12} aria-hidden="true" /> : <Circle size={10} aria-hidden="true" />}<span className="sr-only">{valid ? "Critère rempli : " : "Critère à remplir : "}</span>{label}
      </li>)}</ul>
      <div className={styles.field}>
        <label htmlFor="passwordConfirmation">Confirmez le mot de passe *</label>
        <div className={styles.inputWrap}>
          <LockKeyhole size={15} className={styles.inputIcon} aria-hidden="true" />
          <input id="passwordConfirmation" type={visible.passwordConfirmation ? "text" : "password"} autoComplete="new-password" placeholder="Saisissez-le une seconde fois" minLength={8} required className={styles.withIcon}
            aria-invalid={!!form.formState.errors.passwordConfirmation} aria-describedby={form.formState.errors.passwordConfirmation ? "password-confirmation-error" : confirmation ? "password-match" : undefined} {...form.register("passwordConfirmation")} />
          <button type="button" className={styles.passwordToggle} onClick={() => setVisible(current => ({ ...current, passwordConfirmation: !current.passwordConfirmation }))}
            aria-label={visible.passwordConfirmation ? "Masquer la confirmation" : "Afficher la confirmation"} aria-pressed={visible.passwordConfirmation} aria-controls="passwordConfirmation">{visible.passwordConfirmation ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        {form.formState.errors.passwordConfirmation ? <p id="password-confirmation-error" className={styles.error}>{form.formState.errors.passwordConfirmation.message}</p> : confirmation && <p id="password-match" className={styles.passwordMatch} data-valid={password === confirmation}>
          {password === confirmation ? "Les mots de passe correspondent." : "Les mots de passe ne correspondent pas encore."}
        </p>}
      </div>
    </fieldset>
  </div>;
}
