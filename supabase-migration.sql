-- Migration pour ajouter la colonne inspirations si elle n'existe pas
-- Exécutez ce script dans l'éditeur SQL de Supabase si vous avez déjà créé la table

-- Vérifier et ajouter la colonne inspirations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'inspirations'
    ) THEN
        ALTER TABLE projects ADD COLUMN inspirations TEXT;
    END IF;
END $$;

-- Vérifier et ajouter la colonne client_phone si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'client_phone'
    ) THEN
        ALTER TABLE projects ADD COLUMN client_phone VARCHAR(50);
    END IF;
END $$;

