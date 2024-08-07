# Blablaland c'est quoi ?
Blablaland est un jeu de plateforme sur navigateur créé et édité par l'ex société Niveau99.

[En savoir plus (vidéo)](https://www.youtube.com/watch?v=iqWJbPHAvNQ)
# Le Projet
Ce projet est un fork du site de Blablaland.eu corrigé et mis à la disposition de tous gratuitement et en open source.
Le but étant que tout le monde puisse créer son propre blablaland rapidement et facilement.

N'hésitez pas à contribuer au projet si vous rencontrez des bugs
- Faites remonter les bugs en créant de issues sur ce repos
- Participer au projet en créant vos propre pull request

# Installation
## AVANT TOUTE CHOSE ⚠️
**Lisez le README.MD du dépot [blablaland-site](https://github.com/SeahDokki/blablaland-site/tree/main), le serveur est inutile sans avoir fait au préalable les étapes d'installation du site.**

## Mise en place du projet
Créez un nouveau dossier et ouvrez un terminal à l'interieur
```
git clone https://github.com/SeahDokki/blablaland-serveur.git
```

A la racine du projet, installez les dépendences
```
npm install
```
Toujours à la racine du projet, renommez le fichier `.env.example` ent `.env`
Ouvrez ce fichier et renseignez les informations relative à la base de données

```
DB_HOST=localhost
DB_DATABASE=blablaland
DB_PORT=3306
DB_USER=VOTRE_USERNAME
DB_PASSWORD=VOTRE_MOT_DE_PASSE
```

Ensuite vous pouvez lancer le serveur en mode `dev`
```
npm run dev
```

Le serveur devrait être normalement accessible

