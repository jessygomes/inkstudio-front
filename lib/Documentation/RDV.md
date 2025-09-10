# 📅 Gestion des Rendez-vous - Module RDV

## Vue d'ensemble

Le module RDV constitue le cœur opérationnel d'InkStudio, permettant une gestion complète des rendez-vous de tatouage. Il offre une interface intuitive pour visualiser, créer, modifier et suivre tous les rendez-vous du studio.

## 🎯 Objectifs

Ce module permet aux professionnels du tatouage de :

- Visualiser tous leurs rendez-vous (passés, présents, futurs)
- Créer de nouveaux rendez-vous pour clients existants ou nouveaux
- Gérer les demandes de rendez-vous des clients
- Modifier, confirmer ou annuler des rendez-vous
- Suivre les statuts de paiement
- Gérer les créneaux horaires et disponibilités

## 🗂️ Structure du module

### Pages principales

#### 1. `/mes-rendez-vous` - Page principale

**Fichier** : `app/(root)/(application)/mes-rendez-vous/page.tsx`

Page d'accueil du module qui affiche le composant principal `RDV`.

#### 2. `/mes-rendez-vous/creer` - Création de RDV

**Fichier** : `app/(root)/(application)/mes-rendez-vous/creer/page.tsx`

Page dédiée à la création de nouveaux rendez-vous avec :

- **Authentification requise** : Redirection vers `/connexion` si non connecté
- **Header informatif** : Titre et description du processus
- **Formulaire complet** : `CreateRdvForm` pour saisir tous les détails

#### 3. `/mes-rendez-vous/demandes` - Gestion des demandes

**Fichier** : `app/(root)/(application)/mes-rendez-vous/demandes/page.tsx`

Page pour traiter les demandes de rendez-vous des clients via le composant `DemandesRdv`.

## 🧩 Composants principaux

### 1. `RDV.tsx` - Composant central

**Localisation** : `components/Application/RDV/RDV.tsx`

#### Fonctionnalités principales

**États et modes d'affichage** :

- **Mode calendrier** : Vue hebdomadaire/mensuelle/journalière
- **Mode liste** : Affichage paginé (5 RDV par page)
- **Responsive** : Adaptation mobile/desktop

**Système de filtrage avancé** :

- **Par statut** : PENDING, CONFIRMED, CANCELED, RESCHEDULING
- **Par date** : Tous, passés, à venir
- **Par prestation** : TATTOO, PIERCING, RETOUCHE, PROJET
- **Par tatoueur** : Sélection par artiste
- **Recherche textuelle** : Nom client, prestation, tatoueur

**Navigation temporelle** :

