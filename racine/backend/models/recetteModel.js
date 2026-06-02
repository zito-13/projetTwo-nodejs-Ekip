const mongoose = require('mongoose');

const recetteSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    ingredients: {
        type: String,
        required: true
    },

    instructions: {
        type: String,
        required: true
    },

    time: {
        type: Number,
        required: true
    },

    timecook: {
        type: Number,
        required: true
    },

    difficulty: {
        type: String,
        required: true
    },

    categories: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: null
    },

    auteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Recette = mongoose.model('Recette', recetteSchema);

module.exports = Recette;