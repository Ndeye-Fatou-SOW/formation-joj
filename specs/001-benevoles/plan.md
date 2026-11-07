# 001 — Bénévoles : ouvrir un créneau et s'y inscrire : plan

**Statut** : Validé

## 1. Résumé

On construit dans l'API un nouveau module `volunteers`, qui permet d'ouvrir un créneau d'accueil pour une discipline existante et d'y inscrire un bénévole. Une fois les tâches terminées, un appelant de l'API peut ouvrir un créneau avec un début, une fin et une capacité, puis y inscrire des bénévoles jusqu'à ce que le créneau soit complet ; l'inscription de trop est refusée avec un statut 409 et le code `SLOT_FULL`, même quand deux inscriptions arrivent en même temps. Le travail tient en six tâches, dans l'ordre des couches : le domaine, deux tâches pour les cas d'usage, la persistance, puis deux tâches pour les routes HTTP. L'écran, la consultation d'un créneau, le refus d'un email en double et la désinscription sont laissés aux tranches suivantes.

Les mots de la spec et leur nom dans le code :

| Dans la spec          | Dans le code         | Ce que c'est                                                            |
| --------------------- | -------------------- | ----------------------------------------------------------------------- |
| bénévoles (le module) | `volunteers`         | Le module de l'API qui regroupe les créneaux et les inscriptions.       |
| créneau               | `Slot`               | Une plage horaire d'accueil d'une discipline, avec un nombre de places. |
| début, fin            | `startsAt`, `endsAt` | Les instants où le créneau commence et finit, en ISO 8601.              |
| capacité              | `capacity`           | Le nombre maximal de bénévoles inscrits sur le créneau, au moins 1.     |
| inscription           | `Registration`       | Un bénévole inscrit sur un créneau, avec son nom et son email.          |
| ouvrir un créneau     | `OpenSlot`           | Le cas d'usage qui crée un créneau pour une discipline.                 |
| inscrire un bénévole  | `RegisterVolunteer`  | Le cas d'usage qui inscrit un bénévole, sauf si le créneau est complet. |
| nombre d'inscrits     | `registeredCount`    | Le nombre d'inscriptions d'un créneau.                                  |

## 2. Fichiers par couche

On crée le module `volunteers` dans `apps/api/src/modules/volunteers/`, organisé comme le module Disciplines : un dossier par couche (`domain/`, `application/`, `infra/`, `http/`). Chaque fichier est listé avec son rôle.

