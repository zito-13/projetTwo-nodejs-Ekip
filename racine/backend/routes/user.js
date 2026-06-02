const express = require("express");
const router  = express.Router();
const User    = require("../models/User");

// GET / — tous les utilisateurs
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /register — créer un compte
router.post("/register", async (req, res) => {
    try {
        const { name, firstName, age, email, password } = req.body;

        if (!name || !firstName || !age || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const dejaPris = await User.findOne({ email });
        if (dejaPris) {
            return res.status(409).json({ message: "Cet email est déjà utilisé." });
        }

        const user = await User.create({ name, firstName, age, email, password });

        res.status(201).json({
            user: { _id: user._id, firstName: user.firstName, name: user.name, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /login — connexion
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        res.status(200).json({
            user: { _id: user._id, firstName: user.firstName, name: user.name, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /:id — modifier un utilisateur
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /:id — supprimer un utilisateur
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json({ message: "Utilisateur supprimé" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;