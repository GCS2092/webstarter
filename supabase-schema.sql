-- WebStarter Database Schema
-- Tables pour la plateforme de gestion de projets web

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  project_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  colors VARCHAR(255),
  budget VARCHAR(100),
  deadline DATE,
  inspirations TEXT,
  status VARCHAR(50) DEFAULT 'nouvelle' CHECK (status IN ('nouvelle', 'en_analyse', 'acceptee', 'refusee', 'en_cours', 'termine', 'en_attente_info')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages (messagerie projet)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'admin')),
  sender_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Table des fichiers uploadés
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by VARCHAR(20) NOT NULL CHECK (uploaded_by IN ('client', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'historique des statuts
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(20) NOT NULL CHECK (changed_by IN ('client', 'admin')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON projects(client_email);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_status_history_project_id ON status_history(project_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour enregistrer l'historique des statuts
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_history (project_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'admin', 'Changement de statut automatique');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour l'historique des statuts
CREATE TRIGGER log_status_change_trigger AFTER UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- RLS (Row Level Security) - Politiques de sécurité
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut créer un projet (formulaire public)
CREATE POLICY "Anyone can create projects" ON projects
  FOR INSERT WITH CHECK (true);

-- Politique: Les clients peuvent voir leurs propres projets (via email)
CREATE POLICY "Clients can view own projects" ON projects
  FOR SELECT USING (true); -- Pour simplifier, on permet la lecture à tous (à ajuster selon vos besoins)

-- Politique: Les admins peuvent tout faire (géré côté application avec auth)
-- Les admins utiliseront le service_role key pour bypasser RLS

-- Politique pour les messages
CREATE POLICY "Anyone can create messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read messages" ON messages
  FOR SELECT USING (true);

-- Politique pour les fichiers
CREATE POLICY "Anyone can create files" ON project_files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read files" ON project_files
  FOR SELECT USING (true);

-- Politique pour l'historique
CREATE POLICY "Anyone can read status history" ON status_history
  FOR SELECT USING (true);

