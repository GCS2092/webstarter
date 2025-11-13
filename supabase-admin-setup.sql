-- Script pour créer la table admin_users et ajouter l'admin principal
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Créer la table admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Ajouter l'admin principal
INSERT INTO admin_users (email, name, is_active)
VALUES ('slovengama@gmail.com', 'Admin Principal', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Politique RLS : Seuls les admins peuvent voir la liste des admins
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture (nécessaire pour vérifier si un utilisateur est admin)
CREATE POLICY "Anyone can read admin_users" ON admin_users
  FOR SELECT USING (true);

-- Note: Pour créer l'utilisateur dans Supabase Auth, allez dans:
-- Authentication > Users > Add user > Create new user
-- Email: slovengama@gmail.com
-- Mot de passe: (choisissez un mot de passe sécurisé)

