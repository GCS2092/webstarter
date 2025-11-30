# Configuration des variables d'environnement dans Vercel

## Problème
Si vous rencontrez une erreur 500 sur `/api/set-password` ou d'autres routes API, c'est probablement dû à des variables d'environnement manquantes dans Vercel.

## Variables requises

### 1. Variables Supabase (obligatoires)
- `NEXT_PUBLIC_SUPABASE_URL` : L'URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : La clé anonyme (anon key) de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : La clé service_role de Supabase (pour les opérations admin)

### 2. Variables Gmail (pour l'envoi d'emails)
- `GMAIL_USER` : Votre adresse Gmail
- `GMAIL_APP_PASSWORD` : Le mot de passe d'application Gmail

## Comment configurer dans Vercel

### Étape 1 : Accéder aux paramètres du projet
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet `webstarter`

### Étape 2 : Ouvrir les paramètres d'environnement
1. Cliquez sur **Settings** dans le menu du projet
2. Cliquez sur **Environment Variables** dans le menu de gauche

### Étape 3 : Ajouter les variables
Pour chaque variable, cliquez sur **Add New** et remplissez :

#### Variable 1 : NEXT_PUBLIC_SUPABASE_URL
- **Name** : `NEXT_PUBLIC_SUPABASE_URL`
- **Value** : Votre URL Supabase (ex: `https://xxxxx.supabase.co`)
- **Environment** : Sélectionnez toutes les environnements (Production, Preview, Development)

#### Variable 2 : NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value** : Votre clé anonyme Supabase
- **Environment** : Toutes les environnements

#### Variable 3 : SUPABASE_SERVICE_ROLE_KEY (IMPORTANT)
- **Name** : `SUPABASE_SERVICE_ROLE_KEY`
- **Value** : Votre clé service_role Supabase
- **Environment** : Toutes les environnements
- **⚠️ Important** : Cette clé est sensible, ne la partagez jamais publiquement

#### Variable 4 : GMAIL_USER
- **Name** : `GMAIL_USER`
- **Value** : Votre adresse Gmail
- **Environment** : Toutes les environnements

#### Variable 5 : GMAIL_APP_PASSWORD
- **Name** : `GMAIL_APP_PASSWORD`
- **Value** : Votre mot de passe d'application Gmail
- **Environment** : Toutes les environnements

### Étape 4 : Où trouver les clés Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Vous trouverez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (cliquez sur "Reveal" pour la voir)

### Étape 5 : Redéployer
Après avoir ajouté toutes les variables :
1. Allez dans l'onglet **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **Redeploy**
4. Ou faites un nouveau push sur Git pour déclencher un nouveau déploiement

## Vérification

Après le redéploiement, vérifiez que tout fonctionne :
1. Testez `/admin/set-password` - ne devrait plus donner d'erreur 500
2. Testez `/admin/test-email` - devrait envoyer un email de test
3. Vérifiez les logs Vercel pour voir si des erreurs persistent

## Logs Vercel

Pour voir les logs détaillés :
1. Allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **Functions** pour voir les logs des API routes
4. Les logs devraient maintenant afficher des messages détaillés si une variable manque

## Note importante
Les variables d'environnement sont nécessaires pour que les API routes fonctionnent correctement. Sans `SUPABASE_SERVICE_ROLE_KEY`, les routes comme `/api/set-password` et `/api/create-admin` ne peuvent pas fonctionner.

