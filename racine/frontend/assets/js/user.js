const API_USERS = 'http://localhost:3000/users';

const usersListe = document.getElementById('users-liste');

async function afficherUsers() {
    try {
        const response = await fetch(API_USERS);
        const users = await response.json();

        usersListe.innerHTML = '';

        users.forEach(user => {
            const card = document.createElement('div');

            card.innerHTML = `
                <h3>${user.username}</h3>
                <p><strong>ID :</strong> ${user._id}</p>
                <p><strong>Email :</strong> ${user.email}</p>
            `;

            usersListe.appendChild(card);
        });

    } catch (error) {
        usersListe.innerHTML = 'Erreur lors du chargement des utilisateurs';
        console.error(error);
    }
}

afficherUsers();