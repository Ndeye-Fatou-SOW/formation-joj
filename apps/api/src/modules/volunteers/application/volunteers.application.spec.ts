import { describe, expect, it } from 'vitest';
import { InMemoryDisciplineCatalog } from './testing/in-memory-discipline-catalog';
import { InMemorySlotRepository } from './testing/in-memory-slot.repository';
import { OpenSlot } from './use-cases/open-slot';
import { RegisterVolunteer } from './use-cases/register-volunteer';

const LUTTE_ID = '0199f5c2-0000-7000-8000-000000000001';
const UNKNOWN_DISCIPLINE_ID = '0199f5c2-0000-7000-8000-0000000000ff';
const UNKNOWN_SLOT_ID = '0199f5c2-0000-7000-8000-0000000001ff';

const slotInput = (disciplineId = LUTTE_ID) => ({
  disciplineId,
  startsAt: '2026-11-02T09:00:00.000Z',
  endsAt: '2026-11-02T12:00:00.000Z',
  capacity: 2,
});

function setup() {
  const slots = new InMemorySlotRepository();
  const disciplines = new InMemoryDisciplineCatalog([LUTTE_ID]);
  return {
    slots,
    openSlot: new OpenSlot(slots, disciplines),
    registerVolunteer: new RegisterVolunteer(slots),
  };
}

describe('volunteers (application layer)', () => {
  it('001-AS1: opens a slot with no registration', async () => {
    const { slots, openSlot } = setup();
    const slot = await openSlot.execute(slotInput());

    expect(slot).toMatchObject({
      disciplineId: LUTTE_ID,
      startsAt: new Date('2026-11-02T09:00:00.000Z'),
      endsAt: new Date('2026-11-02T12:00:00.000Z'),
      capacity: 2,
    });
    expect(slot.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await slots.findById(slot.id)).toEqual(slot);
    expect(await slots.countRegistrations(slot.id)).toBe(0);
  });

  it('001-AS3: rejects a slot for an unknown discipline', async () => {
    const { slots, openSlot } = setup();
    await expect(openSlot.execute(slotInput(UNKNOWN_DISCIPLINE_ID))).rejects.toMatchObject({
      code: 'SLOT_DISCIPLINE_NOT_FOUND',
      kind: 'NOT_FOUND',
    });
    expect(slots.size).toBe(0);
  });

  it('001-AS4: registers a volunteer and counts one registration', async () => {
    const { slots, openSlot, registerVolunteer } = setup();
    const slot = await openSlot.execute(slotInput());

    const registration = await registerVolunteer.execute(slot.id, {
      name: 'Awa Diop',
      email: 'awa@example.sn',
    });

    expect(registration).toMatchObject({
      slotId: slot.id,
      name: 'Awa Diop',
      email: 'awa@example.sn',
    });
    expect(registration.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await slots.countRegistrations(slot.id)).toBe(1);
  });

  it('001-AS5: refuses a third volunteer on a slot of capacity 2', async () => {
    const { slots, openSlot, registerVolunteer } = setup();
    const slot = await openSlot.execute(slotInput());
    await registerVolunteer.execute(slot.id, { name: 'Awa Diop', email: 'awa@example.sn' });
    await registerVolunteer.execute(slot.id, { name: 'Moussa Ba', email: 'moussa@example.sn' });

    await expect(
      registerVolunteer.execute(slot.id, { name: 'Fatou Sarr', email: 'fatou@example.sn' }),
    ).rejects.toMatchObject({ code: 'SLOT_FULL', kind: 'CONFLICT' });
    expect(await slots.countRegistrations(slot.id)).toBe(2);
  });

  it('001-AS7: rejects a registration on an unknown slot', async () => {
    const { registerVolunteer } = setup();
    await expect(
      registerVolunteer.execute(UNKNOWN_SLOT_ID, { name: 'Awa Diop', email: 'awa@example.sn' }),
    ).rejects.toMatchObject({ code: 'SLOT_NOT_FOUND', kind: 'NOT_FOUND' });
  });
});
