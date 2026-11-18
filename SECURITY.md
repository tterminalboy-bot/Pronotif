# Sécurité Pronotif

## Engagement du prototype

Cette version ne collecte, ne demande et ne transmet aucun identifiant Pronote. Elle n’a pas de backend. Les règles et préférences sont enregistrées dans le stockage du navigateur; ce stockage n’est pas adapté aux mots de passe, jetons ou autres secrets. Ne pas y saisir de secret.

## Règle pour toute future connexion Pronote

- Ne jamais envoyer un mot de passe Pronote à un serveur Pronotif, même chiffré.
- Ne jamais inclure d’identifiant, mot de passe, cookie de session ou jeton dans le dépôt, les journaux, les rapports d’erreur ou l’analytique.
- Ne pas annoncer une connexion comme fonctionnelle avant d’avoir vérifié le flux, les données échangées et les journaux réseau.
- Privilégier une méthode officielle sans mot de passe. Si aucune n’existe, étudier un connecteur local exécuté sur l’appareil; le secret ne devra alors servir qu’à authentifier la connexion directe au service Pronote et ne devra pas être synchronisé entre appareils.
- L’accès multi-appareils ne doit jamais supposer que les identifiants peuvent être copiés vers le serveur. Chaque appareil doit être autorisé séparément ou utiliser un mécanisme officiel limité et révocable.
- Une application web distante ne peut pas garantir qu’un secret reste privé si son code livré est modifiable ou compromis. Toute solution exigeant un secret doit donc établir une frontière de confiance vérifiable avant sa mise en service.

## État des protections

- Backend et comptes Pronotif : absents.
- Authentification Pronote : absente.
- Stockage des secrets : absent.
- Connecteurs et envois externes : absents.
- Stockage local : règles et thème seulement; données modifiables par l’utilisateur et non chiffrées.

Les éléments absents ne doivent pas être présentés comme des fonctions sécurisées ou opérationnelles.
