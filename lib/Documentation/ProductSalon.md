# Documentation - Module Produits du Salon

## Vue d'ensemble

Le module **ProductSalon** permet aux tatoueurs de gérer leur boutique en ligne en ajoutant, modifiant et supprimant des produits (bijoux, accessoires, soins, etc.) qu'ils proposent à la vente. Ce système offre une interface complète pour la gestion d'inventaire avec upload d'images et gestion des prix.

---

## 🏗️ Architecture du Module

### Structure des fichiers

```
app/(root)/(application)/mes-produits/
├── page.tsx                    # Page principale des produits

components/Application/ProductSalon/
├── ProductList.tsx             # Liste et gestion des produits
├── CreateOrUpdateProduct.tsx   # Formulaire création/modification
└── DeleteProduct.tsx           # Modal de suppression

lib/
├── queries/productSalon.ts     # Actions et requêtes API
├── type.ts                     # Types TypeScript
└── zod/validator.schema.ts     # Validation des formulaires
```

---

## 📱 Pages et Composants

### 1. Page Principale (`mes-produits/page.tsx`)

**Objectif :** Point d'entrée pour la gestion des produits du salon.

**Fonctionnalités :**

- Layout responsive avec fond sombre (`bg-noir-700`)
- Intégration du composant `ProductList`
- Design cohérent avec l'identité visuelle du studio

**Code structure :**

```tsx
export default function MesProduitsPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 sm:px-20">
      <div className="flex relative gap-8 w-full mt-23">
        <ProductList />
      </div>
    </div>
  );
}
```

---

### 2. Liste des Produits (`ProductList.tsx`)

**Objectif :** Affichage et gestion principale des produits avec actions CRUD.

#### Fonctionnalités principales

**🔍 Gestion des données :**

- Récupération automatique des produits via API
- État de chargement avec spinner personnalisé
- Gestion d'erreurs robuste
- Actualisation automatique après modifications

**🎨 Interface utilisateur :**

