const API_USERS = 'http://localhost:3000/users';

const loginForm      = document.getElementById('login-form');
const errorEl        = document.getElementById('login-error');
const togglePassword = document.getElementById('toggle-password');
const passwordInput  = document.getElementById('password');

function afficherErreur(message) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
}

function cacherErreur() {
    errorEl.classList.remove('visible');
}

togglePassword.addEventListener('click', () => {
    const visible      = passwordInput.type === 'text';
    passwordInput.type = visible ? 'password' : 'text';
    togglePassword.style.color = visible ? '' : 'var(--terracotta)';
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    cacherErreur();

    const email     = document.getElementById('email').value.trim();
    const password  = document.getElementById('password').value;
    const btnSubmit = loginForm.querySelector('.btn-submit');

    btnSubmit.disabled    = true;
    btnSubmit.textContent = 'Connexion...';

    try {
        const response = await fetch(`${API_USERS}/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        } else {
            afficherErreur(data.message || 'Email ou mot de passe incorrect.');
        }

    } catch (err) {
        afficherErreur('Impossible de contacter le serveur.');
    } finally {
        btnSubmit.disabled    = false;
        btnSubmit.textContent = 'Se connecter';
    }
});