# Guide de configuration WebStarter

## 📋 Étapes de configuration

### 1. Configuration Supabase

#### Créer le projet
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anonyme

#### Exécuter le schéma SQL
1. Dans le dashboard Supabase, allez dans "SQL Editor"
2. Ouvrez le fichier `supabase-schema.sql`
3. Copiez-collez tout le contenu dans l'éditeur SQL
4. Exécutez le script

#### Créer le bucket de stockage
1. Dans Supabase, allez dans "Storage"
2. Cliquez sur "New bucket"
3. Nommez-le `project-files`
4. Configurez les politiques:
   - **Public**: Oui (pour permettre l'accès aux fichiers)
   - **File size limit**: 50 MB (ou selon vos besoins)
   - **Allowed MIME types**: image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

#### Politiques RLS pour le bucket
Dans l'éditeur SQL, exécutez:

```sql
-- Permettre l'upload à tous
CREATE POLICY "Anyone can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-files');

-- Permettre la lecture à tous
CREATE POLICY "Anyone can read files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

-- Permettre la suppression (optionnel)
CREATE POLICY "Anyone can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-files');
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### 3. Créer un utilisateur admin

#### Via le dashboard Supabase
1. Allez dans "Authentication" > "Users"
2. Cliquez sur "Add user" > "Create new user"
3. Entrez un email et un mot de passe
4. Notez ces identifiants pour vous connecter à `/admin/login`

#### Via SQL (optionnel)
```sql
-- Créer un utilisateur admin (à faire via l'interface Supabase Auth)
-- L'utilisateur sera créé via l'interface d'authentification
```

### 4. Configuration des emails (optionnel mais recommandé)

#### Option A: Resend (recommandé)
1. Créez un compte sur [resend.com](https://resend.com)
2. Obtenez votre API key
3. Ajoutez dans `.env.local`:
   ```env
   RESEND_API_KEY=votre_cle_resend
   ```
4. Installez Resend:
   ```bash
   npm install resend
   ```
5. Dans `src/app/api/send-email/route.ts`, décommentez le code Resend

#### Option B: SendGrid
1. Créez un compte sur [sendgrid.com](https://sendgrid.com)
2. Obtenez votre API key
3. Ajoutez dans `.env.local`:
   ```env
   SENDGRID_API_KEY=votre_cle_sendgrid
   ```
4. Installez SendGrid:
   ```bash
   npm install @sendgrid/mail
   ```

### 5. Lancer l'application

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## ✅ Vérification

1. **Page d'accueil**: `/` - Doit afficher la page d'accueil
2. **Formulaire**: `/request` - Testez l'envoi d'une demande
3. **Admin**: `/admin/login` - Connectez-vous avec vos identifiants admin
4. **Dashboard**: `/admin` - Vérifiez que les projets s'affichent

## 🔧 Dépannage

### Erreur "Invalid API key"
- Vérifiez que les variables d'environnement sont correctes
- Redémarrez le serveur après modification de `.env.local`

### Erreur "Bucket not found"
- Vérifiez que le bucket `project-files` existe dans Supabase Storage
- Vérifiez les politiques RLS du bucket

### Erreur d'authentification admin
- Vérifiez que l'utilisateur existe dans Supabase Auth
- Vérifiez que l'email et le mot de passe sont corrects

### Les emails ne s'envoient pas
- Vérifiez que vous avez configuré un service d'email (Resend, SendGrid, etc.)
- Vérifiez les logs dans la console du navigateur
- Les emails sont simulés par défaut (voir les logs dans la console)

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Resend](https://resend.com/docs)

