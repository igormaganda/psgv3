# 🏢 PSG3 - Portail Admin
## Protection Security Group: Système de Gestion RH

---

## 📋 Vue d'Ensemble

Le portail admin PSG3 est une solution complète de gestion des ressources humaines, sécurisée et intuitive, permettant aux administrateurs de gérer efficacement les employés, documents, et accès au système.

### 🎯 Fonctionnalités Principales

- ✅ **Gestion des Employés** avec profil complet (60+ champs)
- ✅ **Gestion Documentaire** centralisée
- ✅ **Journal d'Audit** complet de toutes les actions
- ✅ **Export CSV** des données (utilisateurs, documents, audit)
- ✅ **Photos de Profil** personnalisables
- ✅ **Workflow d'Approbation** pour les modifications employés
- ✅ **Authentification Sécurisée** avec JWT
- ✅ **Contrôle d'Accès** par rôles (Admin/Employé)

---

## 🚀 Accès au Système

### URL de Production
**🌐 https://psg3-local.vercel.app**

### Connexion Admin
1. Aller sur: `https://psg3-local.vercel.app/portal/admin`
2. Utiliser vos identifiants admin
3. **Première connexion:** Le système vous demandera de changer votre mot de passe

### Sécurité
- 🔐 **Mots de passe:** Min 8 caractères, majuscule, minuscule, chiffre
- ⏰ **Expiration:** Mots de passe expirent après 6 mois
- 🛡️ **2FA:** Authentification à deux facteurs disponible
- 📝 **Journal:** Toutes les actions sont tracées dans l'audit log

---

## 📊 Tableau de Bord Admin

### Statistiques en Temps Réel
Le dashboard affiche instantanément:
- 👥 **Total Employés** - Nombre d'employés enregistrés
- ✅ **Employés Actifs** - Employés avec accès actif
- 📄 **Documents** - Nombre de documents stockés
- 🛡️ **Admins Actifs** - Nombre d'administrateurs

### Activité Récente
- 📋 **Feed en temps réel** des dernières actions
- 🎨 **Codage par couleurs** des types d'actions
- ⏱️ **Horodatage** relatif (il y a 2 minutes, etc.)

---

## 👥 Gestion des Employés

### Navigation
Onglet **"Users"** dans le menu principal

### Fonctionnalités Disponibles

#### 🔍 Recherche et Filtrage
- **Recherche textuelle:** Par nom, email, ID employé
- **Filtre par rôle:** Admin / Employé
- **Filtre par statut:** Actif / Inactif
- **Filtre par département:** Tous les départements

#### ➕ Créer un Employé
1. Cliquer sur **"Add User"**
2. Remplir le formulaire:
   - **Identité:** Prénom, Nom, Email, Mot de passe
   - **Poste:** Département, Titre, ID Employé (auto-généré)
   - **Statut:** Actif/Inactif, Rôle
3. Cliquer **"Create User"**

#### ✏️ Modifier un Employé
1. Cliquer sur l'icône **✏️ (Edit)** dans la table
2. Mettre à jour les informations
3. Cliquer **"Update User"**

#### 🗑️ Désactiver un Employé
1. Cliquer sur l'icône **🗑️ (Delete)** dans la table
2. Confirmer la désactivation
3. **Note:** L'employé est marqué "Inactif" mais les données sont conservées

#### 📤 Exporter la Liste
- Cliquer sur **"Export CSV"** pour télécharger la liste filtrée
- Inclut toutes les colonnes visibles + filtres appliqués

---

## 👤 Profil Employé Complet

### Accès au Profil
- Depuis la table utilisateurs: cliquer sur le nom d'un employé
- **Ou** utiliser la recherche pour trouver un employé spécifique

### Structure du Profil (7 Onglets)

#### 1️⃣ Informations de Base
```
• ID Employé (ex: ADM-0001)
• Prénom, Nom, Nom Préféré
• Date de Naissance, Lieu de Naissance
• Nationalité
• Email Personnel, Email Pro
• Téléphone, Téléphone Pro
```

