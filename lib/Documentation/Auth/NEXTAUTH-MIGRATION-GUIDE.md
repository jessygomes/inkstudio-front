# 🔐 Migration vers NextAuth - Guide Complet

## ✅ Ce qui a été implémenté

### 1. **Installation des dépendances**

- `next-auth@beta` (v5) - Framework d'authentification sécurisé
- `bcryptjs` - Pour le hachage des mots de passe si nécessaire

### 2. **Fichiers de configuration NextAuth**

#### `auth.config.ts`

Configuration du provider Credentials qui se connecte à votre backend existant.

#### `auth.ts`

Configuration principale avec callbacks JWT et session pour gérer les tokens.

#### `app/api/auth/[...nextauth]/route.ts`

Route handler pour les endpoints NextAuth (`/api/auth/*`)

### 3. **Types TypeScript**

`types/next-auth.d.ts` - Extensions des types NextAuth pour inclure vos propriétés personnalisées (role, accessToken, etc.)

### 4. **Helpers d'authentification**

`lib/auth-helpers.ts` - Fonctions utilitaires pour :

- `getCurrentUser()` - Récupérer l'utilisateur connecté
- `getSession()` - Récupérer la session complète
- `getAccessToken()` - Récupérer le token pour les appels API
- `getAuthHeaders()` - Générer les headers d'authentification

### 5. **Middleware mis à jour**

Le middleware utilise maintenant `auth()` de NextAuth pour vérifier l'authentification de manière sécurisée.

### 6. **Composants mis à jour**

- **ConnexionForm** - Utilise `signIn()` de NextAuth
- **LogoutBtn** - Utilise `signOut()` de NextAuth
- **NextAuthProvider** - Provider pour utiliser `useSession()` dans les composants clients

### 7. **Layout principal**

Ajout du `NextAuthProvider` dans le layout racine.

---

## 🚀 Configuration requise

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env.local` :

```env
# Secret pour signer les JWT (IMPORTANT - À générer)
AUTH_SECRET=your-secret-key-here

# URL de base (en production, mettez votre domaine)
NEXTAUTH_URL=http://localhost:3000

# URL de votre backend (gardez celle que vous avez)
NEXT_PUBLIC_BACK_URL=http://localhost:4000
```

**Générer AUTH_SECRET :**

```bash
# Option 1: avec OpenSSL
openssl rand -base64 32

# Option 2: avec NextAuth CLI
npx auth secret
```

---

## 📝 Comment utiliser NextAuth dans votre code

### Dans les **Server Components** :

```typescript
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function MyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  return <div>Bonjour {user.name}</div>;
}
```

### Dans les **Server Actions** :

```typescript
"use server";
import { getAuthHeaders } from "@/lib/auth-helpers";

export async function fetchUserData() {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/user/profile`,
    { headers }
  );

  return response.json();
}
```

### Dans les **Client Components** :

```typescript
"use client";
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Chargement...</div>;
  if (!session) return <div>Non connecté</div>;

  return <div>Bonjour {session.user.name}</div>;
}
```

### Pour la **déconnexion** :

```typescript
"use client";
import { signOut } from "next-auth/react";

function LogoutButton() {
  return (
    <button onClick={() => signOut({ redirect: true, callbackUrl: "/" })}>
      Se déconnecter
    </button>
  );
}
```

---

## 🔄 Fichiers à migrer progressivement

Vous pouvez maintenant remplacer progressivement :

### ❌ Anciens fichiers (à supprimer plus tard)

- `lib/session.ts` - Remplacé par NextAuth
- `lib/auth.actions.ts` - Remplacé par `lib/auth-helpers.ts`
- `lib/auth.server.ts` - Remplacé par `lib/auth-helpers.ts`
- `lib/client-session.ts` - Plus nécessaire

### ✅ Nouveaux fichiers NextAuth

- `auth.config.ts` - Configuration
- `auth.ts` - Logique principale
- `lib/auth-helpers.ts` - Helpers réutilisables
- `types/next-auth.d.ts` - Types TypeScript

---

## 🛡️ Avantages de NextAuth

1. **Sécurité renforcée**

   - Gestion sécurisée des tokens JWT
   - Protection CSRF intégrée
   - Rotation automatique des tokens
   - Cookies sécurisés (httpOnly, secure, sameSite)

2. **Maintenance facilitée**

   - Standard de l'industrie pour Next.js
   - Documentation complète
   - Communauté active
   - Mises à jour régulières

3. **Flexibilité**

   - Support de multiples providers (Google, GitHub, Email, etc.)
   - Callbacks personnalisables
   - Facile à étendre

4. **Expérience développeur**
   - API simple et intuitive
   - Hooks React (`useSession`)
   - TypeScript de première classe
   - Middleware intégré

---

## 🧪 Test de l'authentification

1. Démarrez votre serveur backend
2. Démarrez votre application frontend : `npm run dev`
3. Allez sur http://localhost:3000/connexion
4. Connectez-vous avec vos identifiants
5. Vérifiez que la redirection vers `/dashboard` fonctionne
6. Testez la déconnexion

---

## 📋 Checklist de migration

- [x] Installation de NextAuth
- [x] Configuration des fichiers de base
- [x] Mise à jour du middleware
- [x] Mise à jour du formulaire de connexion
- [x] Mise à jour du bouton de déconnexion
- [x] Ajout du provider dans le layout
- [ ] Ajouter AUTH_SECRET dans .env.local
- [ ] Tester la connexion
- [ ] Tester la déconnexion
- [ ] Migrer les autres composants qui utilisent l'authentification
- [ ] Supprimer les anciens fichiers d'authentification

---

## 🆘 Dépannage

### Erreur: "AUTH_SECRET not set"

Ajoutez la variable `AUTH_SECRET` dans votre `.env.local`

### Erreur: "Credentials provider not found"

Vérifiez que `auth.config.ts` est bien configuré

### La session est null

Vérifiez que le `NextAuthProvider` enveloppe bien votre application dans le layout

### Redirection infinie

Vérifiez les chemins dans le middleware et les callbacks NextAuth

---

## 📚 Ressources

- [NextAuth v5 Documentation](https://authjs.dev)
- [NextAuth GitHub](https://github.com/nextauthjs/next-auth)
- [Guide de migration v4 → v5](https://authjs.dev/guides/upgrade-to-v5)
