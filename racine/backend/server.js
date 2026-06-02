// ── Imports ───────────────────────────────────────────────

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const recetteRoute = require("./routes/recetteRoute");
const userRoutes = require("./routes/user");

// ── Initialisation ────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// ── Middlewares ───────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Sert les fichiers du frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ── Routes API ────────────────────────────────────────────

app.use("/recettes", recetteRoute);
app.use("/users", userRoutes);

// ── Page d'accueil ────────────────────────────────────────

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Lancement du serveur ──────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});