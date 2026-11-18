# Pronotif

Prototype d’application responsive pour organiser et automatiser les événements d’un emploi du temps scolaire.

## Démarrer

Prérequis : Node.js 20 ou ultérieur.

```sh
npm install
npm run dev
```

## État actuel

- Interface responsive avec navigation mobile et bureau, accueil, planning, automatisations et réglages : fonctionnelle côté navigateur.
- Thèmes clair et sombre : fonctionnels et mémorisés localement.
- Créateur guidé d’automatisations : première version côté interface; règles conservées dans le stockage local du navigateur.
- Connexion Pronote : pas encore développée. Aucune saisie de mot de passe Pronote n’est proposée et aucun identifiant ne quitte l’appareil.
- Import ICS : sélection locale disponible; lecture et synchronisation non implémentées.
- Moteur de règles, délais côté serveur, authentification, historique partagé et connecteurs : à développer.

## Structure du code

- `src/app/` : assemblage de l’application et navigation.
- `src/pages/` : accueil, planning, automatisations, réglages et constructeur.
- `src/domain/` : modèle et validation des règles.
- `src/storage/` : persistance locale des règles, avec filtrage des champs acceptés.
- `src/hooks/` : état React des automatisations.
- `tests/` : tests unitaires du modèle et du stockage.

Les règles locales sont des données de prototype. Les valeurs stockées sont revalidées et seules les propriétés prévues par le modèle sont conservées. Cela ne constitue pas un coffre-fort et ne doit pas servir à stocker des secrets.

## Sécurité et limites

Ce projet est un prototype front-end local. Il ne comporte aucun backend, ne collecte pas d’identifiants et ne prétend pas être connecté à Pronote. Les données locales du navigateur ne sont pas un coffre-fort sécurisé : ne pas y enregistrer de secrets. La future connexion Pronote doit utiliser un flux où le navigateur communique directement avec un connecteur local ou une méthode officielle qui ne transmet jamais les identifiants à un serveur Pronotif.

## Sécurité

Voir [SECURITY.md](SECURITY.md) pour les limites vérifiées du prototype et les règles de sécurité imposées aux futures connexions Pronote.
