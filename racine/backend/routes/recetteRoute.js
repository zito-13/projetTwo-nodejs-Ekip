const express  = require('express');
const router   = express.Router();
const Recette  = require('../models/recetteModel');
const User     = require('../models/User'); // Nécessaire pour valider l'auteur

// ── GET / — Toutes les recettes (avec infos auteur) ──────
router.get('/', async (req, res) => {
    try {
        // .populate('auteur') remplace l'ObjectId par les données de l'utilisateur
        // on exclut le mot de passe avec le sélecteur '-password'
        const recettesfind = await Recette.find().populate('auteur', '-password');
        res.json({ recettes: recettesfind });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST / — Créer une recette liée à un utilisateur ─────
router.post('/', async (req, res) => {
    try {
        const { auteur } = req.body;

        // Vérifie que l'utilisateur existe avant de créer la recette
        const userExiste = await User.findById(auteur);
        if (!userExiste) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        const newRecette   = new Recette(req.body);
        const savedRecette = await newRecette.save();

        // Retourne la recette avec les infos de l'auteur (sans mot de passe)
        const populated = await savedRecette.populate('auteur', '-password');
        res.status(201).json({ message: 'Recette créée', recette: populated });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ── GET /:id — Une recette par ID (avec auteur) ──────────
router.get('/:id', async (req, res) => {
    try {
        const recette = await Recette.findById(req.params.id).populate('auteur', '-password');
        if (!recette) {
            return res.status(404).json({ error: 'Recette non trouvée' });
        }
        res.json({ recette });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:id ──────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const recette = await Recette.findByIdAndDelete(req.params.id);
        if (!recette) {
            return res.status(404).json({ message: 'Recette non trouvée' });
        }
        res.status(200).json({ message: 'Recette supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// ── PUT /:id ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const updatedRecette = await Recette.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('auteur', '-password');

        if (!updatedRecette) {
            return res.status(404).json({ message: 'Recette non trouvée' });
        }
        res.json({ recette: updatedRecette });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

module.exports = router;