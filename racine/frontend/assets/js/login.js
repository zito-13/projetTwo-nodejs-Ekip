// URL de base de l'API utilisateurs
const API_USERS = 'http://localhost:3000/users';

// Sélection des éléments du DOM
const loginForm      = document.getElementById('login-form');     // Formulaire de connexion
const errorEl        = document.getElementById('login-error');    // Zone d'affichage des erreurs
const togglePassword = document.getElementById('toggle-password'); // Bouton oeil pour afficher/masquer
const passwordInput  = document.getElementById('password');        // Champ mot de passe

// Affiche un message d'erreur sous le formulaire
function afficherErreur(message) {
    errorEl.textContent = message;
    errorEl.classList.add('visible'); // La classe 'visible' active l'affichage via CSS
}

// Masque le message d'erreur
function cacherErreur() {
    errorEl.classList.remove('visible');
}

// Bascule la visibilité du mot de passe au clic sur l'icône oeil
togglePassword.addEventListener('click', () => {
    const visible      = passwordInput.type === 'text'; // Vérifie si le mdp est déjà visible
    passwordInput.type = visible ? 'password' : 'text'; // Inverse le type du champ
    togglePassword.style.color = visible ? '' : 'var(--terracotta)'; // Colore l'icône si actif
});

// Soumission du formulaire de connexion
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    cacherErreur();     // Efface l'éventuel message d'erreur précédent

    const email     = document.getElementById('email').value.trim(); // Récupère l'email sans espaces
    const password  = document.getElementById('password').value;     // Récupère le mot de passe
    const btnSubmit = loginForm.querySelector('.btn-submit');         // Bouton de soumission

    // Désactive le bouton pendant la requête pour éviter les double-clics
    btnSubmit.disabled    = true;
    btnSubmit.textContent = 'Connexion...';

    try {
        // Envoie les identifiants au backend via POST /users/login
        const response = await fetch(`${API_USERS}/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }) // Convertit en JSON
        });

        const data = await response.json(); // Parse la réponse JSON du serveur

        if (response.ok) {
            // Connexion réussie : on stocke les infos utilisateur dans le localStorage
            // pour les réutiliser sur toutes les pages (nom, id, etc.)
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html'; // Redirige vers la page d'accueil
        } else {
            // Le serveur a répondu avec une erreur (mauvais identifiants, etc.)
            afficherErreur(data.message || 'Email ou mot de passe incorrect.');
        }

    } catch (err) {
        // Erreur réseau : le serveur est inaccessible ou éteint
        afficherErreur('Impossible de contacter le serveur.');
    } finally {
        // Dans tous les cas, on réactive le bouton
        btnSubmit.disabled    = false;
        btnSubmit.textContent = 'Se connecter';
    }
});