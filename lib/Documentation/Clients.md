# 👥 Gestion des Clients - Module Client

## Vue d'ensemble

Le module Client constitue un pilier essentiel d'InkStudio, permettant une gestion complète de la base de données clients du studio de tatouage. Il offre des outils complets pour créer, modifier, supprimer et suivre les clients, ainsi que gérer leurs avis et suivis post-tatouage.

## 🎯 Objectifs

Ce module permet aux professionnels du tatouage de :

- Maintenir une base de données clients complète et organisée
- Gérer les informations personnelles et médicales des clients
- Suivre l'historique des rendez-vous et tatouages
- Traiter les avis et suivis post-tatouage des clients
- Analyser la satisfaction client et les retours

## 🗂️ Structure du module

### Pages principales

#### 1. `/clients` - Page principale

**Fichier** : `app/(root)/(application)/clients/page.tsx`

Page d'accueil du module affichant la liste complète des clients via le composant `ClientList`.

#### 2. `/clients/suivi` - Gestion des suivis

**Fichier** : `app/(root)/(application)/clients/suivi/page.tsx`

Page dédiée à la gestion des avis et suivis post-tatouage via le composant `ShowSuivis`.

## 🧩 Composants principaux

### 1. `ClientList.tsx` - Liste des clients

**Localisation** : `components/Application/Clients/ClientList.tsx`

#### Fonctionnalités principales

**Affichage et navigation** :

- **Liste paginée** : 10 clients par page avec navigation
- **Recherche avancée** : Par nom, prénom, email, téléphone
- **Design responsive** : Adaptation mobile/desktop
- **Compteurs** : Affichage du total et pagination

**Structure de données** :

```typescript
interface ClientProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  medicalHistory?: {
    allergies?: string;
    healthIssues?: string;
    medications?: string;
    pregnancy?: boolean;
    tattooHistory?: string;
  };
  appointments?: Appointment[];
  followUpSubmissions?: FollowUpSubmission[];
}
```

**Actions disponibles** :

- **Créer** : Nouveau client via modal
- **Modifier** : Édition informations existantes
- **Supprimer** : Suppression avec confirmation
- **Consulter** : Détails complets et historique

**Interface responsive** :

- **Desktop** : Tableau avec colonnes (Nom, Email, Téléphone, RDV, Actions)
- **Mobile** : Cards empilées avec informations essentielles
- **Header adaptatif** : Boutons d'action repositionnés selon l'écran

#### Gestion des données

**Pagination côté serveur** :

```typescript
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalClients: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

**Recherche avec debounce** :

- Délai de 300ms pour optimiser les requêtes
- Reset automatique à la page 1 lors d'une nouvelle recherche
- Recherche multi-champs (nom, prénom, email)

**États de chargement** :

- Skeleton loaders pendant le fetch
- Messages d'erreur avec possibilité de retry
- État vide avec invitation à créer un premier client

### 2. `CreateOrUpdateClient.tsx` - Création/modification

**Localisation** : `components/Application/Clients/CreateOrUpdateClient.tsx`

#### Formulaire complet

**Informations personnelles** :

- **Champs obligatoires** : Prénom, nom, email
- **Champs optionnels** : Téléphone, date de naissance, adresse
- **Validation** : Zod schema avec contrôles temps réel

**Historique médical (optionnel)** :

- **Allergies** : Connues du client
- **Problèmes de santé** : Conditions médicales
- **Médicaments** : Traitements en cours
- **Grossesse** : État actuel (checkbox)
- **Historique tatouage** : Expériences précédentes

#### Gestion des limites SaaS

**Contrôle des quotas** :

```typescript
// Vérification côté serveur
if (result.message?.includes("Limite de fiches clients atteinte")) {
  setError("SAAS_LIMIT"); // Message spécial
}
```

**Interface dédiée** :

- Message d'explication des limites
- Bouton d'upgrade vers plan supérieur
- Lien vers la page de tarification

#### Design et UX

**Modal responsive** :

- **Mobile** : Plein écran adaptatif
- **Desktop** : Modal centrée avec max-width
- **Scroll** : Contenu scrollable avec header/footer fixes

**Sections dépliantes** :

- Historique médical optionnel
- Amélioration de l'UX pour les cas simples
- Indicateurs visuels d'état (ouvert/fermé)

### 3. `DeleteClient.tsx` - Suppression

**Localisation** : `components/Application/Clients/DeleteClient.tsx`

#### Processus de suppression

**Confirmation obligatoire** :

- Modal de confirmation explicite
- Affichage du nom complet du client
- Avertissement sur l'irréversibilité

**Sécurité** :

- Double vérification utilisateur
- Gestion des erreurs côté serveur
- Feedback immédiat (succès/erreur)

### 4. `ShowSuivis.tsx` - Gestion des avis

**Localisation** : `components/Application/Clients/ShowSuivis.tsx`

#### Système de suivi post-tatouage

**Structure des données** :

```typescript
interface FollowUpSubmission {
  id: string;
  rating: number; // 1-5 étoiles
  review?: string; // Commentaire client
  photoUrl: string; // Photo cicatrisation
  createdAt: string;
  isAnswered: boolean; // Répondu par le salon
  isPhotoPublic: boolean; // Visible publiquement
  appointmentId: string;
  clientId: string;
  appointment: Appointment;
}
```

#### Filtrage et recherche avancés

**Filtres disponibles** :

- **Par statut** : Tous, répondus, non répondus
- **Par tatoueur** : Sélection par artiste
- **Recherche client** : Nom, prénom du client
- **Pagination** : 10 éléments par page par défaut

**Gestion par URL** :

```typescript
// Paramètres URL pour state management
const statusFromUrl = searchParams.get("status") || "all";
const tatoueurFromUrl = searchParams.get("tatoueurId") || "all";
const queryFromUrl = searchParams.get("q") || "";
const pageFromUrl = Number(searchParams.get("page")) || 1;
```

#### Actions sur les avis

**Répondre aux avis** :

- Modal de réponse avec textarea
- Validation du contenu (non vide)
- Email automatique au client
- Mise à jour du statut `isAnswered`

**Supprimer les avis** :

- Confirmation obligatoire
- Suppression fichier UploadThing
- Nettoyage complet des données

**Gestion de la visibilité** :

- Toggle public/privé pour les photos
- Contrôle de l'affichage portfolio
- Respect de la confidentialité client

#### Interface utilisateur

**Affichage des avis** :

- **Note** : Étoiles visuelles (⭐) + label textuel
- **Photo** : Miniature avec zoom possible
- **Commentaire** : Texte formaté avec retours ligne
- **Métadonnées** : Date, client, tatoueur, RDV associé

**Indicateurs visuels** :

- Badge "Répondu" / "En attente"
- Temps écoulé depuis l'avis
- Status de visibilité public/privé

## 🎨 Design System

### Layout responsive

**Mobile First** :

```css
/* Mobile < 640px */
.client-card {
  @apply flex flex-col space-y-2 p-4;
}