#### 2️⃣ Contact
```
• Adresse (Ligne 1, Ligne 2, Ville, État, Code Postal, Pays)
• Contact Urgent:
  - Nom, Relation
  - Téléphone, Email
```

#### 3️⃣ Emploi
```
• Gouvernement:
  - Type d'ID, Numéro d'ID
  - 4 derniers chiffres SSN
  - Type d'Autorisation de Travail
  - Expiration Autorisation

• Détails Poste:
  - Titre, Département, Manager
  - Type de Contrat, Type d'Emploi
  - Date d'Embauche, Fin Période d'Essai
  - Lieu de Travail, Type d'Horaire
  - Heures Hebdomadaires
```

#### 4️⃣ Rémunération (Admin Only)
```
• Type de Rémunération: Horaire / Salaire
• Salaire de Base
• Éligible Bonus: Oui/Non
• Informations Bancaires:
  - Nom de la Banque
  - 4 derniers chiffres du compte
  - 4 derniers chiffres du routing
```

#### 5️⃣ Équipement
```
• Taille d'Uniforme (XS à 3XL)
• Note de Performance (1-5)
• Équipement Distribué
• Licences Professionnelles
• Certifications (CPR, First Aid, OSHA, etc.)
• Formations Requises
```

#### 6️⃣ Documents
```
📋 Espace pour documents employés:
- CV
- Certifications
- Contrats
- Evaluations
```

#### 7️⃣ Paramètres
```
• Authentification à deux facteurs: Activé/Désactivé
• Statut du compte: Actif/Inactif
```

### 📸 Photo de Profil
- **Cercle photo** en haut du profil
- **Cliquez sur l'icône caméra** pour changer la photo
- **Formats acceptés:** JPG, PNG, GIF
- **Taille max:** 5MB
- **Affichage:** Visible dans la table utilisateurs et le profil

### 💾 Sauvegarde des Modifications
- **Bouton "Save Changes"** apparaît quand des modifications sont détectées
- **Bouton "Cancel"** pour annuler les changements
- **Notifications toast** confirment la sauvegarde

---

## 📄 Gestion Documentaire

### Navigation
Onglet **"Documents"** dans le menu principal

### Types de Documents
- 📋 **Policy** - Politiques de l'entreprise
- 📖 **Handbook** - Manuels employés
- 📝 **Form** - Formulaires divers
- 📋 **Contract** - Contrats
- 📁 **Other** - Autres documents

### Fonctionnalités

#### 📤 Upload de Documents
1. Cliquer sur **"Upload Document"**
2. Remplir:
   - **Titre** du document
   - **Catégorie**
   - **Description** (optionnelle)
   - **Fichier** (drag & drop ou parcourir)
3. Cliquer **"Upload Document"**

**Restrictions:**
- 📏 **Taille max:** 25MB par fichier
- 📎 **Formats acceptés:** PDF, DOC, DOCX, TXT, XLS, XLSX, JPG, PNG

#### 📥 Télécharger un Document
- Cliquer sur l'icône **⬇️ (Download)** sur la carte du document

#### 🗑️ Supprimer un Document
1. Cliquer sur l'icône **🗑️ (Delete)** sur la carte
2. Confirmer la suppression

#### 📤 Exporter la Liste
- Cliquer sur **"Export CSV"** pour télécharger l'inventaire

---

## 📋 Journal d'Audit

### Navigation
Onglet **"Audit Log"** dans le menu principal

### Informations Traquées
Chaque action est enregistrée avec:
- 🕐 **Date et heure** de l'action
- 👤 **Utilisateur** qui a effectué l'action
- 🎯 **Type d'action** (codé par couleur)
- 📝 **Détails** de l'action
- 🌐 **Adresse IP** de l'origine

