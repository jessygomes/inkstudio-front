# Documentation - Module Mon Compte

## Vue d'ensemble

Le module **Mon Compte** est le centre de gestion du profil du salon de tatouage. Il permet aux propriétaires de salons de gérer toutes les informations liées à leur établissement : informations générales, horaires d'ouverture, équipe de tatoueurs, galerie photos et créneaux bloqués. Ce module constitue le cœur administratif de l'application.

---

## 🏗️ Architecture du Module

### Structure des fichiers

```
app/(root)/(application)/mon-compte/
├── page.tsx                     # Page principale du compte salon
├── modifier-salon/
│   └── page.tsx                 # Modification des informations salon
├── horaires/
│   └── page.tsx                 # Gestion des horaires d'ouverture
└── ajouter-tatoueur/
    └── page.tsx                 # Ajout/modification tatoueurs

components/Application/MonCompte/
├── SalonAccount.tsx             # Composant principal du compte
├── InfoSalon.tsx                # Affichage des informations salon
├── Horaire.tsx                  # Gestion des horaires et créneaux
├── TatoueurSalon.tsx            # Gestion de l'équipe
├── SalonPhoto.tsx               # Galerie photos du salon
├── BlockedSlots.tsx             # Créneaux bloqués
├── CreateBlockedSlot.tsx        # Création de créneaux bloqués
├── SalonGalleryUploader.tsx     # Upload multiple d'images
├── SalonImageUploader.tsx       # Upload d'image unique
└── DeleteConfirmationModal.tsx  # Modal de confirmation

lib/
├── queries/                     # Actions et requêtes API
├── type.ts                      # Types TypeScript
└── zod/validator.schema.ts      # Validation des formulaires
```

---

## 📱 Pages et Composants

### 1. Page Principale (`mon-compte/page.tsx`)

**Objectif :** Point d'entrée pour la gestion du compte salon.

**Fonctionnalités :**

- Layout responsive avec fond sombre (`bg-noir-700`)
- Intégration du composant `SalonAccount`
- Design cohérent avec l'identité visuelle

**Code structure :**

```tsx
export default function MonCompte() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 sm:px-20">
      <div className="flex relative gap-8 w-full mt-23">
        <SalonAccount />
      </div>
    </div>
  );
}
```

---

### 2. Composant Principal (`SalonAccount.tsx`)

**Objectif :** Orchestrateur principal du module Mon Compte.

#### Fonctionnalités principales

**🔍 Gestion des données :**

- Récupération des informations salon
- État de chargement avec spinner
- Gestion d'erreurs robuste
- Actualisation automatique

**🎨 Interface utilisateur :**

- Header avec icône business et titre
- Sections organisées en cards
- Design responsive mobile-first
- Transitions fluides

**📋 Sections gérées :**

- **Informations salon** : Données de base
- **Horaires** : Planning d'ouverture
- **Équipe** : Gestion des tatoueurs
- **Galerie** : Photos du salon

#### Structure du composant

```tsx
// États principaux
const [salon, setSalon] = useState<SalonUserProps>();
const [isHoursVisible, setIsHoursVisible] = useState(true);

// Récupération des données
const fetchSalon = async () => {
  // Appel API vers /users/${salonId}
  // Mise à jour du state salon
};

// Sections principales
return (
  <section className="w-full">
    {/* Header responsive */}
    {/* Section INFO SALON */}
    <InfoSalon salon={salon} />

    {/* Section HORAIRES */}
    <Horaire hours={salon.salonHours} />

    {/* Section TATOUEURS */}
    <TatoueurSalon tatoueurs={salon.tatoueurs} />

    {/* Section GALERIE */}
    <SalonPhoto />
  </section>
);
```

---

### 3. Informations Salon (`InfoSalon.tsx`)

**Objectif :** Affichage et gestion des informations de base du salon.

#### Fonctionnalités

**📸 Image du salon :**

- Display avec fallback élégant
- Dimensions fixes 180x180px
- Design arrondi avec effet hover

**📍 Informations de base :**

- Nom du salon
- Adresse complète
- Description (optionnelle)
- Prestations (badges)

**🌐 Réseaux sociaux :**

- Instagram, Facebook, TikTok, Website
- Liens externes avec icônes
- Design en badges colorés

**⚙️ Actions :**

- Bouton "Modifier les informations"
- Redirection vers `/modifier-salon`

#### Design responsive

**Layout mobile :**

- Image au-dessus
- Informations en colonne
- Bouton pleine largeur

**Layout desktop :**

- Image à gauche
- Informations à droite
- Bouton aligné à droite

