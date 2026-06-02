const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        match: [/^[A-Za-zÀ-ÿ -]{2,50}$/, "Nom invalide"]
    },

    firstName: {
        type: String,
        required: true,
        trim: true,
        match: [/^[A-Za-zÀ-ÿ -]{2,50}$/, "Prénom invalide"]
    },

    age: {
        type: Number,
        required: true,
        min: [0, "Age minimum 0"],
        max: [120, "Age maximum 120"]
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Email invalide"]
    },

    password: {
        type: String,
        required: true,
        minlength: [8, "8 caractères minimum"],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
            "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre"
        ]
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);