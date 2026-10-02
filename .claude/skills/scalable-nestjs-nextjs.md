---
name: scalable-nestjs-nextjs
description: Compétences d'un développeur senior (10+ ans) pour concevoir et construire des applications scalables avec NestJS en back-end et Next.js en front-end, en Clean Architecture. À utiliser systématiquement dès qu'un projet mentionne NestJS, Next.js, une API REST à construire from scratch, un back-end modulaire, ou une architecture scalable en TypeScript — même si l'utilisateur ne cite pas explicitement "Clean Architecture" ou "architecture logicielle". Couvre : structure de projet, couches domaine/cas d'usage/adaptateurs/infrastructure, authentification par rôles, validation, gestion d'erreurs, base de données et migrations, tests, scalabilité (cache, files d'attente, multi-tenant), conventions de code. Ne pas utiliser pour des scripts jetables, des prototypes jetables sans suite, ou des stacks autres que NestJS/Next.js (ex. React Native → utiliser le skill dédié mobile).
---

# Développeur senior NestJS + Next.js — projets scalables

Ce skill encode la façon de construire un projet de A à Z, comme le ferait un architecte logiciel senior habitué aux produits qui doivent grossir (plusieurs clients, plusieurs tenants, forte charge en période de pointe). Il s'applique dès la première ligne de code, pas seulement en fin de projet.

## Principe directeur

Toujours partir du métier, jamais du framework. NestJS et Next.js sont des détails d'infrastructure : le code métier (règles, calculs, décisions) ne doit jamais dépendre d'eux. Si on devait remplacer PostgreSQL par autre chose, ou Next.js par un autre front, le cœur métier ne doit pas bouger.

## 1. Structure de projet (Clean Architecture)

Pour le back-end NestJS, organiser **par couche puis par domaine métier**, pas par type technique (pas de dossier `controllers/`, `services/` global) :

```
src/
├── <domaine>/                    # ex: inscriptions, paiements, notes
│   ├── domain/                   # entités, value objects, règles métier pures
│   │   └── *.entity.ts           # AUCUN import NestJS/TypeORM ici
│   ├── application/              # cas d'usage (use cases), ports (interfaces)
│   │   ├── use-cases/
│   │   └── ports/                # interfaces vers persistance, notifs, etc.
│   ├── infrastructure/           # implémentation des ports
│   │   ├── persistence/          # repositories TypeORM/Prisma
│   │   └── adapters/
│   └── presentation/             # contrôleurs NestJS, DTOs, mappers
│       ├── *.controller.ts
│       └── dto/
├── shared/                       # kernel partagé : exceptions, types communs
└── main.ts
```

Règle de dépendance stricte : `presentation → application → domain`, et `infrastructure → application (via ports) → domain`. Le domaine ne dépend de rien. Si un fichier dans `domain/` importe `@nestjs/*` ou un ORM, c'est une fuite d'architecture à corriger.

Pour Next.js (App Router), organiser par feature plutôt que par type de fichier :
```
app/
├── (dashboard)/<feature>/page.tsx
src/
├── features/<feature>/
│   ├── components/
│   ├── hooks/
│   └── api/                      # appels au back-end NestJS, typés
├── shared/ui/                    # composants réutilisables
└── lib/                          # client API, utils
```

## 2. Authentification et autorisation

- JWT avec refresh token, jamais de session stockée en mémoire du process seul (prévoir Redis dès le départ si plusieurs instances).
- Guard NestJS par rôle (`RolesGuard` + décorateur `@Roles(...)`), vérifié à CHAQUE endpoint sensible — jamais seulement côté front.
- Autorisation au niveau ressource, pas seulement au niveau rôle : un enseignant avec le rôle "enseignant" ne doit accéder qu'aux ressources qui lui sont assignées. Vérifier l'appartenance dans le cas d'usage, pas dans le contrôleur.
- Si multi-tenant (plusieurs clients/établissements/organisations) : l'identifiant du tenant doit être injecté depuis le token, jamais depuis un paramètre de requête modifiable par le client.

## 3. Validation et gestion d'erreurs

- DTOs avec `class-validator` sur chaque endpoint d'entrée, jamais de confiance dans le payload brut.
- Exceptions métier typées dans le domaine (ex. `SoldeInsuffisantError`), traduites en codes HTTP appropriés par un `ExceptionFilter` global — le domaine ne connaît pas HTTP.
- Toute opération multi-écriture passe par une transaction explicite (`QueryRunner` TypeORM ou équivalent Prisma) : tout ou rien, jamais d'état partiel en cas d'échec.
- Logger structuré (pas de `console.log`) avec correlation ID par requête pour tracer un problème en prod.

## 4. Base de données

- Migrations versionnées dès le premier commit, jamais de `synchronize: true` en dehors du dev local.
- Un repository par agrégat, implémentant un port défini dans `application/ports`.
- Index sur toute colonne utilisée en filtre ou jointure fréquente ; penser pagination dès la première liste (jamais de `SELECT *` sans limite sur une table qui va grossir).
- Soft delete plutôt que suppression physique sur les données qu'on peut vouloir auditer plus tard.

## 5. Scalabilité

- Cache applicatif (Redis) pour tout calcul coûteux et peu volatile — invalider explicitement plutôt que mettre un TTL court par facilité.
- File d'attente (BullMQ ou équivalent) pour toute tâche non bloquante côté utilisateur : envoi de notification, génération de document, recalcul en masse.
- Concevoir multi-tenant dès le modèle de données même si un seul client existe au lancement (clé `tenantId` sur chaque table métier) — c'est bien plus coûteux à ajouter après coup qu'à poser dès le départ.
- Séparer les endpoints de lecture intensive (rapports, tableaux de bord) des endpoints transactionnels si la charge le justifie.

## 6. Next.js — conventions

- Server Components par défaut, `"use client"` seulement là où l'interactivité l'exige.
- Les appels au back-end NestJS passent par une couche `api/` typée (types partagés ou générés depuis un schéma OpenAPI), jamais de `fetch` ad hoc dispersé dans les composants.
- Formulaires : validation côté client ET re-validation côté serveur NestJS — ne jamais faire confiance au client.
- Gestion d'état serveur avec une lib de data fetching (ex. TanStack Query) plutôt que du state global pour des données qui viennent de l'API.

## 7. Tests

- Tests unitaires sur le domaine et les cas d'usage (rapides, aucune dépendance I/O).
- Tests d'intégration sur les repositories (base de test réelle, via Docker si possible).
- Tests e2e sur les parcours critiques seulement (pas besoin de tout couvrir en e2e).

## 8. Checklist avant de livrer une fonctionnalité

- [ ] Le domaine ne dépend d'aucun framework
- [ ] Chaque endpoint a sa validation DTO et son guard de rôle
- [ ] Les écritures multi-tables sont transactionnelles
- [ ] Les erreurs métier ont un type explicite, pas une exception générique
- [ ] Les listes paginées, les champs filtrés indexés
- [ ] Aucun secret ou clé en dur dans le code

## Comment utiliser ce skill

Quand on démarre un nouveau projet ou une nouvelle fonctionnalité avec cette stack : commencer par poser la structure de dossiers (section 1), définir les entités du domaine sans aucune dépendance technique, puis remonter vers les cas d'usage, puis l'infrastructure et la présentation. Ne jamais commencer par le contrôleur ou la table de base de données.
