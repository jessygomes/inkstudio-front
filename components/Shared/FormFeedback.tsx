import type { ReactNode } from "react";
import { Check, Info, TriangleAlert } from "lucide-react";
import styles from "./FormFeedback.module.css";

export interface FormFeedbackProps {
  message?: string;
  title?: string;
  children?: ReactNode;
}

export default function FormFeedback({ variant, message, title, children }: FormFeedbackProps & { variant: "error" | "success" | "info" }) {
  if (!message) return null;
  const Icon = variant === "error" ? TriangleAlert : variant === "success" ? Check : Info;
  return (
    <div className={styles.feedback} data-variant={variant} role={variant === "error" ? "alert" : "status"} aria-atomic="true">
      <span className={styles.icon}><Icon size={16} aria-hidden="true" /></span>
      <div className={styles.content}>
        <p className={styles.title}>{title ?? (variant === "error" ? "Une erreur est survenue" : variant === "success" ? "Opération réussie" : "À savoir")}</p>
        <p className={styles.message}>{message}</p>
        {children && <div className={styles.details}>{children}</div>}
      </div>
    </div>
  );
}