---

### 4. Modification Salon (`modifier-salon/page.tsx`)

**Objectif :** Formulaire complet de modification des informations salon.

#### Fonctionnalités avancées

**📝 Formulaire intelligent :**

- React Hook Form avec Zod
- Pré-remplissage des valeurs
- Validation en temps réel
- Messages d'erreur contextuels

**🔧 Champs gérés :**

- Informations de base (nom, adresse)
- Image du salon (upload)
- Description
- Prestations (gestion de badges)
- Réseaux sociaux

**📱 Design responsive :**

- Header avec bouton retour
- Sections organisées en cards
- Footer avec actions
- Adaptation mobile complète

#### Schéma de validation

```typescript
updateSalonSchema = z.object({
  salonName: z.string().min(1, "Nom requis"),
  address: z.string().min(1, "Adresse requise"),
  city: z.string().min(1, "Ville requise"),
  postalCode: z.string().min(5, "Code postal invalide"),
  image: z.string().optional(),
  description: z.string().optional(),
  prestations: z.array(z.string()).optional(),
  instagram: z.string().url().optional(),
  facebook: z.string().url().optional(),
  tiktok: z.string().url().optional(),
  website: z.string().url().optional(),
});
```

---

### 5. Gestion des Horaires (`horaires/page.tsx`)

**Objectif :** Configuration des horaires d'ouverture du salon.

#### Fonctionnalités

**🕐 Gestion par jour :**

- 7 jours de la semaine
- Heures d'ouverture/fermeture
- Option "Fermé" par jour
- Validation des créneaux

**💾 Sauvegarde :**

- Format JSON stringifié
- Validation côté client/serveur
- Feedback utilisateur

**🎨 Interface :**

- Design en tableau responsive
- Inputs time avec validation
- Toggles pour jours fermés

#### Structure des données

```typescript
type OpeningHour = { start: string; end: string } | null;

type SalonHours = {
  monday: OpeningHour;
  tuesday: OpeningHour;
  wednesday: OpeningHour;
  thursday: OpeningHour;
  friday: OpeningHour;
  saturday: OpeningHour;
  sunday: OpeningHour;
};
```

---

### 6. Gestion des Tatoueurs (`ajouter-tatoueur/page.tsx`)

**Objectif :** Ajout et modification des membres de l'équipe.

#### Fonctionnalités avancées

**👤 Informations tatoueur :**

- Nom et description
- Photo de profil
- Instagram personnel
- Styles de tatouage (badges)
- Compétences (badges)

**🕐 Horaires individuels :**

- Horaires par défaut du salon
- Personnalisation possible
- Validation des créneaux

**🏷️ Système de badges :**

- Ajout/suppression dynamique
- Styles : Réalisme, Old School, etc.
- Compétences : Couleur, Noir & Gris, etc.

#### Gestion des badges

```tsx
// Ajout de style
const handleAddStyle = () => {
  const val = styleInput.trim();
  if (val && !styleBadges.includes(val)) {
    const updated = [...styleBadges, val];
    setStyleBadges(updated);
    form.setValue("style", updated);
  }
  setStyleInput("");
};

// Suppression de style
const handleRemoveStyle = (val: string) => {
  const updated = styleBadges.filter((s) => s !== val);
  setStyleBadges(updated);
  form.setValue("style", updated);
};
```

---

### 7. Équipe Salon (`TatoueurSalon.tsx`)

**Objectif :** Affichage et gestion de l'équipe de tatoueurs.

#### Fonctionnalités

**👥 Liste des tatoueurs :**

- Cards avec photo et informations
- Badges de styles et compétences
- Actions modifier/supprimer

**🗑️ Suppression sécurisée :**

- Modal de confirmation
- Suppression BDD + UploadThing
- Feedback utilisateur

**➕ Ajout d'équipe :**

- Bouton d'ajout visible
- Redirection vers formulaire
- État vide avec incitation

#### Design des cards

**Informations affichées :**

- Photo du tatoueur
- Nom et description
- Badges de styles
- Instagram personnel
- Actions (modifier/supprimer)

**Responsive :**

- Mobile : Stack vertical
- Desktop : Layout horizontal
- Actions adaptées par breakpoint

---

### 8. Galerie Photos (`SalonPhoto.tsx`)

**Objectif :** Gestion de la galerie photos du salon (max 6 images).

#### Fonctionnalités avancées

**📸 Upload multiple :**

- Drag & drop
- Sélection multiple
- Limite de 6 images
- Compression automatique

**🖼️ Gestion des images :**

