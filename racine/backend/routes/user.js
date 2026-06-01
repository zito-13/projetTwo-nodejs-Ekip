// Import Express
const express = require("express");

// Création du routeur
const router = express.Router();

// Import du modèle User
const User = require("../models/user");

// Route GET : récupérer tous les utilisateurs
router.get("/", async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Créer un utilisateur
router.post("/", async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Modifier un utilisateur par son ID
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // retourne la version modifiée
                runValidators: true // vérifie les règles du modèle
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Supprimer un utilisateur par son ID
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        res.status(200).json({
            message: "Utilisateur supprimé"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Export du routeur
module.exports = router;