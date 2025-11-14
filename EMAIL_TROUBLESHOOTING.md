# 🔍 Diagnostic des problèmes d'envoi d'emails

## ✅ Vérifications à faire

### 1. Vérifier les variables d'environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-application
```

**Important** : 
- Le `GMAIL_USER` doit être votre adresse Gmail complète
- Le `GMAIL_APP_PASSWORD` doit être un **mot de passe d'application** (pas votre mot de passe Gmail normal)
- Redémarrez le serveur après avoir modifié `.env.local`

### 2. Vérifier que le mot de passe d'application est correct

1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Créez un nouveau mot de passe d'application pour "Mail"
3. Copiez le mot de passe généré (16 caractères sans espaces)
4. Collez-le dans `.env.local` comme `GMAIL_APP_PASSWORD`

### 3. Tester l'envoi d'email

Utilisez la page de test : `/admin/test-email`

Cette page vous permettra de :
- Tester l'envoi d'un email
- Voir les erreurs détaillées
- Vérifier la configuration

### 4. Vérifier les logs du serveur

Lorsque vous testez l'envoi d'email, regardez les logs dans votre terminal où tourne `npm run dev`. Vous devriez voir :

**Si tout fonctionne :**
```
Tentative d'envoi d'email à: test@example.com
GMAIL_USER configuré: true
GMAIL_APP_PASSWORD configuré: true
Email envoyé avec succès: { messageId: '...', to: '...', response: '...' }
```

**Si ça ne fonctionne pas :**
```
Erreur détaillée lors de l'envoi de l'email: {
  message: '...',
  code: 'EAUTH',
  ...
}
```

## 🐛 Erreurs courantes et solutions

### Erreur "EAUTH" (Erreur d'authentification)
- **Cause** : Mot de passe d'application incorrect ou email incorrect
- **Solution** : 
  1. Vérifiez que `GMAIL_USER` est votre email Gmail complet
  2. Vérifiez que `GMAIL_APP_PASSWORD` est un mot de passe d'application (pas votre mot de passe normal)
  3. Recréez un mot de passe d'application si nécessaire

### Erreur "ECONNECTION" (Erreur de connexion)
- **Cause** : Problème de connexion internet ou serveur Gmail inaccessible
- **Solution** : Vérifiez votre connexion internet

### Erreur "535" (Code de réponse)
- **Cause** : Mot de passe d'application incorrect
- **Solution** : Recréez un mot de passe d'application Gmail

### "Gmail non configuré"
- **Cause** : Les variables d'environnement ne sont pas définies
- **Solution** : 
  1. Vérifiez que `.env.local` existe à la racine du projet `webstarter/`
  2. Vérifiez que les variables sont bien nommées (sans `NEXT_PUBLIC_` pour ces variables)
  3. Redémarrez le serveur avec `npm run dev`

### Les emails ne partent pas mais pas d'erreur visible
- **Cause** : L'erreur est silencieuse ou les logs ne sont pas visibles
- **Solution** :
  1. Utilisez la page `/admin/test-email` pour voir les erreurs détaillées
  2. Vérifiez les logs du serveur dans le terminal
  3. Vérifiez la console du navigateur (F12)

## 📝 Checklist de diagnostic

- [ ] `.env.local` existe à la racine de `webstarter/`
- [ ] `GMAIL_USER` est défini avec votre email Gmail complet
- [ ] `GMAIL_APP_PASSWORD` est défini avec un mot de passe d'application (16 caractères)
- [ ] Le serveur a été redémarré après modification de `.env.local`
- [ ] Vous avez testé avec `/admin/test-email`
- [ ] Vous avez vérifié les logs du serveur
- [ ] Vous avez vérifié la console du navigateur (F12)

## 🔧 Test manuel de la configuration

Vous pouvez tester la configuration directement dans Node.js :

```bash
cd webstarter
node -e "
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Configuration correcte!');
  }
});
"
```

## 📞 Besoin d'aide ?

Si le problème persiste :
1. Vérifiez les logs détaillés dans `/admin/test-email`
2. Vérifiez les logs du serveur
3. Vérifiez que votre compte Gmail a l'authentification à deux facteurs activée (requis pour les mots de passe d'application)

