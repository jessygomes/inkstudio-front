# 📊 Dashboard - Page d'accueil du studio

## Vue d'ensemble

La page Dashboard est la page d'accueil principale de l'application InkStudio. Elle fournit une vue d'ensemble complète de l'activité du studio de tatouage avec des widgets d'information en temps réel et des statistiques avancées.

## 🎯 Objectif

Cette page permet aux propriétaires de studios de tatouage de :

- Consulter rapidement les rendez-vous du jour
- Suivre les statistiques clés de leur activité
- Gérer les demandes en attente
- Avoir une vision globale de leur business

## 🏗️ Structure de la page

### Header Section

- **Titre** : "Dashboard" avec icône animée
- **Description** : "Vue d'ensemble de votre activité"
- **Actions rapides** :
  - Bouton "Nouveau RDV" → `/mes-rendez-vous/creer`
  - Bouton "Nouveau client" → `/clients`

### Layout responsive (Grid 12 colonnes)

La page utilise un système de grille CSS responsive qui s'adapte selon la taille d'écran :

- **Mobile** : 1 colonne
- **Tablet** : 2 colonnes
- **Desktop** : Jusqu'à 4 colonnes

## 📱 Composants et Widgets

### 1. Statistiques avancées (Top Row) - **PREMIUM UNIQUEMENT**

#### `WeeklyFillRate` - Taux de remplissage hebdomadaire

- **Fonction** : Affiche le pourcentage de créneaux occupés sur la semaine
- **Navigation** : Boutons précédent/suivant pour changer de semaine
- **Couleurs** :
  - Vert (≥80%) : Excellent
  - Jaune (≥60%) : Bon
  - Orange (≥40%) : Moyen
  - Rouge (<40%) : Faible
- **Données** : Créneaux totaux vs créneaux occupés

#### `CancelFillRate` - Taux d'annulation

- **Fonction** : Statistiques globales d'annulation des RDV
- **Métriques** :
  - Pourcentage d'annulation
  - Nombre total de RDV
  - RDV annulés/confirmés/en attente
- **Objectif** : Maintenir <15% d'annulations
- **Couleurs** : Vert à rouge selon le taux

#### `NewClientsCount` - Nouveaux clients

- **Fonction** : Nombre de nouveaux clients par mois
- **Navigation** : Sélecteur de mois/année
- **Limitation** : Pas de navigation future (mois courant max)
- **Icône** : Utilisateurs avec badge "nouveau"

#### `TotalPayed` - Chiffre d'affaires

- **Fonction** : Revenus totaux des tatouages payés par mois
- **Format** : Devise française (€)
- **Navigation** : Mois précédent/suivant
- **Indication** : Montant des tatouages confirmés et payés

### 2. Gestion des rendez-vous (Middle Row)

#### `RendezVousToday` - RDV du jour

