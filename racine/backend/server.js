const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Import de la fonction de connexion à MongoDB
require("dotenv").config();
require("./config/db"); // Charge la configuration de la base de données (MongoDB)
const recetteRoute = require("./routes/recetteRoute"); // Importe les routes de recettes

const app = express();
const PORT = process.env.PORT || 3000;

connectDB(); // Établit la connexion à MongoDB avant de démarrer le serveur

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/recettes', recetteRoute); // Monte les routes de recettes sur « /recettes »

// Route de test
app.get("/", (req, res) => {
    res.json({
        message: "API Recettes opérationnelle "
    });
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});