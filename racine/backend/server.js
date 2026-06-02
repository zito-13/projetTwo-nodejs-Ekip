// ── Imports ───────────────────────────────────────────────

const express    = require("express");                        // Framework HTTP pour créer l'API
const cors       = require("cors");                           // Middleware pour autoriser les requêtes cross-origin (frontend → backend)
const connectDB  = require("./config/db");                    // Fonction de connexion à MongoDB
require("dotenv").config();                                   // Charge les variables d'environnement depuis le fichier .env

const recetteRoute = require("./routes/recetteRoute");        // Routes CRUD des recettes
const userRoutes   = require("./routes/user");                // Routes CRUD + login/register des utilisateurs

// ── Initialisation ────────────────────────────────────────

const app  = express();                                       // Crée l'application Express
const PORT = process.env.PORT || 3000;                        // Port défini dans .env ou 3000 par défaut

connectDB(); // Établit la connexion à MongoDB avant de démarrer le serveur

// ── Middlewares ───────────────────────────────────────────

app.use(cors());           // Autorise toutes les origines (nécessaire pour appeler l'API depuis le frontend)
app.use(express.json());   // Parse automatiquement le body des requêtes en JSON

// ── Routes ────────────────────────────────────────────────

app.use('/recettes', recetteRoute); // Toutes les routes de recetteRoute.js sont préfixées par /recettes
                                    // ex : GET /recettes, POST /recettes, DELETE /recettes/:id

app.use('/users', userRoutes);      // Toutes les routes de user.js sont préfixées par /users
                                    // ex : POST /users/login, POST /users/register, GET /users

// ── Route de test ─────────────────────────────────────────

// Permet de vérifier rapidement que le serveur tourne
// Accessible via GET http://localhost:3000/
app.get("/", (req, res) => {
    res.json({ message: "API Recettes operationnelle" });
});

// ── Lancement du serveur ──────────────────────────────────

// Le serveur écoute sur le port défini et confirme le démarrage dans le terminal
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});