- Grid responsive 2-3 colonnes
- Preview avec actions
- Suppression individuelle
- Compteur de limite

**🧹 Nettoyage automatique :**

- Suppression UploadThing
- Mise à jour BDD
- Synchronisation état

#### Workflow d'upload

```tsx
const handleMultipleImagesUploaded = async (imageUrls: string[]) => {
  try {
    // Récupérer images existantes
    const currentPhotos = images.map((img) => img.url);

    // Combiner avec nouvelles
    const allPhotos = [...currentPhotos, ...imageUrls];

    // Limiter à 6 maximum
    const limitedPhotos = allPhotos.slice(0, 6);

    // Sauvegarder en BDD
    await savePhotosToDatabase(limitedPhotos);

    // Refresh liste
    await fetchImages();
  } catch (error) {
    console.error("Erreur upload:", error);
  }
};
```

---

### 9. Créneaux Bloqués (`BlockedSlots.tsx`)

**Objectif :** Gestion des indisponibilités du salon et des tatoueurs.

#### Fonctionnalités

**🚫 Types de blocage :**

- Salon complet
- Tatoueur spécifique
- Périodes personnalisées
- Motifs optionnels

**📅 Gestion des créneaux :**

- Liste groupée par date
- Filtrage par tatoueur
- Déblocage simple
- Validation temporelle

**🔍 Filtres et affichage :**

- "Tous", "Salon", par tatoueur
- Groupement par date
- Format dates français
- Actions sur chaque créneau

#### Structure des données

```typescript
interface BlockedSlot {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  tatoueurId: string | null; // null = salon complet
  userId: string;
  tatoueur: Tatoueur | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 10. Création Créneaux (`CreateBlockedSlot.tsx`)

**Objectif :** Modal de création de nouveaux créneaux bloqués.

#### Fonctionnalités avancées

**📅 Sélection intelligente :**

- Date/heure de début
- Date/heure de fin
- Auto-remplissage dates
- Validation croisée

**🎯 Ciblage précis :**

- Salon complet ou tatoueur
- Dropdown des tatoueurs
- Motif optionnel

**✅ Validations strictes :**

- Dates cohérentes
- Durée minimale/maximale
- Pas de chevauchement
- Dates futures uniquement

#### Validation des dates

```tsx
const validateAndFormatDates = (data) => {
  // Format ISO local (sans forcer UTC)
  const startDateTimeString = `${data.startDate}T${data.startTime}:00`;
  const endDateTimeString = `${data.endDate}T${data.endTime}:00`;

  const startDateTime = new Date(startDateTimeString);
  const endDateTime = new Date(endDateTimeString);

  // Validations
  if (startDateTime >= endDateTime) {
    return { isValid: false, error: "Date de fin antérieure" };
  }

  if (startDateTime < new Date()) {
    return { isValid: false, error: "Date passée" };
  }

  // Durée entre 15min et 30 jours
  const diffMinutes = (endDateTime - startDateTime) / (1000 * 60);
  if (diffMinutes < 15 || diffMinutes > 43200) {
    // 30 jours
    return { isValid: false, error: "Durée invalide" };
  }

  return { isValid: true, startDateTime, endDateTime };
};
```

---

### 11. Upload d'Images (`SalonGalleryUploader.tsx`)

**Objectif :** Composant d'upload multiple optimisé.

#### Fonctionnalités avancées

**📤 Upload intelligent :**

- Drag & drop avec feedback visuel
- Sélection multiple fichiers
- Preview avant upload
- Compression automatique

**🔒 Validations :**

- Types de fichiers (images uniquement)
- Taille maximale (8MB)
- Limite quantité (selon slots restants)
- Format et qualité

**⚡ Optimisations :**

- Compression client-side
- Progress bar détaillée
- Annulation possible
- États d'erreur détaillés

#### Compression d'images

```tsx
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      convertTypes: ["image/png"],
      convertSize: 1000000, // 1MB
      success: resolve,
      error: () => resolve(file), // Fallback
    });
  });
};
```

---

## 🔧 Architecture Technique

### Types TypeScript

```typescript
// Salon principal
interface SalonUserProps {
  id: string;
  salonName: string;
  address: string;
  city: string;
  postalCode: string;
  image?: string;
  description?: string;
  prestations?: string[];
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  salonHours?: string; // JSON stringifié
  tatoueurs?: TatoueurProps[];
  salonPhotos?: SalonImage[];
}

// Tatoueur
interface TatoueurProps {
  id: string;
  name: string;
  img?: string;
  description?: string;
  instagram?: string;
  hours?: string; // JSON stringifié
  style?: string[];
  skills?: string[];
  salonId: string;
}

