# Audit des mails Inkera — 23 octobre 2026

## Modifications appliquées

Frontend : normalisation de l'adresse de récupération (espaces et casse), état d'envoi, erreurs réseau lisibles, rejet des liens de réinitialisation incomplets, encodage des paramètres de vérification d'adresse.

Backend voisin : `D:/CORPORATE/INKERA/Backend/TattooStudio-Backend/tattoo-studio-back`.

- `src/auth/auth.service.ts` : construction des liens de vérification et de réinitialisation avec `URL` et `URLSearchParams`. Les adresses contenant `+` sont préservées. Validation de `FRONTEND_URL`, avec HTTPS public obligatoire en production pour ces liens.
- `src/email/email-template.service.ts` : présentation commune actualisée (signature Inkera, typographies système, couleurs sobres, boutons orange plus contrastés, fond de secours des boutons et cartes), retrait du calque qui recouvrait l'en-tête et des polices Google externes. Lien à copier ajouté au mail de récupération.

## Liens examinés

| Destination | Résultat |
| --- | --- |
| `/login` | Page absente ; remplacé par `/connexion`. |
| `/contact` | Page absente ; remplacé par `/contactez-nous`. |
| `/reset-password?token=…&email=…` | Page présente ; paramètres désormais encodés à la génération. |
| `/verifier-email?token=…&email=…` | Page présente ; paramètres encodés à la génération et lors de l'appel API. |
| `/dashboard`, `/bo-1d19161a0c34978a5a82009b634baadf/users`, `/nouveau-creneau` | Pages présentes. |
| `/suivi/[token]`, `/meeting/[id]` | Pages présentes ; nécessitent un identifiant valide. Le repli `/suivi` seul ne correspond pas à une page et ne remplace pas un vrai lien de suivi. |

Le générateur commun peut encore produire `#` si aucune URL frontend n'est configurée, et ses replis peuvent pointer vers localhost. La configuration déployée doit donc être contrôlée pour l'ensemble des mails, pas seulement ceux de sécurité.

## Réception du mail : diagnostic non confirmé

La configuration locale pointe vers `http://localhost:3000` pour le frontend et `http://localhost:4000` pour l'API. C'est cohérent en développement, mais ces valeurs ne doivent pas être reprises en production. Une clé Mailgun est présente ; cela ne prouve pas qu'elle est valide ou que le domaine est autorisé à envoyer.

Le code attend la réponse Mailgun et propage les erreurs d'envoi. Une adresse inconnue retourne volontairement le même message de confirmation, sans envoyer de mail. Les espaces et différences de casse dans l'adresse de récupération sont maintenant normalisés.

Après confirmation des domaines concernés, les vérifications réseau hors du bac à sable ont réussi :

- `https://www.inkera-studio.fr/motdepasseoublie` et `https://www.inkera-studio.com/motdepasseoublie` répondent HTTP 200.
- Le JavaScript déployé appelle `https://inkstudio-back-production.up.railway.app/auth/forgot-password`, pas localhost.
- Le backend local autorise les deux domaines, avec ou sans `www`, dans sa configuration CORS. La configuration réellement déployée n'a pas été lue.
- Sur les deux domaines, le cookie de retour Auth.js désigne `https://www.inkera-studio.com`. C'est cohérent avec un domaine principal en `.com` ; ce n'est pas une preuve de panne d'envoi.
- La lecture des événements Mailgun réussit (HTTP 200), avec la clé locale. Aucun sujet correspondant à une réinitialisation n'apparaît parmi les 100 derniers événements renvoyés. Cela ne prouve pas l'absence d'un envoi plus ancien ni l'utilisation de cette même configuration sur Railway.

Aucun envoi réel n'a été déclenché. L'adresse concernée et l'heure de l'essai restent nécessaires pour retrouver l'événement exact. La livraison, les suppressions Mailgun, les rejets destinataires et la configuration déployée restent à contrôler. Aucune configuration de production n'a été modifiée et aucun déploiement n'a été effectué.

### Vérification ciblée après communication de l'adresse

Pour `contact.inkera@gmail.com` : le compte existe avec correspondance exacte et adresse vérifiée dans la base désignée par le fichier `.env` local du backend. Aucun jeton de réinitialisation n'est actuellement présent pour ce compte dans cette base. Cela n'exclut pas un jeton déjà consommé ou supprimé et ne prouve pas que Railway utilise la même base.

