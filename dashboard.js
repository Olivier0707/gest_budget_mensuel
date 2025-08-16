// Variables globales
let currentUser = null;
let categories = [];
let revenus = [];
let depenses = [];
let currentStats = {};

// Graphiques
let categoryChart = null;
let evolutionChart = null;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    await loadCategories();
    await loadRevenus();
    await loadDepenses();
    await updateStats();
    
    // Initialiser les contrôles de date
    initializeDateControls();
    
    // Attacher les événements
    attachEventListeners();
    
    // Charger le dashboard par défaut
    showSection('dashboard');
});

// Initialisation des contrôles de date
function initializeDateControls() {
    const now = new Date();
    document.getElementById('monthSelect').value = now.getMonth() + 1;
    document.getElementById('yearSelect').value = now.getFullYear();
    document.getElementById('depenseDate').value = now.toISOString().split('T')[0];
    
    const filterMois = document.getElementById('filterMois');
    if (filterMois) {
        const currentMonth = now.toISOString().slice(0, 7);
        filterMois.value = currentMonth;
    }
}

// Chargement des données utilisateur
async function loadUserData() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            const userData = await response.json();
            document.getElementById('username').textContent = userData.username || 'Utilisateur';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
    }
}

// Chargement des catégories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (response.ok) {
            categories = await response.json();
            updateCategorySelects();
            renderCategories();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        showMessage('Erreur lors du chargement des catégories', 'error');
    }
}

// Mise à jour des sélecteurs de catégories
function updateCategorySelects() {
    const selects = [
        document.getElementById('depenseCategorie'),
        document.getElementById('filterCategorie')
    ];
    
    selects.forEach(select => {
        if (select) {
            // Garder la première option
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nom;
                select.appendChild(option);
            });
        }
    });
}

// Rendu des catégories
function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-item';
        categoryDiv.style.borderLeftColor = category.couleur;
        categoryDiv.innerHTML = `
            <h4>${category.nom}</h4>
            <div style="width: 20px; height: 20px; background-color: ${category.couleur}; border-radius: 50%; margin: 0 auto;"></div>
        `;
        container.appendChild(categoryDiv);
    });
}

