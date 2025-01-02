const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
// const PORT = 3000; // Le serveur tournera sur le port 3000

// Middleware CORS pour autoriser le front-end à parler au back-end
app.use(cors());

// Servir les fichiers CSS et JS directement
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Route par défaut pour servir `index.html` depuis la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Route pour résoudre un gamertag (ResolveVanityURL)
app.get('/resolveVanityURL', async (req, res) => {
    console.log('Requête reçue pour resolveVanityURL avec params :', req.query);
    const { vanityurl } = req.query;
    //const API_KEY = '5DA1986A3042A92A5D66781E4A853A48';
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
    // const API_KEY = '5DA1986A3042A92A5D66781E4A853A48';
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
    // const API_KEY = '5DA1986A3042A92A5D66781E4A853A48';
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


/* Lancement du serveur sur le port défini
app.listen(PORT, () => {
    console.log(`Serveur actif sur http://localhost:${PORT}`);
});
*/

module.exports = app;