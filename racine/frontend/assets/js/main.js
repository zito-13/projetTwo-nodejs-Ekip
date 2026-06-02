const API_RECETTES = 'http://localhost:3000/recettes';
const API_USERS    = 'http://localhost:3000/users';
const PEXELS_KEY   = 'FZxpznXTMSKXdYy9HWaGAFkhUlicWWNG5475kqBdhc5M06sX2uxyQ34k';

const form         = document.getElementById('recipe-form');
const selectAuteur = document.getElementById('auteur');
const listeSection = document.getElementById('recettes-liste');

// ── Session ───────────────────────────────────────────────
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

function gererNav() {
    const user           = getUser();
    const navAjouter     = document.getElementById('nav-ajouter');
    const navUser        = document.getElementById('nav-user');
    const navUsername    = document.getElementById('nav-username');
    const navDeconnexion = document.getElementById('nav-deconnexion');
    const navConnexion   = document.getElementById('nav-connexion');
    const btnDeconnexion = document.getElementById('btn-deconnexion');

    const afficher = (el, visible) => {
        if (el) el.style.display = visible ? 'list-item' : 'none';
    };

    if (user) {
        afficher(navAjouter,     true);
        afficher(navUser,        true);
        afficher(navDeconnexion, true);
        afficher(navConnexion,   false);
        
    } else {
        afficher(navAjouter,     false);
        afficher(navUser,        false);
        afficher(navDeconnexion, false);
        afficher(navConnexion,   true);
    }

    if (btnDeconnexion) {
        btnDeconnexion.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
}

// ── Modal ─────────────────────────────────────────────────
function creerModal() {
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';

    overlay.innerHTML = `
        <div id="modal">
            <button id="modal-close" aria-label="Fermer">&times;</button>
            <div id="modal-img-wrap">
                <img id="modal-img" src="" alt="">
            </div>
            <div id="modal-content">
                <p id="modal-auteur"></p>
                <h2 id="modal-title"></h2>
                <div id="modal-meta"></div>
                <div id="modal-section">
                    <h4>Ingredients</h4>
                    <p id="modal-ingredients"></p>
                </div>
                <div id="modal-section">
                    <h4>Instructions</h4>
                    <p id="modal-instructions"></p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('modal-close').addEventListener('click', fermerModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fermerModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerModal(); });
}

function ouvrirModal(r) {
    const auteurNom = r.auteur ? r.auteur.username : 'Inconnu';

    document.getElementById('modal-title').textContent        = r.title;
    document.getElementById('modal-auteur').textContent       = auteurNom;
    document.getElementById('modal-ingredients').textContent  = r.ingredients;
    document.getElementById('modal-instructions').textContent = r.instructions;

    document.getElementById('modal-meta').innerHTML = `
        <span>${r.categories}</span>
        <span>${r.difficulty}</span>
        <span>Prep. ${r.time} min</span>
        <span>Cuisson ${r.timecook} min</span>
    `;

    const imgEl   = document.getElementById('modal-img');
    const imgWrap = document.getElementById('modal-img-wrap');
    if (r.image) {
        imgEl.src             = r.image;
        imgEl.alt             = r.title;
        imgWrap.style.display = 'block';
    } else {
        imgWrap.style.display = 'none';
    }

    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fermerModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ── Message formulaire ────────────────────────────────────
function afficherMessage(texte, succes = true) {
    let msgEl = document.getElementById('form-message');
    if (!msgEl) {
        msgEl = document.createElement('p');
        msgEl.id = 'form-message';
        form.after(msgEl);
    }
    msgEl.textContent      = texte;
    msgEl.style.color      = succes ? 'green' : 'red';
    msgEl.style.fontWeight = 'bold';
    msgEl.style.marginTop  = '10px';
    setTimeout(() => { msgEl.textContent = ''; }, 4000);
}

// ── Recherche image Pexels ────────────────────────────────
async function chercherImage(titre, categorie) {
    try {
        const termesFood   = 'recipe dish plated food meal cuisine';
        const motsInutiles = ['de','du','des','au','aux','à','la','le','les','un','une','et','avec'];
        const titrePropre  = titre.toLowerCase().split(' ')
            .filter(m => !motsInutiles.includes(m)).join(' ');

        const query    = encodeURIComponent(`${titrePropre} ${categorie} ${termesFood}`);
        const url      = `https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape&size=large`;
        const response = await fetch(url, { headers: { 'Authorization': PEXELS_KEY } });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.photos || data.photos.length === 0) return await chercherImageFallback(titrePropre);

        const motsTitre = titrePropre.split(' ');
        let meilleure = data.photos[0], meilleurScore = 0;
        data.photos.forEach(p => {
            const score = motsTitre.filter(m => (p.alt || '').toLowerCase().includes(m)).length;
            if (score > meilleurScore) { meilleurScore = score; meilleure = p; }
        });

        return meilleure.src.large;
    } catch (err) {
        return null;
    }
}

async function chercherImageFallback(titrePropre) {
    try {
        const query    = encodeURIComponent(titrePropre + ' food');
        const url      = `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`;
        const response = await fetch(url, { headers: { 'Authorization': PEXELS_KEY } });
        if (!response.ok) return null;
        const data = await response.json();
        return data.photos && data.photos.length > 0 ? data.photos[0].src.large : null;
    } catch { return null; }
}

// ── Chargement utilisateurs ───────────────────────────────
async function chargerUtilisateurs() {
    if (!selectAuteur) return;
    try {
        const response = await fetch(API_USERS);
        const users    = await response.json();
        selectAuteur.innerHTML = '<option value="">-- Choisir un auteur --</option>';
        users.forEach(u => {
            const option       = document.createElement('option');
            option.value       = u._id;
            option.textContent = u.username;
            selectAuteur.appendChild(option);
        });
    } catch (err) {
        selectAuteur.innerHTML = '<option value="">Impossible de charger les utilisateurs</option>';
    }
}

// ── Affichage recettes ────────────────────────────────────
async function afficherRecettes() {
    if (!listeSection) return;
    try {
        const response = await fetch(API_RECETTES);
        const data     = await response.json();
        const recettes = data.recettes;

        listeSection.innerHTML = '';

        if (recettes.length === 0) {
            listeSection.innerHTML = '<p>Aucune recette pour le moment.</p>';
            return;
        }

        recettes.forEach(r => {
            const auteurNom = r.auteur ? r.auteur.username : 'Inconnu';
            const card      = document.createElement('article');
            card.className  = 'recette-card';
            card.dataset.id = r._id;

            const imageHtml = r.image
                ? `<div class="recette-img"><img src="${r.image}" alt="${r.title}" loading="lazy"></div>`
                : `<div class="recette-img recette-img--placeholder"><span>Pas d'image</span></div>`;

            card.innerHTML = `
                ${imageHtml}
                <div class="recette-body">
                    <h3>${r.title}</h3>
                    <p class="recette-auteur">${auteurNom}</p>
                    <p><strong>Categorie :</strong> ${r.categories}</p>
                    <p><strong>Difficulte :</strong> ${r.difficulty}</p>
                    <p>
                        <strong>Preparation :</strong> ${r.time} min &nbsp;|&nbsp;
                        <strong>Cuisson :</strong> ${r.timecook} min
                    </p>
                    <button class="btn-voir">Voir la recette</button>
                </div>
            `;

            card.querySelector('.btn-voir').addEventListener('click', () => ouvrirModal(r));
            listeSection.appendChild(card);
        });

    } catch (err) {
        listeSection.innerHTML = '<p style="color:red">Impossible de charger les recettes.</p>';
    }
}