/* Tablet >= 640px */
.client-grid {
  @apply grid grid-cols-2 gap-4;
}

/* Desktop >= 1024px */
.client-table {
  @apply grid grid-cols-6 gap-2;
}
```

**Breakpoints** :

- **Mobile** : `< 640px` - Layout vertical, cards
- **Tablet** : `640px - 1024px` - Layout grid 2 colonnes
- **Desktop** : `> 1024px` - Tableau complet

### Codes couleur et statuts

**Statuts clients** :

```css
.client-active {
  color: #10b981;
} /* Vert - Client actif */
.client-inactive {
  color: #6b7280;
} /* Gris - Inactif */
.client-new {
  color: #3b82f6;
} /* Bleu - Nouveau */
```

**Statuts avis** :

```css
.review-answered {
  background: #10b981;
} /* Vert - Répondu */
.review-pending {
  background: #f59e0b;
} /* Orange - En attente */
.review-public {
  color: #3b82f6;
} /* Bleu - Public */
.review-private {
  color: #6b7280;
} /* Gris - Privé */
```

**Notes clients** :

```css
.rating-5 {
  color: #10b981;
} /* Vert - Excellent */
.rating-4 {
  color: #84cc16;
} /* Vert clair - Bien */
.rating-3 {
  color: #f59e0b;
} /* Orange - Moyen */
.rating-2 {
  color: #ef4444;
} /* Rouge - Mauvais */
.rating-1 {
  color: #dc2626;
} /* Rouge foncé - Très mauvais */
```

### Composants UI réutilisables

**Pagination** :

```tsx
<Pagination
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  onPageChange={handlePageChange}
  showInfo={true}
/>
```

**Filtres** :

```tsx
<FilterBar
  statusFilter={statusFilter}
  tatoueurFilter={tatoueurFilter}
  searchTerm={searchTerm}
  onStatusChange={setStatusFilter}
  onTatoueurChange={setTatoueurFilter}
  onSearchChange={setSearchTerm}
/>
```

## 🔄 Gestion des données

### APIs et actions serveur

**Actions principales** :

```typescript
// Clients
getSalonClientsAction(page, search); // Liste paginée
createOrUpdateClient(data, method, url); // CRUD
deleteClient(clientId); // Suppression

// Suivis
getFollowUpAction(page, limit, status, tatoueurId, query); // Liste filtrée
replySuiviAction(followUpId, response); // Répondre
deleteSuiviAction(followUpId); // Supprimer
```

**Gestion cache** :

- Invalidation après CRUD operations
- Refresh automatique après actions
- Optimistic updates pour l'UX

### Validation et sécurité

**Schémas Zod** :

```typescript
const clientSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  // Historique médical optionnel
  allergies: z.string().optional(),
  healthIssues: z.string().optional(),
  medications: z.string().optional(),
  pregnancy: z.boolean().default(false),
  tattooHistory: z.string().optional(),
});
```

**Contrôles d'accès** :

- Vérification propriétaire des données
- Isolation par salon/utilisateur
- Validation côté serveur systématique

## 🖼️ Gestion des médias

### UploadThing integration

**Upload photos suivis** :

```typescript
const extractUploadThingKey = (url: string): string | null => {
  const match = url.match(/\/f\/([^\/\?]+)/);
  return match ? match[1] : null;
};