### Types d'Actions
| Action | Couleur | Description |
|--------|---------|-------------|
| User Created | 🟢 Vert | Nouvel employé créé |
| User Updated | 🔵 Bleu | Profil modifié |
| User Deleted | 🔴 Rouge | Employé désactivé |
| Document Uploaded | 🟠 Orange | Nouveau document |
| Document Deleted | 🔴 Rouge | Document supprimé |
| Login | ⚪ Blanc | Connexion au système |
| Logout | ⚪ Blanc | Déconnexion |
| Password Changed | 🟣 Violet | Mot de passe changé |

### Export de l'Audit
- L'audit log peut être **exporté en CSV**
- Filtres disponibles par type d'action et plage de dates

---

## 🔐 Sécurité et Authentification

### Expiration des Mots de Passe
- ⏰ **Durée de validité:** 6 mois
- 🚨 **Alerte:** Notification 30 jours avant expiration
- 🛑 **Blocage:** Accès refusé si mot de passe expiré
- 🔑 **Changement:** Forcé à la première connexion

### Complexité des Mots de Passe
- ✅ **Minimum 8 caractères**
- ✅ **Au moins une majuscule**
- ✅ **Au moins une minuscule**
- ✅ **Au moins un chiffre**

### Sessions et Jetons
- 🔑 **Jetons JWT** pour l'authentification
- ⏱️ **Expiration automatique** des sessions
- 📱 **Multi-device** supporté

---

## 🔄 Workflow d'Approbation (Prochainement)

### Mode Admin
- ✅ **Modification directe** de tous les champs
- ✅ **Validation immédiate** des changements
- ✅ **Accès complet** à toutes les sections

### Mode Employé (À Venir)
- 📝 **Soumission de modifications** pour approbation
- ⏳ **Statut des demandes:** En attente / Approuvé / Rejeté
- 🔔 **Notifications** des décisions admin
- 📋 **Historique** des modifications demandées

---

## 📱 Interface Utilisateur

### Design Responsive
- 📱 **Mobile:** Interface adaptée pour smartphones
- 💻 **Tablette:** Mise en page optimisée
- 🖥️ **Desktop:** Expérience complète

### Navigation Intuitive
- 🏠 **Onglets principaux:** Dashboard | Users | Documents | Audit Log
- 🔄 **Changement rapide** entre sections
- 🎨 **Design moderne** avec animations fluides
- ♿ **Accessibilité:** Contrastes respectés, tailles lisibles

### Notifications
- 🔔 **Toast notifications** pour feedback immédiat
- ✅ **Succès:** Vert
- ❌ **Erreur:** Rouge
- ⚠️ **Attention:** Orange
- ℹ️ **Info:** Bleu

---

## 🎨 Personnalisation

### Badges et Indicateurs
- **Rôle Admin:** Badge ambre
- **Rôle Employé:** Badge bleu
- **Statut Actif:** Badge vert
- **Statut Inactif:** Badge rouge
- **Catégories Documents:** Codées par couleur

### Thème
- 🎨 **Couleurs:** Amber (PSG brand)
- 🖼️ **Design épuré** et professionnel
- 🌈 **Contrôles visuels** pour faciliter la lecture

---

## 📞 Support et Assistance

### En Cas de Problème

1. **Vérifier vos identifiants**
   - Email correct
   - Mot de passe valide (attention aux majuscules)

2. **Mot de passe oublié**
   - Contacter l'admin principal
   - Réinitialisation sécurisée

3. **Problème technique**
   - Rafraîchir la page (F5)
   - Vider le cache du navigateur
   - Essayer un autre navigateur

### Contact Admin
- 📧 **Email Support:** admin@psg.local
- 🌐 **URL:** https://psg3-local.vercel.app

---

## 📖 Guide Rapide

### Scénarios Courants

#### Scénario 1: Nouvel Employé
1. ✅ Aller dans **"Users"** → **"Add User"**
2. ✅ Remplir informations de base
3. ✅ Cliquer **"Create User"**
4. ✅ L'employé recevra un email avec ses identifiants
5. ✅ À la première connexion, il devra changer son mot de passe

