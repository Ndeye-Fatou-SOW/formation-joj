import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { disciplines } from '../../disciplines/infra/disciplines.schema';
import { Registration } from '../domain/registration';
import { Slot } from '../domain/slot';
import { DrizzleDisciplineCatalog } from './drizzle-discipline-catalog';
import { DrizzleSlotRepository } from './drizzle-slot.repository';

const DISCIPLINE_ID = randomUUID();

const newSlot = (capacity = 2) =>
  Slot.create({
    id: randomUUID(),
    disciplineId: DISCIPLINE_ID,
    startsAt: new Date('2026-11-02T09:00:00.123Z'),
    endsAt: new Date('2026-11-02T12:00:00.456Z'),
    capacity,
    now: new Date('2026-10-31T09:00:00.789Z'),
  });

const newRegistration = (slot: Slot, name: string) =>
  Registration.create({
    id: randomUUID(),
    slotId: slot.id,
    name,
    email: `${name.toLowerCase()}@example.sn`,
    now: new Date(),
  });

describe('DrizzleSlotRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSlotRepository;
  let catalog: DrizzleDisciplineCatalog;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    await connection.db.insert(disciplines).values({
      id: DISCIPLINE_ID,
      name: 'Lutte',
      category: 'sports-de-combat',
      createdAt: new Date(),
    });
    repository = new DrizzleSlotRepository(connection.db);
    catalog = new DrizzleDisciplineCatalog(connection.db);
  });

  afterAll(() => connection?.close());

  it('001-AS1: reads back exactly the slot it wrote, with no registration', async () => {
    const slot = newSlot();
    await repository.insert(slot);

    expect(await repository.findById(slot.id)).toEqual(slot);
    expect(await repository.findById(randomUUID())).toBeNull();
    expect(await repository.countRegistrations(slot.id)).toBe(0);
  });

  it('001-AS3: tells whether a discipline exists', async () => {
    expect(await catalog.exists(DISCIPLINE_ID)).toBe(true);
    expect(await catalog.exists(randomUUID())).toBe(false);
  });

  it('001-AS4: counts the registrations it wrote', async () => {
    const slot = newSlot();
    await repository.insert(slot);
    await repository.insertRegistration(slot, newRegistration(slot, 'Awa'));

    expect(await repository.countRegistrations(slot.id)).toBe(1);
  });

  it('001-AS5: lets only two of three simultaneous registrations through', async () => {
    const slot = newSlot(2);
    await repository.insert(slot);

    const results = await Promise.allSettled(
      ['Awa', 'Moussa', 'Fatou'].map((name) =>
        repository.insertRegistration(slot, newRegistration(slot, name)),
      ),
    );

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(2);
    expect(results.filter((result) => result.status === 'rejected')).toEqual([
      expect.objectContaining({ reason: expect.objectContaining({ code: 'SLOT_FULL' }) }),
    ]);
    expect(await repository.countRegistrations(slot.id)).toBe(2);
  });
});
