import styles from "./AdminShell.module.css";

const descriptions: Record<string, string> = {
  "Vue d’ensemble":
    "Les chiffres essentiels, les dossiers à traiter et vos outils de gestion, au même endroit.",
  "Gestion des utilisateurs":
    "Retrouvez les comptes, leur date d’inscription et leur ancienneté sur Inkera.",
  "Vérification des salons":
    "Consultez les pièces reçues et traitez les demandes de vérification.",
  Articles: "Préparez et gérez les publications de la plateforme.",
  "Gestion des Articles":
    "Préparez, retrouvez et mettez à jour les publications de la plateforme.",
  "Fiche Utilisateur":
    "Informations du compte, ancienneté sur Inkera, équipe et documents de vérification.",
  "Nouvel Article":
    "Rédigez votre publication, ajoutez ses visuels puis publiez-la.",
};

export default function AdminPageHeader({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.heading}>
      <div>
        <div className={styles.headingIcon}>
          {icon}
          <span>Inkera Studio</span>
        </div>
        <h1>{title}</h1>
        {(description || descriptions[title]) && (
          <p>{description || descriptions[title]}</p>
        )}
      </div>
      {children && <div className={styles.headingActions}>{children}</div>}
    </header>
  );
}
