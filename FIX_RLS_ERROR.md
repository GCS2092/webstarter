# 🔧 Correction de l'erreur RLS

## ❌ Erreur rencontrée

```
new row violates row-level security policy for table "admin_users"
```

## ✅ Solution

Exécutez le script SQL `fix-admin-rls.sql` dans Supabase pour corriger les politiques RLS.

### Étapes :

1. **Allez dans Supabase** → **SQL Editor**
2. **Copiez-collez** le contenu de `fix-admin-rls.sql`
3. **Cliquez sur "Run"**

Le script va :
- ✅ Supprimer les anciennes politiques
- ✅ Créer de nouvelles politiques qui permettent :
  - La lecture (SELECT)
  - L'insertion (INSERT)
  - La mise à jour (UPDATE)

## 📝 Alternative : Script SQL direct

Si vous préférez, exécutez directement ceci dans Supabase SQL Editor :

```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Anyone can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can update admin_users" ON admin_users;

-- Créer les nouvelles politiques
CREATE POLICY "Anyone can read admin_users" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert admin_users" ON admin_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update admin_users" ON admin_users
  FOR UPDATE USING (true);
```

## ✅ Vérification

Après avoir exécuté le script, essayez à nouveau d'ajouter un admin via `/admin/manage` ou `/admin/add-admin`.

L'erreur devrait être résolue ! 🎉

