# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`.

## Méthodologie

- Toute fonctionnalité suit le cycle `/prd` → `/spec` → `/spec-plan` → `/tdd-task` → `/converge`, avec une validation humaine après chaque document ; les règles sont dans `specs/constitution.md`.
- Test d'abord : écrire le test, le voir échouer pour la bonne raison (`pnpm tdd:red <fichier>`), puis le code minimal.
- Ordre des couches pour une fonctionnalité : schéma partagé → entité → cas d'usage → table et migration → repository Drizzle → controller et e2e → fausse API MSW → écran (détail : `README.md`, « Ajouter une fonctionnalité »).
- Une tâche = un commit Conventional Commits ; `pnpm verify` avant de commiter, `pnpm check` avant de conclure. Jamais de `--no-verify`.
- Celui qui code ne valide pas : relecture par le sous-agent `relecteur`.

## Architecture

- `packages/shared` : schémas Zod d'entrée et de réponse, seule source du contrat entre l'API et le front. Le front n'importe jamais `apps/api`, ni l'inverse.
- API : un module par domaine dans `apps/api/src/modules/<domaine>/`, découpé en `domain/`, `application/`, `infra/`, `http/`, sur le modèle de `disciplines`. Le transverse (config, erreurs, base) est dans `src/core/`.
- `domain/` reste en TypeScript pur : ni NestJS ni Drizzle (vérifié par oxlint).
- `application/` définit le port (classe abstraite `DisciplineRepository`) ; `infra/` l'implémente avec Drizzle ; le `<nom>.module.ts` relie les deux.
- `http/` : controller fin, qui valide (DTO zod), appelle un seul cas d'usage et sérialise. Aucune règle métier.
- Front : une page par fichier dans `apps/web/src/routes/`, le code d'une fonctionnalité dans `src/features/<nom>/` (`api/` pour HTTP et hooks TanStack Query, `components/`), shadcn dans `src/components/ui/`.
- `apps/web/src/mocks/` est la fausse API des tests : mêmes schémas et mêmes codes d'erreur que `apps/api`.
- Les migrations sont générées par `pnpm db:generate`, jamais éditées à la main.

## Concepts appréciés

- Typage strict : pas de `any` ; codes d'erreur en union littérale (`as const satisfies Record<string, ErrorKind>`).
- Un cas d'usage = une classe `@Injectable()` avec une seule méthode `execute()`.
- Entités à constructeur privé : `Discipline.create()` applique les règles, `Discipline.restore()` relit la base sans revalider.
- Le domaine ne fait pas confiance à la validation HTTP : il revérifie ses invariants.
- Mapper explicite entre domaine et table : `toDomain()` / `toRow()`.
- Fonctions de fabrique pour les erreurs : `disciplineNameTaken(name)`, `disciplineNotFound(id)`.

## Bonnes pratiques

- Toute erreur métier est une `AppError` (code stable + catégorie `VALIDATION`, `NOT_FOUND`, `CONFLICT`, `BUSINESS_RULE`). Seul `ProblemDetailsFilter` la traduit en HTTP (400, 404, 409, 422, RFC 9457).
- Une entrée est validée par un schéma Zod de `packages/shared` via `createZodDto`, jamais à la main dans le controller.
- Aucun secret dans le code : les valeurs sensibles vont dans `apps/api/.env` (ignoré par git).
- Tests API : unitaires du domaine (`*.spec.ts`), cas d'usage avec le repository en mémoire (`application/testing/`), intégration sur PGlite (`*.int.spec.ts`), e2e supertest (`test/*.e2e.spec.ts`).
- Tests front : à côté du fichier testé, via la fausse API MSW (`fixture`, `mockControl`) ; un audit d'accessibilité `*.a11y.test.tsx` par état d'écran.
- Chaque scénario d'acceptation a son test ; aucun test sans réseau ni Docker requis.

## Nommage

- Fichiers en kebab-case, suffixés par leur rôle : `create-discipline.ts`, `discipline.mapper.ts`, `drizzle-discipline.repository.ts`, `disciplines.schema.ts`, `disciplines.errors.ts`.
- Classes en PascalCase ; cas d'usage nommés par un verbe : `CreateDiscipline`, `ListDisciplines` ; erreurs `<Entité>Error`.
- Codes d'erreur en SCREAMING_SNAKE_CASE préfixés par l'entité : `DISCIPLINE_NAME_TAKEN`.
- Schémas partagés en camelCase suffixés `Schema` : `createDisciplineSchema` ; types `CreateDisciplineInput`, `DisciplineResponse`.
- Titres de tests en anglais, préfixés par le numéro de spec et le scénario : `it('000-AS2: rejects a name that is too long')`.
- Commits Conventional Commits citant la tâche et le scénario : `feat(benevoles): T03 refuse a full slot (001-AS2)`.
- Code et identifiants en anglais ; commentaires et documentation en français.
