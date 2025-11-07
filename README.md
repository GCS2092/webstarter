# WebStarter 🚀

Plateforme de gestion de projets web professionnelle. Transformez vos idées en sites web modernes et performants.

## 🎯 Fonctionnalités

### Partie publique
- ✅ Page d'accueil avec présentation des services
- ✅ Page "À propos" avec le processus en étapes
- ✅ Formulaire de demande de projet complet avec validation
- ✅ Upload de fichiers (logo, photos, documents)
- ✅ Confirmation automatique par email

### Partie admin
- ✅ Dashboard avec statistiques et filtres
- ✅ Gestion des projets avec changement de statut
- ✅ Messagerie intégrée pour chaque projet
- ✅ Gestion des fichiers uploadés
- ✅ Authentification admin avec Supabase Auth
- ✅ Recherche et filtres avancés

### Espace client
- ✅ Accès privé au projet (via email)
- ✅ Suivi de l'avancement du projet
- ✅ Messagerie avec l'admin
- ✅ Upload de fichiers
- ✅ Téléchargement des documents

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd webstarter
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Supabase**
   - Créez un projet sur [Supabase](https://supabase.com)
   - Exécutez le script SQL dans `supabase-schema.sql` dans l'éditeur SQL de Supabase
   - Créez un bucket de stockage nommé `project-files` dans Supabase Storage
   - Configurez les politiques RLS selon vos besoins

4. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   Remplissez les variables dans `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL de votre projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clé anonyme de Supabase

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 📦 Structure du projet

```
webstarter/
├── src/
│   ├── app/
│   │   ├── admin/              # Dashboard admin
│   │   │   ├── login/          # Page de connexion admin
│   │   │   └── projects/[id]/  # Détails d'un projet
│   │   ├── client/[projectId]/ # Espace client
│   │   ├── about/              # Page À propos
│   │   ├── request/            # Formulaire de demande
│   │   └── api/
│   │       └── send-email/     # API route pour les emails
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   └── ui/                 # Composants UI
│   └── lib/
│       ├── supabase.ts         # Client Supabase (client)
│       └── supabase-server.ts  # Client Supabase (server)
├── supabase-schema.sql         # Schéma de base de données
└── package.json
```

## 🗄️ Base de données

Le schéma SQL est disponible dans `supabase-schema.sql`. Il inclut:

- **projects**: Table principale des projets
- **messages**: Messagerie entre client et admin
- **project_files**: Fichiers uploadés pour chaque projet
- **status_history**: Historique des changements de statut

## ✉️ Configuration des emails

L'API route `/api/send-email` est prête mais nécessite la configuration d'un service d'email:

### Option 1: Resend (recommandé)
```bash
npm install resend
```

Puis dans `src/app/api/send-email/route.ts`, décommentez le code Resend.

### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

### Option 3: Nodemailer
Pour un service SMTP personnalisé.

## 🔐 Authentification Admin

1. Créez un utilisateur admin dans Supabase Auth
2. Connectez-vous via `/admin/login`
3. Le middleware protège automatiquement les routes `/admin/*`

## 📝 Statuts des projets

- `nouvelle`: Nouvelle demande
- `en_analyse`: En cours d'analyse
- `acceptee`: Acceptée
- `refusee`: Refusée
- `en_attente_info`: En attente d'informations
- `en_cours`: En cours de développement
- `termine`: Terminé

## 🎨 Personnalisation

- Modifiez les couleurs dans `src/app/globals.css`
- Personnalisez les textes dans les composants
- Ajoutez vos propres styles dans Tailwind

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