- **shared** :
  - `packages/shared/src/volunteers.ts` contient les schémas Zod échangés entre l'API et un futur front : `createSlotSchema` (identifiant de discipline, début, fin, capacité entière d'au moins 1, fin après le début), `slotSchema` (le créneau renvoyé, avec `registeredCount`), `slotIdParamsSchema`, `registerVolunteerSchema` (nom de 1 à 100 caractères après suppression des espaces, email valide) et `registrationSchema` (l'inscription renvoyée). Il exporte aussi `VOLUNTEER_NAME_MAX_LENGTH = 100`.
  - `packages/shared/src/index.ts` réexporte ce nouveau fichier.
- **domain** :
  - `domain/slot.ts` définit l'entité `Slot`. `Slot.create()` revérifie que la capacité est un entier d'au moins 1 et que la fin est après le début ; `Slot.restore()` relit la base sans revalider ; `slot.assertRoomFor(registeredCount)` lève `SLOT_FULL` quand le nombre d'inscrits atteint la capacité.
  - `domain/registration.ts` définit l'entité `Registration`. `Registration.create()` supprime les espaces autour du nom et de l'email, puis revérifie que le nom n'est pas vide, qu'il ne dépasse pas 100 caractères et que l'email a une forme valide.
  - `domain/volunteers.errors.ts` déclare les codes d'erreur du module, la classe `VolunteersError` et les fonctions de fabrique `slotNotFound(id)`, `slotDisciplineNotFound(disciplineId)` et `slotFull(slotId, capacity)`.
- **application** :
  - `application/slot.repository.ts` est le port de persistance `SlotRepository` : `findById(id)`, `insert(slot)`, `countRegistrations(slotId)` et `insertRegistration(slot, registration)`. Ce dernier doit lever `SLOT_FULL` si le créneau est complet au moment de l'écriture, même face à une inscription simultanée.
  - `application/discipline-catalog.ts` est le port `DisciplineCatalog`, avec une seule méthode `exists(disciplineId)`. Le module `volunteers` n'importe ainsi rien du code du module Disciplines.
  - `application/use-cases/open-slot.ts` est le cas d'usage `OpenSlot` : il vérifie que la discipline existe, crée le `Slot` et l'enregistre.
  - `application/use-cases/register-volunteer.ts` est le cas d'usage `RegisterVolunteer` : il charge le créneau (sinon `SLOT_NOT_FOUND`), crée la `Registration`, vérifie qu'il reste une place pour donner un message clair, puis délègue l'écriture à `insertRegistration`, qui garantit la règle sous verrou.
  - `application/testing/in-memory-slot.repository.ts` et `application/testing/in-memory-discipline-catalog.ts` sont les fausses implémentations en mémoire, fidèles au contrat des ports, pour tester les cas d'usage sans base.
- **infra** :
  - `infra/volunteers.schema.ts` décrit les tables `slots` et `registrations` pour Drizzle (détail en section 3).
  - `infra/slot.mapper.ts` et `infra/registration.mapper.ts` convertissent explicitement entre lignes et entités (`toDomain()`, `toRow()`).
  - `infra/drizzle-slot.repository.ts` implémente `SlotRepository`. `insertRegistration` ouvre une transaction, verrouille la ligne du créneau (`SELECT … FOR UPDATE`), compte les inscriptions, appelle `slot.assertRoomFor(count)` puis insère : deux inscriptions simultanées à la dernière place ne passent donc pas toutes les deux.
  - `infra/drizzle-discipline-catalog.ts` implémente `DisciplineCatalog` en lisant la table `disciplines`.
  - `apps/api/migrations/` reçoit la migration générée par `pnpm db:generate --name=volunteers`.
- **http** :
  - `http/volunteers.controller.ts` est le controller fin du module, qui expose deux routes :
    - `POST /api/slots` ouvre un créneau. Son corps suit `createSlotSchema`. Elle renvoie 201 avec le créneau (`slotSchema`, `registeredCount: 0`), 400 si l'entrée est invalide, ou 404 si la discipline n'existe pas.
    - `POST /api/slots/:slotId/registrations` inscrit un bénévole. Son corps suit `registerVolunteerSchema`. Elle renvoie 201 avec l'inscription (`registrationSchema`), 400 si l'entrée est invalide, 404 si le créneau n'existe pas, ou 409 `SLOT_FULL` si le créneau est complet.
  - `volunteers.module.ts` relie les ports à leurs implémentations Drizzle et déclare les deux cas d'usage.
  - `apps/api/src/app.module.ts` importe `VolunteersModule`.
- **web** : rien. L'écran est hors périmètre ; la fausse API MSW sera complétée avec l'écran, en TR3.

## 3. Données

On stocke les créneaux et leurs inscriptions dans deux nouvelles tables. La migration est générée par `pnpm db:generate --name=volunteers`.

- **`slots`** : `id` (uuid, clé primaire), `discipline_id` (uuid, non nul), `starts_at` et `ends_at` (timestamptz, précision 3, non nuls), `capacity` (integer, non nul), `created_at` (timestamptz, précision 3, non nul).
  - La clé étrangère `discipline_id` → `disciplines.id` protège la règle « un créneau appartient à une discipline existante » (AS3). Elle est en `ON DELETE CASCADE`, pour que la suppression d'une discipline, déjà livrée, ne se mette pas à échouer.
  - Une contrainte `CHECK (capacity >= 1)` et une contrainte `CHECK (ends_at > starts_at)` protègent les règles de AS2 au niveau de la base.
- **`registrations`** : `id` (uuid, clé primaire), `slot_id` (uuid, non nul), `name` (varchar 100, non nul), `email` (varchar 254, non nul), `created_at` (timestamptz, précision 3, non nul).
  - La clé étrangère `slot_id` → `slots.id` (`ON DELETE CASCADE`) garantit qu'une inscription vise un créneau existant (AS7).
  - Un index sur `slot_id` accélère le comptage des inscrits d'un créneau.
  - La capacité (AS5) ne peut pas s'écrire comme une contrainte de table : le verrou sur la ligne du créneau dans `insertRegistration` la protège.

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`VolunteersError`, dérivée d'`AppError`), avec un code stable et un statut HTTP. Les entrées mal formées sont d'abord refusées par le DTO Zod avec le code générique `VALIDATION_FAILED` (400). Les codes de validation du domaine ne servent que si un appelant interne contourne le DTO.

| Code AppError                | Catégorie  | HTTP | Quand                                                   | Scénario |
| ---------------------------- | ---------- | ---- | ------------------------------------------------------- | -------- |
| `SLOT_CAPACITY_INVALID`      | VALIDATION | 400  | La capacité n'est pas un entier d'au moins 1.           | AS2      |
| `SLOT_TIME_RANGE_INVALID`    | VALIDATION | 400  | La fin du créneau n'est pas après son début.            | AS2      |
| `SLOT_DISCIPLINE_NOT_FOUND`  | NOT_FOUND  | 404  | On ouvre un créneau pour une discipline inexistante.    | AS3      |
| `SLOT_FULL`                  | CONFLICT   | 409  | Le créneau compte déjà autant d'inscrits que de places. | AS5      |
| `REGISTRATION_NAME_REQUIRED` | VALIDATION | 400  | Le nom du bénévole est vide ou fait d'espaces.          | AS6      |
| `REGISTRATION_NAME_TOO_LONG` | VALIDATION | 400  | Le nom du bénévole dépasse 100 caractères.              | AS6      |
| `REGISTRATION_EMAIL_INVALID` | VALIDATION | 400  | L'email du bénévole est mal formé.                      | AS6      |
| `SLOT_NOT_FOUND`             | NOT_FOUND  | 404  | On s'inscrit sur un créneau qui n'existe pas.           | AS7      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit. Un test e2e par scénario confirme en plus la réponse HTTP que l'appelant observe.

| Scénario | Fichier de test                                           | Niveau      | Ce que le test vérifie                                                                  |
| -------- | --------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| AS1      | `…/volunteers/application/volunteers.application.spec.ts` | unitaire    | Le créneau ouvert pour la Lutte a son début, sa fin, une capacité de 2 et 0 inscrit.    |
| AS1      | `…/volunteers/infra/drizzle-slot.repository.int.spec.ts`  | intégration | Le créneau relu en base est identique à celui écrit.                                    |
| AS1      | `apps/api/test/slots.e2e.spec.ts`                         | e2e         | 201, et le corps suit `slotSchema` avec `capacity: 2` et `registeredCount: 0`.          |
| AS2      | `…/volunteers/domain/slot.spec.ts`                        | unitaire    | Une capacité de 0 et une fin égale au début sont refusées avec leur code.               |
| AS2      | `apps/api/test/slots.e2e.spec.ts`                         | e2e         | 400 au format RFC 9457, avec le champ en cause dans `errors`.                           |
| AS3      | `…/volunteers/application/volunteers.application.spec.ts` | unitaire    | `SLOT_DISCIPLINE_NOT_FOUND`, et aucun créneau n'est enregistré.                         |
| AS3      | `apps/api/test/slots.e2e.spec.ts`                         | e2e         | 404 avec le code `SLOT_DISCIPLINE_NOT_FOUND`.                                           |
| AS4      | `…/volunteers/application/volunteers.application.spec.ts` | unitaire    | L'inscription d'Awa Diop garde son nom et son email, et le créneau compte 1 inscrit.    |
| AS4      | `apps/api/test/registrations.e2e.spec.ts`                 | e2e         | 201, et le corps suit `registrationSchema` avec le nom et l'email.                      |
| AS5      | `…/volunteers/domain/slot.spec.ts`                        | unitaire    | `assertRoomFor(2)` lève `SLOT_FULL` sur un créneau de capacité 2.                       |
| AS5      | `…/volunteers/application/volunteers.application.spec.ts` | unitaire    | La troisième inscription est refusée avec `SLOT_FULL`, et le créneau compte 2 inscrits. |
| AS5      | `…/volunteers/infra/drizzle-slot.repository.int.spec.ts`  | intégration | Trois inscriptions simultanées sur un créneau de capacité 2 : exactement deux passent.  |
| AS5      | `apps/api/test/registrations.e2e.spec.ts`                 | e2e         | 409 avec le code `SLOT_FULL` pour le troisième bénévole.                                |
| AS6      | `…/volunteers/domain/registration.spec.ts`                | unitaire    | Un nom vide, un nom trop long et un email mal formé sont refusés avec leur code.        |
| AS6      | `apps/api/test/registrations.e2e.spec.ts`                 | e2e         | 400 au format RFC 9457, avec le champ en cause dans `errors`.                           |
| AS7      | `…/volunteers/application/volunteers.application.spec.ts` | unitaire    | `SLOT_NOT_FOUND` pour un identifiant de créneau inconnu.                                |
| AS7      | `apps/api/test/registrations.e2e.spec.ts`                 | e2e         | 404 avec le code `SLOT_NOT_FOUND`.                                                      |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chacune commence par écrire son test, le voir échouer (`pnpm tdd:red <fichier>`), puis écrire le code minimal, et tient dans un commit.

- [x] T01 [001-AS2, AS5, AS6] Écrire d'abord `domain/slot.spec.ts` et `domain/registration.spec.ts` (« 001-AS2: rejects a capacity below 1 or an end not after the start », « 001-AS5: refuses a registration when the slot is full », « 001-AS6: rejects an empty name, a name too long or a malformed email »), puis `packages/shared/src/volunteers.ts`, `volunteers.errors.ts`, `slot.ts` et `registration.ts`
- [ ] T02 [001-AS1, AS3] Écrire d'abord `application/volunteers.application.spec.ts` (« 001-AS1: opens a slot with no registration », « 001-AS3: rejects a slot for an unknown discipline »), puis les ports `SlotRepository` et `DisciplineCatalog`, leurs fausses implémentations en mémoire et `OpenSlot`
- [ ] T03 [001-AS4, AS5, AS7] Compléter `application/volunteers.application.spec.ts` (« 001-AS4: registers a volunteer and counts one registration », « 001-AS5: refuses a third volunteer on a slot of capacity 2 », « 001-AS7: rejects a registration on an unknown slot »), puis `RegisterVolunteer`
- [ ] T04 [001-AS1, AS5] Écrire d'abord `infra/drizzle-slot.repository.int.spec.ts` (« 001-AS1: reads back exactly the slot it wrote », « 001-AS5: lets only two of three simultaneous registrations through »), puis `volunteers.schema.ts`, la migration `pnpm db:generate --name=volunteers`, les mappers, `DrizzleSlotRepository` et `DrizzleDisciplineCatalog`
- [ ] T05 [001-AS1, AS2, AS3] Écrire d'abord `apps/api/test/slots.e2e.spec.ts` (« 001-AS1: opens a slot (201) », « 001-AS2: rejects an invalid slot (400, RFC 9457) », « 001-AS3: rejects a slot for an unknown discipline (404) »), puis la route `POST /api/slots` dans `volunteers.controller.ts`, `volunteers.module.ts` et l'import dans `app.module.ts`
- [ ] T06 [001-AS4, AS5, AS6, AS7] Écrire d'abord `apps/api/test/registrations.e2e.spec.ts` (« 001-AS4: registers a volunteer (201) », « 001-AS5: refuses a third volunteer with SLOT_FULL (409) », « 001-AS6: rejects an invalid registration (400) », « 001-AS7: rejects a registration on an unknown slot (404) »), puis la route `POST /api/slots/:slotId/registrations`
