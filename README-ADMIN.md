# PSG Employee Portal - Administration

Portail administratif pour Protection Security Group avec gestion complète des employés, documents et journal d'audit.

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Système d'authentification** JWT avec bcrypt
- **Login administratif** sécurisé avec expiry des mots de passe
- **Dashboard admin** avec statistiques en temps réel
- **Base de données PostgreSQL** avec Prisma ORM
- **API complètes** pour authentification et administration
- **Interface responsive** avec React et Tailwind CSS

### 📋 À venir
- Gestion CRUD complète des employés (50+ champs)
- Upload et gestion de documents entreprise
- Journal d'audit complet avec filtres
- Changement de mot de passe avec alertes
- Tests et validation

## 🛠️ Stack Technique

- **Frontend**: React 19 + Vite
- **Backend**: Express.js
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: JWT (jose) + bcrypt
- **Styling**: Tailwind CSS + Lucide Icons
- **Animations**: Framer Motion

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL (local ou distant)
- npm ou yarn

### Étapes

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer la base de données**
```bash
# Éditer .env avec les informations de connexion PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/psg_db"
```

3. **Initialiser Prisma**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. **Démarrer le serveur**
```bash
npm run dev
```

5. **Accéder au portail**
- Site public: http://localhost:3012/
- Portail admin: http://localhost:3012/portal

## 👥 Comptes de Test

### Admin Accounts
```
Email: admin@psg.com
Password: Admin#2026!

Email: m.reynolds@psg.com
Password: Admin#2026!
```

### Employee Accounts
```
Email: jason.walker@psg.local
Password: Employee#2026!

Email: s.martinez@psg.local
Password: Employee#2026!
```

## 🔧 Scripts Disponibles

```bash
npm run dev           # Démarrer le serveur de développement
npm run build         # Compiler pour la production
npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Créer les migrations de base de données
npm run prisma:seed      # Peupler la base de données avec des données de test
npm run db:setup         # Setup complet de la base de données
```

## 📁 Structure du Projet

```
psg3/
├── src/
│   ├── api/              # Routes API Express
│   │   ├── auth.ts       # Authentification (login, logout, change-password)
│   │   └── admin.ts      # Administration (users, documents, audit)
│   ├── components/       # Composants React
│   │   └── admin/        # Composants admin
│   ├── pages/            # Pages React
│   │   └── admin/        # Pages admin
│   └── lib/              # Utilitaires
│       ├── auth.ts       # Fonctions d'authentification
│       ├── prisma.ts     # Client Prisma
│       └── middleware.ts # Middlewares Express
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── seed.ts           # Données de test
└── server.ts             # Serveur Express
```

## 🔐 Sécurité

- **Hashage bcrypt** (12 rounds) pour les mots de passe
- **Tokens JWT** avec expiration de 7 jours
- **Expiration des mots de passe** tous les 6 mois
- **Alertes visuelles** 30 jours avant expiration
- **Audit complet** de toutes les actions
- **Protection CORS** configurée

## 📊 Modèle de Données

### User
- Authentication (email, password)
- Rôles (admin, employee)
- Statut actif/inactif
- Gestion de l'expiration des mots de passe

### EmployeeProfile
- 50+ champs pour fiche employé complète
- Informations personnelles, professionnelles, bancaires
- Certifications et équipements
- Contact urgence

### Document
- Upload de fichiers
- Catégorisation
- Visibilité admin/employee

### AuditLog
- Traçabilité complète
- Filtres par action, date
- Informations IP et utilisateur

## 🚧 Développement en Cours

Le portail administratif est en phase de développement active. Les fonctionnalités CRUD complètes pour la gestion des employés, documents et audit seront ajoutées prochainement.

## 📞 Support

Pour toute question ou problème, contacter l'administrateur système.

---

**Protection Security Group LLC** © 2026 - Tous droits réservés