- **Taille** : `col-span-12 lg:col-span-4`
- **Fonction** : Affiche les rendez-vous de la date sélectionnée
- **Navigation** :
  - Boutons jour précédent/suivant
  - Labels intelligents (Aujourd'hui, Hier, Demain)
- **Détails par RDV** :
  - Heure de début/fin et durée
  - Nom du client et tatoueur
  - Type de prestation
  - Statut (PENDING, CONFIRMED, CANCELED)
  - Prix (estimé ou final)
  - Zone anatomique
  - Statut de paiement
- **Actions** :
  - Voir détails complets
  - Marquer comme payé/non payé
  - Modifier le RDV

#### `WaitingRdv` - RDV en attente de confirmation

- **Taille** : `col-span-12 lg:col-span-4`
- **Fonction** : Liste des RDV avec statut "PENDING"
- **Informations** :
  - Client et contact
  - Date/heure proposée
  - Délai avant RDV
  - Détails de la prestation
- **Actions rapides** :
  - Confirmer le RDV
  - Annuler le RDV
  - Voir détails complets
- **Gestion** : Messages personnalisés pour confirmation/annulation

### 3. Suivi client (Premium)

#### `NotAnswerClient` - Suivis en attente - **PREMIUM UNIQUEMENT**

- **Taille** : `col-span-12 lg:col-span-4`
- **Fonction** : Gestion des avis clients non répondus
- **Contenu** :
  - Note client (1-5 étoiles)
  - Commentaire/avis
  - Photo du tatouage cicatrisé
  - Temps écoulé depuis l'avis
- **Actions** :
  - Répondre à l'avis
  - Marquer comme traité
- **Notification** : Badge avec nombre d'avis en attente

### 4. Message compte gratuit

Pour les utilisateurs avec `saasPlan === "FREE"`, un bandeau informatif remplace les statistiques premium :

- **Design** : Gradient orange/tertiary avec bordure
- **Contenu** :
  - Explication des fonctionnalités premium
  - Liste des statistiques disponibles
  - Boutons d'action vers les plans payants
- **Features présentées** :
  - 📈 Taux de remplissage hebdomadaire
  - 💰 Revenus totaux
  - 👥 Nouveaux clients
  - 📉 Taux d'annulation

### 5. Espaces futurs (Bottom Row)

Deux placeholders pour de futurs composants :

- **Graphiques** : Espace pour charts/analytics
- **Widgets** : Zone pour nouveaux widgets métier

## 🎨 Design System

### Couleurs principales

- **Background** : `noir-700` (background principal)
- **Cards** : `noir-700` avec bordures `white/20`
- **Primary** : `tertiary-400` à `tertiary-600` (boutons, accents)
- **Status colors** :
  - Vert : Positif (confirmé, bon taux)
  - Orange : Attention (en attente)
  - Rouge : Négatif (annulé, mauvais taux)

### Typographie

- **Font principale** : `font-one`
- **Titres** : `font-bold` avec `tracking-wide`
- **Tailles** : `text-xs` à `text-xl` selon l'importance

### Effets visuels

- **Shadows** : `shadow-2xl` pour profondeur
- **Gradients** : Utilisés pour les boutons et zones premium
- **Borders** : `border-white/20` pour la séparation subtile
- **Animations** : `animate-pulse` pour les icônes de loading

## 🔄 États et gestion des données

### Loading States

Chaque composant gère son état de chargement avec :

- Skeleton loaders
- Spinners animés
- Messages d'attente

### Error Handling

- Messages d'erreur contextuels
- Boutons de retry
- Fallbacks gracieux

### Real-time Updates

- Refresh automatique après actions
- Invalidation des queries React Query
- État synchronisé entre composants

## 📱 Responsive Design

### Breakpoints

- **Mobile** : `<640px` - Layout 1 colonne
- **Tablet** : `640px-1024px` - Layout 2 colonnes
- **Desktop** : `>1024px` - Layout 4 colonnes

### Adaptations

- Boutons header deviennent verticaux sur mobile
- Statistiques passent de 4 à 2 puis 1 colonne
- Navigation simplifiée sur petits écrans

## 🔐 Contrôle d'accès

### Compte gratuit (FREE)

- Accès aux RDV du jour
- Accès aux RDV en attente
- Pas d'accès aux statistiques
- Message promotionnel affiché

### Compte premium (PRO/PREMIUM)

- Accès complet à tous les widgets
- Statistiques avancées
- Suivi client complet
- Toutes les métriques business

## 🔗 Navigation et liens

### Actions principales

- **Nouveau RDV** : `/mes-rendez-vous/creer`
- **Nouveau client** : `/clients`
- **Upgrade** : `/parametres` (depuis message gratuit)

### Navigation interne

- Détails RDV : Modal overlay
- Détails client : Modal overlay
- Gestion actions : Modals de confirmation

## 🧪 Points d'amélioration futurs

### Nouvelles fonctionnalités envisagées

1. **Graphiques avancés** : Charts de revenus, tendances
2. **Notifications push** : Alertes temps réel
3. **Export données** : PDF/Excel des statistiques
4. **Widget météo** : Pour planifier les RDV
5. **Intégration calendrier** : Google Calendar, Outlook
6. **Chat client** : Communication directe

### Optimisations techniques

1. **Caching intelligent** : Réduction des appels API
2. **Lazy loading** : Chargement différé des composants
3. **PWA** : Application web progressive
4. **Dark/Light mode** : Thèmes multiples

## 📊 Métriques de performance

### Objectifs UX

- **Temps de chargement** : <2 secondes
- **Interaction** : <100ms de réponse
- **Accessibilité** : Score AA minimum
- **Mobile-first** : Design adaptatif parfait

Cette page Dashboard constitue le cœur de l'expérience utilisateur d'InkStudio, offrant une vue d'ensemble complète et des outils de gestion efficaces pour les professionnels du tatouage.
