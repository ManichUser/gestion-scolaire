# Projet — Gestion scolaire (collèges/lycées privés, Cameroun)

## Contexte
Application de gestion scolaire pour collèges et lycées privés camerounais (6e à Terminale), développée en monorepo pour être industrialisée ensuite comme produit multi-établissements. Voir `cahier-des-charges.md` à la racine pour l'analyse complète (profils, modèle de données, diagrammes de séquence, exigences non fonctionnelles).

## Structure du dépôt (monorepo)
```
apps/
├── backend/   # NestJS — Clean Architecture
├── web/       # Next.js — administration + enseignant
└── mobile/    # React Native/Expo — parent (offline-first)
packages/
└── shared-types/   # DTOs et types partagés entre apps
cahier-des-charges.md
```

## Stack technique
- Backend : NestJS + PostgreSQL (hébergé sur **Neon**, serverless)
- Web : Next.js (App Router)
- Mobile : React Native/Expo
- Cache/files d'attente : Redis (via Docker en local)

## Skills à utiliser
- `scalable-nestjs-nextjs` — pour tout code backend NestJS et frontend Next.js
- `scalable-react-native-expo` — pour tout code mobile
- Un troisième skill build/test est aussi disponible dans `.claude/skills/`

Ces skills se déclenchent normalement dès que la stack correspondante est mentionnée ; en cas de doute, les consulter explicitement avant d'écrire du code.

## Règles non négociables du projet
- **Pas de paiement en ligne** : l'application ne fait que suivre un statut de paiement (attendu/versé/solde), jamais de transaction bancaire réelle.
- **Base de données Neon** : connexion via `DATABASE_URL` en variable d'environnement, jamais en dur. SSL activé, pooling adapté au serverless (connection pooler Neon). Prévoir la reconnexion propre après mise en veille de l'instance.
- **Multi-tenant dès le modèle de données** : champ `tenantId` sur les entités métier, même si un seul établissement existe au lancement.
- **Offline-first côté parent uniquement** : lecture seule avec cache local (SQLite) et indicateur de fraîcheur. Pas de saisie offline côté enseignant dans cette version.
- **Clean Architecture stricte côté backend** : le domaine ne doit jamais importer NestJS ni un ORM.
- **Toute écriture multi-tables est transactionnelle.**

## Environnement de développement
- Backend dockerisé (`Dockerfile` + `docker-compose.yml` pour backend + Redis en local). Pas de PostgreSQL dockerisé, la base vit sur Neon.
- Next.js et Expo tournent nativement en dev, pas de Docker pour eux.
- Variables d'environnement documentées dans `.env.example` à chaque app, jamais de secret en dur dans le code.

## Ordre de développement (phases du cahier des charges)
1. Fondations : auth, rôles, établissement, année scolaire, classe, inscription
2. Cœur enseignant : notes, absences, cahier de texte/devoirs
3. Cœur administration : paiements, emploi du temps, signalements → convocations/sanctions
4. Calcul et restitution : moyennes (calcul paresseux), classements, bulletins, statistiques
5. Espace parent complet + notifications

Ne pas commencer une phase avant que la précédente soit validée par l'utilisateur.

## Vérification obligatoire après chaque tâche
Après toute modification du backend (nouvelle entité, module, endpoint), **démarrer réellement le serveur et vérifier qu'il tourne sans erreur** avant de déclarer la tâche terminée — ne jamais se contenter de dire que le code "devrait fonctionner". Concrètement :
- Lancer le serveur (`npm run start:dev` ou via Docker) et confirmer qu'il boot sans erreur de compilation ni d'injection de dépendances.
- Si un endpoint a été ajouté ou modifié, l'appeler réellement (ex. `curl`) et montrer la réponse, pas seulement le code.
- Si une migration a été générée, l'exécuter contre la base Neon et confirmer qu'elle passe.
- En cas d'erreur au démarrage ou à l'appel, la corriger avant de rendre la main, ne pas la signaler comme "à corriger plus tard".
Ne jamais attendre la fin d'une longue série de tâches pour faire cette vérification : elle se fait à la fin de CHAQUE tâche.

## Conventions
- Français pour les noms de domaine métier côté commentaires/documentation si ça aide la lisibilité, anglais pour le code (variables, fonctions) — rester cohérent avec ce qui existe déjà dans le dépôt une fois posé.
- Toujours s'arrêter et présenter la structure/les entités créées avant d'enchaîner sur la couche suivante, sauf instruction contraire explicite.