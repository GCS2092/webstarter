-- Script pour corriger les politiques RLS de la table admin_users
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Anyone can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can update admin_users" ON admin_users;

-- Politique pour permettre la lecture (nécessaire pour vérifier si un utilisateur est admin)
CREATE POLICY "Anyone can read admin_users" ON admin_users
  FOR SELECT USING (true);

-- Politique pour permettre l'insertion (nécessaire pour ajouter des admins)
CREATE POLICY "Anyone can insert admin_users" ON admin_users
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour (nécessaire pour activer/désactiver des admins)
CREATE POLICY "Anyone can update admin_users" ON admin_users
  FOR UPDATE USING (true);

-- Vérifier les politiques créées
SELECT * FROM pg_policies WHERE tablename = 'admin_users';

