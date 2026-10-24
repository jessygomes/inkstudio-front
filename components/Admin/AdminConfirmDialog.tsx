"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./AdminShell.module.css";

export default function AdminConfirmDialog({
  open,
  title,
  children,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      role="alertdialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id={titleId}>{title}</h2>
      <div className="mt-4">{children}</div>
      <div className={styles.dialogActions}>
        <button
          autoFocus
          className="admin-button"
          disabled={busy}
          onClick={onCancel}
        >
          Conserver
        </button>
        <button
          className="admin-button admin-button-danger"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Suppression…" : "Supprimer"}
        </button>
      </div>
    </dialog>
  );
}