// Chargement des revenus
async function loadRevenus() {
    try {
        const response = await fetch('/api/revenus');
        if (response.ok) {
            revenus = await response.json();
            renderRevenus();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des revenus:', error);
        showMessage('Erreur lors du chargement des revenus', 'error');
    }
}

// Rendu des revenus
function renderRevenus() {
    const tbody = document.querySelector('#revenusTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    revenus.forEach(revenu => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${revenu.source}</td>
            <td>${revenu.montant.toFixed(2)} €</td>
            <td>${new Date(revenu.date_ajout).toLocaleDateString()}</td>
            <td>
                <button onclick="deleteRevenu(${revenu.id})" class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;">
                    Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Chargement des dépenses
async function loadDepenses() {
    try {
        const month = document.getElementById('monthSelect')?.value;
        const year = document.getElementById('yearSelect')?.value;
        const category = document.getElementById('filterCategorie')?.value;
        
        let url = '/api/depenses?';
        if (month && year) {
            url += `month=${month}&year=${year}&`;
        }
        if (category) {
            url += `category=${category}&`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            depenses = await response.json();
            renderDepenses();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des dépenses:', error);
        showMessage('Erreur lors du chargement des dépenses', 'error');
    }
}

// Rendu des dépenses
function renderDepenses() {
    const tbody = document.querySelector('#depensesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    depenses.forEach(depense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(depense.date_depense).toLocaleDateString()}</td>
            <td>
                <span style="display: inline-block; width: 12px; height: 12px; background-color: ${depense.categorie_couleur}; border-radius: 50%; margin-right: 8px;"></span>
                ${depense.categorie_nom}
            </td>
            <td>${depense.description}</td>
            <td>
                <span class="badge badge-${depense.type}">${depense.type}</span>
            </td>
            <td>${depense.montant.toFixed(2)} €</td>
            <td>
                <button onclick="deleteDepense(${depense.id})" class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;">
                    Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Mise à jour des statistiques
async function updateStats() {
    try {
        const month = document.getElementById('monthSelect')?.value;
        const year = document.getElementById('yearSelect')?.value;
        
        let url = '/api/stats';
        if (month && year) {
            url += `?month=${month}&year=${year}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            currentStats = await response.json();
            updateStatsDisplay();
            updateCategoryChart();
            await loadDepenses(); // Recharger les dépenses avec les nouveaux filtres
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
        showMessage('Erreur lors de la mise à jour des statistiques', 'error');
    }
}

// Mise à jour de l'affichage des statistiques
function updateStatsDisplay() {
    document.getElementById('totalRevenus').textContent = `${currentStats.revenus.toFixed(2)} €`;
    document.getElementById('totalDepenses').textContent = `${currentStats.depenses.toFixed(2)} €`;
    document.getElementById('budgetRestant').textContent = `${currentStats.budget_restant.toFixed(2)} €`;
    document.getElementById('joursAutonomie').textContent = `${currentStats.jours_autonomie} jours`;
    
    // Gestion de l'alerte de rupture budgétaire
    const alerteDiv = document.getElementById('alerteRupture');
    if (currentStats.alerte_rupture || currentStats.budget_restant < 0) {
        alerteDiv.style.display = 'block';
        if (currentStats.budget_restant < 0) {
            alerteDiv.className = 'alert alert-danger';
            alerteDiv.innerHTML = `
                🚨 <strong>Budget dépassé !</strong> Vous avez dépassé votre budget de ${Math.abs(currentStats.budget_restant).toFixed(2)} €.
                <div class="suggestions">
                    <p><strong>Actions recommandées :</strong></p>
                    <ul>
                        <li>Réviser immédiatement vos dépenses</li>
                        <li>Supprimer les dépenses non essentielles</li>
                        <li>Planifier un budget d'urgence</li>
                    </ul>
                </div>
            `;
        }
    } else {
        alerteDiv.style.display = 'none';
    }
}

// Mise à jour du graphique des catégories
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx || !currentStats.categories_depenses) return;
    
    // Détruire l'ancien graphique s'il existe
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const data = currentStats.categories_depenses.filter(cat => cat.total > 0);
    
    if (data.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        const context = ctx.getContext('2d');
        context.font = '16px Arial';
        context.fillStyle = '#666';
        context.textAlign = 'center';
        context.fillText('Aucune dépense pour cette période', ctx.width / 2, ctx.height / 2);
        return;
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(cat => cat.nom),
            datasets: [{
                data: data.map(cat => cat.total),
                backgroundColor: data.map(cat => cat.couleur),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toFixed(2)} € (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Gestion des événements
function attachEventListeners() {
    // Formulaire revenus
    const revenuForm = document.getElementById('revenuForm');
    if (revenuForm) {
        revenuForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addRevenu(new FormData(revenuForm));
        });
    }
    
    // Formulaire dépenses
    const depenseForm = document.getElementById('depenseForm');
    if (depenseForm) {
        depenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addDepense(new FormData(depenseForm));
        });
    }
    
    // Formulaire catégories
    const categorieForm = document.getElementById('categorieForm');
    if (categorieForm) {
        categorieForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addCategorie(new FormData(categorieForm));
        });
    }
}

// Navigation entre les sections
function showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Désactiver tous les liens de navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Afficher la section sélectionnée
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Activer le lien de navigation correspondant
    const targetLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
    
    // Actions spécifiques selon la section
    switch(sectionName) {
        case 'dashboard':
            updateStats();
            break;
        case 'previsions':
            updatePredictions();
            break;
    }
}

// Ajouter un revenu
async function addRevenu(formData) {
    try {
        const data = Object.fromEntries(formData);
        
        const response = await fetch('/api/revenus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Revenu ajouté avec succès', 'success');
            document.getElementById('revenuForm').reset();
            await loadRevenus();
            await updateStats();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erreur lors de l\'ajout du revenu', 'error');
    }
}

// Supprimer un revenu
async function deleteRevenu(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) return;
    
    try {
        const response = await fetch(`/api/revenus/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Revenu supprimé avec succès', 'success');
            await loadRevenus();
            await updateStats();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erreur lors de la suppression du revenu', 'error');
    }
}

// Ajouter une dépense
async function addDepense(formData) {
    try {
        const data = Object.fromEntries(formData);
        
        const response = await fetch('/api/depenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Dépense ajoutée avec succès', 'success');
            document.getElementById('depenseForm').reset();
            // Remettre la date du jour par défaut
            document.getElementById('depenseDate').value = new Date().toISOString().split('T')[0];
            await loadDepenses();
            await updateStats();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erreur lors de l\'ajout de la dépense', 'error');
    }
}

// Supprimer une dépense
async function deleteDepense(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;
    
    try {
        const response = await fetch(`/api/depenses/${id}/supprimer`, {
            method: 'PUT'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Dépense supprimée avec succès', 'success');
            await loadDepenses();
            await updateStats();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erreur lors de la suppression de la dépense', 'error');
    }
}

// Ajouter une catégorie
async function addCategorie(formData) {
    try {
        const data = Object.fromEntries(formData);
        
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Catégorie ajoutée avec succès', 'success');
            document.getElementById('categorieForm').reset();
            await loadCategories();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erreur lors de l\'ajout de la catégorie', 'error');
    }
}

// Filtrer les dépenses
async function filterDepenses() {
    await loadDepenses();
}

// Mise à jour des prévisions
function updatePredictions() {
    const analyseBudget = document.getElementById('analyseBudget');
    const suggestionsEconomies = document.getElementById('suggestionsEconomies');
    
    if (!analyseBudget || !currentStats) return;
    
    // Analyse du budget
    let analyse = '';
    const ratio = currentStats.depenses / currentStats.revenus;
    
    if (ratio > 1) {
        analyse = `
            <div style="color: var(--danger-color);">
                <h4>⚠️ Situation critique</h4>
                <p>Vos dépenses dépassent vos revenus de ${((ratio - 1) * 100).toFixed(1)}%.</p>
                <p>Budget dépassé : ${Math.abs(currentStats.budget_restant).toFixed(2)} €</p>
            </div>
        `;
    } else if (ratio > 0.8) {
        analyse = `
            <div style="color: var(--warning-color);">
                <h4>⚠️ Attention</h4>
                <p>Vous utilisez ${(ratio * 100).toFixed(1)}% de vos revenus.</p>
                <p>Marge de sécurité faible : ${currentStats.budget_restant.toFixed(2)} €</p>
            </div>
        `;
    } else {
        analyse = `
            <div style="color: var(--success-color);">
                <h4>✅ Situation saine</h4>
                <p>Vous utilisez ${(ratio * 100).toFixed(1)}% de vos revenus.</p>
                <p>Économies possibles : ${currentStats.budget_restant.toFixed(2)} €</p>
            </div>
        `;
    }
    
    analyseBudget.innerHTML = analyse;
    
    // Suggestions d'économies
    if (suggestionsEconomies && currentStats.categories_depenses) {
        const topCategories = currentStats.categories_depenses
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);
        
        let suggestions = '<ul>';
        topCategories.forEach(cat => {
            const percentage = (cat.total / currentStats.depenses * 100).toFixed(1);
            suggestions += `<li>${cat.nom} représente ${percentage}% de vos dépenses (${cat.total.toFixed(2)} €)</li>`;
        });
        suggestions += '</ul>';
        
        suggestions += '<p><strong>Conseils :</strong></p><ul>';
        if (currentStats.jours_autonomie < 10) {
            suggestions += '<li>Réduisez immédiatement les dépenses non essentielles</li>';
        }
        suggestions += '<li>Essayez la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne</li>';
        suggestions += '<li>Planifiez vos gros achats à l\'avance</li>';
        suggestions += '</ul>';
        
        suggestionsEconomies.innerHTML = suggestions;
    }
}

// Affichage des messages
function showMessage(text, type = 'error') {
    // Créer ou récupérer l'élément de message
    let messageDiv = document.getElementById('globalMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'globalMessage';
        messageDiv.className = 'message';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '80px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '1001';
        messageDiv.style.minWidth = '300px';
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Déconnexion
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        window.location.href = '/';
    }
}

// Utilitaires pour les dates
function getCurrentMonthYear() {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}