// Image salon
interface SalonImage {
  id: string;
  url: string;
  createdAt: string;
}

// Créneau bloqué
interface BlockedSlot {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  tatoueurId: string | null;
  userId: string;
  tatoueur: Tatoueur | null;
}
```

### API Routes

**Endpoints principaux :**

- `GET /users/${id}` : Informations salon complètes
- `PATCH /users/${id}` : Mise à jour salon
- `PATCH /users/${id}/hours` : Mise à jour horaires
- `PATCH /users/${id}/photos` : Mise à jour galerie
- `GET /tatoueurs/user/${id}` : Liste tatoueurs
- `POST /tatoueurs` : Création tatoueur
- `PATCH /tatoueurs/${id}` : Modification tatoueur
- `DELETE /tatoueurs/${id}` : Suppression tatoueur
- `GET /blocked-slots/salon/${id}` : Créneaux bloqués
- `POST /blocked-slots` : Création créneau bloqué
- `DELETE /blocked-slots/${id}` : Suppression créneau

---

## 🎨 Système de Design

### Palette de couleurs

**Couleurs principales :**

- `noir-700` : Arrière-plan principal
- `noir-500` : Cards et modals
- `tertiary-400/500` : Accents et boutons
- `white/5-20` : Bordures et overlays

**États d'interaction :**

- Hover : Brightness et scale transforms
- Focus : Border tertiary-400
- Active : Pressed states
- Disabled : Opacity 50%

### Layout responsive

**Breakpoints :**

- Mobile : < 640px (sm)
- Tablet : 640px - 1024px
- Desktop : > 1024px

**Adaptations :**

- Mobile : Stack vertical, boutons pleine largeur
- Tablet : Layout hybride
- Desktop : Layout horizontal, actions alignées

### Typographie

**Polices :**

- `font-one` : Titres et labels (tracking-widest)
- `font-two` : Textes de contenu
- Tailles : `text-xs` (12px) à `text-3xl` (30px)

---

## 🔌 Intégrations

### UploadThing

**Configuration :**

- Endpoint : `/api/uploadthing`
- Route : `imageUploader`
- Taille max : 8MB par image
- Types : jpeg, png, webp

**Fonctionnalités :**

- Upload multiple
- Compression client
- Progress tracking
- Suppression sécurisée

### React Hook Form + Zod

**Avantages :**

- Validation en temps réel
- Performance optimisée
- TypeScript intégré
- Messages d'erreur personnalisés

**Patterns utilisés :**

```tsx
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: {
    /* valeurs par défaut */
  },
});

// Gestion des erreurs
{
  form.formState.errors.field && (
    <p className="text-red-300 text-xs">
      {form.formState.errors.field.message}
    </p>
  );
}
```

### Sonner (Notifications)

**Types utilisés :**

- `toast.success()` : Opérations réussies
- `toast.error()` : Erreurs utilisateur
- `toast.warning()` : Avertissements

---

## 🚦 Gestion des États

### États de chargement

**LoadingStates :**

- `isLoading` : Chargement initial
- `isSubmitting` : Soumission formulaire
- `isDeleting` : Suppression en cours
- `isUploading` : Upload d'images

**Patterns UI :**

```tsx
{isLoading ? (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400"></div>
) : (
  // Contenu principal
)}
```

### Gestion d'erreurs

**Types d'erreurs :**

- Erreurs réseau (fetch failed)
- Erreurs validation (Zod)
- Erreurs UploadThing
- Erreurs business logic

**Affichage uniforme :**

```tsx
{
  error && (
    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
      <p className="text-red-300 text-xs">{error}</p>
    </div>
  );
}
```

---

## 🔄 Workflows Utilisateur

### Scénario : Configuration initiale salon

1. **Accès Mon Compte** : Navigation depuis menu
2. **Informations salon** : Complétion profil
3. **Upload image** : Ajout photo salon
4. **Configuration horaires** : Définition planning
5. **Ajout équipe** : Création profils tatoueurs
6. **Galerie photos** : Upload images salon
7. **Créneaux bloqués** : Configuration indisponibilités

### Scénario : Gestion quotidienne

1. **Consultation planning** : Vérification horaires
2. **Blocage créneau** : Ajout indisponibilité
3. **Modification équipe** : Update tatoueur
4. **Mise à jour galerie** : Ajout nouvelles photos
5. **Modification infos** : Update coordonnées

### Scénario : Gestion d'équipe

1. **Ajout tatoueur** : Formulaire complet
2. **Configuration horaires** : Planning individuel
3. **Styles et compétences** : Badges spécialités
4. **Photo profil** : Upload image
5. **Modification** : Update informations
6. **Suppression** : Avec confirmation

---

## 🛠️ Bonnes Pratiques

### Performance

**Optimisations :**

- Lazy loading des images
- Compression avant upload
- Cache des requêtes API
- Debounce sur les inputs

**Patterns React :**

```tsx
// Éviter re-renders inutiles
const memoizedComponent = useMemo(
  () => <ExpensiveComponent data={data} />,
  [data]
);