- Navigation par semaine/mois/jour
- Labels intelligents (Aujourd'hui, Cette semaine, etc.)
- Pagination pour le mode liste

**Gestion des interactions** :

- Clic sur événement → Détails complets
- Actions rapides (confirmer, annuler, modifier)
- Gestion statut de paiement

### 2. `Calendar.tsx` - Vue calendrier

**Localisation** : `components/Application/RDV/Calendar.tsx`

#### Configuration calendrier

**Localisation française** :

- Format dates français (dd/MM/yyyy)
- Jours de la semaine en français
- Messages interface localisés

**Plages horaires** :

- **Heures d'ouverture** : 9h00 - 19h00
- **Créneaux** : 30 minutes
- **Slots** : 2 par heure

**Styles par statut** :

- **PENDING** : Orange (#F59E0B)
- **CONFIRMED** : Vert (#10B981)
- **DECLINED** : Rouge (#EF4444)
- **CANCELED** : Gris foncé (#6B7280)

**Événements affichés** :

- Titre : `{prestation} - {prénom} {nom}`
- Durée visible
- Statut coloré
- Sélection d'événement

### 3. `CreateRdvForm.tsx` - Création de RDV

**Localisation** : `components/Application/RDV/CreateRdvForm.tsx`

#### Workflow de création

**Étape 1 : Sélection client**

- Client existant (recherche)
- Nouveau client (formulaire complet)

**Étape 2 : Type de prestation**

- **TATTOO** : Tatouage classique
- **PIERCING** : Piercing
- **RETOUCHE** : Retouche de tatouage
- **PROJET** : Consultation/projet

**Étape 3 : Détails spécifiques**

Selon le type :

- Zone anatomique
- Taille approximative
- Style et couleurs
- Images de référence
- Croquis personnalisé
- Prix estimé/final

**Étape 4 : Planification**

- Sélection tatoueur
- Choix date
- Créneaux disponibles (grille interactive)
- Vérification conflits

**Étape 5 : Validation**

- Récapitulatif complet
- Confirmation création
- Notification email automatique

### 4. `DemandesRdv.tsx` - Gestion des demandes

**Localisation** : `components/Application/RDV/DemandesRdv.tsx`

#### Traitement des demandes clients

**Types de statut** :

- **PENDING** : En attente de traitement
- **PROPOSED** : Créneaux proposés
- **DECLINED** : Refusée
- **ACCEPTED** : Acceptée (devient RDV)
- **CLOSED** : Clôturée

**Informations demande** :

- Coordonnées client
- Type de prestation souhaité
- Disponibilités proposées
- Message/description
- Images jointes

**Actions possibles** :

- Accepter → Création RDV automatique
- Proposer nouveaux créneaux
- Refuser avec message
- Marquer comme traitée

### 5. Composants d'actions

#### `ConfirmRdv.tsx` - Confirmation

**Actions** :

- Validation du rendez-vous
- Message personnalisé de confirmation
- Email automatique au client
- Mise à jour statut → CONFIRMED

#### `CancelRdv.tsx` - Annulation

**Actions** :

- Annulation avec motif
- Message d'explication
- Email notification client
- Mise à jour statut → CANCELED
- Libération des créneaux

#### `ChangeRdv.tsx` - Reprogrammation

**Actions** :

- Notification changement au client
- Message explicatif
- Email avec demande nouveau créneau
- Statut → RESCHEDULING

#### `UpdateRdv.tsx` - Modification

**Fonctionnalités avancées** :

- **Modification horaires** : Sélection nouveaux créneaux
- **Changement tatoueur** : Avec vérification disponibilités
- **Modification détails** : Prix, description, zone
- **Gestion intelligente** :
  - Détection conflits
  - Vérification créneaux consécutifs
  - Préservation créneaux initiaux
  - Validation cohérence

**Interface de sélection** :

- Grille horaire interactive
- Créneaux occupés/bloqués/disponibles
- Sélection multiple consécutive
- Comparaison avant/après

## 🎨 Design System

### Structure responsive

**Mobile** :

- Mode liste prioritaire
- Navigation simplifiée
- Modales plein écran
- Actions contextuelles

**Desktop** :

- Vue calendrier + liste
- Panneau latéral détails
- Filtres étendus
- Multi-actions

### Codes couleur par statut

```css
/* Statuts RDV */
.pending {
  background: #f59e0b;
} /* Orange */
.confirmed {
  background: #10b981;
} /* Vert */
.canceled {
  background: #6b7280;
} /* Gris */
.rescheduling {
  background: #3b82f6;
} /* Bleu */

/* États paiement */
.paid {
  color: #10b981;
} /* Vert */
.unpaid {
  color: #f59e0b;
} /* Orange */
.partial {
  color: #3b82f6;
} /* Bleu */
```

### Typographie et espacements

- **Font principale** : `font-one`
- **Titres** : `text-lg` à `text-xl`
- **Corps** : `text-sm` à `text-base`
- **Labels** : `text-xs`
- **Espacement** : Grid 4px (p-1, p-2, p-4, etc.)

## 🔄 Gestion des données

### États de chargement

**Pattern consistant** :

```tsx
{
  loading ? (
    <div className="animate-pulse">{/* Skeleton loaders */}</div>
  ) : error ? (
    <div className="error-state">{/* Message erreur + retry */}</div>
  ) : (
    <div className="content">{/* Contenu principal */}</div>
  );
}
```

### Mutations et cache

**React Query** :

- Cache automatique
- Invalidation intelligente
- Optimistic updates
- Retry automatique

**Actions principales** :

- `createAppointment` → Création
- `updateAppointment` → Modification
- `confirmAppointment` → Confirmation/Annulation
- `paidAppointments` → Statut paiement

### Synchronisation temps réel

**Invalidation cache** :

- Après création/modification
- Changement de vue
- Action utilisateur
- Refresh manuel

## 📱 Fonctionnalités avancées

### Gestion créneaux intelligente

**Détection conflits** :

- Vérification créneaux occupés
- Respect créneaux bloqués
- Validation consécutivité
- Alertes chevauchement

**Créneaux types** :

- **Disponibles** : Libre pour réservation
- **Occupés** : Déjà réservés
- **Bloqués** : Indisponibles (congés, pause)
- **Proposés** : En cours de négociation

### Notifications et emails

**Événements déclencheurs** :

- Création RDV → Email confirmation
- Modification → Email mise à jour
- Confirmation → Email validation
- Annulation → Email notification
- Rappel → Email/SMS 24h avant

### Export et rapports

**Fonctionnalités futures** :

- Export PDF planning
- Statistiques période
- Rapport revenus
- Analyse créneaux

## 🔐 Sécurité et permissions

### Contrôle d'accès

**Propriétaire studio** :

- Accès complet tous RDV
- Modification tous paramètres
- Gestion tatoueurs
- Administration créneaux

**Tatoueur** :

- Accès RDV personnels
- Modification limitée
- Pas d'accès administration

### Validation données

**Côté client** :

- Zod schemas validation
- React Hook Form
- Validation temps réel
- Messages erreur contextuels

**Côté serveur** :

- Validation business rules
- Contrôle cohérence
- Sanitization données
- Audit trail

## 🚀 Optimisations et performance

### Techniques appliquées

**Chargement** :

- Lazy loading composants
- Pagination intelligente
- Cache stratégique
- Prefetch données

**Rendu** :

- Memoization React
- Virtual scrolling (listes longues)
- Debounce recherche
- Optimistic UI

### Métriques cibles

- **Temps chargement initial** : <3s
- **Interaction** : <100ms
- **Recherche** : <200ms
- **Navigation** : <150ms

## 🎯 Points d'amélioration futurs

### Fonctionnalités envisagées

1. **Drag & Drop** : Déplacement RDV par glisser-déposer
2. **Récurrence** : RDV récurrents (suivi cicatrisation)
3. **Notifications push** : Alertes temps réel
4. **Intégration calendrier** : Google Calendar, Outlook
5. **Mode hors-ligne** : Synchronisation différée
6. **Chat intégré** : Communication client directe
7. **Géolocalisation** : Rappels basés localisation
8. **IA suggestions** : Créneaux optimaux automatiques

### Améliorations techniques

1. **Performance** :

   - Server-side rendering partiel
   - Streaming données
   - Cache edge
   - CDN images

2. **UX/UI** :

   - Animations micro-interactions
   - Feedback haptique mobile
   - Accessibilité complète
   - Mode sombre/clair

3. **Analytics** :
   - Tracking utilisation
   - Métriques performance
   - A/B testing
   - Heatmaps interaction

## 🔗 Intégrations

### APIs externes actuelles

- **Email** : Service SMTP configuration
- **SMS** : Integration possible Twilio/OVH
- **Paiement** : Stripe/PayPal (futur)
- **Calendrier** : CalDAV support

### Webhooks et événements

**Événements émis** :

- `appointment.created`
- `appointment.updated`
- `appointment.confirmed`
- `appointment.canceled`
- `payment.updated`

**Intégrations tierces** :

- CRM external
- Comptabilité
- Marketing automation
- Analytics custom

## 📊 Métriques et analytics

### KPIs suivis

**Opérationnels** :

- Taux occupation créneaux
- Temps moyen traitement demande
- Taux confirmation/annulation
- Revenus par tatoueur/période

**UX/Performance** :

- Temps chargement pages
- Taux conversion demande → RDV
- Satisfaction utilisateur
- Erreurs/bugs reportés

Cette documentation constitue un guide complet pour comprendre et maintenir le module RDV d'InkStudio, couvrant tous les aspects techniques, fonctionnels et d'expérience utilisateur.
