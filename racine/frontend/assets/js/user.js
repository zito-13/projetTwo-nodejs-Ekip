const API_USERS = "http://localhost:3000/users";

const usersContainer = document.getElementById("users");
const userForm = document.getElementById("userForm");

async function getUsers() {

    try {

        const response = await fetch(API_USERS);
        const users = await response.json();

        usersContainer.innerHTML = "";

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
        });

        addEvents(users);

    } catch (error) {

        console.error(error);

    }

}

function addEvents(users) {

    document.querySelectorAll(".editBtn").forEach(btn => {

        btn.addEventListener("click", async () => {

            const user = users.find(
                u => u._id === btn.dataset.id
            );

            const name = prompt("Nom :", user.name);

            if (name === null) return;

            const firstName = prompt("Prénom :", user.firstName);

            if (firstName === null) return;

            const age = prompt("Âge :", user.age);

            if (age === null) return;

            const email = prompt("Email :", user.email);

            if (email === null) return;

            await fetch(`${API_USERS}/${user._id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    firstName,
                    age: Number(age),
                    email
                })

            });

            getUsers();

        });

    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {

        btn.addEventListener("click", async () => {

            const confirmDelete = confirm(
                "Supprimer cet utilisateur ?"
            );

            if (!confirmDelete) return;

            await fetch(`${API_USERS}/${btn.dataset.id}`, {
                method: "DELETE"
            });

            getUsers();

        });

    });

}

userForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const user = {

        name: document.getElementById("name").value,
        firstName: document.getElementById("firstName").value,
        age: Number(document.getElementById("age").value),
        email: document.getElementById("email").value,
        password: document.getElementById("password").value

    };

    await fetch(API_USERS, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(user)

    });

    userForm.reset();

    getUsers();

});

getUsers();