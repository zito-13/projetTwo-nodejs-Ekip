// ── Import ────────────────────────────────────────────────
const mongoose = require('mongoose'); // Charge Mongoose pour interagir avec MongoDB

// ── Définition du schéma ──────────────────────────────────
// Un schéma décrit la structure et les règles de validation d'un document
const recetteSchema = new mongoose.Schema({

    title: {
        type: String,        // Doit être une chaîne de caractères
        required: true      // Champ obligatoire — rejeté si absent
    },

    ingredients: {
        type: String,        // Liste des ingrédients (stockée en texte brut)
        required: true      // Champ obligatoire
    },

    instructions: {
        type: String,        // Étapes de préparation (texte libre)
        required: true      // Champ obligatoire
    },

    time: {
        type: Number,        // Temps de préparation (en minutes, par convention)
        required: true      // Champ obligatoire
    },

    timecook: {
        type: Number,        // Temps de cuisson (en minutes, par convention)
        required: true      // Champ obligatoire
    },

    difficulty: {
        type: String,        // Niveau de difficulté (ex. "Facile", "Moyen", "Difficile")
        required: true      // Champ obligatoire
    },

    categories: {
        type: String,        // Catégorie de la recette (ex. "Dessert", "Entrée")
        required: true      // Champ obligatoire
    },
});

// ── Création du modèle ────────────────────────────────────
// mongoose.model() lie le schéma à la collection "recettes" dans MongoDB
// (Mongoose met automatiquement le nom en minuscules et au pluriel → "recettes")
const Recette = mongoose.model('Recette', recetteSchema);

// ── Export ────────────────────────────────────────────────
module.exports = Recette; // Exporte le modèle pour l'utiliser dans les routes

