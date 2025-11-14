# 🔧 Guide de dépannage - Problème de connexion admin

## ❌ Erreur : "Email ou mot de passe incorrect" après avoir défini le mot de passe

### ✅ Solution étape par étape

#### 1. Utiliser la page de diagnostic

Allez sur : **`/admin/check-status`**

Cette page va vérifier :
- ✅ Si l'utilisateur existe dans Supabase Auth
- ✅ Si l'utilisateur est dans la table `admin_users`
- ✅ Si l'utilisateur est actif (`is_active = true`)

#### 2. Vérifier dans Supabase

**Dans Supabase SQL Editor**, exécutez :

```sql
-- Vérifier si l'utilisateur est dans admin_users
SELECT * FROM admin_users WHERE email = 'slovengama@gmail.com';

-- Si rien ne s'affiche, ajoutez-le :
INSERT INTO admin_users (email, name, is_active)
VALUES ('slovengama@gmail.com', 'Admin Principal', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;
```

#### 3. Vérifier que le mot de passe a bien été défini

**Dans Supabase** → **Authentication** → **Users**

1. Cherchez `slovengama@gmail.com`
2. Vérifiez que l'utilisateur existe
3. Si l'utilisateur n'a pas de mot de passe, utilisez `/admin/set-password`

#### 4. Vérifier la configuration

Assurez-vous que dans `.env.local` vous avez :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role  # IMPORTANT pour définir les mots de passe
```

#### 5. Redémarrer le serveur

Après avoir modifié `.env.local` :

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

## 🔍 Causes possibles

1. **Mot de passe non défini** : L'API `/api/set-password` n'a pas fonctionné
   - Solution : Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est dans `.env.local`
   - Réessayez `/admin/set-password`

2. **Utilisateur pas dans admin_users** : L'utilisateur existe mais n'est pas admin
   - Solution : Utilisez `/admin/add-admin` ou exécutez le SQL ci-dessus

3. **Email différent** : L'email utilisé pour se connecter est différent
   - Solution : Utilisez exactement le même email partout

4. **Mot de passe incorrect** : Vous avez tapé le mauvais mot de passe
   - Solution : Réinitialisez le mot de passe via `/admin/set-password`

## 📋 Checklist de vérification

- [ ] L'utilisateur existe dans Supabase Auth (Authentication > Users)
- [ ] Le mot de passe a été défini via `/admin/set-password`
- [ ] L'utilisateur est dans `admin_users` avec `is_active = true`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` est configuré dans `.env.local`
- [ ] Le serveur a été redémarré après modification de `.env.local`
- [ ] Vous utilisez exactement le même email partout

## 🚀 Solution rapide

Si rien ne fonctionne, exécutez dans Supabase SQL Editor :

```sql
-- 1. Ajouter l'admin dans admin_users
INSERT INTO admin_users (email, name, is_active)
VALUES ('slovengama@gmail.com', 'Admin Principal', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- 2. Vérifier
SELECT * FROM admin_users WHERE email = 'slovengama@gmail.com';
```

Puis utilisez `/admin/set-password` pour définir le mot de passe.

