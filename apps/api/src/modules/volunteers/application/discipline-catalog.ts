/**
 * Port vers les disciplines : le module volunteers n'importe rien du code du module Disciplines.
 * Implémenté par DrizzleDisciplineCatalog (infra) et InMemoryDisciplineCatalog (tests).
 */
export abstract class DisciplineCatalog {
  abstract exists(disciplineId: string): Promise<boolean>;
}
