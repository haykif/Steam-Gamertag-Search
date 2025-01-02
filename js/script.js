import { inject } from '@vercel/analytics';

document.addEventListener('DOMContentLoaded', () => {
    const gamertagForm = document.getElementById('gamertagForm');
    const gamertagInput = document.getElementById('gamertagInput');
    const resultContainer = document.getElementById('resultContainer');
    const loader = document.getElementById('loader');

    gamertagForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gamertag = gamertagInput.value.trim();

        if (!gamertag) {
            alert('Veuillez entrer un gamertag ou un SteamID64 valide.');
            return;
        }

        // Afficher le loader et vider les résultats
        loader.style.display = 'block';
        resultContainer.innerHTML = '';

        // Étape 1 : Essayer de résoudre le vanity URL
        fetch(`/resolveVanityURL?vanityurl=${gamertag}`)
            .then(response => response.json())
            .then(data => {
                if (data.response.success === 1) {
                    // Vanity URL résolue avec succès
                    const steamID64 = data.response.steamid;
                    console.log(`SteamID64 trouvé pour le vanity URL "${gamertag}" : ${steamID64}`);
                    return fetch(`/getPlayerSummaries?steamid=${steamID64}`);
                } else {
                    // Si ResolveVanityURL échoue, considérer que c'est un SteamID64
                    console.warn(`Impossible de résoudre "${gamertag}" en vanity URL. Tentative avec SteamID64.`);
                    console.warn(`Tentative réussie avec succès`);
                    return fetch(`/getPlayerSummaries?steamid=${gamertag}`);
                }
            })
            .then(response => {
                // Vérifie si le backend renvoie une erreur HTTP
                if (!response.ok) {
                    throw new Error('Ce profil est privé ou non accessible.');
                }
                return response.json();
            })
            .then(data => {
                const player = data.response.players[0];
                if (player) {
                    // Afficher les infos du joueur
                    resultContainer.innerHTML = `
                        <h3>Profil de ${player.personaname}</h3>
                        <img src="${player.avatarfull}" alt="Avatar de ${player.personaname}">
                        <p>URL du profil : <a href="${player.profileurl}" target="_blank">${player.profileurl}</a></p>
                        <p>Dernière connexion : ${new Date(player.lastlogoff * 1000).toLocaleString()}</p>
                    `;

                    // Charger les jeux du joueur
                    return fetch(`/getOwnedGames?steamid=${player.steamid}`);
                } else {
                    resultContainer.innerHTML = `<p style="color: #ff007f;"><b>Aucun joueur trouvé pour ce SteamID.</b></p>`;
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Impossible de récupérer les jeux.');
                }
                return response.json();
            })
            .then(data => {
                if (data.response && data.response.games) {
                    const games = data.response.games;

                    // Trier les jeux par temps de jeu (décroissant)
                    games.sort((a, b) => b.playtime_forever - a.playtime_forever);

                    // Limiter l'affichage à 10 jeux
                    const topGames = games.slice(0, 10);

                    // Créer une liste des jeux
                    let gamesHTML = `<h3>Top 10 jeux :</h3><ul>`;
                    topGames.forEach(game => {
                        const playtimeHours = (game.playtime_forever / 60).toFixed(1); // Convertir en heures
                        gamesHTML += `
                            <li>
                                <span style="text-align: left">${game.name}</span>
                                <span>Temps de jeu - ${playtimeHours} heures jouées</span>
                                <a href="https://store.steampowered.com/app/${game.appid}" target="_blank">Voir sur Steam</a>
                            </li>`;
                    });
                    gamesHTML += `</ul>`;

                    // Afficher les jeux dans le container
                    resultContainer.innerHTML += gamesHTML;
                } else {
                    resultContainer.innerHTML += `<p style="color: #ff007f;"><b>La personne souhaite ne pas rendre public les jeux qu'elle possède.</b></p>`;
                }
            })
            .catch(err => {
                console.error(err);
                resultContainer.innerHTML = `<p style="color: #ff007f;"><b>Erreur : ${err.message}</b></p>`;
            })
            .finally(() => {
                // Cacher le loader
                loader.style.display = 'none';
            });
    });
});

inject();