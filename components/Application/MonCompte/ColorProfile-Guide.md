# Guide d'intégration - Composant ColorProfile

## Fichiers créés/modifiés

### 1. Fonctions API (lib/queries/user.ts)

- ✅ `getColorProfileAction()` - Récupère les couleurs actuelles
- ✅ `updateColorProfileAction(payload)` - Met à jour les couleurs

### 2. Types TypeScript (lib/type.ts)

- ✅ `ColorProfileProps` - Interface pour les données de couleur
- ✅ `UpdateColorProfileDto` - Interface pour la mise à jour

### 3. Composant UI (components/Application/MonCompte/ColorProfile.tsx)

- ✅ Composant complet avec interface utilisateur
- ✅ Gestion des états de chargement
- ✅ Validation et gestion d'erreurs
- ✅ Aperçu des couleurs en temps réel

## Comment utiliser le composant

### Option 1: L'ajouter à une page existante

```tsx
import ColorProfile from "@/components/Application/MonCompte/ColorProfile";

export default function MonComptePage() {
  return (
    <div className="space-y-6">
      {/* Autres composants */}
      <ColorProfile />
    </div>
  );
}
```

### Option 2: L'intégrer dans les paramètres

```tsx
// Dans votre fichier de paramètres
import ColorProfile from "@/components/Application/MonCompte/ColorProfile";

export default function Parametres() {
  return (
    <section className="space-y-8">
      <ColorProfile />
      {/* Autres paramètres */}
    </section>
  );
}
```

## Fonctionnalités incluses

- 🎨 **Sélecteur de couleur visuel** avec input color et input text
- 👀 **Aperçu en temps réel** des couleurs sélectionnées
- 🔄 **État de chargement** lors de la récupération et sauvegarde
- ✅ **Gestion d'erreurs** avec toasts de notification
- 🔧 **Bouton de réinitialisation** aux couleurs par défaut
- 📱 **Interface responsive** adaptée au design existant

## API Backend correspondante

Le composant utilise les endpoints suivants :

- `GET /users/color-profile` - Récupérer les couleurs
- `PATCH /users/color-profile` - Mettre à jour les couleurs

Corps de la requête PATCH :

```json
{
  "colorProfile": "#3B82F6",
  "colorProfileBis": "#6366F1"
}
```

## Personnalisation

Le composant utilise les classes Tailwind suivantes pour être cohérent avec votre design :

- `bg-white/5` pour les arrière-plans
- `border-white/10` pour les bordures
- `font-one` pour la typographie
- `tertiary-400` et `tertiary-500` pour les boutons

Vous pouvez modifier ces classes selon vos besoins.
