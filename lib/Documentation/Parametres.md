# Documentation - Module Paramètres

## Vue d'ensemble

Le module **Paramètres** est le centre de configuration avancée de l'application InkStudio. Il permet aux utilisateurs de gérer leur compte, abonnement SaaS, notifications, sécurité et préférences personnelles. Ce module intègre la gestion complète des plans d'abonnement avec upgrade/downgrade, la sécurité du compte et la personnalisation de l'expérience utilisateur.

---

## 🏗️ Architecture du Module

### Structure des fichiers

```
app/(root)/(application)/parametres/
└── page.tsx                    # Page unique de paramètres

lib/
├── queries/                    # Actions et requêtes API
│   ├── saas.ts                # Gestion des abonnements
│   ├── auth.ts                # Authentification et sécurité
│   └── user.ts                # Paramètres utilisateur
├── type.ts                     # Types TypeScript
└── zod/validator.schema.ts     # Validation des formulaires
```

### Types principaux

```typescript
interface Subscription {
  id: string;
  userId: string;
  currentPlan: "FREE" | "PRO" | "BUSINESS";
  planStatus: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate: string | null;
  trialEndDate: string | null;
  maxAppointments: number;
  maxClients: number;
  maxTattooeurs: number;
  maxPortfolioImages: number;
  hasAdvancedStats: boolean;
  hasEmailReminders: boolean;
  hasCustomBranding: boolean;
  hasApiAccess: boolean;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
}

interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  appointmentReminders: boolean;
  followUpReminders: boolean;
}
```

---

## 📱 Fonctionnalités Principales

### 1. Gestion du Compte Utilisateur

**Objectif :** Affichage et modification des informations personnelles du salon.

#### Informations affichées

**🏢 Données du salon :**

- Nom du salon
- Email de connexion
- Téléphone (optionnel)
- Adresse complète

**⚙️ Paramètre spécial - Confirmation RDV :**

- Toggle pour activer/désactiver la confirmation manuelle
- État visuel (automatique/manuel)
- Impact sur les nouveaux rendez-vous

#### Fonctionnement de la confirmation RDV

```tsx
const handleConfirmationSettingChange = async (value: boolean) => {
  try {
    const response = await updateAppointmentConfirmationAction(value);

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    setConfirmationEnabled(value);

    toast.success(
      value
        ? "Confirmation manuelle activée - Les nouveaux RDV devront être confirmés"
        : "Confirmation automatique activée - Les nouveaux RDV seront directement confirmés"
    );
  } catch (error) {
    toast.error("Erreur lors de la mise à jour du paramètre");
  }
};
```

**États des confirmations :**

- **Automatique (false)** : Les RDV sont confirmés immédiatement
- **Manuel (true)** : Les RDV nécessitent une confirmation du salon

---

### 2. Gestion des Abonnements SaaS

**Objectif :** Centre de contrôle complet pour la gestion des plans d'abonnement.

#### Plans disponibles

**🆓 Plan Gratuit (FREE) :**

- 5 clients maximum
- 10 RDV par mois
- Support basique
- Fonctionnalités limitées
- Prix : 0€/mois

**⭐ Plan Pro (PRO) :**

- Clients illimités
- RDV illimités
- Support prioritaire
- Analytics avancées
- Rappels automatiques
- Prix : 35,99€/mois

**🏢 Plan Business (BUSINESS) :**

- Multi-salons
- API accès
- Support dédié
- Branding personnalisé
- Intégrations avancées
- Prix : 89,99€/mois

#### Affichage du plan actuel

```tsx
const getPlanDetails = (plan: string) => {
  switch (plan) {
    case "FREE":
      return {
        name: "Gratuit",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/30",
        features: [
          `${subscription?.maxClients || 0} clients max`,
          `${subscription?.maxAppointments || 0} RDV/mois`,
          "Support basique",
        ],
      };
    case "PRO":
      return {
        name: "Pro",
        color: "text-tertiary-400",
        bgColor: "bg-tertiary-500/20",
        borderColor: "border-tertiary-500/30",
        features: [
          "Clients illimités",
          "RDV illimités",
          "Support prioritaire",
          "Analytics avancées",
          "Rappels automatiques",
        ],
      };
    // ... autres plans
  }
};
```

#### Changement de plan

**🔄 Processus d'upgrade/downgrade :**

1. **Sélection** : Modal avec tous les plans disponibles
2. **Validation** : Confirmation du changement
3. **Traitement** : Appel API avec mise à jour immédiate
4. **Facturation** : Calcul au prorata automatique
5. **Confirmation** : Notification de succès

**⚠️ Avertissements spéciaux :**

