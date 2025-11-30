-- Script pour créer un utilisateur dans Supabase Auth via SQL
-- ⚠️ ATTENTION: Ce script nécessite l'extension pg_net et la clé service_role
-- 
-- IMPORTANT: 
-- 1. Remplacez YOUR_SUPABASE_URL par votre URL Supabase
-- 2. Remplacez YOUR_SERVICE_ROLE_KEY par votre clé service_role
-- 3. Remplacez l'email et le mot de passe par vos valeurs
--
-- ⚠️ SÉCURITÉ: Ne partagez JAMAIS ce script avec la clé service_role visible

-- Option 1: Utiliser pg_net (si l'extension est activée)
-- Vérifier si pg_net est disponible
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE 'Extension pg_net trouvée';
  ELSE
    RAISE WARNING 'Extension pg_net non trouvée. Activez-la dans Database > Extensions';
  END IF;
END $$;

-- Fonction pour créer un utilisateur via l'API Supabase Admin
CREATE OR REPLACE FUNCTION create_auth_user_via_api(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT DEFAULT NULL,
  p_supabase_url TEXT DEFAULT current_setting('app.supabase_url', true),
  p_service_role_key TEXT DEFAULT current_setting('app.service_role_key', true)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response JSONB;
  v_url TEXT;
  v_payload JSONB;
BEGIN
  -- Construire l'URL de l'API
  v_url := COALESCE(p_supabase_url, 'YOUR_SUPABASE_URL') || '/auth/v1/admin/users';
  
  -- Construire le payload
  v_payload := jsonb_build_object(
    'email', p_email,
    'password', p_password,
    'email_confirm', true,
    'user_metadata', jsonb_build_object('name', COALESCE(p_name, 'Admin'))
  );
  
  -- Appeler l'API via pg_net
  SELECT content::jsonb INTO v_response
  FROM http((
    'POST',
    v_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || COALESCE(p_service_role_key, 'YOUR_SERVICE_ROLE_KEY')),
      http_header('apikey', COALESCE(p_service_role_key, 'YOUR_SERVICE_ROLE_KEY'))
    ],
    'application/json',
    v_payload::text
  )::http_request);
  
  RETURN v_response;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM
    );
END;
$$;

-- ⚠️ MÉTHODE ALTERNATIVE PLUS SIMPLE (RECOMMANDÉE)
-- Utilisez directement l'interface Supabase ou notre API

-- Pour créer l'utilisateur slovengama@gmail.com :
-- 
-- MÉTHODE 1: Via l'interface Supabase (LE PLUS SIMPLE)
-- 1. Allez dans Authentication > Users
-- 2. Cliquez sur "Add user" > "Create new user"
-- 3. Remplissez l'email et le mot de passe
-- 4. Cochez "Auto Confirm User"
-- 5. Cliquez sur "Create user"
--
-- MÉTHODE 2: Via notre API (depuis votre application)
-- Utilisez la page /admin/check-status et cliquez sur "Créer l'utilisateur dans Supabase Auth"
--
-- MÉTHODE 3: Via curl (depuis votre terminal)
-- curl -X POST 'https://YOUR_SUPABASE_URL/auth/v1/admin/users' \
--   -H "apikey: YOUR_SERVICE_ROLE_KEY" \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{
--     "email": "slovengama@gmail.com",
--     "password": "VotreMotDePasse123!",
--     "email_confirm": true
--   }'

-- Exemple d'utilisation de la fonction (si pg_net est activé)
-- ⚠️ REMPLACEZ les valeurs avant d'exécuter
/*
SELECT create_auth_user_via_api(
  'slovengama@gmail.com',           -- email
  'VotreMotDePasse123!',            -- mot de passe
  'Admin Principal',                 -- nom
  'https://dlilzlplokhnioozgewo.supabase.co',  -- URL Supabase
  'YOUR_SERVICE_ROLE_KEY'            -- Clé service_role (⚠️ SÉCURITÉ)
);
*/

-- Après avoir créé l'utilisateur dans Auth, ajoutez-le dans admin_users
INSERT INTO admin_users (email, name, is_active)
VALUES ('slovengama@gmail.com', 'Admin Principal', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Vérifier que tout est en place
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

