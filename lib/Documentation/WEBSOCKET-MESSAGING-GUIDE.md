# Guide Websocket Messaging - InkStudio

## Vue d'ensemble

Le système de messagerie en temps réel fonctionne avec **Socket.IO** côté client et backend, permettant :

- **Envoi/réception de messages** instantanés
- **Indicateurs de typing** (voir qui écrit)
- **Marquage automatique** comme lu
- **Notifications** en temps réel
- **Gestion de la connexion** avec reconnexion auto

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Component: Conversation.tsx                        │   │
│  │  - Affiche les messages                             │   │
│  │  - Gère l'UI (typing, connexion, input)             │   │
│  │  - Appelle les actions du hook                      │   │
│  └─────────────────────────────────────────────────────┘   │
│           ↓ utilise                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Hook: useMessaging(token)                          │   │
│  │  - Gère la connexion Socket.IO                      │   │
│  │  - Émet et reçoit les événements                    │   │
│  │  - Maintient l'état (messages, typing, etc)         │   │
│  └─────────────────────────────────────────────────────┘   │
│           ↓ utilise                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Route: /api/messaging/token                    │   │
│  │  - Lit le cookie HttpOnly access_token              │   │
│  │  - Retourne le JWT au client                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↕ Socket.IO
                      ws://backend/messaging
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS/Node.js)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  - Valide le JWT dans le handshake                          │
│  - Gère les événements Socket.IO                            │
│  - Persiste les messages en BDD                             │
│  - Broadcast les notifications aux clients                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Flux d'authentification

### 1️⃣ **Récupération du Token**

```
Utilisateur accède à /messagerie/[id]
        ↓
Conversation.tsx se monte
        ↓
useEffect() appelle fetch("/api/messaging/token")
        ↓
API Route (côté serveur) lit cookies HttpOnly
        ↓
Retourne { token: "eyJhbGc..." }
        ↓
setAccessToken(token)
        ↓
useMessaging(token) reçoit le token
```

**Pourquoi cette approche ?**

- Les cookies HttpOnly ne sont **pas accessibles** via `document.cookie` côté client (par sécurité)
- L'API route s'exécute côté serveur et peut les lire
- Le token est ensuite envoyé au socket pour l'authentification

### 2️⃣ **Connexion Socket.IO**

```
useMessaging reçoit token
        ↓
Crée connexion: io(`${NEXT_PUBLIC_BACK_URL}/messaging`, {
  auth: { token },                    // JWT brut
  withCredentials: true,              // Envoie les cookies
  transports: ["websocket", "polling"]
})
        ↓
Socket établit la connexion
        ↓
Backend reçoit le handshake
        ↓
Valide le JWT
        ↓
Si valide → Accept, sinon → Disconnect
        ↓
socket.on("connect") déclenché ✅
        ↓
setIsConnected(true)
```

**Code dans useMessaging.ts :**

```typescript
useEffect(() => {
  if (!token || socketRef.current) return; // Attend le token

  const socket = io(baseUrl, {
    auth: { token }, // JWT brut (pas de "Bearer ")
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("✅ Connecté");
    setIsConnected(true);
  });

  socketRef.current = socket;
}, [token]);
```

---

## Flux des Messages

### Envoi d'un message

```
Utilisateur tape un message et appuie sur Envoyer
        ↓
MessageInput.tsx → handleSendMessage(message)
        ↓
Conversation.tsx → sendMessage(conversationId, message)
        ↓
useMessaging → socketRef.emit("send-message", {
  conversationId: "abc123",
  content: "Bonjour!",
  attachments: []
})
        ↓
Backend reçoit l'événement
        ↓
Valide, persiste en BDD
        ↓
Backend émet "new-message" à tous les clients de la conversation
        ↓
Tous les clients reçoivent:
  socket.on("new-message", (message) => {
    setMessages(prev => [...prev, message])
  })
        ↓
L'UI se met à jour ✅
```

### Réception de messages (en direct)

```
Backend persiste un message (via API, autre client, etc)
        ↓
Broadcast via socket.io (emit "new-message")
        ↓
useMessaging écoute cet événement
        ↓
setMessages((prev) => [...prev, newMessage])
        ↓
liveMessages change de valeur
        ↓
displayedMessages recalcule
        ↓
MessageBubbles re-render avec le nouveau message ✅
```

---

## Gestion des Typing Indicators

### Utilisateur commence à écrire

```
MessageInput.tsx détecte onChange
        ↓
onInputChange() appelé
        ↓
handleInputChange(value) dans Conversation.tsx
        ↓
if (!isTyping) {
  startTyping(conversationId)  // Envoyer au socket
  setIsTyping(true)
}
        ↓
useMessaging → socketRef.emit("user-typing", { conversationId })
        ↓
Backend broadcast "user-typing" à tous les clients
        ↓
Autres clients reçoivent:
  socket.on("user-typing", (data) => {
    setTypingUsers(prev => new Set([...prev, userId]))
  })
        ↓
UI affiche "Quelqu'un est en train d'écrire..." ✅
```