#### Scénario 2: Modifier un Profil
1. ✅ Aller dans **"Users"** → Rechercher l'employé
2. ✅ Cliquer sur le nom de l'employé
3. ✅ Naviguer entre les onglets pour trouver le champ
4. ✅ Modifier les champs nécessaires
5. ✅ Cliquer **"Save Changes"**

#### Scénario 3: Upload Document
1. ✅ Aller dans **"Documents"** → **"Upload Document"**
2. ✅ Remplir titre, catégorie, description
3. ✅ Glisser-déposer le fichier ou parcourir
4. ✅ Cliquer **"Upload Document"**
5. ✅ Le document apparaît dans la liste

#### Scénario 4: Exporter Données
1. ✅ Aller dans la section (Users ou Documents)
2. ✅ Appliquer les filtres souhaités
3. ✅ Cliquer **"Export CSV"**
4. ✅ Le fichier télécharge automatiquement

#### Scénario 5: Consulter l'Audit
1. ✅ Aller dans **"Audit Log"**
2. ✅ Les actions récentes s'affichent
3. ✅ Filtrer par type d'action si nécessaire
4. ✅ Exporter en CSV pour analyse

---

## ✅ Checkliste de Déploiement

### Pour les Administrateurs

- [ ] Compte admin créé et testé
- [ ] Premier employé créé pour test
- [ ] Document de test uploadé
- [ ] Export CSV testé
- [ ] Audit log vérifié
- [ ] Mot de passe changé (première connexion)
- [ ] Photo de profil uploadée
- [ ] Tous les onglets du profil explorés

### Pour les Employés

- [ ] Invitez les employés par email
- [ ] Communiquez-leur l'URL du portail
- [ ] Expliquez le processus de première connexion
- [ ] Indiquez comment modifier leur profil
- [ ] Précisez les documents à uploader

---

## 🎓 Formation Recommandée

### Module 1: Connexion et Navigation (15 min)
- Accès au portail admin
- Première connexion
- Navigation entre onglets
- Compréhension du dashboard

### Module 2: Gestion des Employés (30 min)
- Créer un employé
- Modifier un profil
- Désactiver un compte
- Exporter la liste

### Module 3: Gestion Documentaire (20 min)
- Uploader un document
- Catégoriser correctement
- Télécharger et supprimer

### Module 4: Profil Employé Complet (45 min)
- Exploration des 7 onglets
- Compréhension des 60+ champs
- Modification des informations
- Gestion des photos

### Module 5: Audit et Sécurité (15 min)
- Lecture du journal d'audit
- Compréhension des actions tracées
- Gestion des mots de passe

**Temps total de formation:** ~2 heures

---

## 📈 Évolutions Futures

### Phase 2 - En Développement
- 🔔 **Système de notifications** pour les approbations
- 📊 **Rapports avancés** et analytics
- 📱 **Application mobile** employés
- 🔄 **Synchronisation** avec autres systèmes RH

### Phase 3 - Roadmap
- 🤖 **Automatisation** des workflows
- 📈 **Performance analytics**
- 🎯 **Objectifs et évaluations**
- 💰 **Gestion des paies**

---

## 📞 Informations Complémentaires

### En Résumé

Le portail admin PSG3 est:
- ✅ **Complet** - Toutes les fonctionnalités RH nécessaires
- ✅ **Sécurisé** - Authentification robuste et audit complet
- ✅ **Intuitif** - Interface moderne et responsive
- ✅ **Flexible** - Export et personnalisation
- ✅ **Scalable** - Prêt pour évoluer avec votre entreprise

### Prochaine Étape

🚀 **Commencez dès maintenant:** 
1. Connectez-vous à https://psg3-local.vercel.app/portal/admin
2. Explorez le dashboard
3. Créez votre premier employé de test
4. Découvrez toutes les fonctionnalités!

---

**Version:** 1.0
**Date:** 15 Mai 2026
**Développé par:** Protection Security Group
**Support:** admin@psg.local

🎉 **Bienvenue dans votre nouveau portail admin PSG3!**
