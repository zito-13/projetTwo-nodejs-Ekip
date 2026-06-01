const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/user");

const connectDB = require("./config/db");

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);

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