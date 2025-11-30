# Configuration Firebase pour WebStarter

## 📍 Où se trouve la clé ?

La clé privée Firebase se trouve dans le **fichier JSON du compte de service** que vous avez fourni. Elle est stockée dans le champ `private_key`.

## 🔐 Configuration des variables d'environnement

### Variables côté client (NEXT_PUBLIC_*)

Ces variables sont accessibles dans le navigateur et doivent être préfixées par `NEXT_PUBLIC_` :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDWmweYdJcJuw8BctcQOOvsCbiED3rmceI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=webstarter-288e8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=webstarter-288e8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=webstarter-288e8.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=908089529916
NEXT_PUBLIC_FIREBASE_APP_ID=1:908089529916:web:62d70f147169747ec25539
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BDylwcUQcdOS1yGIqB8SqlDFrH4lTliAFD4SnorGq5mtlP_6Rlr30Yo98p_f9do9Jq48einPSPyR4rypcHY1BhE
```

### Variables côté serveur (Firebase Admin)

Ces variables sont utilisées uniquement côté serveur pour envoyer des notifications push :

```env
FIREBASE_PROJECT_ID=webstarter-288e8
FIREBASE_PRIVATE_KEY_ID=3f6016fd9bbfcfb28dca39951600cdfab8092df7
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdYuGpP4A4l/yo\n6F9AFx/GddasneC1C6P+FtBdRlY7X9nJtTadbjqVWKEPHiVtzpmUZLFZrU9sIy3u\nF2oecMlQhEdHO2DFPiL/nZyw7mRmi/Y5CmwbWcVAvNfB6ztuQP/KX7N1bS/enGov\npWLh0QvCzx9hH4/kS05lJKgdJMn+3b1aqo/qMMdrKkhJ8gX8VUg2OOLd/97GGDT7\nxpLdMGmxhMfpUW66J9yP6a+X50Cyzvx2tEfDdN0OO3KwTNmSQt4E9jgsYf2fT5lJ\nLRBdcrfswVSzuEE3tim95oTMtoictUC1SfQ+KHfBcfSk2mMRwxpQUBz/jMIg6dUl\ncRLsWAO9AgMBAAECggEAKj5MsIdVTJtq2xFH46VxR20AmmNj2WRO95e7BJYo9hXT\nmILVrmrUOZrI3Axs4mzGJyDhw16zxyQoI1RQjOwb9MsUcKec4UQ805xD3u+VrjqZ\n85R7ENpHCgnF5YxUbtLudSy7t+R/KUKVc8Vx5YedHwRF+WUl05Js79Pnda8Wspv4\n/KmVGgps9qJd9F6fkmrDPMkoGaXq+fqI8vxNUAjlUrUIb+zUyKrfAN1thDLv2br+\nN6z27AnZJ/D8S8zdYjp3OXlwK1eJSU0VGs+DAPrN5q9UuWTHeXruImhc3c2dHnPQ\nwQFVG3J0W3P2x8Lpd/HZN3B4Rcd3707BfBMxyPfTBwKBgQDM9x9icRhszMA7LQyt\nhX61HhveaimQGbqiLtPeH+oYDhcYL5vkvNDo5g771+A+TnDEfUsH93Ygxyvjc+q8\n6vkQByIY/QWvRPaNgP3txT4ivSWu+g54hZjZs7sycYpMQbLjkSPuLxSzg8lteZ5q\nQVi53amIKQQr7ETcLDMFAf/RbwKBgQDEkvqqrGFu8Q7FhY4MYt29ZmPObRlD6aKB\nmSgN2gWPCY0XInPi0NVYRjzm/2waasnP4RcDqZvi9MCiKmK/5YcYux0l8r44B8+G\noMWl7leKoo3O+Sx/Fq/A8HuQjfiuijEoMQx8/eOMCY2Df4gRXh3S8RvmWtHSupVC\nDFkpdIbPkwKBgFECAsd3h33I1tkMjwwtzMxsn/sh3ldzs83R0C7kUjM7rmkCuAyJ\ni8/gzV9ADQLTIcKm+nalmWyPC4uUDtynydRJ3XIe3pZNHV0D9Fh7MnmsZC5p6jo8\nIxM38+6V7WECPl+ux5KlzPq+RWgdPz0jopujPhPwkhOCCB004t1B0wfFAoGBAKSB\nEA9WtS8/wongK7EH5+NB1ZKB0Jv54IouXsvAwdgjORS8O1j8RR5boUn7RT+SUJOM\nHlNtVEyJYNAVQpCvB/DVXh5M141SVASpdN5Y6J/XS2+DLQ6qMKj5V57wgMWoVlz5\nNyc+3Xdq4yfByWAncDQAnMWZCXEdvh0I8nDz2IHLAoGBALD4ssCw6XrB4K8uyu9H\ntYPSHcQsEfjW/7bPcZj83Id2/D2BOWwdGMAhfGc45TyeAE+td1PdotFdSCdUIxsJ\nDx8O87DSDDZ8gjy0n/7DrTzRbX4PVlcyanXISyhvnhBB08pySa4xZvLHGQziRPVv\nDF2HlgMMtZENGyHRUO2LAW3u\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@webstarter-288e8.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=105803298127845604360
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40webstarter-288e8.iam.gserviceaccount.com
```

## 📝 Étapes de configuration

### 1. Local (.env.local)

1. Créez ou modifiez le fichier `.env.local` à la racine du projet
2. Ajoutez toutes les variables Firebase listées ci-dessus
3. **Important** : Pour `FIREBASE_PRIVATE_KEY`, gardez les guillemets et les `\n` (sauts de ligne)

### 2. Vercel (Production)

1. Allez dans votre projet Vercel → **Settings** → **Environment Variables**
2. Ajoutez toutes les variables Firebase (client et serveur)
3. **Important** : Pour `FIREBASE_PRIVATE_KEY` dans Vercel :
   - Collez la clé complète avec les guillemets
   - Ou utilisez le format multiligne si Vercel le supporte
   - Les `\n` doivent être préservés

## 🔑 Où trouver les clés dans Firebase Console

1. **Configuration Web** :
   - Firebase Console → Project Settings → General
   - Section "Your apps" → Web app
   - Copiez les valeurs de `firebaseConfig`

2. **VAPID Key** (pour les notifications push) :
   - Firebase Console → Project Settings → Cloud Messaging
   - Section "Web Push certificates"
   - Copiez la "Key pair"

3. **Service Account Key** (clé privée) :
   - Firebase Console → Project Settings → Service accounts
   - Cliquez sur "Generate new private key"
   - Téléchargez le fichier JSON
   - La clé privée est dans le champ `private_key`

## 🚀 Utilisation

### Côté client (notifications push)

```typescript
import { getFCMToken, onMessageListener } from "@/lib/firebase";

// Obtenir le token FCM
const token = await getFCMToken();

// Écouter les messages
onMessageListener().then((payload) => {
  console.log("Message reçu:", payload);
});
```

### Côté serveur (envoyer des notifications)

```typescript
import { sendPushNotification } from "@/lib/firebase-admin";

// Envoyer une notification
await sendPushNotification(
  "token-fcm-du-client",
  "Nouveau message",
  "Vous avez reçu un nouveau message"
);
```

## ⚠️ Sécurité

1. **Ne commitez jamais** le fichier `.env.local` dans Git
2. La clé privée (`FIREBASE_PRIVATE_KEY`) est très sensible
3. Utilisez des variables d'environnement pour toutes les clés
4. Dans Vercel, vérifiez que les variables sont bien configurées

## 📚 Documentation

- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

