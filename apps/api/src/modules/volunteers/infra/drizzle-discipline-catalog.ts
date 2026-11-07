import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { disciplines } from '../../disciplines/infra/disciplines.schema';
import { DisciplineCatalog } from '../application/discipline-catalog';

/** Lit la table des disciplines, sans passer par le code du module Disciplines. */
@Injectable()
export class DrizzleDisciplineCatalog extends DisciplineCatalog {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async exists(disciplineId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: disciplines.id })
      .from(disciplines)
      .where(eq(disciplines.id, disciplineId))
      .limit(1);
    return row !== undefined;
  }
}
