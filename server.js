const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_ici';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de 100 requêtes par IP
});
app.use(limiter);

// Initialisation de la base de données
const db = new sqlite3.Database('budget.db');

// Création des tables
db.serialize(() => {
  // Table utilisateurs
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table revenus
  db.run(`CREATE TABLE IF NOT EXISTS revenus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    montant REAL NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Table catégories
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nom TEXT NOT NULL,
    couleur TEXT DEFAULT '#007bff',
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Table dépenses
  db.run(`CREATE TABLE IF NOT EXISTS depenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    montant REAL NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fixe', 'variable')),
    date_depense DATE NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    supprimee BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`);

  // Table objectifs
  db.run(`CREATE TABLE IF NOT EXISTS objectifs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nom TEXT NOT NULL,
    montant_cible REAL NOT NULL,
    montant_actuel REAL DEFAULT 0,
    date_limite DATE,
    atteint BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Table paramètres utilisateur
  db.run(`CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    seuil_alerte REAL DEFAULT 100,
    notifications_actives BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insérer des catégories par défaut
  db.run(`INSERT OR IGNORE INTO categories (user_id, nom, couleur) VALUES 
    (0, 'Loyer', '#dc3545'),
    (0, 'Électricité', '#ffc107'),
    (0, 'Nourriture', '#28a745'),
    (0, 'Transport', '#17a2b8'),
    (0, 'Scolarité', '#6f42c1'),
    (0, 'Loisirs', '#fd7e14'),
    (0, 'Santé', '#e83e8c'),
    (0, 'Autres', '#6c757d')`);
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Accès refusé' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Routes d'authentification
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
          }
          return res.status(500).json({ error: 'Erreur lors de la création du compte' });
        }
        
        // Créer les paramètres par défaut
        db.run('INSERT INTO user_settings (user_id) VALUES (?)', [this.lastID]);
        
        // Copier les catégories par défaut pour cet utilisateur
        db.run(`INSERT INTO categories (user_id, nom, couleur) 
                SELECT ?, nom, couleur FROM categories WHERE user_id = 0`,
                [this.lastID]);
        
        res.json({ message: 'Compte créé avec succès', userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });
    
    res.json({ message: 'Connexion réussie', user: { id: user.id, username: user.username } });
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Déconnexion réussie' });
});

// Routes API protégées
app.use('/api', authenticateToken);

// Gestion des revenus
app.get('/api/revenus', (req, res) => {
  db.all('SELECT * FROM revenus WHERE user_id = ? ORDER BY date_ajout DESC', 
    [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des revenus' });
    }
    res.json(rows);
  });
});

app.post('/api/revenus', (req, res) => {
  const { source, montant } = req.body;
  
  db.run('INSERT INTO revenus (user_id, source, montant) VALUES (?, ?, ?)',
    [req.user.userId, source, montant], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du revenu' });
    }
    res.json({ id: this.lastID, message: 'Revenu ajouté avec succès' });
  });
});

app.delete('/api/revenus/:id', (req, res) => {
  db.run('DELETE FROM revenus WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
    res.json({ message: 'Revenu supprimé avec succès' });
  });
});

// Gestion des catégories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories WHERE user_id = ? OR user_id = 0 ORDER BY nom',
    [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { nom, couleur } = req.body;
  
  db.run('INSERT INTO categories (user_id, nom, couleur) VALUES (?, ?, ?)',
    [req.user.userId, nom, couleur || '#007bff'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de l\'ajout de la catégorie' });
    }
    res.json({ id: this.lastID, message: 'Catégorie ajoutée avec succès' });
  });
});

// Gestion des dépenses
app.get('/api/depenses', (req, res) => {
  const { month, year, category } = req.query;
  let query = `SELECT d.*, c.nom as categorie_nom, c.couleur as categorie_couleur 
               FROM depenses d 
               JOIN categories c ON d.category_id = c.id 
               WHERE d.user_id = ? AND d.supprimee = 0`;
  let params = [req.user.userId];

  if (month && year) {
    query += ` AND strftime('%m', d.date_depense) = ? AND strftime('%Y', d.date_depense) = ?`;
    params.push(month.padStart(2, '0'), year);
  }

  if (category) {
    query += ` AND d.category_id = ?`;
    params.push(category);
  }

  query += ` ORDER BY d.date_depense DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des dépenses' });
    }
    res.json(rows);
  });
});

app.post('/api/depenses', (req, res) => {
  const { category_id, description, montant, type, date_depense } = req.body;
  
  db.run(`INSERT INTO depenses (user_id, category_id, description, montant, type, date_depense) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.userId, category_id, description, montant, type, date_depense], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'ajout de la dépense' });
      }
      res.json({ id: this.lastID, message: 'Dépense ajoutée avec succès' });
    });
});

app.put('/api/depenses/:id/supprimer', (req, res) => {
  db.run('UPDATE depenses SET supprimee = 1 WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
    res.json({ message: 'Dépense supprimée avec succès' });
  });
});

// Statistiques et prévisions
app.get('/api/stats', (req, res) => {
  const { month, year } = req.query;
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();
  
  // Calcul des revenus du mois
  db.get(`SELECT COALESCE(SUM(montant), 0) as total_revenus 
          FROM revenus 
          WHERE user_id = ?`,
    [req.user.userId], (err, revenus) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du calcul des revenus' });
    }

    // Calcul des dépenses du mois
    db.get(`SELECT COALESCE(SUM(montant), 0) as total_depenses 
            FROM depenses 
            WHERE user_id = ? AND supprimee = 0 
            AND strftime('%m', date_depense) = ? 
            AND strftime('%Y', date_depense) = ?`,
      [req.user.userId, currentMonth.toString().padStart(2, '0'), currentYear.toString()], 
      (err, depenses) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors du calcul des dépenses' });
        }

        // Calcul des dépenses par catégorie
        db.all(`SELECT c.nom, c.couleur, COALESCE(SUM(d.montant), 0) as total
                FROM categories c
                LEFT JOIN depenses d ON c.id = d.category_id 
                  AND d.user_id = ? AND d.supprimee = 0
                  AND strftime('%m', d.date_depense) = ? 
                  AND strftime('%Y', d.date_depense) = ?
                WHERE c.user_id = ? OR c.user_id = 0
                GROUP BY c.id, c.nom, c.couleur
                HAVING total > 0
                ORDER BY total DESC`,
          [req.user.userId, currentMonth.toString().padStart(2, '0'), currentYear.toString(), req.user.userId],
          (err, categories) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur lors du calcul par catégorie' });
            }

            const budget_restant = revenus.total_revenus - depenses.total_depenses;
            const jours_restants = new Date(currentYear, currentMonth, 0).getDate() - new Date().getDate();
            const jours_autonomie = jours_restants > 0 && depenses.total_depenses > 0 ? 
              Math.floor(budget_restant / (depenses.total_depenses / new Date().getDate())) : 0;

            res.json({
              revenus: revenus.total_revenus,
              depenses: depenses.total_depenses,
              budget_restant,
              jours_autonomie,
              categories_depenses: categories,
              alerte_rupture: budget_restant < 100 // Seuil par défaut
            });
          });
      });
  });
});

// Routes pour les pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});