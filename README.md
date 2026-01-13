# INKERA Studio - Frontend

Plateforme de gestion pour salons de tatouage construite avec Next.js 15 et NextAuth.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn
- Backend API en cours d'exécution

### Installation

```bash
npm install
```

### Configuration

**⚠️ IMPORTANT** : Avant de démarrer, configurez les variables d'environnement.

1. Créez un fichier `.env.local` à la racine :

```env
AUTH_SECRET=<votre-clé-secrète>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACK_URL=http://localhost:4000
```

2. Générez votre `AUTH_SECRET` :

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Pour plus de détails, consultez [CONFIGURATION-REQUISE.md](./CONFIGURATION-REQUISE.md)

### Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔐 Authentification

Ce projet utilise **NextAuth v5** pour une authentification sécurisée.

### Documentation

- 📖 [Guide de migration NextAuth](./NEXTAUTH-MIGRATION-GUIDE.md)
- ✅ [Résumé de l'installation](./NEXTAUTH-SETUP-COMPLETE.md)
- ⚙️ [Configuration requise](./CONFIGURATION-REQUISE.md)
- 💡 [Exemples d'utilisation](./lib/examples/nextauth-usage-examples.tsx)

### Utilisation rapide

**Server Component :**

```typescript
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function Page() {
  const user = await getCurrentUser();
  return <div>Bonjour {user?.name}</div>;
}
```

**Client Component :**

```typescript
"use client";
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session } = useSession();
  return <div>{session?.user.name}</div>;
}
```

## 📁 Structure du projet

```
├── app/                      # Pages et routes Next.js
│   ├── (auth)/              # Pages d'authentification
│   ├── (root)/              # Application principale
│   ├── api/                 # API routes
│   └── layout.tsx           # Layout racine
├── components/              # Composants React
│   ├── Auth/               # Composants d'authentification
│   ├── Application/        # Composants métier
│   ├── Providers/          # Context providers
│   └── ui/                 # Composants UI réutilisables
├── lib/                     # Utilitaires et helpers
│   ├── auth-helpers.ts     # Helpers NextAuth
│   ├── queries/            # React Query hooks
│   └── zod/                # Schémas de validation
├── auth.ts                  # Configuration NextAuth
├── auth.config.ts          # Config providers NextAuth
└── middleware.ts           # Middleware de protection

```

## 🛠️ Stack technologique

- **Framework** : Next.js 15 (App Router)
- **Authentification** : NextAuth v5
- **Styling** : TailwindCSS
- **Validation** : Zod
- **Forms** : React Hook Form
- **State Management** : React Query
- **Animations** : Framer Motion
- **WebSocket** : Socket.io-client

## 📝 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint

# Vérifier l'installation NextAuth (optionnel)
npm run verify-auth
```

## 🧪 Tests

Avant de déployer, vérifiez que :

- ✅ La connexion fonctionne
- ✅ Les routes protégées sont inaccessibles sans authentification
- ✅ La déconnexion fonctionne correctement
- ✅ La session persiste après actualisation

## 🚀 Déploiement

### Variables d'environnement en production

Définissez ces variables sur votre plateforme d'hébergement :

```env
AUTH_SECRET=<clé-générée-sécurisée>
NEXTAUTH_URL=https://votre-domaine.com
NEXT_PUBLIC_BACK_URL=https://api.votre-domaine.com
```

### Vercel

Le déploiement sur Vercel est recommandé pour Next.js :

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying).

## 📚 Documentation supplémentaire

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth Documentation](https://authjs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query)

## 🆘 Support

En cas de problème :

1. Consultez [CONFIGURATION-REQUISE.md](./CONFIGURATION-REQUISE.md)
2. Vérifiez [NEXTAUTH-MIGRATION-GUIDE.md](./NEXTAUTH-MIGRATION-GUIDE.md)
3. Consultez les logs du serveur et du navigateur

## 📄 Licence

Propriétaire - INKERA Studio

---

Développé avec ❤️ pour les professionnels du tatouage
