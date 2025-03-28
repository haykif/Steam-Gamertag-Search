const express = require('express');
const cors = require('cors');
const axios = require('axios');
const favicon = require('serve-favicon');
const path = require('path');
const RateLimit = require('express-rate-limit');

const app = express();

// set up rate limiter: maximum of 150 requests per 10 minutes
const limiter = RateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 150, // max 150 requetes par windowMs
});

// favicon de fou
app.use(favicon(path.join(__dirname, 'favicon.ico')));

// apply rate limiter to all requests
app.use(limiter);

// Middleware CORS pour autoriser le front-end à parler au back-end
app.use(cors());

// Servir les fichiers CSS et JS directement
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/ico', express.static(path.join(__dirname, 'ico')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Route par défaut pour servir `index.html` depuis la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour le about
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/about.html'));
});

// Route pour le features
app.get('/features', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/features.html'));
});

// Route pour résoudre un gamertag (ResolveVanityURL)
app.get('/resolveVanityURL', async (req, res) => {
    console.log('Requête reçue pour resolveVanityURL avec params :', req.query);
    const { vanityurl } = req.query;
    const API_KEY = process.env.STEAM_API_KEY;

    try {
        const response = await axios.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/`, {
            params: {
                key: API_KEY,
                vanityurl: vanityurl,
            },
        });
        console.log('Données reçues de ResolveVanityURL :', response.data); // LOG
        res.json(response.data);
    } catch (error) {
        console.error('Erreur dans ResolveVanityURL :', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer les infos du joueur (GetPlayerSummaries)
app.get('/getPlayerSummaries', async (req, res) => {
    console.log('Requête reçue pour getPlayerSummeries avec params :', req.query);
    const { steamid } = req.query;
    const API_KEY = process.env.STEAM_API_KEY;

    if (!steamid) {
        return res.status(400).json({ error: 'Le paramètre "steamid" est requis.' });
    }

    try {
        const response = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`, {
            params: {
                key: API_KEY,
                steamids: steamid,
            },
        });
        const player = response.data.response.players[0];

        // Vérifie si le profil est privé
        if (player.communityvisibilitystate !== 3) {
            return res.status(403).json({ error: 'Ce profil est privé ou non accessible.' });
        }

        res.json(response.data); // Renvoie les données pour un profil public
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer les jeux possédés par le joueur (GetOwnedGames)
app.get('/getOwnedGames', async (req, res) => {
    console.log('Requête reçue pour getOwnedGames avec params :', req.query);
    const { steamid } = req.query;
    const API_KEY = process.env.STEAM_API_KEY;

    if (!steamid) {
        return res.status(400).json({ error: 'Le paramètre "steamid" est requis.' });
    }

    try {
        const response = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`, {
            params: {
                key: API_KEY,
                steamid: steamid,
                format: 'json',
                include_appinfo: true, // Inclut les infos des jeux (nom, images, etc.)
                include_played_free_games: true, // Inclut les jeux gratuits joués
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Erreur dans GetOwnedGames :', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getRecentlyPlayedGames', async (req, res) => {
    const { steamid } = req.query;
    const API_KEY = process.env.STEAM_API_KEY; // Ta clé Steam stockée en variable d'env

    try {
        const response = await fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${API_KEY}&steamid=${steamid}&format=json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux récemment joués.' });
    }
});

// Route pour le features
app.get('/.well-known/discord', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth/discord.txt'));
});
module.exports = app;

// Route pour robots.txt
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});