const deleteFromUploadThing = async (fileKey: string) => {
  const res = await fetch("/api/uploadthing/delete", {
    method: "POST",
    body: JSON.stringify({ fileKeys: [fileKey] }),
  });
  return res.ok;
};
```

**Optimisation images** :

- Compression automatique
- Redimensionnement côté client
- Formats modernes (WebP, AVIF)
- Lazy loading pour performance

### Gestion de la visibilité

**Photos portfolio** :

- Toggle public/privé par photo
- Intégration avec la galerie publique
- Respect confidentialité client
- Permissions granulaires

## 📊 Métriques et analytics

### KPIs clients

**Métriques de base** :

- Nombre total de clients
- Nouveaux clients par période
- Taux de fidélisation
- Clients actifs vs inactifs

**Satisfaction client** :

- Note moyenne des avis
- Distribution des notes (1-5)
- Taux de réponse aux avis
- Évolution satisfaction dans le temps

### Rapports disponibles

**Analyse clientèle** :

- Démographie clients (âge, localisation)
- Historique des rendez-vous
- Préférences de prestations
- Valeur vie client (CLV)

**Suivi post-tatouage** :

- Taux de soumission des suivis
- Délai moyen de cicatrisation
- Problèmes récurrents
- Satisfaction par tatoueur

## 🔐 Conformité et confidentialité

### RGPD et données personnelles

**Collecte minimale** :

- Champs obligatoires limités
- Historique médical optionnel
- Consentement explicite
- Droit à l'effacement

**Sécurisation** :

- Chiffrement des données sensibles
- Accès restreint aux données médicales
- Audit trail des modifications
- Anonymisation possible

### Gestion des consentements

**Photos et avis** :

- Consentement publication portfolio
- Droit de retrait simple
- Gestion granulaire des permissions
- Traçabilité des consentements

## 🚀 Optimisations et performance

### Techniques appliquées

**Côté client** :

- Pagination serveur (non client)
- Debounce recherche (300ms)
- Lazy loading modales
- Memoization composants lourds

**Côté serveur** :

- Index base de données optimisés
- Cache requêtes fréquentes
- Compression réponses API
- Limitation taux (rate limiting)

### Métriques cibles

- **Chargement liste** : < 2s
- **Recherche** : < 500ms
- **Sauvegarde** : < 1s
- **Upload photo** : < 5s

## 🎯 Points d'amélioration futurs

### Fonctionnalités envisagées

1. **Import/Export** :

   - CSV import clients existants
   - Export données RGPD
   - Sauvegarde automatique
   - Migration entre plans

2. **Communication** :

   - SMS notifications automatiques
   - Email marketing ciblé
   - Rappels rendez-vous
   - Campagnes satisfaction

3. **Analytics avancés** :

   - Segmentation clientèle
   - Prédiction churn
   - Recommandations personnalisées
   - A/B testing communications

4. **Intégrations** :
   - CRM externes (HubSpot, Salesforce)
   - Outils comptabilité
   - Plateformes review (Google, Facebook)
   - Services géolocalisation

### Améliorations techniques

1. **Performance** :

   - Virtual scrolling grandes listes
   - Progressive Web App (PWA)
   - Service Worker cache
   - Optimistic UI généralisé

2. **UX/Accessibilité** :

   - Mode sombre complet
   - Support lecteurs d'écran
   - Navigation clavier
   - Contraste élevé

3. **Mobile** :
   - App native (React Native)
   - Push notifications
   - Mode hors-ligne
   - Géolocalisation

## 🔗 Intégrations

### APIs tierces actuelles

**Communication** :

- SMTP pour emails
- SMS providers (Twilio, OVH)
- Push notifications (Firebase)

**Stockage** :

- UploadThing pour fichiers
- Base de données PostgreSQL
- Cache Redis (optionnel)

### Webhooks et événements

**Événements émis** :

```typescript
// Client events
client.created;
client.updated;
client.deleted;

// Review events
review.submitted;
review.answered;
review.visibility_changed;
```

**Intégrations possibles** :

- Marketing automation
- CRM synchronisation
- Analytics personnalisés
- Notifications tierces

## 📈 Évolution du module

### Roadmap technique

**Phase 1** (Actuel) :

- ✅ CRUD clients complet
- ✅ Gestion avis et suivis
- ✅ Recherche et filtres
- ✅ Responsive design

**Phase 2** (Court terme) :

- 🔄 Import/export CSV
- 🔄 Notifications automatiques
- 🔄 Analytics avancés
- 🔄 Mode hors-ligne

**Phase 3** (Moyen terme) :

- 📋 App mobile native
- 📋 IA recommandations
- 📋 Intégrations CRM
- 📋 API publique

**Phase 4** (Long terme) :

- 📋 Multi-salon/franchise
- 📋 Places de marché
- 📋 Blockchain certificats
- 📋 Réalité augmentée

Cette documentation constitue un guide complet pour comprendre et maintenir le module Client d'InkStudio, couvrant tous les aspects techniques, fonctionnels et d'expérience utilisateur, ainsi que les perspectives d'évolution future.
