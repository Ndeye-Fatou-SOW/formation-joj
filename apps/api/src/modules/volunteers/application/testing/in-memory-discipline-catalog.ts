import { DisciplineCatalog } from '../discipline-catalog';

/** Fake du catalogue : les disciplines existantes sont les identifiants donnés au constructeur. */
export class InMemoryDisciplineCatalog extends DisciplineCatalog {
  private readonly ids: ReadonlySet<string>;

  constructor(ids: readonly string[]) {
    super();
    this.ids = new Set(ids);
  }

  async exists(disciplineId: string): Promise<boolean> {
    return this.ids.has(disciplineId);
  }
}
