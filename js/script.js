document.addEventListener('DOMContentLoaded', () => {
    const gamertagForm = document.getElementById('gamertagForm');
    const gamertagInput = document.getElementById('gamertagInput');
    const resultContainer = document.getElementById('resultContainer');

    // Événement lors de la soumission du formulaire
    gamertagForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Empêche le rechargement de la page par défaut

        const gamertag = gamertagInput.value.trim();
        
        // Vérifie si un gamertag est entré
        if (gamertag) {
            // Crée une carte de résultat fictive
            const resultCard = document.createElement('div');
            resultCard.classList.add('result-card');
            resultCard.innerHTML = `
                <h3>Résultat pour "${gamertag}"</h3>
                <p>Jeux possédés : 42</p>
                <p>Heures de jeu : 350 heures</p>
                <p>Dernière connexion : il y a 2 jours</p>
            `;
            
            // Vide les anciens résultats et ajoute le nouveau
            resultContainer.innerHTML = '';
            resultContainer.appendChild(resultCard);
        } else {
            alert('Veuillez entrer un gamertag valide.');
        }
    });
});
