# Administration Inkera

L'interface dispose d'une navigation commune : vue d'ensemble, utilisateurs, vérifications, styles, catégories, articles et statistiques. Les neuf pages incluent désormais un en-tête lisible sur ordinateur comme sur mobile. Les titres masqués sur grand écran et les accès sans action du tableau de bord ont été remplacés.

## Ancienneté des comptes

Les listes de professionnels et de clients, les fiches et les aperçus affichent une durée lisible et la date d'inscription. Le calcul utilise `User.createdAt`, jamais la date du dernier changement ni celle du premier abonnement. Les durées suivent les jours calendaires à Paris, avec gestion des fins de mois et des changements d'heure.

Le backend ajoute `membership` aux utilisateurs renvoyés par les listes admin et les fiches : `since`, `years`, `months`, `days`, `totalDays`, `label`. L'ancienneté est recalculée également sur les réponses mises en cache. Aucune migration de base de données n'est nécessaire.

## Styles et catégories

- Nouvelle page `/admin/styles` avec recherche, nombre de photos associées et création/modification/suppression.
- Page `/admin/categories` reconstruite avec recherche, filtre de visibilité, ordre d'affichage, identifiant et activation/masquage.
- Correction du contrat des actions frontend : l'API renvoie `{ categories }` et `{ styles }`, plutôt qu'un tableau à la racine. Les mutations utilisent les objets `{ category }` ou `{ style }`.
- Confirmation explicite avant suppression. Les associations concernées sont indiquées, les photos conservées.
- Validation des longueurs et de l'ordre côté backend, avec retour clair en cas de doublon concurrent sur les styles.
- Les endpoints restent protégés par les guards JWT et administrateur existants.

Les modifications d'interface couvrent également les comptes, les fiches, les dossiers, les statistiques et les pages de publication. La suppression d'un article utilise désormais une fenêtre de confirmation et les formulaires possèdent des libellés visibles.

## Contrôles

- 17 tests backend admin réussis : ancienneté, cache, contrats de réponse, doublons, renommage transactionnel et associations des portfolios, validations.
- Compilations TypeScript frontend/backend et ESLint ciblé réussis.
- 36 contrôles de mise en page dans Chrome : neuf pages aux largeurs 390, 768, 1024 et 1440 px, sans débordement horizontal de page.
- Parcours navigateur avec API fictive : recherche, visibilité, création, modification, suppression/annulation, erreur de chargement puis reprise, ancienneté des clients et professionnels, taille de la fenêtre mobile et fermeture avec Échap.

L'aperçu de test utilise les composants réels avec des données fictives et des appels API simulés. Il ne valide pas une session administrateur réelle, des envois, des uploads ou une connexion au backend déployé. Les captures contiennent uniquement des données de démonstration : [ordinateur](admin-preview/desktop.png), [mobile](admin-preview/mobile.png).

Les changements se trouvent dans le frontend et le backend voisin `D:/CORPORATE/INKERA/Backend/TattooStudio-Backend/tattoo-studio-back`. Aucun compte, style, catégorie, photo ou article réel n'a été modifié pendant les contrôles ; aucun déploiement n'a été effectué.
