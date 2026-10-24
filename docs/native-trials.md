# Périodes offertes gérées par Inkera

## Comportement

| Compte et formule | Durée initiale | Carte à l'inscription |
| --- | --- | --- |
| Indépendant, Pro | 3 mois calendaires par défaut | Non |
| Salon, Business | 60 jours | Non |

Le backend conserve l'échéance dans `User.saasPlanUntil` et `SaasPlanDetails.trialEndDate`, avec le statut `TRIAL` et les fonctionnalités du plan. Le paramètre backend existant `TATOUEUR_PRO_TRIAL_MONTHS` peut ajuster la durée Pro ; son défaut est 3 mois. Business reste réservé aux salons.

L'inscription ne crée pas de checkout Stripe pour ces essais, même si le client en demande un. La souscription est une action ultérieure explicite depuis **Paramètres → Abonnement et factures**. Un bouton permet de souscrire au plan déjà utilisé pendant l'essai.

Le checkout ne donne plus 60 jours supplémentaires. Une souscription anticipée au même plan reprend uniquement l'échéance Inkera restante : date de fin explicite lorsqu'elle est assez éloignée, sinon ancrage de facturation sans prorata. Un essai déjà terminé ne donne pas lieu à un nouvel essai Stripe. Références : [paramètres du checkout Stripe](https://docs.stripe.com/api/checkout/sessions/create), types du SDK Stripe installé.

## Rappels

- E-mails à J-7, J-3 et J-1, avec date de fin, formule et bouton vers `/parametres#facturation`.
- Notification compacte dans l'app pendant les sept derniers jours, au même emplacement que les documents manquants. Masquable pour la journée, actualisée toutes les cinq minutes et au retour sur l'onglet.
- Un utilisateur ayant souscrit ne reçoit plus de rappel à souscrire. Chaque envoi relit le statut et l'échéance avant de partir.
- Après une interruption du worker, seul le dernier palier déjà atteint est rattrapé ; les trois mails ne partent pas ensemble.

La file Bull existante `saas-billing` conserve les identifiants uniques des rappels terminés afin d'éviter les renvois lors des scans et redémarrages. Trois tentatives avec délai exponentiel sont prévues en cas d'erreur d'envoi. Ce mécanisme repose sur la persistance Redis existante ; une acceptation Mailgun suivie d'un arrêt avant l'acquittement du job peut encore entraîner un doublon lors d'une reprise.

## Fin de la période

Sans souscription, l'accès revient à Free. Le contrôle périodique passe d'une fréquence quotidienne à horaire. L'échéance est également contrôlée lors de la lecture du plan et des actions protégées, pour ne pas prolonger l'accès jusqu'au prochain scan. Les données ne sont pas supprimées par ce passage à Free.

Les abonnements Stripe existants restent compatibles avec les webhooks en place. Les essais Stripe déjà créés ne sont pas annulés ou migrés par ces modifications locales.

## Mise en service

Changements présents dans les deux dépôts : frontend courant et backend voisin `D:/CORPORATE/INKERA/Backend/TattooStudio-Backend/tattoo-studio-back`.

Déployer le backend avec les nouveaux fichiers `trial-policy.ts` et `saas-trial-reminder.service.ts`, le worker Bull et le scheduler, puis le frontend. Aucune migration Prisma n'est nécessaire. L'URL frontend backend doit être une URL publique valide, et Mailgun, Redis ainsi que les webhooks Stripe doivent être opérationnels.

Aucun déploiement, envoi réel, abonnement ou paiement n'a été effectué pendant cette tâche.

## Validation

104 tests backend passent sur les six suites auth, SaaS, rappels, mails et Stripe. Ils couvrent notamment les inscriptions natives, les échéances, les rappels périmés ou déjà souscrits, le rattrapage après interruption et la reprise de l'échéance dans le checkout. Les deux compilations TypeScript passent, ainsi que l'ESLint ciblé. `node scripts/check-trial-notices.cjs` valide 16 cas côté frontend.
