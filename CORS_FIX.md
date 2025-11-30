# Résolution des erreurs CORS avec Supabase

## Problème
Si vous rencontrez une erreur CORS lors de l'envoi du formulaire :
```
Blocage d'une requête multiorigine (Cross-Origin Request) : la politique « Same Origin » ne permet pas de consulter la ressource distante située sur https://dlilzlplokhnioozgewo.supabase.co/rest/v1/projects?select=*. Raison : échec de la requête CORS.
```

## Solutions

### 1. Vérifier les variables d'environnement
Assurez-vous que vos variables d'environnement sont correctement configurées dans Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Vérifier les RLS (Row Level Security) dans Supabase
1. Allez dans votre projet Supabase
2. Naviguez vers **Authentication** > **Policies**
3. Vérifiez que les politiques RLS pour la table `projects` permettent les INSERT depuis l'application

### 3. Vérifier les CORS dans Supabase
1. Allez dans **Settings** > **API**
2. Vérifiez que votre domaine Vercel (`webstarter-seven.vercel.app`) est autorisé
3. Si nécessaire, ajoutez-le dans les **Allowed Origins**

### 4. Vérifier la configuration du bucket Storage
Si vous utilisez le stockage de fichiers :
1. Allez dans **Storage** > **Policies**
2. Vérifiez que les politiques permettent l'upload depuis votre domaine

### 5. Solution temporaire (développement uniquement)
Pour le développement local, vous pouvez temporairement désactiver CORS dans votre navigateur (non recommandé pour la production).

## Code de gestion d'erreur
Le code a été mis à jour pour :
- Détecter les erreurs CORS
- Afficher un message d'erreur clair à l'utilisateur
- Logger les erreurs pour le débogage

Si le problème persiste après ces vérifications, contactez le support Supabase.

