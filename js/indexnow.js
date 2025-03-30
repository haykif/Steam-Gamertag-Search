window.addEventListener('load', () => {
    const currentUrl = window.location.href;
  
    // Ne rien envoyer en local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[IndexNow] Skipped on localhost');
        return;
    }
  
    fetch('/submitIndexNow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            urlList: [currentUrl]
        })
    })
    .then(res => res.json())
    .then(data => console.log('[IndexNow] Ping réussi:', data))
    .catch(err => console.error('[IndexNow] Erreur:', err));
});