Mailgun ne renvoie aucun événement pour ce destinataire sur une requête couvrant les 30 derniers jours ; la rétention effective du fournisseur peut être plus courte. Les recherches ciblées dans les listes `bounces`, `complaints` et `unsubscribes` renvoient HTTP 404 (aucune entrée trouvée). Les secrets et les jetons n'ont pas été affichés.

Pour conclure, il faut rapprocher une nouvelle tentative de récupération de sa réponse réseau et des logs Railway, et comparer les configurations déployées de base de données et de Mailgun. La cause de non-réception reste non confirmée.

### Nouvel essai confirmé

Le nouvel essai du 23 octobre 2026 a créé un jeton dont l'expiration est le 23 octobre à 19:36:11 UTC, soit une création vers 19:21:11 UTC (21:21 heure de Paris). Le jeton lui-même n'a pas été lu. Cela confirme que cette demande a atteint un backend utilisant la base consultée et a retrouvé le compte.

L'utilisateur confirme ensuite que le site a affiché une confirmation et que le mail a bien été reçu. Le parcours déployé a donc fonctionné pour cet essai. Aucun événement correspondant n'était visible dans le domaine Mailgun consulté au moment du contrôle ; la correspondance entre la configuration Mailgun locale et celle de Railway n'est pas établie.

Les corrections locales n'ayant pas été déployées, la réception ne peut pas leur être attribuée. La cause du premier problème reste indéterminée ; un délai de livraison est une possibilité non confirmée.

## Vérification mobile

Le mobile et l'ordinateur utilisent le même composant de récupération et le même appel `POST /auth/forgot-password`, sans branche conditionnelle selon la taille de l'écran.

Corrections locales : largeur fluide des formulaires et du séparateur, champs à 16 px pour éviter le zoom automatique courant sur iPhone, champs et boutons d'au moins 44 px, suppression de la hauteur fixe des pages au profit de `min-h-dvh` avec espacement vertical. Le mail utilise des marges mobiles réduites, un bouton avec dimensionnement explicite et un retour à la ligne des contenus longs.

Contrôle dans Chrome sans interface à 320, 390, 768 et 1440 px : récupération, nouveau mot de passe avec lien fictif, lien incomplet et aperçu du mail. Les 16 affichages contrôlés ne débordent pas horizontalement. Les champs mesurent 16 px et les boutons des formulaires 44 px ; le bouton du mail reste entièrement dans la largeur disponible. Aucune demande réelle n'a été soumise pendant ces contrôles.

Limites : émulation de largeur dans Chrome, sans essai matériel Safari/iPhone ou Android, ni rendu dans les applications Gmail/Outlook/Apple Mail. Les changements ne sont pas déployés. Lors de cette vérification, le contrôle TypeScript global signale deux erreurs dans la messagerie, sur `transports` dans `InboxWorkspace.tsx` et `withCredentials` dans `useMessaging.ts` ; ces fichiers n'ont pas été modifiés dans cette tâche.

## Expéditeur des vérifications et confirmation d'inscription

Les méthodes backend `sendEmailVerification` et `sendClientEmailVerification` utilisent explicitement le nom d'expéditeur `Inkera Studio`, même en l'absence de nom de salon. Cela couvre l'inscription et le renvoi lors d'une tentative de connexion d'un compte non vérifié. L'objet est harmonisé en `Vérification de votre email - Inkera Studio`.

Après une réponse d'inscription réussie, un toast global annonce l'envoi du mail pendant 12 secondes. Le contexte est mémorisé pour toutes les offres ; la page de connexion reprend le toast et le message de confirmation, puis consomme cette indication pour éviter un nouvel affichage à chaque visite. Le même identifiant de toast évite les doublons pendant la navigation. Le retour depuis Stripe conserve aussi cette indication. Aucun envoi réel ni création de compte n'ont été déclenchés pour cette modification.

## Validation

- TypeScript frontend et backend : réussi.
- ESLint sur les trois fichiers frontend modifiés : réussi.
- Tests existants `mailer.service.spec.ts` : 44 réussis.
- Contrôles de rendu : encodage des adresses avec `+`, échappement des séparateurs du lien HTML, nom de salon dans l'en-tête, lien de secours, retrait des anciennes destinations et des polices externes.
- Aperçu statique avec données fictives : `email-password-reset-preview.html`. Les liens utilisent un domaine de démonstration.
