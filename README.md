# 💰 Gestion des Budgets Mensuels

Application web complète pour la gestion des budgets personnels et familiaux, développée avec Node.js, Express, SQLite et une interface moderne.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Implémentées

- **🔐 Authentification sécurisée**
  - Création de compte avec validation
  - Connexion/déconnexion
  - Hachage des mots de passe avec bcrypt
  - Sessions JWT sécurisées

- **💵 Gestion des Revenus**
  - Ajouter plusieurs sources de revenus
  - Visualisation des revenus totaux
  - Suppression des revenus

- **💸 Gestion des Dépenses**
  - Ajout de dépenses par catégorie
  - Classification fixe/variable
  - Suppression logique des dépenses
  - Filtrage par catégorie, date, montant

- **🏷️ Gestion des Catégories**
  - Catégories prédéfinies (Loyer, Nourriture, Transport, etc.)
  - Création de catégories personnalisées
  - Couleurs personnalisables

- **📊 Tableau de Bord Interactif**
  - Statistiques en temps réel
  - Graphiques avec Chart.js
  - Cartes de synthèse

- **🔮 Prévisions Budgétaires**
  - Calcul automatique des jours d'autonomie
  - Analyse de la situation financière
  - Suggestions d'économies personnalisées

- **⚠️ Système d'Alertes**
  - Notifications de rupture budgétaire
  - Seuils d'alerte personnalisables
  - Suggestions automatiques d'économies

- **📱 Interface Responsive**
  - Design moderne et intuitif
  - Compatible mobile et desktop
  - Animations et transitions fluides

## 🛠️ Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner ou télécharger le projet**
   ```bash
   mkdir gestion-budget-mensuel
   cd gestion-budget-mensuel
   ```

2. **Copier tous les fichiers sources** dans le dossier du projet en respectant cette structure :
   ```
   gestion-budget-mensuel/
   ├── server.js
   ├── package.json
   ├── README.md
   └── public/
       ├── dashboard.html
       ├── login.html
       ├── styles.css
       └── dashboard.js
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

4. **Démarrer l'application**
   ```bash
   # En mode développement (avec rechargement automatique)
   npm run dev
   
   # Ou en mode production
   npm start
   ```

5. **Accéder à l'application**
   - Ouvrir votre navigateur à l'adresse : `http://localhost:3000`

## 🔧 Configuration

### Variables d'environnement (optionnel)
Créez un fichier `.env` pour personnaliser la configuration :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt_tres_securise_ici
NODE_ENV=production
```

### Base de données
- L'application utilise SQLite avec un fichier `budget.db` créé automatiquement
- Les tables sont créées automatiquement au premier démarrage
- Catégories par défaut incluses

## 📖 Utilisation

### Premier démarrage

1. **Créer un compte**
   - Cliquer sur l'onglet "Inscription"
   - Remplir le formulaire avec un nom d'utilisateur, email et mot de passe
   - Valider l'inscription

2. **Se connecter**
   - Utiliser vos identifiants pour accéder au tableau de bord
   - Vous êtes automatiquement redirigé vers l'interface principale

### Utilisation quotidienne

#### 💵 Gérer vos revenus
- Aller dans l'onglet "Revenus"
- Ajouter vos différentes sources (salaire, freelance, etc.)
- Les revenus sont comptabilisés dans les statistiques globales

#### 💸 Enregistrer vos dépenses
- Aller dans l'onglet "Dépenses"
- Sélectionner une catégorie existante
- Préciser si c'est une dépense fixe ou variable
- Ajouter une description et le montant
- Sélectionner la date de la dépense

#### 🏷️ Personnaliser vos catégories
- Aller dans l'onglet "Catégories"
- Ajouter de nouvelles catégories selon vos besoins
- Choisir une couleur pour une meilleure visualisation

#### 📊 Suivre votre budget
- Le tableau de bord affiche :
  - Revenus et dépenses du mois
  - Budget restant
  - Nombre de jours d'autonomie
  - Répartition par catégorie (graphique)
- Utilisez les filtres par mois/année pour analyser différentes périodes

#### 🔮 Utiliser les prévisions
- L'onglet "Prévisions" fournit :
  - Une analyse détaillée de votre situation
  - Des suggestions d'économies personnalisées
  - Des conseils budgétaires

## ⚠️ Système d'Alertes

L'application vous alertera automatiquement si :
- Votre budget restant devient faible (seuil par défaut : 100€)
- Vos dépenses dépassent vos revenus
- Votre rythme de dépenses risque de dépasser le budget avant la fin du mois

## 🔐 Sécurité

- Mots de passe hachés avec bcrypt
- Sessions sécurisées avec JWT
- Protection contre les attaques par force brute
- Validation des données côté serveur
- Données personnelles isolées par utilisateur

## 🐛 Dépannage

### Problèmes courants

1. **Erreur "Port déjà utilisé"**
   - Changer le port dans le fichier `.env` ou arrêter l'autre processus

2. **Base de données corrompue**
   - Supprimer le fichier `budget.db` et redémarrer l'application

3. **Erreurs de permissions**
   - Vérifier que le dossier du projet est accessible en écriture

4. **Interface ne se charge pas**
   - Vérifier que tous les fichiers sont dans le bon dossier `public/`
   - Vérifier la console du navigateur pour les erreurs JavaScript

### Logs et débogage
- Les erreurs serveur s'affichent dans la console
- Utiliser les outils de développement du navigateur (F12) pour déboguer l'interface

## 📝 Licence

Ce projet est libre d'utilisation pour un usage personnel et éducatif.

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez les logs de l'application
3. Vérifiez que tous les fichiers sont présents et correctement placés

---

**Bonne gestion de votre budget ! 💰📈**