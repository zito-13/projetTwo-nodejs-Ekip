// URL de base de l'API utilisateurs
const API_USERS = "http://localhost:3000/users";

// Sélection des éléments du DOM
const usersContainer = document.getElementById("users");       // Conteneur qui affiche la liste des utilisateurs
const userForm       = document.getElementById("userForm");    // Formulaire de création d'utilisateur
const formMessage    = document.getElementById("formMessage"); // Zone d'affichage des messages de retour

// ── Récupération et affichage des utilisateurs ────────────

// Récupère tous les utilisateurs depuis l'API et génère une carte HTML pour chacun
async function getUsers() {

    try {
        const response = await fetch(API_USERS);      // Requête GET /users
        const users    = await response.json();        // Parse la réponse JSON

        usersContainer.innerHTML = "";                 // Vide la liste avant de la reconstruire

        // Génère une carte HTML pour chaque utilisateur
        users.forEach(user => {

            usersContainer.innerHTML += `
            <div class="user">
                <p>ID : ${user._id}</p>
                <h3>${user.firstName} ${user.name}</h3>
                <p>Age : ${user.age}</p>
                <p>Email : ${user.email}</p>
                <div class="actions">
                    <button class="editBtn" data-id="${user._id}">
                        Modifier
                    </button>
                    <button class="deleteBtn" data-id="${user._id}">
                        Supprimer
                    </button>
                </div>
            </div>
            `;
            // data-id stocke l'_id MongoDB sur chaque bouton
            // pour savoir quel utilisateur modifier ou supprimer au clic
        });

        // Attache les événements sur les boutons après la génération du HTML
        addEvents(users);

    } catch (error) {
        console.error(error);
    }
}

// ── Événements Modifier / Supprimer ──────────────────────

// Attache les listeners sur tous les boutons Modifier et Supprimer
// Doit être appelée après chaque regénération de la liste (innerHTML)
// car les anciens boutons sont détruits et recréés à chaque fois
function addEvents(users) {

    // ── Boutons Modifier ──────────────────────────────────
    document.querySelectorAll(".editBtn").forEach(btn => {

        btn.addEventListener("click", async () => {

            // Retrouve l'objet utilisateur correspondant au bouton cliqué
            // grâce au data-id stocké sur le bouton
            const user = users.find(u => u._id === btn.dataset.id);

            // Ouvre des prompts pré-remplis avec les valeurs actuelles
            // Si l'utilisateur annule (null), on interrompt l'opération
            const name = prompt("Nom :", user.name);
            if (name === null) return;

            const firstName = prompt("Prénom :", user.firstName);
            if (firstName === null) return;

            const age = prompt("Âge :", user.age);
            if (age === null) return;

            const email = prompt("Email :", user.email);
            if (email === null) return;

            try {
                // Envoie les nouvelles valeurs via PUT /users/:id
                const response = await fetch(`${API_USERS}/${user._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name,
                        firstName,
                        age: Number(age), // Conversion en nombre car prompt retourne une string
                        email
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message); // Affiche l'erreur retournée par le backend
                    return;
                }

                getUsers(); // Rafraîchit la liste après la modification

            } catch (error) {
                alert(error.message);
            }
        });
    });

    // ── Boutons Supprimer ─────────────────────────────────
    document.querySelectorAll(".deleteBtn").forEach(btn => {

        btn.addEventListener("click", async () => {

            // Demande confirmation avant suppression définitive
            const confirmDelete = confirm("Supprimer cet utilisateur ?");
            if (!confirmDelete) return;

            // Envoie la requête DELETE /users/:id
            await fetch(`${API_USERS}/${btn.dataset.id}`, {
                method: "DELETE"
            });

            getUsers(); // Rafraîchit la liste après la suppression
        });
    });
}

// ── Création d'un utilisateur ─────────────────────────────

userForm.addEventListener("submit", async (e) => {

    e.preventDefault();            // Empêche le rechargement de la page
    formMessage.textContent = "";  // Efface le message précédent

    // Récupère les valeurs du formulaire
    const user = {
        name:      document.getElementById("name").value,
        firstName: document.getElementById("firstName").value,
        age:       Number(document.getElementById("age").value), // Conversion string → nombre
        email:     document.getElementById("email").value,
        password:  document.getElementById("password").value
    };

    try {
        // Envoie le nouvel utilisateur via POST /users/register
        const response = await fetch(`${API_USERS}/register`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(user)
        });

        const data = await response.json();

        if (!response.ok) {
            // Le backend a retourné une erreur (email déjà utilisé, champs invalides...)
            formMessage.style.color = "red";
            formMessage.textContent = data.message;
            return;
        }

        // Succès : message vert, reset du formulaire, rafraîchissement de la liste
        formMessage.style.color = "green";
        formMessage.textContent = "Utilisateur créé avec succès";
        userForm.reset();
        getUsers();

    } catch (error) {
        // Erreur réseau : serveur inaccessible
        formMessage.style.color = "red";
        formMessage.textContent = error.message;
    }
});

// ── Init ──────────────────────────────────────────────────
// Charge et affiche la liste des utilisateurs au chargement de la page
getUsers();