import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { SlotRepository } from '../application/slot.repository';
import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';
import { slotNotFound } from '../domain/volunteers.errors';
import { toRow as registrationToRow } from './registration.mapper';
import { toDomain, toRow } from './slot.mapper';
import { registrations, slots } from './volunteers.schema';

@Injectable()
export class DrizzleSlotRepository extends SlotRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findById(id: string): Promise<Slot | null> {
    const [row] = await this.db.select().from(slots).where(eq(slots.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async insert(slot: Slot): Promise<void> {
    await this.db.insert(slots).values(toRow(slot));
  }

  async countRegistrations(slotId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(registrations)
      .where(eq(registrations.slotId, slotId));
    return row?.value ?? 0;
  }

  /**
   * Le verrou sur la ligne du créneau sérialise les inscriptions concurrentes : la seconde attend
   * que la première soit validée, puis compte les inscrits à jour.
   */
  async insertRegistration(slot: Slot, registration: Registration): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [row] = await tx.select().from(slots).where(eq(slots.id, slot.id)).for('update');
      if (!row) throw slotNotFound(slot.id);
      const [registered] = await tx
        .select({ value: count() })
        .from(registrations)
        .where(eq(registrations.slotId, slot.id));
      toDomain(row).assertRoomFor(registered?.value ?? 0);
      await tx.insert(registrations).values(registrationToRow(registration));
    });
  }
}