// Optimiser les callbacks
const handleClick = useCallback(() => {
  // Action
}, [dependency]);
```

### Sécurité

**Validations :**

- Double validation client/serveur
- Sanitisation des inputs
- Vérification des permissions
- Rate limiting sur uploads

**Upload sécurisé :**

- Types de fichiers restreints
- Taille maximale contrôlée
- Noms de fichiers sécurisés
- Scan antivirus (côté serveur)

### Accessibilité

**ARIA Labels :**

- Boutons avec descriptions
- Modals avec focus management
- Images avec alt text
- Forms avec labels explicites

**Navigation clavier :**

- Tab order logique
- Escape pour fermer modals
- Enter pour valider actions
- Raccourcis clavier

---

## 📊 Métriques & Analytics

### KPIs à surveiller

**Utilisation :**

- Taux de complétion profil salon
- Nombre moyen de tatoueurs par salon
- Utilisation des créneaux bloqués
- Upload d'images par mois

**Performance :**

- Temps de chargement pages
- Taux d'erreur uploads
- Temps de soumission formulaires

**Business :**

- Salons avec profil complet
- Engagement avec fonctionnalités
- Taux de mise à jour informations

---

## 🐛 Debugging & Maintenance

### Logs importants

**Upload d'images :**

```typescript
console.log("🖼️ Upload démarré:", files.length, "fichiers");
console.log("✅ Upload réussi:", uploadedUrls);
console.error("❌ Erreur upload:", error);
```

**Gestion des créneaux :**

```typescript
console.log("📅 Créneau créé:", { start, end, tatoueur });
console.warn("⚠️ Conflit horaire détecté");
```

### Erreurs communes

**Problème** : Images non supprimées d'UploadThing
**Solution** : Vérifier `extractKeyFromUrl` et API de suppression

**Problème** : Validation horaires échoue
**Solution** : Contrôler format dates et timezone

**Problème** : Formulaires ne se pré-remplissent pas
**Solution** : Vérifier `useEffect` et `form.reset()`

---

## 🎯 Roadmap & Améliorations

### Version actuelle (1.0)

- ✅ Gestion complète salon
- ✅ Équipe de tatoueurs
- ✅ Galerie photos (6 max)
- ✅ Créneaux bloqués
- ✅ Horaires d'ouverture

### Prochaines versions

**v1.1 - Améliorations UX**

- [ ] Wizard de configuration initiale
- [ ] Templates de salon prédéfinis
- [ ] Drag & drop réorganisation photos
- [ ] Notifications push modifications

**v1.2 - Fonctionnalités avancées**

- [ ] Gestion des congés automatiques
- [ ] Synchronisation calendriers externes
- [ ] Système de backup automatique
- [ ] Historique des modifications

**v1.3 - Analytics & Insights**

- [ ] Dashboard analytics salon
- [ ] Statistiques d'engagement
- [ ] Rapports de performance
- [ ] Recommandations personnalisées

---

## 📚 Ressources & Documentation

### Liens utiles

**Composants UI :**

- [Tailwind CSS](https://tailwindcss.com/) : Framework CSS
- [React Hook Form](https://react-hook-form.com/) : Gestion formulaires
- [Zod](https://zod.dev/) : Validation TypeScript

**Upload & Images :**

- [UploadThing](https://uploadthing.com/) : Service d'upload
- [Compressor.js](https://fengyuanchen.github.io/compressorjs/) : Compression images

**Notifications :**

- [Sonner](https://sonner.emilkowal.ski/) : Toast notifications

### Conventions de code

**Naming :**

- Components : PascalCase
- Functions : camelCase
- Constants : UPPER_SNAKE_CASE
- Types : PascalCase avec suffix Props/State

**Structure fichiers :**

- Un composant par fichier
- Index.ts pour exports
- Co-location des types
- Tests adjacents aux composants

---

_Cette documentation couvre l'ensemble du module Mon Compte de l'application InkStudio. Elle constitue la référence complète pour la gestion des profils de salon et sert de guide pour l'équipe de développement et les futures évolutions du système._
