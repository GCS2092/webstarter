# Configuration des URLs dans Supabase

## Problème
Si vous rencontrez une erreur 400 lors de la création d'utilisateur ou de l'authentification, c'est probablement dû à une mauvaise configuration des URLs dans Supabase.

## Configuration requise

### 1. Site URL
Dans Supabase, allez dans **Authentication** → **URL Configuration** → **Site URL**

**Configurez :**
```
https://webstarter-seven.vercel.app
```

⚠️ **Important** : Utilisez `https://` (pas `http://`) et n'ajoutez pas de slash à la fin.

### 2. Redirect URLs
Dans la même page, section **Redirect URLs**, ajoutez ces URLs (une par ligne) :

```
https://webstarter-seven.vercel.app/**
https://webstarter-seven.vercel.app/admin/**
https://webstarter-seven.vercel.app/admin/login
https://webstarter-seven.vercel.app/api/**
http://localhost:3000/**
http://localhost:3000/admin/**
http://localhost:3000/admin/login
```

**Explication :**
- `**` signifie "tous les chemins sous ce domaine" (wildcard)
- Les URLs avec `localhost:3000` sont pour le développement local
- Les URLs avec `webstarter-seven.vercel.app` sont pour la production Vercel

### 3. Si vous avez un domaine personnalisé
Si vous avez configuré un domaine personnalisé dans Vercel (ex: `webstarter.com`), ajoutez aussi :

```
https://webstarter.com/**
https://webstarter.com/admin/**
https://webstarter.com/admin/login
```

## Vérification

Après avoir configuré les URLs :

1. **Sauvegardez** les modifications dans Supabase
2. **Attendez 1-2 minutes** pour que les changements prennent effet
3. **Testez** la création d'utilisateur depuis `/admin/check-status`
4. **Testez** la connexion depuis `/admin/login`

## Erreurs courantes

### Erreur "Invalid redirect URL"
- Vérifiez que l'URL exacte est dans la liste des Redirect URLs
- Vérifiez qu'il n'y a pas de slash en trop à la fin
- Vérifiez que vous utilisez `https://` (pas `http://`) pour la production

### Erreur 400 lors de la création d'utilisateur
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configurée dans Vercel
- Vérifiez que le Site URL est correct
- Vérifiez les logs Vercel pour voir l'erreur exacte

### L'authentification ne fonctionne pas
- Vérifiez que les Redirect URLs incluent tous les chemins nécessaires
- Vérifiez que le Site URL correspond exactement à votre domaine Vercel

## Configuration complète recommandée

### Site URL
```
https://webstarter-seven.vercel.app
```

### Redirect URLs (une par ligne)
```
https://webstarter-seven.vercel.app/**
https://*.vercel.app/**
http://localhost:3000/**
http://localhost:3000/**
```

**Note** : `*.vercel.app` couvre tous les déploiements Vercel (preview, production, etc.)

## Après configuration

1. Redéployez votre application Vercel (ou attendez le prochain déploiement)
2. Testez la création d'utilisateur
3. Testez la connexion admin

Si le problème persiste, vérifiez les logs Vercel pour voir l'erreur exacte retournée par Supabase.

