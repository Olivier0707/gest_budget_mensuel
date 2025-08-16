# 📁 Structure du Projet

Voici comment organiser tous les fichiers pour que l'application fonctionne correctement :

```
gestion-budget-mensuel/
│
├── 📄 package.json                 # Configuration npm et dépendances
├── 📄 server.js                    # Serveur Node.js principal
├── 📄 README.md                    # Documentation utilisateur
├── 📄 STRUCTURE_PROJET.md          # Ce fichier
├── 📄 budget.db                    # Base de données SQLite (créée automatiquement)
│
└── 📁 public/                      # Fichiers statiques (HTML, CSS, JS)
    ├── 📄 login.html               # Page de connexion/inscription
    ├── 📄 dashboard.html           # Interface principale
    ├── 📄 styles.css               # Styles CSS de l'application
    └── 📄 dashboard.js             # Logique JavaScript du dashboard
```

## 📋 Checklist d'installation

### ✅ Étape 1 : Créer la structure
1. Créer le dossier principal `gestion-budget-mensuel`
2. Créer le sous-dossier `public/`

### ✅ Étape 2 : Copier les fichiers

**À la racine du projet :**
- `package.json` → Copier le contenu de l'artefact "package.json"
- `server.js` → Copier le contenu de l'artefact "server.js"
- `README.md` → Copier le contenu de l'artefact "README.md"

**Dans le dossier `public/` :**
- `login.html` → Copier le contenu de l'artefact "login.html"
- `dashboard.html` → Copier le contenu de l'artefact "dashboard.html"
- `styles.css` → Copier le contenu de l'artefact "styles.css"
- `dashboard.js` → Copier le contenu de l'artefact "dashboard.js"

### ✅ Étape 3 : Installation
```bash
# Dans le dossier racine du projet
npm install
```

### ✅ Étape 4 : Démarrage
```bash
# Mode développement (recommandé)
npm run dev

# Ou mode production
npm start
```

## 🔍 Vérification

Une fois tous les fichiers copiés, votre dossier devrait ressembler exactement à la structure ci-dessus.

### Points importants :
- ⚠️ **Respecter exactement les noms de fichiers** (sensible à la casse)
- ⚠️ **Le dossier `public/` doit contenir tous les fichiers HTML, CSS et JS**
- ⚠️ **Le fichier `server.js` doit être à la racine, pas dans `public/`**
- ✅ Le fichier `budget.db` sera créé automatiquement au premier démarrage
- ✅ Tous les fichiers doivent être encodés en UTF-8

## 🚀 Test de fonctionnement

Après installation :
1. L'application démarre sur `http://localhost:3000`
2. La page de connexion s'affiche correctement
3. Vous pouvez créer un compte et vous connecter
4. Le dashboard se charge avec toutes les fonctionnalités

Si quelque chose ne fonctionne pas, vérifiez que tous les fichiers sont au bon endroit selon cette structure.