# 🔐 Configuration Admin - WebStarter

## 📋 Étapes pour créer l'admin

### 1. Exécuter le script SQL dans Supabase

1. Allez dans votre dashboard Supabase
2. Ouvrez **"SQL Editor"**
3. Copiez-collez le contenu du fichier `supabase-admin-setup.sql`
4. Cliquez sur **"Run"** (ou F5)

Ce script va :
- ✅ Créer la table `admin_users`
- ✅ Ajouter l'admin avec l'email `slovengama@gmail.com`
- ✅ Configurer les politiques de sécurité

### 2. Créer l'utilisateur dans Supabase Auth

1. Dans Supabase, allez dans **"Authentication"** > **"Users"**
2. Cliquez sur **"Add user"** > **"Create new user"**
3. Remplissez :
   - **Email** : `slovengama@gmail.com`
   - **Password** : (choisissez un mot de passe sécurisé)
   - **Auto Confirm User** : ✅ Cochez cette case
4. Cliquez sur **"Create user"**

### 3. Tester la connexion

1. Allez sur `/admin/login`
2. Connectez-vous avec :
   - **Email** : `slovengama@gmail.com`
   - **Password** : (le mot de passe que vous avez créé)
3. Vous devriez être redirigé vers le dashboard admin

## 🔒 Sécurité

Le système vérifie maintenant :
1. ✅ L'authentification Supabase (email + mot de passe)
2. ✅ La présence dans la table `admin_users`
3. ✅ Le statut `is_active = true`

## 👥 Ajouter d'autres admins

Pour ajouter un autre admin, exécutez dans Supabase SQL Editor :

```sql
INSERT INTO admin_users (email, name, is_active)
VALUES ('nouvel-admin@email.com', 'Nom de l''admin', true);
```

Puis créez l'utilisateur dans **Authentication > Users**.

## 🚫 Désactiver un admin

Pour désactiver un admin (sans le supprimer) :

```sql
UPDATE admin_users 
SET is_active = false 
WHERE email = 'admin@email.com';
```

## ✅ Vérification

Pour vérifier que l'admin est bien configuré :

```sql
SELECT * FROM admin_users WHERE email = 'slovengama@gmail.com';
```

Vous devriez voir une ligne avec `is_active = true`.

## 📝 Notes importantes

- ⚠️ L'email dans `admin_users` doit correspondre EXACTEMENT à l'email dans Supabase Auth
- ⚠️ Le mot de passe est géré par Supabase Auth, pas dans la table `admin_users`
- ⚠️ Si vous changez l'email dans Auth, mettez à jour aussi dans `admin_users`