- Downgrade vers gratuit : Alerte sur les limitations
- Upgrade : Information sur la facturation immédiate
- Période d'essai : Affichage des dates importantes

```tsx
const handlePlanChange = async (newPlan: string) => {
  setIsChangingPlan(true);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/saas/upgrade/${user.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors du changement de plan");
    }

    await fetchUserPlan(); // Refresh des données
    toast.success(
      `Plan changé avec succès vers ${getPlanDetails(newPlan).name} !`
    );
    setShowPlanModal(false);
  } catch (error) {
    toast.error("Erreur lors du changement de plan");
  } finally {
    setIsChangingPlan(false);
  }
};
```

#### Informations de facturation

**📊 Données affichées :**

- Prix mensuel/annuel
- Date de début d'abonnement
- Prochaine date de paiement
- Statut du plan (actif/annulé/expiré)
- Méthode de paiement
- Période d'essai (si applicable)

**📈 Limites du plan :**

- Nombre de clients maximum
- RDV par mois
- Tatoueurs dans l'équipe
- Images portfolio
- Fonctionnalités avancées

---

### 3. Gestion des Notifications

**Objectif :** Configuration fine des préférences de communication.

#### Types de notifications

**📧 Notifications par email :**

- Activé/désactivé globalement
- Impact sur tous les emails système

**📅 Rappels de rendez-vous :**

- Notifications avant les RDV
- Envoi automatique aux clients et salon

**🔄 Rappels de suivi :**

- Post-tatouage et cicatrisation
- Demandes de photos de suivi

**📢 Emails marketing :**

- Nouveautés et promotions
- Newsletter InkStudio
- Conseils et astuces

#### Gestion des paramètres

```tsx
const handleSettingChange = async (
  setting: keyof UserSettings,
  value: boolean
) => {
  try {
    // Mise à jour optimiste
    setSettings((prev) => ({ ...prev, [setting]: value }));

    // Appel API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/settings`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [setting]: value }),
      }
    );

    if (response.ok) {
      toast.success("Paramètre mis à jour");
    } else {
      throw new Error("Erreur serveur");
    }
  } catch (error) {
    // Rollback en cas d'erreur
    setSettings((prev) => ({ ...prev, [setting]: !value }));
    toast.error("Erreur lors de la mise à jour");
  }
};
```

---

### 4. Sécurité du Compte

**Objectif :** Gestion de la sécurité et de l'authentification.

#### Changement de mot de passe

**🔐 Processus sécurisé :**

1. **Vérification** : Mot de passe actuel requis
2. **Validation** : Nouveau mot de passe (min 6 caractères)
3. **Confirmation** : Double saisie obligatoire
4. **Mise à jour** : Hash sécurisé côté serveur

**Validation Zod :**

```typescript
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
```

**Traitement sécurisé :**

```tsx
const handlePasswordChange = async (
  data: z.infer<typeof changePasswordSchema>
) => {
  setIsChangingPassword(true);

  try {
    const response = await changePasswordAction({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    if (!response.ok) {
      throw new Error(response.message || "Erreur lors du changement");
    }

    toast.success("Mot de passe changé avec succès !");
    setShowPasswordModal(false);
    passwordForm.reset();
  } catch (error) {
    toast.error(error.message || "Erreur lors du changement de mot de passe");
  } finally {
    setIsChangingPassword(false);
  }
};
```

#### Gestion des sessions

**📱 Sessions actives :**

- Liste des appareils connectés
- Dernière activité par appareil
- Géolocalisation (si disponible)
- Déconnexion sélective ou totale

**🚪 Déconnexion sécurisée :**

- Déconnexion de tous les appareils
- Invalidation des tokens
- Notification par email

---

### 5. Préférences Personnelles

**Objectif :** Personnalisation de l'expérience utilisateur.

#### Paramètres régionaux

**🌍 Fuseau horaire :**

- Sélection parmi les zones principales
- Impact sur l'affichage des dates/heures
- Synchronisation avec les RDV

**🗣️ Langue d'interface :**

- Français (par défaut)
- Anglais
- Espagnol
- Autres langues à venir

#### Configuration avancée

**🎨 Thème d'interface :**

- Mode sombre (par défaut)
- Mode clair (à venir)
- Contraste élevé (accessibilité)

**📊 Préférences d'affichage :**

- Format des dates (DD/MM/YYYY, MM/DD/YYYY)
- Format des heures (24h, 12h)
- Monnaie locale

---

## 🎨 Design et Interface

### Architecture des sections

**📂 Sections pliables :**

- Header cliquable avec icône +/-
- Animation fluide d'ouverture/fermeture
- État persistant par session
- Responsive mobile-first

```tsx
const [openSections, setOpenSections] = useState({
  account: true,
  subscription: true,
  notifications: false,
  security: false,
  preferences: false,
});

const toggleSection = (section: keyof typeof openSections) => {
  setOpenSections((prev) => ({
    ...prev,
    [section]: !prev[section],
  }));
};
```

### Design responsive

**📱 Mobile :**

- Sections empilées verticalement
- Boutons pleine largeur
- Textes adaptés (courts)
- Touch-friendly (44px minimum)

**💻 Desktop :**

- Layout plus aéré
- Textes complets
- Hover effects
- Raccourcis clavier

**🎨 Système de couleurs :**

- `noir-700` : Arrière-plan principal
- `noir-500` : Cards et modals
- `tertiary-400/500` : Accents et actions
- `white/5-20` : Bordures et états

### Composants d'interface

**🔘 Toggles personnalisés :**

```tsx
<label className="relative inline-flex items-center cursor-pointer">
  <input
    type="checkbox"
    checked={value}
    onChange={(e) => handleChange(e.target.checked)}
    className="sr-only peer"
  />
  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
</label>
```

**🏷️ Badges de plan :**

- Couleurs spécifiques par plan
- Animations subtiles
- Indicateurs visuels de statut

---

## 🔧 Intégrations Techniques

### API SaaS

**Endpoints principaux :**

- `GET /saas/plan/${userId}` : Récupération du plan actuel
- `PATCH /saas/upgrade/${userId}` : Changement de plan
- `POST /saas/cancel/${userId}` : Annulation d'abonnement
- `GET /saas/usage/${userId}` : Statistiques d'utilisation

**Gestion des erreurs SaaS :**

```tsx
const fetchUserPlan = useCallback(async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/saas/plan/${user.id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Cookie de session
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du plan");
    }

    const data = await response.json();
    setSubscription(data);
  } catch (error) {
    console.error("Erreur plan utilisateur :", error);
    // Fallback vers plan gratuit
    setSubscription(null);
  }
}, [user?.id]);
```

### Authentification et sécurité

**Endpoints sécurisés :**

- `POST /auth/change-password` : Changement de mot de passe
- `GET /auth/sessions` : Sessions actives
- `POST /auth/logout-all` : Déconnexion totale
- `PATCH /users/settings` : Paramètres utilisateur

**Validation côté client :**

- React Hook Form + Zod
- Validation en temps réel
- Messages d'erreur contextuels
- Protection CSRF

### Gestion d'état avancée

**États multiples :**

```tsx
// États de chargement
const [loading, setLoading] = useState(true);
const [isChangingPlan, setIsChangingPlan] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);

