document.addEventListener('DOMContentLoaded', () => {
    const gamertagForm = document.getElementById('gamertagForm');
    const gamertagInput = document.getElementById('gamertagInput');
    const resultContainer = document.getElementById('resultContainer');
    const loader = document.getElementById('loader');
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    const footer = document.getElementById('footer');


    let playerData;

    navLinks.forEach(link => {
        // Vérifie si le lien correspond au chemin actuel
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    function updateProfileLinkSize() {
        const profileLink = document.getElementById('profileLink');
        if (profileLink) {
            profileLink.style.fontSize = window.innerWidth <= 768 ? '0.5rem' : '1rem';
        }
    }

    window.addEventListener('resize', updateProfileLinkSize);

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

        // Résolution du vanity URL
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

            // Block profil privée/inaccessible
            .then(response => {
                if (!response.ok) throw new Error('Ce profil est privé ou non accessible.');
                return response.json();
            })

            // Block affichage du profil
            .then(data => {
                const player = data.response.players[0];
                if (player) {
                    playerData = player; // Stocke le joueur pour le réutiliser plus tard
                    resultContainer.innerHTML = `
                        <h3>Profil de ${player.personaname}</h3>
                        <img src="${player.avatarfull}" alt="Avatar de ${player.personaname}">
                        <p>URL du profil : <a id="profileLink" href="${player.profileurl}" target="_blank">${player.profileurl}</a></p>
                        <p>Dernière connexion : ${new Date(player.lastlogoff * 1000).toLocaleString()}</p>
                    `;
                    updateProfileLinkSize();
                    return fetch(`/getOwnedGames?steamid=${player.steamid}`);
                } else {
                    resultContainer.innerHTML = `<p style="color: #ff007f;"><b>Aucun joueur trouvé pour ce SteamID.</b></p>`;
                }
            })

            // Block impossible de récup jeux
            .then(response => {
                if (!response.ok) throw new Error('Impossible de récupérer les jeux.');
                return response.json();
            })

            // Block TOP 10 jeux
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
                                <span>Temps de jeu - ${playtimeHours} heures jouées</span>
                                <a href="https://store.steampowered.com/app/${game.appid}" target="_blank">Voir sur Steam</a>
                            </li>`;
                    });
                    gamesHTML += `</ul>`;

                    resultContainer.innerHTML += gamesHTML;
                } else {
                    resultContainer.innerHTML += `<p style="color: #ff007f;"><b>La personne ne souhaite pas rendre public les jeux qu'elle possède.</b></p>`;
                }
            })

            // Block récup jeux joués récemment
            .then(() => {
                return fetch(`/getRecentlyPlayedGames?steamid=${playerData.steamid}`);
            })

            // Block impossible de récup jeux récents
            .then(response => {
                if (!response.ok) throw new Error('Impossible de récupérer les jeux récents.');
                return response.json();
            })

            // Block affichage jeux récents
            .then(data => {
                if (data.response && data.response.games && data.response.games.length > 0) {
                    let recentGamesHTML = `
                                <h3 style="margin-bottom: 0;">Derniers jeux joués: </h3>
                                <h4 style="margin-top: 0;">(2 dernières semaines)</h4>
                                <ul>`;
                    data.response.games.forEach(game => {
                        const playtimeRecent = (game.playtime_2weeks / 60).toFixed(1);
                        recentGamesHTML += `
                            <li>
                                <span style="text-align: left">${game.name}</span>
                                <span> ${playtimeRecent} heures</span>
                                <a href="https://store.steampowered.com/app/${game.appid}" target="_blank"> Voir sur Steam</a>
                            </li>`;
                    })
                    recentGamesHTML += `</ul>`;
                    resultContainer.innerHTML += recentGamesHTML;
                } else {
                    resultContainer.innerHTML += `<p style="color: #ff007f;"><br><b>Aucun jeu joué récemment. C'est pas un vrai gamer ce type!</b></p>`;
                }
            })

            // Block Erreur
            .catch(err => {
                console.error('[Erreur]', err);
                resultContainer.innerHTML = `
                    <p style="color: #ff007f;">
                        <b>Une erreur est survenue :</b> ${err.message}.<br>
                        Veuillez vérifier votre connexion ou réessayer plus tard.
                    </p>`;
            })
            
            .finally(() => {
                loader.style.display = 'none';
                footer.style.display = 'block';
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
    document.body.classList.add('fade-in');
});
