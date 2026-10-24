# Vérifications et statistiques admin

## Vérification professionnelle

Le statut du compte (`verifiedSalon`) est désormais distinct du statut de chaque pièce. L’ancienne carte affichait « En attente » sans lire ce champ et omettait `documentStatus` dans les actions. Un compte peut légitimement être vérifié tout en ayant une pièce supplémentaire à examiner : le backend exige la validation du justificatif `HYGIENE_SALUBRITE`.

Les pièces approuvées affichent « Consulté et vérifié », leur date d’examen lorsqu’elle est disponible, un aperçu et une action « Dévalider le fichier ». La dévalidation demande un motif, prévient de l’incidence possible sur le compte et rafraîchit les données. La boîte de dialogue native permet la navigation clavier et la fermeture par Échap. Aucun fichier n’est automatiquement approuvé à partir du statut du profil.

La file des dossiers ne lit plus son ancien cache de dix minutes : une pièce traitée doit disparaître immédiatement de cette file. Les dossiers entièrement traités restent consultables dans les fiches utilisateurs.

## Statistiques

- KPI plus compacts sur la page statistiques.
- Graphiques à échelle proportionnelle, axes gradués à partir de zéro, valeurs et mois avec année, couleurs distinctes.
- Périodes de 6/12/24 mois, regroupement mensuel ou annuel, détails en tableau et reprise après erreur.
- Le mois courant et les regroupements annuels incomplets sont signalés. Les périodes suivent les mois civils de Paris, indépendamment du fuseau du serveur.
- Suppression de l’affichage des anciens « revenus » : l’API estimait un historique à partir des formules actuelles, sans factures ni paiements.
- Le classement des professionnels est présenté comme des visites de profils, et non comme une mesure de leur activité dans l’app.

## Comptes professionnels supprimés

La migration backend `20261024120000_account_departure_metrics` ajoute `AccountDeparture` et `AdminMetricTracking`. Elle initialise le début du suivi à la date de son application. Le service de suppression admin écrit l’événement **dans la transaction qui supprime le compte**. Il conserve le rôle, la date et la source administrative, sans identifiant utilisateur, nom ou e-mail. Les clients ne sont pas inclus dans ce compteur.

L’API `/admin/evolution` renvoie `period`, `salons`, `appointments`, `departures` et `departuresTrackingSince`. Les mois non suivis ont `departures: null`, distinct de zéro. La première période suivie peut être partielle. Le paramètre `months` est borné entre 1 et 24. L’ancien champ d’estimation `revenue` a été retiré ; le frontend de ce dépôt a été adapté.

Le suivi couvre le chemin de suppression admin existant. Il ne mesure ni la résiliation d’un abonnement Stripe, ni un départ volontaire attesté, ni une suppression manuelle en base. Les anciennes suppressions ne peuvent pas être reconstituées. Les inscriptions et RDV historiques restent des comptes des lignes encore présentes : leurs données peuvent disparaître avec un compte supprimé.

## Mise en service

Déployer le frontend et le backend. Dans le backend, appliquer les migrations avant de démarrer la nouvelle version :

```sh
npx prisma migrate deploy
npx prisma generate
```

Aucune migration ni modification de compte réel n’a été exécutée pendant cette intervention. Le suivi des suppressions démarre après application de la migration.

## Indicateurs à ajouter ensuite

| Indicateur | Période / lecture | Données nécessaires |
| --- | --- | --- |
| Inscriptions et départs par type de compte | Mois, année ; salon / indépendant | Événements durables d’inscription et de suppression |
| Essais actifs, échéances et conversion en abonnement | Mois de début d’essai, cohortes | Historique des essais et premier paiement confirmé |
| MRR, ARR et paiements encaissés | Fin de mois et année | Abonnements et factures Stripe, remises, remboursements et impayés |
| Résiliations, churn et motifs | Mois, année, Pro / Business | Événement de résiliation distinct de la suppression du compte |
| Rétention à 30/90/180 jours | Cohortes d’inscription | Événements d’activité définis et datés |
| Activation des comptes | Mois d’inscription | Profil complété, documents validés, premier RDV |
| Professionnels actifs et inactifs | 7/30/90 jours | Une définition commune d’activité métier |
| Délai de vérification | Médiane et 90e percentile mensuels | Historique des dépôts et décisions, incluant les remplacements |

Priorité recommandée : conversion des essais, résiliations/churn et MRR réel, avec séparation salon/indépendant. Ces chiffres ne sont pas affichés tant que leurs sources ne sont pas fiables.

## Validation

- 51 tests backend réussis dans les quatre suites admin et vérification concernées, dont le suivi transactionnel des suppressions, les bornes des périodes et la distinction entre zéro et absence d’historique.
- TypeScript frontend/backend, ESLint des pages et composants admin, validation du schéma Prisma et contrôles de diff réussis.
- 12 contrôles de mise en page navigateur à 390, 768, 1024 et 1440 px, sans débordement horizontal de page. Les graphiques conservent leur propre défilement lorsque nécessaire.
- Parcours navigateur : période de 24 mois, regroupement annuel, erreur et reprise, statut vérifié avec pièce supplémentaire en attente, motif obligatoire avant dévalidation, fermeture par Échap et rafraîchissement du statut.

Ces contrôles navigateur utilisent les composants réels avec une API simulée et des données de démonstration, sans connexion administrateur réelle ni changement sur le compte Gleamy Ink.

Captures : [statistiques ordinateur](admin-preview/stats-1440.png), [statistiques mobile](admin-preview/stats-390.png), [vérification mobile](admin-preview/verification-mobile.png).
