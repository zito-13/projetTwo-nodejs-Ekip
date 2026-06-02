const API_RECETTES  = 'http://localhost:3000/recettes';
const API_USERS     = 'http://localhost:3000/users';
const PEXELS_KEY = 'FZxpznXTMSKXdYy9HWaGAFkhUlicWWNG5475kqBdhc5M06sX2uxyQ34k';

const form         = document.getElementById('recipe-form');
const selectAuteur = document.getElementById('auteur');
const listeSection = document.getElementById('recettes-liste');

// ── Message de retour formulaire ──────────────────────────
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

// ── Recherche d'image sur Unsplash ────────────────────────
// On cherche avec le titre + la catégorie pour plus de pertinence
async function chercherImage(titre, categorie) {
    try {
        const query    = encodeURIComponent(titre + ' ' + categorie + ' food');
        const url      = `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`;
        const response = await fetch(url, {
            headers: {
                'Authorization': PEXELS_KEY
            }
        });

        if (!response.ok) {
            console.error('Pexels erreur HTTP :', response.status, response.statusText);
            return null;
        }

        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.large;
        }
        return null;
    } catch (err) {
        console.error('Erreur Pexels :', err);
        return null;
    }
}

// ── Chargement des utilisateurs dans le select ────────────
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
        console.error(err);
    }
}

// ── Affichage de toutes les recettes ──────────────────────
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

            const card = document.createElement('article');
            card.className  = 'recette-card';
            card.dataset.id = r._id;

            // Image : affiche la photo si disponible, sinon un placeholder
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
                    <details>
                        <summary>Ingredients</summary>
                        <p>${r.ingredients}</p>
                    </details>
                    <details>
                        <summary>Instructions</summary>
                        <p>${r.instructions}</p>
                    </details>
                </div>
            `;

            listeSection.appendChild(card);
        });

    } catch (err) {
        listeSection.innerHTML = '<p style="color:red">Impossible de charger les recettes.</p>';
        console.error(err);
    }
}

// ── Soumission du formulaire ──────────────────────────────
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

        // Recherche de l'image avant l'envoi
        const imageUrl = await chercherImage(titre, categorie);
        if (imageUrl) {
            recette.image = imageUrl;
        }

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
            console.error(err);
        }
    });
}

chargerUtilisateurs();
afficherRecettes();