// États des modales
const [showPlanModal, setShowPlanModal] = useState(false);
const [showPasswordModal, setShowPasswordModal] = useState(false);

// Données utilisateur
const [subscription, setSubscription] = useState<Subscription | null>(null);
const [settings, setSettings] = useState<UserSettings>({...});
const [confirmationEnabled, setConfirmationEnabled] = useState(false);
```

---

## 🚦 Workflows Utilisateur

### Scénario : Upgrade de plan

1. **Consultation** : Utilisateur consulte les limites actuelles
2. **Comparaison** : Ouverture modal de changement de plan
3. **Sélection** : Choix du nouveau plan (Pro/Business)
4. **Validation** : Confirmation avec informations de facturation
5. **Traitement** : Mise à jour immédiate du plan
6. **Confirmation** : Notification et refresh des données

### Scénario : Configuration notifications

1. **Accès** : Section notifications dépliée
2. **Configuration** : Toggle des différents types
3. **Sauvegarde** : Mise à jour automatique par paramètre
4. **Feedback** : Toast de confirmation pour chaque changement

### Scénario : Changement mot de passe

1. **Sécurité** : Section sécurité dépliée
2. **Initialisation** : Ouverture modal dédiée
3. **Vérification** : Saisie mot de passe actuel
4. **Nouveau** : Définition nouveau mot de passe
5. **Confirmation** : Double vérification
6. **Validation** : Contrôles de sécurité
7. **Mise à jour** : Hash et sauvegarde sécurisés

---

## 📊 Métriques et Analytics

### KPIs à surveiller

**💰 Métriques business :**

- Taux de conversion Free → Pro
- Churn rate par plan
- Revenue per user (ARPU)
- Lifetime value (LTV)

**📈 Utilisation des fonctionnalités :**

- Changements de plan par mois
- Fréquence de modification des paramètres
- Utilisation des limites par plan
- Abandons de processus d'upgrade

**🔒 Sécurité :**

- Fréquence de changement de mot de passe
- Tentatives d'accès échouées
- Sessions multiples par utilisateur

### Données à collecter

```tsx
// Analytics d'usage
const trackPlanChange = (oldPlan: string, newPlan: string) => {
  analytics.track("plan_changed", {
    user_id: user.id,
    old_plan: oldPlan,
    new_plan: newPlan,
    timestamp: new Date().toISOString(),
  });
};

