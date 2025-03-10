# Steam Gamertag Finder

Steam Gamertag Finder est une application web permettant de rechercher des informations sur les utilisateurs Steam \
à partir de leur gamertag ou SteamID64. Pour accéder au site, cliquez [**ici**](https://steam-gamertag-finder.vercel.app/).

## Fonctionnalités

- **Résolution des vanity URLs** vers des SteamID64.
- **Affichage des informations publiques des utilisateurs Steam** :
  - Nom d'utilisateur.
  - URL du profil Steam.
  - Dernière connexion.
  - Avatar de l'utilisateur.
- **Affichage des jeux possédés par un utilisateur** :
  - Temps de jeu total.
  - Classement des jeux par temps de jeu.
  - Lien vers la page du jeu sur le magasin Steam.

## Installation et utilisation

### Pré-requis

- **Node.js** (version 16 ou supérieure)
- Une clé API Steam (https://steamcommunity.com/dev/apikey)

### Étapes d'installation

1. Clonez le repository :

    ```bash
    git clone https://github.com/haykif/steam-gamertag-finder.git
    cd steam-gamertag-finder
    ```

2. Installez les dépendances :

    ```css
    npm install
    ```

3. Configurez votre clé API Steam dans un fichier `.env` à la racine du projet :

    ```env
    STEAM_API_KEY=VOTRE_CLE_API_STEAM
    ```

4. Lancez l'application en local :

    ```css
    npm start
    ```

5. Déployez sur **Vercel** pour un accès en ligne.

## Déploiement sur Vercel

1. Connectez votre repository GitHub à Vercel.
2. Ajoutez la variable d'environnement **STEAM_API_KEY** dans les paramètres de votre projet sur Vercel.
3. Déployez votre projet et utilisez l'URL générée par Vercel pour accéder à l'application.

## Mentions légales

Ce projet utilise des données de l'API Steam (https://steamcommunity.com/dev). Tous les droits relatifs aux données et au logo Steam appartiennent à **Valve Corporation**.

- **Logo Steam** : Utilisé uniquement comme favicon, conformément aux [conditions d'utilisation de Steam](https://store.steampowered.com/legal/). Le logo est employé pour renforcer l'identité visuelle de l'application et permettre aux utilisateurs de reconnaître instantanément son lien avec Steam.
- Ce projet est à but éducatif et non commercial. Il n'est ni affilié ni approuvé par Valve Corporation.

## Contributeurs

- [Haykif](https://github.com/haykif)

## Licence

The MIT License (MIT)

Copyright (c) 2025 Hamza Akif Aydogdu

Consultez le fichier [LICENSE](./LICENSE.md) pour plus d'informations.