### Utilisateur arrête d'écrire

```
2 secondes sans activité (timeout)
        ↓
handleInputChange() timeout déclenche:
  stopTyping(conversationId)
  setIsTyping(false)
        ↓
useMessaging → socketRef.emit("user-stopped-typing", { conversationId })
        ↓
Backend broadcast à tous
        ↓
Autres clients reçoivent:
  socket.on("user-stopped-typing", (data) => {
    setTypingUsers(prev => {
      prev.delete(userId)
      return prev
    })
  })
        ↓
UI cache le message "en train d'écrire" ✅
```

---

## Marquage des messages comme lus

### Automatique à la réception

```
Utilisateur ouvre une conversation
        ↓
joinConversation(conversationId) déclenché
        ↓
useEffect regarde les messages
        ↓
Pour chaque message non lu envoyé par l'autre:
  markAsRead(messageId)
        ↓
useMessaging → socketRef.emit("mark-as-read", { messageId })
        ↓
Backend met à jour isRead = true en BDD
        ↓
Backend broadcast "message-read" à tous
        ↓
Autres clients reçoivent:
  socket.on("message-read", (data) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === data.messageId
          ? { ...msg, isRead: true, readAt: data.readAt }
          : msg
      )
    )
  })
        ↓
Affichage du status "lu" mis à jour ✅
```

---

## État et Flux de reconnexion

### Déconnexion et reconnexion auto

```
Connexion perdue (wifi off, serveur redémarre, etc)
        ↓
socket.on("disconnect", (reason) => {
  console.log("Déconnecté:", reason)
  setIsConnected(false)
})
        ↓
Socket.IO essaie de se reconnecter (auto)
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
        ↓
Si réussi:
  socket.on("connect")
  setIsConnected(true)
  UI passe au vert ✅
        ↓
Si échoué 5x:
  Arrête, affiche "Déconnecté" en rouge
  Utilisateur doit recharger
```

**UI Impact :**

- Badge "Connecté" / "Déconnecté" dans le header
- Input désactivé quand déconnecté
- MessageInput refuse d'envoyer si `!isConnected`

---

## Structure des Fichiers

```
lib/
├── hook/
│   └── useMessaging.ts          ← Hook principal (Socket.IO)
│
app/
├── api/
│   └── messaging/
│       └── token/
│           └── route.ts          ← Récupère le JWT des cookies
│
components/
└── Application/
    └── Messaging/
        ├── Conversation.tsx      ← Component principal
        ├── MessageBubbles.tsx     ← Affichage des messages
        ├── MessageInput.tsx       ← Input et envoi
        ├── ConversationRDVDetails.tsx
        ├── ConversationRDVModal.tsx
        └── ...
```

---

## Types de données

### MessagingMessage (depuis le socket)

```typescript
interface MessagingMessage {
  id: string;
  content: string;
  senderId: string;
  type: "USER" | "SYSTEM";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date | string;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    salonName?: string;
    image?: string;
    role: string;
    email?: string;
  };
}
```

### ConversationMessageDto (depuis l'API REST)

```typescript
interface ConversationMessageDto {
  id: string;
  content: string;
  createdAt: string;
  conversationId: string;
  type?: "SYSTEM" | "USER" | "CLIENT";
  isRead: boolean;
  attachments?: Array<{
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
  }>;
  sender: ConversationUserDto;
}
```

**Note :** Conversation.tsx convertit `MessagingMessage` en `ConversationMessageDto` pour l'affichage unifié.

---

## Événements Socket.IO

### Émis par le client

| Événement                   | Payload                                    | Description                 |
| --------------------------- | ------------------------------------------ | --------------------------- |
| `join-conversation`         | `{ conversationId }`                       | Rejoindre une conversation  |
| `leave-conversation`        | `{ conversationId }`                       | Quitter une conversation    |
| `send-message`              | `{ conversationId, content, attachments }` | Envoyer un message          |
| `user-typing`               | `{ conversationId }`                       | Indiquer qu'on écrit        |
| `user-stopped-typing`       | `{ conversationId }`                       | Arrêter d'écrire            |
| `mark-as-read`              | `{ messageId }`                            | Marquer un message comme lu |
| `mark-conversation-as-read` | `{ conversationId }`                       | Marquer tous comme lus      |

### Reçus par le client

