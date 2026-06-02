const API_RECETTES = 'http://localhost:3000/recettes';
const API_USERS    = 'http://localhost:3000/users';

const form         = document.getElementById('recipe-form');
const selectAuteur = document.getElementById('auteur');
const listeSection = document.getElementById('recettes-liste');

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

            card.innerHTML = `
                <h3>${r.title}</h3>
                <img src="${r.lienimg || 'default-image.jpg'}" alt="Image de ${r.title}" class="recette-image">
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
            `;

            listeSection.appendChild(card);
        });

    } catch (err) {
        listeSection.innerHTML = '<p style="color:red">Impossible de charger les recettes.</p>';
        console.error(err);
    }
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const recette = {
            title:        document.getElementById('title').value.trim(),
            ingredients:  document.getElementById('ingredients').value.trim(),
            instructions: document.getElementById('instructions').value.trim(),
            time:         Number(document.getElementById('time').value),
            timecook:     Number(document.getElementById('timecook').value),
            difficulty:   document.getElementById('difficulty').value,
            categories:   document.getElementById('categories').value.trim(),
            auteur:       selectAuteur.value,
            lienimg:      document.getElementById('lienimg').value.trim()
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