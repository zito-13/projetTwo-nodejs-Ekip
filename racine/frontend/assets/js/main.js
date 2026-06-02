// URLs de base des APIs backend
const API_RECETTES = 'http://localhost:3000/recettes';
const API_USERS    = 'http://localhost:3000/users';
const PEXELS_KEY   = 'FZxpznXTMSKXdYy9HWaGAFkhUlicWWNG5475kqBdhc5M06sX2uxyQ34k';

// Sélection des éléments du DOM (peuvent être null selon la page)
const form         = document.getElementById('recipe-form');   // Formulaire d'ajout de recette
const selectAuteur = document.getElementById('auteur');        // Select de choix de l'auteur
const listeSection = document.getElementById('recettes-liste'); // Conteneur des cartes recettes

// ── Session ───────────────────────────────────────────────

// Récupère l'utilisateur connecté depuis le localStorage
// Retourne null si aucun utilisateur n'est connecté ou si le JSON est invalide
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

// Gère l'affichage de la navigation selon l'état de connexion
// Affiche "Ajouter une recette" + nom + déconnexion si connecté
// Affiche uniquement "Connexion" si non connecté
function gererNav() {
    const user           = getUser();
    const navAjouter     = document.getElementById('nav-ajouter');
    const navUser        = document.getElementById('nav-user');
    const navUsername    = document.getElementById('nav-username');
    const navDeconnexion = document.getElementById('nav-deconnexion');
    const navConnexion   = document.getElementById('nav-connexion');
    const btnDeconnexion = document.getElementById('btn-deconnexion');

    // Utilitaire : affiche ou masque un élément nav en toute sécurité
    // (évite une erreur si l'élément n'existe pas sur la page courante)
    const afficher = (el, visible) => {
        if (el) el.style.display = visible ? 'list-item' : 'none';
    };

    if (user) {
        // Utilisateur connecté : on affiche les éléments réservés aux membres
        afficher(navAjouter,     true);
        afficher(navUser,        true);
        afficher(navDeconnexion, true);
        afficher(navConnexion,   false);
        // Affiche "Prénom Nom" ou l'email en fallback si le prénom est absent
        if (navUsername) {
            navUsername.textContent = user.firstName ? user.firstName + ' ' + user.name : user.email;
        }
    } else {
        // Utilisateur non connecté : on masque tout sauf le lien de connexion
        afficher(navAjouter,     false);
        afficher(navUser,        false);
        afficher(navDeconnexion, false);
        afficher(navConnexion,   true);
    }

    // Bouton déconnexion : vide le localStorage et redirige vers la page de connexion
    if (btnDeconnexion) {
        btnDeconnexion.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
}

// ── Modal ─────────────────────────────────────────────────

// Crée la structure HTML de la modal et l'injecte dans le body
// La modal s'ouvre au clic sur "Voir la recette" et affiche tous les détails
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

    // Fermeture via le bouton ×
    document.getElementById('modal-close').addEventListener('click', fermerModal);
    // Fermeture en cliquant en dehors de la modal (sur l'overlay)
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fermerModal(); });
    // Fermeture avec la touche Echap
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerModal(); });
}

