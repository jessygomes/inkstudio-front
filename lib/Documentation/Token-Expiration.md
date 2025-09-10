# Gestion des Tokens Expirés - InkStudio

## Vue d'ensemble

Ce système gère automatiquement les tokens d'authentification expirés côté client et serveur pour une expérience utilisateur fluide.

## 🔧 Architecture

### Côté Serveur (`auth.server.ts`)

```typescript
export const getAuthenticatedUser = async () => {
  // ...
  if (response.status === 401) {
    await deleteSession(); // Nettoie les cookies côté serveur
    throw new Error("TOKEN_EXPIRED");
  }
  // ...
};
```

### Côté Client (`auth-error-handler.ts`)

```typescript
export const handleAuthError = (error, router) => {
  if (isUnauthorized) {
    clearClientSession(); // Nettoie les cookies côté client
    router.push("/connexion?reason=expired");
    return true;
  }
  return false;
};
```

## 🛠️ Fonctionnalités

### 1. Détection automatique des tokens expirés

- **Serveur** : Détection via status HTTP 401
- **Client** : Intercepteur sur les requêtes fetch

### 2. Nettoyage automatique des cookies

- **Serveur** : `deleteSession()` supprime les cookies httpOnly
- **Client** : `clearClientSession()` supprime les cookies côté navigateur

### 3. Redirection intelligente

- Redirection vers `/connexion?reason=expired`
- Message d'information à l'utilisateur
- Prévention des boucles de redirection

### 4. Middleware de protection

- Vérification des tokens sur les routes protégées
- Redirection automatique si pas de token

## 📝 Usage

### Dans un composant React

```tsx
import { useAuthErrorHandler } from "@/lib/utils/auth-error-handler";

const MyComponent = () => {
  const { handleError } = useAuthErrorHandler();

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");
      // ...
    } catch (error) {
      if (!handleError(error)) {
        // Gérer les autres types d'erreurs
      }
    }
  };
};
```

### Avec authFetch (recommandé)

```tsx
import { authFetch } from "@/lib/utils/auth-error-handler";

const response = await authFetch("/api/data", {
  method: "POST",
  body: JSON.stringify(data),
});
// Gestion automatique des tokens expirés
```

## 🔒 Sécurité

### Cookies sécurisés

- `httpOnly: true` - Protection XSS
- `secure: true` en production - HTTPS uniquement
- `sameSite: "lax"` - Protection CSRF

### Nettoyage complet

- Suppression côté serveur ET client
- Invalidation immédiate des sessions
- Logs de sécurité détaillés

## 🚀 Routes protégées

Le middleware protège automatiquement :

- `/dashboard`
- `/rdv`
- `/clients`
- `/portfolio`
- `/mes-produits`
- `/mon-compte`
- `/parametres`

## 📊 Logs et Debugging

### Logs serveur

```
🔑 Token expiré ou invalide - Nettoyage des cookies
✅ Utilisateur récupéré (auth.server.ts)
🧹 Cookies de session supprimés côté serveur
```

### Logs client

```
🔑 Token expiré détecté côté client - Nettoyage des cookies
🧹 Cookies de session supprimés côté client
```

## 🔄 Workflow complet

1. **Détection** : Token expiré lors d'une requête (401)
2. **Nettoyage serveur** : `deleteSession()` supprime les cookies httpOnly
3. **Erreur propagée** : `TOKEN_EXPIRED` remontée au layout
4. **Redirection** : Vers `/connexion?reason=expired`
5. **Nettoyage client** : `clearClientSession()` si nécessaire
6. **Message utilisateur** : "Votre session a expiré"
7. **Reconnexion** : Processus de login normal

## 🛡️ Protection contre les cas d'erreur

- **Fallback redirection** : `window.location.href` si router indisponible
- **Double nettoyage** : Serveur + client pour garantir la suppression
- **Gestion d'erreurs** : Try/catch avec logs détaillés
- **Prevention des boucles** : Vérification des URL de redirection

## 📱 Expérience utilisateur

- Message clair lors de l'expiration
- Redirection automatique et fluide
- Sauvegarde du contexte de navigation (paramètres URL)
- Reconnexion rapide sans perte de données

## 🔧 Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_BACK_URL=http://localhost:8000
NODE_ENV=production # Pour les cookies sécurisés
```

### Durée de vie des cookies

```typescript
expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
```

## 🧪 Tests

### Test d'expiration manuelle

1. Se connecter à l'application
2. Supprimer le token côté backend ou attendre l'expiration
3. Naviguer vers une page protégée
4. Vérifier la redirection et le message

### Test de nettoyage

1. Vérifier la présence des cookies avant expiration
2. Déclencher l'expiration
3. Vérifier la suppression complète des cookies
4. Confirmer la redirection vers `/connexion?reason=expired`