| Événement              | Payload                                | Description             |
| ---------------------- | -------------------------------------- | ----------------------- |
| `connect`              | (vide)                                 | Connexion établie       |
| `disconnect`           | `reason`                               | Déconnecté              |
| `connect_error`        | `error`                                | Erreur de connexion     |
| `new-message`          | `MessagingMessage`                     | Nouveau message reçu    |
| `conversation-history` | `{ conversationId, messages[] }`       | Historique au join      |
| `user-typing`          | `{ conversationId, userId, userName }` | Utilisateur tape        |
| `user-stopped-typing`  | `{ conversationId, userId }`           | Utilisateur arrête      |
| `message-read`         | `{ messageId, readAt }`                | Message marqué comme lu |
| `unread-count-updated` | `{ totalUnread }`                      | Compteur non lus        |
| `error`                | `{ message }`                          | Erreur serveur          |

---

## Logique d'affichage des messages

```typescript
// 1. Messages du socket (en direct)
const liveMessagesAsDto = liveMessages.map((msg) => ({
  // Conversion MessagingMessage → ConversationMessageDto
}));

// 2. Utilise les liveMessages s'il y en a, sinon l'historique initial
const displayedMessages =
  liveMessagesAsDto.length > 0
    ? liveMessagesAsDto // Messages en direct
    : initialMessages; // Historique de l'API

// 3. Affiche dans MessageBubbles
<MessageBubbles messages={displayedMessages} currentUserId={user?.id} />;
```

---

## Variables d'environnement requises

```env
# .env.local ou variables système

NEXT_PUBLIC_BACK_URL=http://localhost:3001        # URL du backend
NEXT_PUBLIC_API_URL=http://localhost:3001         # Fallback
```

---

## Cas d'usage courant

### Scénario : Deux utilisateurs discutent

```
🧑 Alice                          🧑 Bob
│                                  │
├─ Accède à la convo         │
│  Token récupéré            │
│  Socket connecté           │
│                                  ├─ Accède à la convo
│                                  │  Token récupéré
│                                  │  Socket connecté
│
├─ Commence à écrire        │
│  (isTyping = true)        │
│  emit "user-typing"       │ ──→ Backend broadcast
│                                  ├─ Reçoit "user-typing"
│                                  ├─ setTypingUsers({Bob_id})
│                                  └─ UI: "Alice est en train d'écrire..."
│
├─ 2s sans activité        │
│  emit "user-stopped-typing"  ──→ Backend broadcast
│                                  ├─ Reçoit "user-stopped-typing"
│                                  ├─ setTypingUsers(new Set())
│                                  └─ UI: disparaît
│
├─ Envoie "Bonjour!"       │
│  emit "send-message"     │ ──→ Backend persiste en BDD
│  MessageInput vide       │     Backend broadcast
│  setIsTyping(false)      │
│                                  ├─ Reçoit "new-message"
│                                  ├─ setMessages([...prev, newMsg])
│                                  ├─ Reçoit "user-stopped-typing"
│                                  └─ UI: Message + statue "✓ Livré"
│
│                                  ├─ Bob lit le message
│                                  │  (auto markAsRead)
│                                  ├─ emit "mark-as-read"
│                                  ├─ Backend met à jour
│                                  ├─ Backend broadcast
│
├─ Reçoit "message-read"   │
│  setMessages([...prev,   │
│    { ...msg,             │
│      isRead: true        │
│    }])                   │
│  UI: statue "✓✓ Lu"      │
│                                  └─ ...
```

---

## Points clés à retenir

✅ **Authentification** : JWT brut dans `auth.token`, pas de "Bearer"
✅ **HttpOnly Cookies** : Lus via API route côté serveur, jamais côté client
✅ **Socket initialization** : Attend le token avant de se connecter
✅ **Messages** : Historique au join, puis messages en direct du socket
✅ **Typing** : Timeout 2s, auto-reset si inactivité
✅ **Reconnexion** : Auto avec backoff expo, max 5 tentatives
✅ **État UI** : Badge de connexion, input désactivé si déconnecté

---

## Dépannage

### Le socket se déconnecte immédiatement

**Cause :** Pas de token, JWT invalide, ou namespace incorrect
**Solution :**

- Vérifier que `/api/messaging/token` retourne le token
- Vérifier que le backend accepte le JWT
- Vérifier que le namespace est `/messaging`

### Messages ne s'affichent pas

**Cause :** `liveMessages` vide ou conversion échouée
**Solution :**

- Vérifier que le socket est connecté (`isConnected === true`)
- Vérifier que `join-conversation` a été émis
- Vérifier les logs du serveur

### Typing indicator ne marche pas

**Cause :** Timeout mal configuré ou userId manquant
**Solution :**

- Vérifier le timeout (2s par défaut)
- Vérifier que `userId` est présent dans le payload du serveur

---

## Évolutions futures

- [ ] Persistance des messages côté client (React Query, Zustand)
- [ ] Notifications desktop
- [ ] Pièces jointes (upload → socket emit)
- [ ] Édition/suppression de messages
- [ ] Réactions aux messages (emoji)
- [ ] Recherche dans les messages
- [ ] Export de conversation
- [ ] End-to-end encryption (optionnel)
