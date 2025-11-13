# Configuration Gmail pour l'envoi d'emails

## 📧 Configuration Gmail SMTP

Votre projet est maintenant configuré pour envoyer des emails via Gmail SMTP en utilisant un mot de passe d'application.

## 🔧 Étapes de configuration

### 1. Activer la validation en 2 étapes (si pas déjà fait)

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Cliquez sur **Sécurité**
3. Activez la **Validation en deux étapes** si ce n'est pas déjà fait

### 2. Créer un mot de passe d'application

1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionnez **Application** : "Autre (nom personnalisé)"
3. Entrez "WebStarter" comme nom
4. Cliquez sur **Générer**
5. **Copiez le mot de passe d'application** (16 caractères, espaces inclus)

### 3. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Configuration Gmail
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=jkqzuyaebqjaeqmv
```

**Important** : 
- `GMAIL_USER` : Votre adresse Gmail complète (ex: `votrenom@gmail.com`)
- `GMAIL_APP_PASSWORD` : Le mot de passe d'application que vous avez généré (sans espaces)

### 4. Redémarrer le serveur

Après avoir ajouté les variables d'environnement :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

## ✅ Vérification

Pour tester l'envoi d'emails :

1. Remplissez le formulaire de demande sur `/request`
2. Vérifiez que vous recevez bien l'email de confirmation
3. Dans le dashboard admin, changez le statut d'un projet
4. Vérifiez que le client reçoit l'email de changement de statut

## 🔍 Dépannage

### Erreur "Invalid login"
- Vérifiez que `GMAIL_USER` contient bien votre adresse Gmail complète
- Vérifiez que `GMAIL_APP_PASSWORD` est correct (sans espaces)
- Assurez-vous que la validation en 2 étapes est activée

### Erreur "Less secure app access"
- Les mots de passe d'application remplacent l'accès des applications moins sécurisées
- Utilisez toujours un mot de passe d'application, pas votre mot de passe Gmail normal

### Les emails ne partent pas
- Vérifiez les logs dans la console du serveur
- Vérifiez que les variables d'environnement sont bien chargées
- Testez avec un autre compte email en destination

### Emails en spam
- Les emails peuvent arriver en spam la première fois
- Ajoutez votre adresse Gmail dans les contacts du destinataire
- Utilisez un domaine personnalisé pour améliorer la délivrabilité (optionnel)

## 📝 Note de sécurité

⚠️ **Ne commitez jamais** votre fichier `.env.local` dans Git !
- Le fichier `.env.local` est déjà dans `.gitignore`
- Ne partagez jamais votre mot de passe d'application publiquement
- Si vous devez partager le projet, utilisez `.env.example` sans les vraies valeurs

## 🚀 Alternative : Utiliser un domaine personnalisé

Pour une meilleure délivrabilité, vous pouvez configurer Gmail avec un domaine personnalisé via Google Workspace, mais cela nécessite un abonnement payant.

Pour l'instant, la configuration avec un compte Gmail personnel fonctionne parfaitement pour les besoins de la plateforme.