// Métriques de sécurité
const trackPasswordChange = () => {
  analytics.track("password_changed", {
    user_id: user.id,
    timestamp: new Date().toISOString(),
  });
};
```

---

## 🛠️ Maintenance et Debugging

### Logs importants

**Changement de plan :**

```typescript
console.log("🔄 Changement de plan:", { oldPlan, newPlan, userId });
console.log("✅ Plan mis à jour avec succès");
console.error("❌ Erreur changement de plan:", error);
```

**Sécurité :**

```typescript
console.log("🔐 Tentative de changement de mot de passe");
console.log("✅ Mot de passe mis à jour");
console.error("❌ Échec changement mot de passe:", error);
```

**Paramètres :**

```typescript
console.log("⚙️ Mise à jour paramètre:", { setting, value });
console.log("✅ Paramètre sauvegardé");
```

### Erreurs communes

**Problème** : Plan non récupéré au chargement
**Solution** : Vérifier les cookies de session et l'authentification

**Problème** : Échec de changement de plan
**Solution** : Contrôler les permissions et la validité du plan

**Problème** : Paramètres non sauvegardés
**Solution** : Vérifier la connectivité et les validations

### Tests recommandés

**Tests unitaires :**

- Validation des schémas Zod
- Fonctions de changement de plan
- Toggles de paramètres

**Tests d'intégration :**

- Workflow complet d'upgrade
- Changement de mot de passe end-to-end
- Sauvegarde des préférences

**Tests de sécurité :**

- Validation des mots de passe
- Protection contre les attaques CSRF
- Gestion des sessions

---

## 🎯 Roadmap & Améliorations

### Version actuelle (1.0)

- ✅ Gestion complète des plans SaaS
- ✅ Sécurité et changement de mot de passe
- ✅ Configuration des notifications
- ✅ Préférences de base
- ✅ Interface responsive

### Prochaines versions

**v1.1 - Facturation avancée**

- [ ] Historique des paiements
- [ ] Factures téléchargeables
- [ ] Méthodes de paiement multiples
- [ ] Codes promotionnels

**v1.2 - Sécurité renforcée**

- [ ] Authentification à deux facteurs (2FA)
- [ ] Logs de sécurité détaillés
- [ ] Alertes de connexions suspectes
- [ ] Récupération de compte avancée

**v1.3 - Personnalisation avancée**

- [ ] Thèmes personnalisés
- [ ] Widgets configurables
- [ ] API webhooks personnalisés
- [ ] Intégrations tierces

**v1.4 - Analytics & Insights**

- [ ] Dashboard d'utilisation personnel
- [ ] Recommandations d'optimisation
- [ ] Comparaisons avec la moyenne
- [ ] Prédictions de croissance

---

## 🔐 Sécurité et Conformité

### Protection des données

**RGPD :**

- Consentement explicite pour les emails marketing
- Droit à l'oubli (suppression compte)
- Export des données personnelles
- Anonymisation des analytics

**Sécurité des mots de passe :**

- Hash bcrypt avec salt
- Politique de complexité configurable
- Historique des anciens mots de passe
- Expiration périodique (optionnelle)

### Audit et traçabilité

**Logs de sécurité :**

```typescript
interface SecurityLog {
  userId: string;
  action: "password_change" | "plan_change" | "settings_update";
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}
```

**Conformité :**

- Retention des logs (1 an minimum)
- Chiffrement des données sensibles
- Sauvegarde régulière
- Tests de pénétration périodiques

---

## 🌐 Internationalisation

### Support multilingue

**Textes traduits :**

- Interface complète en français/anglais
- Messages d'erreur localisés
- Emails transactionnels multilingues
- Documentation utilisateur

**Formats régionaux :**

```typescript
const formatters = {
  currency: new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }),
  date: new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }),
};
```

### Adaptation culturelle

**Préférences régionales :**

- Format des dates (DD/MM vs MM/DD)
- Format des numéros de téléphone
- Devises locales
- Jours de la semaine (lundi/dimanche premier)

---

_Cette documentation couvre l'ensemble du module Paramètres de l'application InkStudio. Elle constitue la référence complète pour la gestion des comptes utilisateur, abonnements SaaS, sécurité et préférences, servant de guide technique et fonctionnel pour l'équipe de développement._