- Grid responsive (2-5 colonnes selon l'écran)
- Cartes produits avec effet hover
- Overlay d'actions au survol (desktop)
- Boutons d'actions visibles (mobile)
- État vide avec incitation à l'action

**⚡ Actions disponibles :**

- **Créer** : Nouveau produit
- **Modifier** : Édition produit existant
- **Supprimer** : Suppression avec confirmation

#### Structure du composant

```tsx
// États principaux
const [products, setProducts] = useState<ProductSalonProps[]>([]);
const [selectedProduct, setSelectedProduct] =
  useState<ProductSalonProps | null>(null);
const [loading, setLoading] = useState(true);

// Modals
const [isModalOpen, setIsModalOpen] = useState(false);
const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

// Récupération des données
const fetchProducts = async () => {
  // Appel API vers /product-salon/${userId}
  // Gestion des erreurs et validation des données
};
```

#### Design de carte produit

**Informations affichées :**

- Image du produit (aspect carré)
- Nom du produit
- Prix avec badge tertiary
- Description (truncature sur 3 lignes)
- Actions (modifier/supprimer)

**Interactions :**

- Hover effect avec scale sur l'image
- Overlay d'actions sur desktop
- Boutons permanents sur mobile
- Animations fluides avec Tailwind

---

### 3. Création/Modification (`CreateOrUpdateProduct.tsx`)

**Objectif :** Modal unifié pour créer ou modifier un produit.

#### Fonctionnalités avancées

**📤 Upload d'images :**

- Intégration `SalonImageUploader`
- Support UploadThing
- Nettoyage automatique des images temporaires
- Gestion des erreurs d'upload

**📝 Formulaire intelligent :**

- Validation en temps réel avec Zod
- Différenciation création/modification
- Gestion des valeurs par défaut
- Messages d'erreur contextuels

**🔒 Gestion SaaS :**

- Détection des limites de plan
- Messages d'erreur spécifiques
- Blocage élégant en cas de limite atteinte

#### Schéma de validation (Zod)

```typescript
productSalonSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  price: z.number().min(0, "Le prix doit être positif"),
  imageUrl: z.string().min(1, "L'image est requise"),
  userId: z.string(),
});
```

#### Gestion du nettoyage

**Problématique :** Éviter les images orphelines lors d'annulation.

**Solution :**

```tsx
const handleClose = async () => {
  const currentImageUrl = form.watch("imageUrl");

  // Si nouvelle image uploadée, la supprimer
  if (currentImageUrl && currentImageUrl !== initialImageUrl) {
    setIsClosing(true);
    await deleteFromUploadThing(currentImageUrl);
    setIsClosing(false);
  }

  setIsOpen(false);
};
```

#### Interface utilisateur

**Layout modal :**

- Header fixe avec titre contextuel
- Zone de contenu scrollable
- Footer fixe avec actions
- Responsive design

**Sections du formulaire :**

1. **Image** : Upload avec preview
2. **Informations** : Nom, description, prix
3. **Actions** : Annuler/Sauvegarder

---

### 4. Suppression (`DeleteProduct.tsx`)

**Objectif :** Suppression sécurisée avec confirmation.

#### Fonctionnalités

**🗑️ Suppression complète :**

- Suppression en base de données
- Suppression du fichier UploadThing
- Gestion des erreurs partielles
- Notifications toast

**🔐 Sécurité :**

- Modal de confirmation
- Affichage du nom du produit
- Double validation utilisateur
- Action irréversible clairement mentionnée

#### Processus de suppression

```tsx
const handleDelete = async () => {
  try {
    // 1. Supprimer de la base de données
    await deleteProductAction(product.id);

    // 2. Supprimer le fichier UploadThing
    if (product.imageUrl?.includes("utfs.io")) {
      const fileKey = extractUploadThingKey(product.imageUrl);
      if (fileKey) {
        await deleteFromUploadThing(fileKey);
      }
    }

    // 3. Notifications et cleanup
    toast.success("Produit supprimé avec succès");
    onDelete(); // Refresh de la liste
  } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};
```

---

## 🔧 Architecture Technique

### Types TypeScript

```typescript
interface ProductSalonProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### API Routes

**Endpoints utilisés :**

- `GET /product-salon/${userId}` : Liste des produits
- `POST /product-salon` : Création produit
- `PATCH /product-salon/${id}` : Modification produit
- `DELETE /product-salon/${id}` : Suppression produit

### Actions serveur

```typescript
// Création/Modification
export const createOrUpdateProductAction = async (
  data: ProductFormData,
  method: "POST" | "PATCH",
  url: string
) => {
  // Validation côté serveur
  // Appel API avec gestion d'erreurs
  // Retour standardisé
};

// Suppression
export const deleteProductAction = async (productId: string) => {
  // Suppression sécurisée
  // Gestion des erreurs
};
```

---

## 🎨 Système de Design

### Palette de couleurs

**Couleurs principales :**

- `noir-700` : Arrière-plan principal
- `noir-500` : Cartes et modals
- `tertiary-400/500` : Accents et boutons
- `white/10-20` : Bordures et overlays

**États d'interaction :**

- Hover : Scale transforms et opacity changes
- Focus : Border tertiary-400
- Disabled : Opacity 50% + cursor-not-allowed

### Typographie

**Polices :**

- `font-one` : Titres et labels (tracking-wide)
- `font-two` : Textes secondaires
- Tailles : `text-xs` à `text-xl`

### Responsive Design

**Breakpoints :**

- Mobile : 2 colonnes grid
- Tablet : 3 colonnes
- Desktop : 4-5 colonnes
- Actions hover desktop / permanentes mobile

---

## 🔌 Intégrations

### UploadThing

**Configuration :**

- Endpoint : `/api/uploadthing`
- Types supportés : Images (jpeg, png, webp)
- Taille max : Selon plan SaaS
- CDN : Livraison optimisée

**Gestion des clés :**

```typescript
// Extraction de clé depuis URL
const extractKeyFromUrl = (url: string): string | null => {
  // Regex pour extraire la clé UploadThing
  // Support des différents formats d'URL
};

// Suppression sécurisée
const deleteFromUploadThing = async (key: string) => {
  // Appel API de suppression
  // Gestion des erreurs réseau
};
```

### Sonner (Notifications)

**Types de notifications :**

- `toast.success()` : Opérations réussies
- `toast.error()` : Erreurs utilisateur
- `toast.warning()` : Avertissements (ex: limite SaaS)

---

## 🚦 Gestion des États

### États de chargement

**LoadingStates :**

- `loading` : Chargement initial des produits
- `isClosing` : Nettoyage lors d'annulation
- `submitting` : Soumission de formulaire

**UI Loading :**

```tsx
{loading ? (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400"></div>
    <p className="text-white/60">Chargement des produits...</p>
  </div>
) : (
  // Contenu principal
)}
```

### Gestion d'erreurs

**Types d'erreurs :**

- Erreurs réseau (fetch)
- Erreurs de validation (Zod)
- Erreurs SaaS (limites)
- Erreurs UploadThing

**Affichage :**

```tsx
{
  error && (
    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
      <p className="text-red-300 text-xs">{error}</p>
    </div>
  );
}
```

---

## 📊 Limitations SaaS

### Système de quotas

**Limites par plan :**

- **Gratuit** : 10 produits maximum
- **Pro** : 100 produits maximum
- **Enterprise** : Illimité

**Gestion côté client :**

```tsx
if (result.error && result.message?.includes("Limite de produits atteinte")) {
  setError("SAAS_LIMIT");
  // Affichage message spécifique
  // Proposition d'upgrade
}
```

**Messages utilisateur :**

- Limite atteinte : Proposition d'upgrade
- Approche de la limite : Avertissement préventif

---

## 🔄 Workflow Utilisateur

### Scénario : Ajout d'un produit

1. **Accès** : Navigation vers "Mes Produits"
2. **Création** : Clic "Nouveau produit"
3. **Upload** : Sélection image produit
4. **Informations** : Saisie nom, description, prix
5. **Validation** : Vérification formulaire
6. **Soumission** : Enregistrement en base
7. **Confirmation** : Toast de succès
8. **Actualisation** : Refresh automatique de la liste

### Scénario : Modification

1. **Sélection** : Clic icône modification
2. **Pré-remplissage** : Chargement données existantes
3. **Modification** : Changements utilisateur
4. **Nettoyage** : Gestion images temporaires
5. **Sauvegarde** : Mise à jour en base
6. **Retour** : Fermeture modal et refresh

### Scénario : Suppression

1. **Sélection** : Clic icône suppression
2. **Confirmation** : Modal avec nom produit
3. **Validation** : Double confirmation
4. **Suppression** : Base + UploadThing
5. **Notification** : Toast de confirmation
6. **Actualisation** : Refresh liste

---

## 🛠️ Bonnes Pratiques

### Performance

**Optimisations :**

- Images lazy loading avec Next.js Image
- Pagination côté serveur (si >50 produits)
- Cache des requêtes API
- Debounce sur les recherches

**Code splitting :**

- Modals en lazy import
- Composants lourds en dynamic import

### Sécurité

**Validations :**

- Double validation client/serveur
- Sanitisation des inputs
- Vérification des permissions utilisateur
- Rate limiting sur les uploads

**Upload sécurisé :**

- Types de fichiers restreints
- Taille maximale contrôlée
- Scan antivirus (selon plan)

### Accessibilité

**ARIA Labels :**

- Boutons avec descriptions
- Modals avec focus management
- Images avec alt text descriptif

**Navigation clavier :**

- Tab order logique
- Escape pour fermer modals
- Enter pour valider actions

---

## 🎯 Roadmap & Améliorations

### Version actuelle (1.0)

- ✅ CRUD complet des produits
- ✅ Upload d'images UploadThing
- ✅ Responsive design
- ✅ Gestion des erreurs
- ✅ Limites SaaS

### Prochaines versions

**v1.1 - Améliorations UX**

- [ ] Drag & drop réorganisation
- [ ] Recherche et filtres
- [ ] Import en masse (CSV)
- [ ] Templates de produits

**v1.2 - E-commerce**

- [ ] Gestion du stock
- [ ] Variantes de produits (tailles, couleurs)
- [ ] Codes promotionnels
- [ ] Statistiques de vente

**v1.3 - Avancé**

- [ ] Catégories de produits
- [ ] Produits liés/recommandés
- [ ] Reviews clients
- [ ] API publique boutique

---

## 🐛 Debugging & Maintenance

### Logs importants

**Upload d'images :**

```typescript
console.log("🧹 Nettoyage: suppression de l'image temporaire");
console.log("✅ Image temporaire supprimée lors de l'annulation");
console.warn("⚠️ Impossible de supprimer l'image temporaire");
```

**Suppression :**

```typescript
console.log("Suppression UploadThing réussie:", result);
console.error("Erreur lors de la suppression UploadThing:", error);
```

### Erreurs communes

**Problème** : Images orphelines
**Solution** : Vérifier le nettoyage dans `handleClose`

**Problème** : Erreur 404 sur images
**Solution** : Vérifier la validité des URLs UploadThing

**Problème** : Limite SaaS non gérée
**Solution** : Vérifier les messages d'erreur du backend

---

## 📈 Métriques & Analytics

### KPIs à surveiller

**Utilisation :**

- Nombre de produits par utilisateur
- Taux d'upload réussi
- Temps moyen de création produit

**Performance :**

- Temps de chargement liste
- Taille moyenne des images
- Erreurs de upload

**Business :**

- Progression vers limites SaaS
- Taux de conversion gratuit → payant
- Utilisation des fonctionnalités avancées

---

_Cette documentation couvre l'ensemble du module ProductSalon de l'application InkStudio. Elle est maintenue à jour avec chaque évolution du système et sert de référence pour l'équipe de développement._
