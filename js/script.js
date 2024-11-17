document.addEventListener('DOMContentLoaded', () => {
    const gamertagForm = document.getElementById('gamertagForm');
    const gamertagInput = document.getElementById('gamertagInput');

    gamertagForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Empêche le rechargement de la page par défaut

        const gamertag = gamertagInput.value.trim();
        if (gamertag) {
            alert(`Recherche lancée pour le gamertag : ${gamertag}`);
        } else {
            alert('Veuillez entrer un gamertag avant de rechercher.');
        }
    });
});