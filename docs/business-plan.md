# Rétablissement de Business — 23 octobre 2026

**Mise à jour :** à la demande suivante, les périodes offertes des deux formules sont désormais gérées par Inkera, sans carte à l'inscription. Les 60 jours Business ne sont plus accordés par un nouveau trial Stripe. Voir [le fonctionnement actuel des essais et rappels](native-trials.md). Les éléments ci-dessous décrivent l'état constaté lors du rétablissement initial.

- Inscription : Business est proposé aux comptes `user_salon` uniquement. Les choix Business conservés dans le lien d'inscription sont préselectionnés pour les salons et rejetés pour les indépendants.
- Tarification : la carte Business est active. Un visiteur est dirigé vers l'inscription avec Business préselectionné ; un salon connecté est dirigé vers la gestion de son abonnement. Les autres comptes connectés ne peuvent pas choisir Business.
- Paramètres : Business est masqué pour les comptes non salon.
- Backend voisin : restriction vérifiée à l'inscription, au checkout Stripe, au changement d'abonnement existant et à l'attribution du plan SaaS.

## Essai gratuit

Le checkout Stripe utilise actuellement `trial_period_days: 60` et demande un moyen de paiement. Cela s'applique à Business. La durée n'a pas été modifiée.

L'offre de trois mois est distincte : elle concerne les indépendants en Pro. Elle ne s'applique pas automatiquement à Business. L'interface Business indique donc 60 jours d'essai, puis le tarif affiché de 59,99 €/mois. `STRIPE_PRICE_BUSINESS` est renseigné dans la configuration locale ; la configuration déployée et le prix Stripe réel n'ont pas été modifiés ni contrôlés à distance.

## Validation

Six combinaisons rôle/plan vérifiées côté frontend. Les tests backend couvrent le checkout salon Pro et Business avec 60 jours d'essai, le refus de Business pour les indépendants/clients/admins avant tout appel Stripe et le refus d'un plan ou checkout Business à l'inscription indépendante.

La compilation backend passe. La suite ciblée Stripe/SaaS/authentification compte 31 tests réussis et trois échecs existants dans l'authentification : attentes de données de connexion ne prenant pas en compte `agendaMode`/`profileImage`, et mock de réinitialisation sans `deleteMany`. Les nouveaux tests Business passent.

Aucun abonnement réel, essai, compte ou paiement n'a été créé. Les changements sont locaux, sans déploiement.