// ── Soumission formulaire ─────────────────────────────────
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titre     = document.getElementById('title').value.trim();
        const categorie = document.getElementById('categories').value.trim();

        const recette = {
            title:        titre,
            ingredients:  document.getElementById('ingredients').value.trim(),
            instructions: document.getElementById('instructions').value.trim(),
            time:         Number(document.getElementById('time').value),
            timecook:     Number(document.getElementById('timecook').value),
            difficulty:   document.getElementById('difficulty').value,
            categories:   categorie,
            auteur:       selectAuteur.value,
        };

        if (!recette.auteur) {
            afficherMessage('Veuillez selectionner un auteur.', false);
            return;
        }

        const champsVides = Object.entries(recette).filter(([k, v]) =>
            k !== 'auteur' && (v === '' || (typeof v === 'number' && isNaN(v)))
        );
        if (champsVides.length > 0) {
            afficherMessage('Veuillez remplir tous les champs.', false);
            return;
        }

        const imageUrl = await chercherImage(titre, categorie);
        if (imageUrl) recette.image = imageUrl;

        try {
            const response = await fetch(API_RECETTES, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(recette)
            });

            const data = await response.json();

            if (response.ok) {
                afficherMessage('Recette ' + data.recette.title + ' ajoutee avec succes !', true);
                form.reset();
                afficherRecettes();
            } else {
                afficherMessage('Erreur : ' + (data.error || "Impossible d'ajouter la recette."), false);
            }
        } catch (err) {
            afficherMessage('Impossible de contacter le serveur.', false);
        }
    });
}

// ── Init ──────────────────────────────────────────────────
gererNav();
creerModal();
chargerUtilisateurs();
afficherRecettes();