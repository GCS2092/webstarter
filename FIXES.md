# 🔧 Corrections appliquées

## ✅ Problème 1 : Colonne `inspirations` manquante dans Supabase

### Solution
Un script de migration a été créé : `supabase-migration.sql`

**Action requise** :
1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL
3. Exécutez le contenu du fichier `supabase-migration.sql`
4. Cela ajoutera la colonne `inspirations` (et `client_phone` si manquante) à votre table `projects`

### Alternative rapide
Si vous préférez exécuter directement dans Supabase :

```sql
-- Ajouter la colonne inspirations si elle n'existe pas
ALTER TABLE projects ADD COLUMN IF NOT EXISTS inspirations TEXT;

-- Ajouter la colonne client_phone si elle n'existe pas
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);
```

## ✅ Problème 2 : Configuration Gmail pour les emails

### Solution
L'envoi d'emails via Gmail SMTP a été configuré avec Nodemailer.

**Action requise** :

1. **Installer la dépendance** :
   ```bash
   cd webstarter
   npm install
   ```

2. **Créer/Modifier `.env.local`** :
   ```env
   # Supabase (déjà configuré)
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_supabase

   # Gmail (NOUVEAU - à ajouter)
   GMAIL_USER=votre-email@gmail.com
   GMAIL_APP_PASSWORD=jkqzuyaebqjaeqmv
   ```

3. **Redémarrer le serveur** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

### Vérification
- Remplissez le formulaire de demande
- Vérifiez que vous recevez l'email de confirmation
- Dans le dashboard admin, changez un statut
- Vérifiez que le client reçoit l'email

## 📝 Notes importantes

1. **Mot de passe d'application Gmail** : 
   - Le mot de passe fourni (`jkqzuyaebqjaeqmv`) doit être utilisé tel quel
   - Assurez-vous que la validation en 2 étapes est activée sur votre compte Gmail
   - Ne partagez jamais ce mot de passe publiquement

2. **Adresse Gmail** :
   - Remplacez `votre-email@gmail.com` par votre vraie adresse Gmail
   - C'est cette adresse qui apparaîtra comme expéditeur des emails

3. **Sécurité** :
   - Le fichier `.env.local` est déjà dans `.gitignore`
   - Ne commitez jamais vos variables d'environnement

## 🚀 Prochaines étapes

1. ✅ Exécuter `supabase-migration.sql` dans Supabase
2. ✅ Ajouter les variables Gmail dans `.env.local`
3. ✅ Installer les dépendances (`npm install`)
4. ✅ Redémarrer le serveur
5. ✅ Tester l'envoi d'emails

## 📚 Documentation

- Voir `GMAIL_SETUP.md` pour le guide complet de configuration Gmail
- Voir `SETUP.md` pour la configuration générale du projet

