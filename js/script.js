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
                    console.log(`SteamID64 trouvé pour "${gamertag}" : ${steamID64}`);
                    return fetch(`/getPlayerSummaries?steamid=${steamID64}`);
                } else {
                    // Si ResolveVanityURL échoue, considérer que c'est un SteamID64
                    console.warn(`Impossible de résoudre "${gamertag}". Tentative avec SteamID64.`);
                    return fetch(`/getPlayerSummaries?steamid=${gamertag}`);
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Ce profil est privé ou non accessible.');
                return response.json();
            })
            .then(data => {
                const player = data.response.players[0];
                if (player) {
                    resultContainer.innerHTML = `
                        <h3>Profil de ${player.personaname}</h3>
                        <img src="${player.avatarfull}" alt="Avatar de ${player.personaname}">
                        <p>URL du profil : <a href="${player.profileurl}" target="_blank">${player.profileurl}</a></p>
                        <p>Dernière connexion : ${new Date(player.lastlogoff * 1000).toLocaleString()}</p>
                    `;
                    return fetch(`/getOwnedGames?steamid=${player.steamid}`);
                } else {
                    resultContainer.innerHTML = `<p style="color: #ff007f;"><b>Aucun joueur trouvé pour ce SteamID.</b></p>`;
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Impossible de récupérer les jeux.');
                return response.json();
            })
            .then(data => {
                if (data.response && data.response.games) {
                    const games = data.response.games;
                    games.sort((a, b) => b.playtime_forever - a.playtime_forever);
                    const topGames = games.slice(0, 10);

                    let gamesHTML = `<h3>Top 10 jeux :</h3><ul>`;
                    topGames.forEach(game => {
                        const playtimeHours = (game.playtime_forever / 60).toFixed(1);
                        gamesHTML += `
                            <li>
                                <span style="text-align: left">${game.name}</span>
                                <span> ${playtimeHours} heures jouées</span>
                                <a href="https://store.steampowered.com/app/${game.appid}" target="_blank">Voir sur Steam</a>
                            </li>`;
                    });
                    gamesHTML += `</ul>`;

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
                loader.style.display = 'none';
            });
    });

    // Effet de transition entre les pages
    const links = document.querySelectorAll("a");

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            // Vérifie qu'on ne sort pas du site et que le lien est interne
            if (href && !href.startsWith("http")) {
                e.preventDefault();
                document.body.style.opacity = 0;

                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });

    // Rétablir l'opacité de la page à l'affichage
    document.body.style.opacity = 1;
});
