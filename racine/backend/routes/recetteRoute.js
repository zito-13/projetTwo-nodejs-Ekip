// recettesRouter.js
// ── Imports ───────────────────────────────────────────────
const express = require('express');        // Charge le framework Express
const router  = express.Router();         // Crée un routeur Express isolé
const recettes = require('../models/recetteModel'); // Importe le modèle Mongoose

// ── GET / — Récupère toutes les recettes ─────────────────
router.get('/', async (req, res) => {   // Route GET sur « / »
  try {
    const recettesfind = await recettes.find(); // Cherche tous les documents
    res.json({ recettes: recettesfind });       // Renvoie le tableau en JSON
  } catch (err) {
    res.status(500).json({ error: err.message }); // Erreur serveur
  }
});

// ── POST / — Crée une nouvelle recette ───────────────────
router.post('/', async (req, res) => {  // Route POST sur « / »
  try {
    const newRecette = new recettes(req.body); // Instancie un nouveau doc depuis le body
    const savedRecette = await newRecette.save(); // Sauvegarde en base
    res.status(201).json({ message: 'Recette créée', recette: savedRecette }); // 201 = créé
  } catch (err) {
    res.status(400).json({ error: err.message }); // 400 = données invalides
  }
});

// ── GET /:id — Récupère une recette par son ID ───────────
router.get('/:id', async (req, res) => { // Route GET avec paramètre « :id »
  try {
    const recette = await recettes.findById(req.params.id); // Cherche par _id MongoDB
    if (!recette) {
      return res.status(404).json({ error: 'Recette non trouvée' }); // ID inconnu → 404
    }
    res.json({ recette }); // Renvoie la recette trouvée
  } catch (err) {
    res.status(500).json({ error: err.message }); // Erreur serveur (ex. ID malformé)
  }
});

// ── DELETE /:id — Supprime une recette par son ID ────────
router.delete('/:id', async (req, res) => { // Route DELETE avec paramètre « :id »
  try {
    const recette = await recettes.findByIdAndDelete(req.params.id); // Trouve ET supprime
    if (!recette) {
      return res.status(404).json({ message: 'Recette non trouvée' }); // Rien supprimé → 404
    }
    res.status(200).json({ message: 'Recette supprimée avec succès' }); // Succès
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message }); // Erreur serveur
  }
});

// ── PUT /:id — Met à jour une recette par son ID ─────────
router.put('/:id', async (req, res) => { // Route PUT avec paramètre « :id »
  try {
    const updatedRecette = await recettes.findByIdAndUpdate(
      req.params.id,   // ID de la recette à modifier
      req.body,         // Nouvelles données issues du body
      { new: true, runValidators: true } // new:true → retourne le doc mis à jour ; runValidators → applique les règles du schéma
    );
    if (!updatedRecette) {
      return res.status(404).json({ message: 'Recette non trouvée' }); // ID inconnu → 404
    }
    res.json({ recette: updatedRecette }); // Renvoie la recette modifiée
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message }); // Erreur serveur
  }
});

// ── Export ────────────────────────────────────────────────
module.exports = router; // Exporte le routeur pour l'utiliser dans app.js
