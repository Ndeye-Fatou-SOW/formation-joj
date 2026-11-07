import { describe, expect, it } from 'vitest';
import { InMemoryDisciplineCatalog } from './testing/in-memory-discipline-catalog';
import { InMemorySlotRepository } from './testing/in-memory-slot.repository';
import { OpenSlot } from './use-cases/open-slot';

const LUTTE_ID = '0199f5c2-0000-7000-8000-000000000001';
const UNKNOWN_DISCIPLINE_ID = '0199f5c2-0000-7000-8000-0000000000ff';

const slotInput = (disciplineId = LUTTE_ID) => ({
  disciplineId,
  startsAt: '2026-11-02T09:00:00.000Z',
  endsAt: '2026-11-02T12:00:00.000Z',
  capacity: 2,
});

function setup() {
  const slots = new InMemorySlotRepository();
  const disciplines = new InMemoryDisciplineCatalog([LUTTE_ID]);
  return { slots, openSlot: new OpenSlot(slots, disciplines) };
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
});
