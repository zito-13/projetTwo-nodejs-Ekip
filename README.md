# ZeBig Cooking

Application web de gestion de recettes de cuisine. Elle permet de créer des comptes utilisateurs, d'ajouter des recettes illustrées automatiquement par une image issue de l'API Pexels, et de les consulter dans une interface responsive.

---

## Technologies utilisées

**Backend**
- Node.js
- Express.js
- MongoDB / Mongoose
- dotenv

**Frontend**
- HTML / CSS / JavaScript vanilla
- API Pexels (recherche d'images automatique)
- Google Fonts (Playfair Display, DM Sans)

---

## Structure du projet

```
projet/
├── backend/
│   ├── config/
│   │   └── db.js                  # Connexion à MongoDB
│   ├── models/
│   │   ├── User.js                # Modèle utilisateur
│   │   └── recetteModel.js        # Modèle recette
│   ├── routes/
│   │   ├── user.js                # Routes utilisateurs (CRUD + login/register)
│   │   └── recetteRoute.js        # Routes recettes (CRUD)
│   ├── server.js                  # Point d'entrée du serveur
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── index.html                 # Page d'accueil — liste des recettes
    ├── ajoutrecette.html          # Page d'ajout de recette
    ├── login.html                 # Page de connexion
    ├── register.html              # Page d'inscription
    ├── gestionUsers.html          # Page de gestion des utilisateurs
    ├── assets/
    │   ├── css/
    │   │   ├── style.css          # Styles globaux
    │   │   ├── ajoutrecette.css   # Styles formulaire recette
    │   │   ├── login.css          # Styles connexion / inscription
    │   │   └── user.css           # Styles gestion utilisateurs
    │   ├── js/
    │   │   ├── main.js            # Logique principale (recettes + modal + nav)
    │   │   ├── login.js           # Logique de connexion
    │   │   ├── register.js        # Logique d'inscription
    │   │   └── user.js            # Logique gestion utilisateurs
    │   └── images/
    │       └── bgcooklight.png    # Image de fond
```

---

## Installation et lancement

### Prérequis

- Node.js v18+
- MongoDB (local ou Atlas)
- Un compte Pexels pour la clé API ([pexels.com/api](https://www.pexels.com/api/))

### 1. Cloner le projet

```bash
git clone https://github.com/ton-username/zebigcooking.git
cd zebigcooking/backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du dossier `backend` :

```env
MONGO_URI=mongodb://localhost:27017/zebigcooking
PORT=3000
```

> Si vous utilisez MongoDB Atlas, remplacez `MONGO_URI` par votre URI de connexion Atlas.

### 4. Lancer le serveur

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`. Le terminal affiche :

```
Serveur démarré sur le port 3000
MongoDB connecté
```

### 5. Lancer le frontend

Ouvrir le dossier `frontend` avec **Live Server** (VS Code) ou tout autre serveur statique.

---

## API — Endpoints

### Recettes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/recettes` | Récupère toutes les recettes (avec auteur) |
| GET | `/recettes/:id` | Récupère une recette par son ID |
| POST | `/recettes` | Crée une nouvelle recette |
| PUT | `/recettes/:id` | Modifie une recette |
| DELETE | `/recettes/:id` | Supprime une recette |

### Utilisateurs

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users` | Récupère tous les utilisateurs |
| POST | `/users/register` | Crée un compte utilisateur |
| POST | `/users/login` | Connexion (retourne les infos utilisateur) |
| PUT | `/users/:id` | Modifie un utilisateur |
| DELETE | `/users/:id` | Supprime un utilisateur |

---

## Modèles de données

### Recette

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| title | String | Oui | Titre de la recette |
| ingredients | String | Oui | Liste des ingrédients |
| instructions | String | Oui | Étapes de préparation |
| time | Number | Oui | Temps de préparation (min) |
| timecook | Number | Oui | Temps de cuisson (min) |
| difficulty | String | Oui | Facile / Moyen / Difficile |
| categories | String | Oui | Catégorie (Dessert, Plat...) |
| image | String | Non | URL de l'image (Pexels) |
| auteur | ObjectId | Oui | Référence vers un utilisateur |

### Utilisateur

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| name | String | Oui | Nom de famille |
| firstName | String | Oui | Prénom |
| age | Number | Oui | Âge (0–120) |
| email | String | Oui | Email unique |
| password | String | Oui | Mot de passe (8 car. min, 1 maj, 1 chiffre) |

---

## Fonctionnalités

- Affichage des recettes en grille de 3 colonnes
- Recherche automatique d'une image via l'API Pexels à la création d'une recette
- Modal de détail pour chaque recette (ingrédients, instructions, image, auteur)
- Inscription et connexion utilisateur
- Navigation conditionnelle : le bouton "Ajouter une recette" est visible uniquement si l'utilisateur est connecté
- Déconnexion avec suppression de la session (localStorage)
- Design responsive (mobile, tablette, desktop)

---

## Clé API Pexels

La clé est définie directement dans `assets/js/main.js` :

```js
const PEXELS_KEY = 'VOTRE_CLE_PEXELS';
```

Pour obtenir une clé gratuite : [pexels.com/api](https://www.pexels.com/api/) — 200 requêtes/heure en accès gratuit.

---

## Auteurs
@zito-13 , @Ryukai555 
Projet réalisé dans le cadre de la formation développeur web et web mobile .
