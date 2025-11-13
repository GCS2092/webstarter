-- Script simple pour ajouter un utilisateur existant comme admin
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Assurez-vous que la table admin_users existe (si pas déjà fait, exécutez supabase-admin-setup.sql d'abord)

-- Ajouter l'utilisateur existant slovengama@gmail.com comme admin
INSERT INTO admin_users (email, name, is_active)
VALUES ('slovengama@gmail.com', 'Admin Principal', true)
ON CONFLICT (email) 
DO UPDATE SET 
  is_active = true,
  name = COALESCE(EXCLUDED.name, admin_users.name);

-- Vérifier que l'admin a été ajouté
SELECT * FROM admin_users WHERE email = 'slovengama@gmail.com';

