# 📝 NextAuth - Aide-mémoire

## 🔑 Générer une nouvelle clé AUTH_SECRET

```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

```bash
# Linux/Mac (OpenSSL)
openssl rand -base64 32
```

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚀 Commandes de développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Vérifier NextAuth (optionnel)
npm run verify-auth
```

---

## 📦 Imports courants

```typescript
// Server Components
import {
  getCurrentUser,
  getSession,
  getAccessToken,
  getAuthHeaders,
} from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

// Client Components
import { useSession, signIn, signOut } from "next-auth/react";

// Configuration
import { auth } from "@/auth";
```

---

## 💻 Snippets de code

### Récupérer l'utilisateur (Server Component)

```typescript
const user = await getCurrentUser();
if (!user) redirect("/connexion");
```

### Récupérer le token pour API call

```typescript
const token = await getAccessToken();
// ou
const headers = await getAuthHeaders();
```

### Utiliser la session (Client Component)

```typescript
const { data: session, status } = useSession();
if (status === "loading") return <Loader />;
if (!session) return <LoginPrompt />;
```

### Déconnexion

```typescript
await signOut({ redirect: true, callbackUrl: "/" });
```

### Connexion programmatique

```typescript
const result = await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: false,
});

if (result?.error) {
  // Gérer l'erreur
}
```

---

## 🔍 Debugging

### Vérifier la session dans un Server Component

```typescript
const session = await auth();
console.log("Session:", session);
```

### Vérifier les cookies

```typescript
// Dans le navigateur (DevTools > Application > Cookies)
// Rechercher: next-auth.session-token (production) ou
//            next-auth.session-token (dev)
```

### Logs NextAuth

```typescript
// Dans auth.ts, ajoutez :
export const { ... } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  // ... reste de la config
});
```

---

## 🛡️ Middleware patterns

### Protéger une route spécifique

```typescript
// Dans middleware.ts
if (
  req.nextUrl.pathname.startsWith("/admin") &&
  req.auth?.user.role !== "ADMIN"
) {
  return NextResponse.redirect(new URL("/", req.url));
}
```

### Rediriger si déjà connecté

```typescript
if (req.nextUrl.pathname === "/login" && req.auth) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

---

## 🔧 Configuration avancée

### Ajouter un champ personnalisé au token

```typescript
// Dans auth.ts > callbacks > jwt
if (user) {
  token.customField = user.customField;
}
```

### Exposer à la session client

```typescript
// Dans auth.ts > callbacks > session
session.customField = token.customField;
```

### Rafraîchir la session

```typescript
"use client";
import { useSession } from "next-auth/react";

const { update } = useSession();

// Mettre à jour la session
await update({
  ...session,
  user: { ...session.user, name: "New Name" },
});
```

---

## 🌐 Variables d'environnement

### Développement (.env.local)

```env
AUTH_SECRET=<clé-générée>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACK_URL=http://localhost:4000
```

### Production

```env
AUTH_SECRET=<clé-super-sécurisée>
NEXTAUTH_URL=https://votredomaine.com
NEXT_PUBLIC_BACK_URL=https://api.votredomaine.com
```

---

## 📋 Checklist de déploiement

- [ ] AUTH_SECRET unique et sécurisée
- [ ] NEXTAUTH_URL correcte (HTTPS en prod)
- [ ] Backend accessible depuis le frontend
- [ ] Cookies configurés correctement (secure, sameSite)
- [ ] Tests de connexion/déconnexion OK
- [ ] Pas de secrets dans le code committé
- [ ] .env.local dans .gitignore

---

## 🆘 Erreurs courantes

| Erreur                | Solution                                |
| --------------------- | --------------------------------------- |
| `AUTH_SECRET not set` | Créer `.env.local` avec AUTH_SECRET     |
| `Session null`        | Vérifier NextAuthProvider dans layout   |
| `CredentialsSignin`   | Vérifier backend et credentials         |
| `Redirect loop`       | Vérifier middleware et routes protégées |
| `401 Unauthorized`    | Token expiré ou invalide, reconnecter   |

---

## 📚 Ressources rapides

- [NextAuth Docs](https://authjs.dev)
- [Guide de migration](./NEXTAUTH-MIGRATION-GUIDE.md)
- [Exemples](./lib/examples/nextauth-usage-examples.tsx)
- [Configuration](./CONFIGURATION-REQUISE.md)

---

**Astuce** : Ajoutez ce fichier à vos favoris pour un accès rapide ! 📌
