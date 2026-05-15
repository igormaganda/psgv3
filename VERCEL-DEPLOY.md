# 🚀 Guide de Déploiement Vercel - Portail Admin PSG

## 📋 Pré-requis

- Compte Vercel (https://vercel.com)
- Projet Vercel créé
- Base de données PostgreSQL (Vercel Postgres ou externe)

## 🔧 Configuration du Projet

### 1. Variables d'Environnement

Configurer les variables d'environnement dans votre projet Vercel:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=votre_clé_secret_jwt_très_longue_et_sécurisée
NODE_ENV=production
```

### 2. Base de Données

#### Option A: Vercel Postgres (Recommandé)
1. Aller dans votre projet Vercel
2. Storage → Databases → Create Database
3. Choisir PostgreSQL
4. Copier la `DATABASE_URL` fournie

#### Option B: Base de données externe
Utiliser votre propre serveur PostgreSQL ou un service comme:
- Supabase
- Railway
- Neon
- PlanetScale

## 🚀 Processus de Déploiement

### Méthode 1: Via Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer le projet
vercel

# Suivre les instructions:
# - Liern le projet à un équipe existante ou créer un nouveau
# - Confirmer les paramètres de build
# - Configurer les variables d'environnement
```

### Méthode 2: Via GitHub (Recommandé pour CI/CD)

1. **Pousser le code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PSG Admin Portal"
   git remote add origin https://github.com/VOTRE_USERNAME/psg3-admin.git
   git push -u origin main
   ```

2. **Importer sur Vercel**
   - Aller sur https://vercel.com/new
   - Importer le projet GitHub
   - Configurer les paramètres
   - Cliquer sur "Deploy"

### Méthode 3: Déploiement Manuel

1. Aller sur https://vercel.com/new
2. Choisir "Import Other Project"
3. Télécharger les fichiers du projet
4. Configurer les paramètres de build
5. Déployer

## ⚙️ Configuration du Build

Dans les paramètres du projet Vercel:

**Build Command:**
```bash
npm run vercel-build
```

**Output Directory:**
```bash
dist
```

**Install Command:**
```bash
npm install
```

## 🗄️ Configuration de la Base de Données

### Initialiser Prisma sur Vercel

Après le déploiement initial, exécuter:

```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Exécuter les commandes de base de données
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

### Via Vercel CLI

```bash
# Se connecter au projet
vercel link

# Pousser le schéma de base de données
npx prisma db push --accept-data-loss

# Créer les données de test
npx prisma db seed
```

## 🔐 Comptes de Test

Une fois le déploiement terminé, utiliser ces comptes:

**Admin:**
- Email: `admin@psg.com`
- Password: `Admin#2026!`

**Employees:**
- Email: `jason.walker@psg.local`
- Password: `Employee#2026!`

## 🌐 URLs du Déploiement

Après déploiement, vous aurez:

- **URL de production:** `https://votre-projet.vercel.app`
- **URL du portail admin:** `https://votre-projet.vercel.app/portal`
- **Domaine personnalisé:** Configurable dans les settings Vercel

## 📊 Monitoring

Vercel fournit automatiquement:
- **Analytics:** Visiteurs et performance
- **Logs:** Logs des requêtes et erreurs
- **Deployments:** Historique des déploiements
- **Environment Variables:** Gestion des secrets

## 🔄 Mise à Jour du Déploiement

### Automatic Deployment (avec GitHub)
Chaque `push` sur `main` déclenche un nouveau déploiement.

### Manual Deployment
```bash
vercel --prod
```

## 🛠️ Résolution de Problèmes

### Problème: "Database connection failed"
**Solution:** Vérifier la variable `DATABASE_URL` dans les settings Vercel

### Problème: "Prisma Client not generated"
**Solution:** Ajouter `"postinstall": "prisma generate"` aux scripts package.json

### Problème: "Route not found"
**Solution:** Vérifier le fichier `vercel.json` pour les routes correctes

### Problème: "Timeout sur les fonctions"
**Solution:** Augmenter `"maxLambdaSize"` dans vercel.json

## 💰 Coûts

**Vercel Hobby (Gratuit):**
- 100GB bandwidth/mois
- 1000 invocations de fonctions/jour
- 6 secondes timeout par fonction
- Prisma gratuit limité

**Vercel Pro ($20/mois):**
- 1TB bandwidth/mois
- Fonctions illimitées
- 10 secondes timeout
- Support prioritaire

## 🚀 Check-list de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL créée
- [ ] Schéma Prisma poussé (`npx prisma db push`)
- [ ] Données de test créées (`npx prisma db seed`)
- [ ] Premier déploiement réussi
- [ ] Test des routes API
- [ ] Test du portail admin
- [ ] Configuration du domaine personnalisé (optionnel)
- [ ] Monitoring configuré

---

**Une fois déployé, votre portail admin sera accessible en HTTPS avec un certificat SSL automatique !** 🎉