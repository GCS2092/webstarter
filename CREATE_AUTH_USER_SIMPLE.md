# Créer un utilisateur dans Supabase Auth - Méthodes simples

## ⚠️ Pourquoi pas directement via SQL ?

On ne peut **pas** créer directement un utilisateur dans `auth.users` via SQL car :
- Les mots de passe doivent être hashés avec bcrypt (algorithme spécifique)
- Il y a des triggers et validations automatiques
- C'est une table système protégée par Supabase

## ✅ Méthodes recommandées (du plus simple au plus avancé)

### Méthode 1 : Interface Supabase (LE PLUS SIMPLE) ⭐

1. Allez dans votre dashboard Supabase
2. **Authentication** → **Users**
3. Cliquez sur **"Add user"** → **"Create new user"**
4. Remplissez :
   - **Email** : `slovengama@gmail.com`
   - **Password** : (choisissez un mot de passe sécurisé)
   - **Auto Confirm User** : ✅ **Cochez cette case** (important !)
5. Cliquez sur **"Create user"**

✅ **C'est tout !** L'utilisateur est créé et peut se connecter immédiatement.

### Méthode 2 : Via votre application (Recommandé) ⭐

1. Allez sur `/admin/check-status`
2. Entrez l'email : `slovengama@gmail.com`
3. Cliquez sur **"Vérifier"**
4. Si l'utilisateur n'existe pas dans Auth, un bouton **"Créer l'utilisateur dans Supabase Auth"** apparaîtra
5. Entrez un mot de passe (minimum 6 caractères)
6. Cliquez sur **"Créer l'utilisateur"**

✅ L'utilisateur sera créé automatiquement avec le mot de passe que vous avez choisi.

### Méthode 3 : Via curl (Terminal)

```bash
curl -X POST 'https://dlilzlplokhnioozgewo.supabase.co/auth/v1/admin/users' \
  -H "apikey: VOTRE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "slovengama@gmail.com",
    "password": "VotreMotDePasse123!",
    "email_confirm": true
  }'
```

⚠️ **Remplacez** `VOTRE_SERVICE_ROLE_KEY` par votre vraie clé (trouvable dans Supabase → Settings → API → service_role key)

### Méthode 4 : Via SQL avec pg_net (Avancé)

Si vous avez activé l'extension `pg_net` dans Supabase, vous pouvez utiliser le script `create-auth-user-via-sql.sql`.

⚠️ **Attention** : Cette méthode nécessite :
- L'extension `pg_net` activée (Database → Extensions)
- La clé service_role dans le script (⚠️ risque de sécurité)

## 📝 Après avoir créé l'utilisateur dans Auth

Assurez-vous qu'il est aussi dans `admin_users` :

```sql
INSERT INTO admin_users (email, name, is_active)
VALUES ('slovengama@gmail.com', 'Admin Principal', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;
```

## ✅ Vérification

Pour vérifier que tout est correct :

```sql
SELECT 
  au.email,
  au.name,
  au.is_active,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.email = au.email
    ) THEN '✅ Existe dans Auth'
    ELSE '❌ N''existe pas dans Auth'
  END as auth_status
FROM admin_users au
WHERE au.email = 'slovengama@gmail.com';
```

## 🎯 Recommandation

**Utilisez la Méthode 1 (Interface Supabase)** ou **Méthode 2 (Application)** - ce sont les plus simples et les plus sûres !