// Remplit la modal avec les données d'une recette et l'affiche
function ouvrirModal(r) {
    const auteurNom = r.auteur ? r.auteur.firstName + ' ' + r.auteur.name : 'Inconnu';

    // Injection des données textuelles
    document.getElementById('modal-title').textContent        = r.title;
    document.getElementById('modal-auteur').textContent       = auteurNom;
    document.getElementById('modal-ingredients').textContent  = r.ingredients;
    document.getElementById('modal-instructions').textContent = r.instructions;

    // Badges de métadonnées (catégorie, difficulté, temps)
    document.getElementById('modal-meta').innerHTML = `
        <span>${r.categories}</span>
        <span>${r.difficulty}</span>
        <span>Prep. ${r.time} min</span>
        <span>Cuisson ${r.timecook} min</span>
    `;

    // Affiche l'image si elle existe, sinon masque le bloc image
    const imgEl   = document.getElementById('modal-img');
    const imgWrap = document.getElementById('modal-img-wrap');
    if (r.image) {
        imgEl.src             = r.image;
        imgEl.alt             = r.title;
        imgWrap.style.display = 'block';
    } else {
        imgWrap.style.display = 'none';
    }

    // Activation de l'overlay + blocage du scroll de la page
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Ferme la modal et réactive le scroll de la page
function fermerModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ── Message formulaire ────────────────────────────────────

// Affiche un message de succès (vert) ou d'erreur (rouge) sous le formulaire
// Le message disparaît automatiquement après 4 secondes
function afficherMessage(texte, succes = true) {
    let msgEl = document.getElementById('form-message');
    if (!msgEl) {
        // Crée l'élément s'il n'existe pas encore dans le DOM
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

// Cherche une image culinaire sur Pexels en combinant titre + catégorie + termes food
// Récupère 5 résultats et choisit celui dont l'alt correspond le mieux au titre
async function chercherImage(titre, categorie) {
    try {
        // Termes anglais ajoutés pour forcer des résultats culinaires
        const termesFood   = 'recipe dish plated food meal cuisine';

        // Suppression des mots de liaison pour affiner la recherche
        const motsInutiles = ['de','du','des','au','aux','à','la','le','les','un','une','et','avec'];
        const titrePropre  = titre.toLowerCase().split(' ')
            .filter(m => !motsInutiles.includes(m)).join(' ');

        const query    = encodeURIComponent(`${titrePropre} ${categorie} ${termesFood}`);
        const url      = `https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape&size=large`;
        const response = await fetch(url, { headers: { 'Authorization': PEXELS_KEY } });

        if (!response.ok) return null;

        const data = await response.json();

        // Si aucun résultat, on tente une recherche simplifiée (fallback)
        if (!data.photos || data.photos.length === 0) return await chercherImageFallback(titrePropre);

        // Scoring : on sélectionne la photo dont la description contient
        // le plus de mots du titre pour maximiser la pertinence
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

// Recherche de secours : si la recherche combinée échoue,
// on tente uniquement avec le titre nettoyé + "food"
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

// Récupère tous les utilisateurs depuis l'API et remplit le <select> auteur
// Chaque option a pour valeur l'_id MongoDB et affiche "Prénom Nom"
async function chargerUtilisateurs() {
    if (!selectAuteur) return; // Ne rien faire si le select n'existe pas sur la page
    try {
        const response = await fetch(API_USERS);
        const users    = await response.json();

        selectAuteur.innerHTML = '<option value="">-- Choisir un auteur --</option>';
        users.forEach(u => {
            const option       = document.createElement('option');
            option.value       = u._id;                          // _id envoyé au backend
            option.textContent = u.firstName + ' ' + u.name;    // Affiché dans la liste
            selectAuteur.appendChild(option);
        });
    } catch (err) {
        selectAuteur.innerHTML = '<option value="">Impossible de charger les utilisateurs</option>';
    }
}

// ── Affichage recettes ────────────────────────────────────

// Récupère toutes les recettes depuis l'API et génère une carte HTML pour chacune
// Chaque carte dispose d'un bouton "Voir la recette" qui ouvre la modal
async function afficherRecettes() {
    if (!listeSection) return; // Ne rien faire si le conteneur n'existe pas sur la page
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
            // L'auteur est un objet complet grâce au .populate() côté backend
            const auteurNom = r.auteur ? r.auteur.firstName + ' ' + r.auteur.name : 'Inconnu';

            const card      = document.createElement('article');
            card.className  = 'recette-card';
            card.dataset.id = r._id;

            // Bloc image : photo si disponible, placeholder sinon
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

            // Ouvre la modal avec les données de cette recette au clic
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

        // Construction de l'objet recette à envoyer au backend
        const recette = {
            title:        titre,
            ingredients:  document.getElementById('ingredients').value.trim(),
            instructions: document.getElementById('instructions').value.trim(),
            time:         Number(document.getElementById('time').value),
            timecook:     Number(document.getElementById('timecook').value),
            difficulty:   document.getElementById('difficulty').value,
            categories:   categorie,
            auteur:       selectAuteur.value, // _id de l'utilisateur sélectionné
        };

        // Validation : un auteur doit être sélectionné
        if (!recette.auteur) {
            afficherMessage('Veuillez selectionner un auteur.', false);
            return;
        }

        // Validation : aucun champ (hors auteur) ne doit être vide ou NaN
        const champsVides = Object.entries(recette).filter(([k, v]) =>
            k !== 'auteur' && (v === '' || (typeof v === 'number' && isNaN(v)))
        );
        if (champsVides.length > 0) {
            afficherMessage('Veuillez remplir tous les champs.', false);
            return;
        }

        // Recherche d'une image pertinente avant l'envoi (ne bloque pas si échec)
        const imageUrl = await chercherImage(titre, categorie);
        if (imageUrl) recette.image = imageUrl;

        try {
            // Envoi de la recette au backend via POST /recettes
            const response = await fetch(API_RECETTES, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(recette)
            });

            const data = await response.json();

            if (response.ok) {
                afficherMessage('Recette ' + data.recette.title + ' ajoutee avec succes !', true);
                form.reset();
                afficherRecettes(); // Rafraîchit la liste après l'ajout
            } else {
                afficherMessage('Erreur : ' + (data.error || "Impossible d'ajouter la recette."), false);
            }
        } catch (err) {
            afficherMessage('Impossible de contacter le serveur.', false);
        }
    });
}

// ── Init ──────────────────────────────────────────────────
// Ordre d'exécution au chargement de la page :
gererNav();           // 1. Adapte la navigation selon la session
creerModal();         // 2. Injecte la modal dans le DOM
chargerUtilisateurs(); // 3. Remplit le select auteur si présent
afficherRecettes();   // 4. Charge et affiche les recettes si présentes