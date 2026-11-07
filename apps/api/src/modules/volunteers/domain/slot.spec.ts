import { describe, expect, it } from 'vitest';
import { Slot } from './slot';

const NOW = new Date('2026-10-31T09:00:00.000Z');
const ID = '0199f5c2-0000-7000-8000-000000000101';
const DISCIPLINE_ID = '0199f5c2-0000-7000-8000-000000000001';
const STARTS_AT = new Date('2026-11-02T09:00:00.000Z');
const ENDS_AT = new Date('2026-11-02T12:00:00.000Z');

const newSlot = (overrides: Partial<{ capacity: number; startsAt: Date; endsAt: Date }> = {}) =>
  Slot.create({
    id: ID,
    disciplineId: DISCIPLINE_ID,
    startsAt: STARTS_AT,
    endsAt: ENDS_AT,
    capacity: 2,
    now: NOW,
    ...overrides,
  });

describe('Slot', () => {
  it('001-AS1: opens a slot with its times and capacity', () => {
    expect(newSlot()).toMatchObject({
      id: ID,
      disciplineId: DISCIPLINE_ID,
      startsAt: STARTS_AT,
      endsAt: ENDS_AT,
      capacity: 2,
      createdAt: NOW,
    });
  });

  it.each([0, -1, 1.5])(
    '001-AS2: rejects a capacity below 1 or not an integer (%j)',
    (capacity) => {
      expect(() => newSlot({ capacity })).toThrow(
        expect.objectContaining({ code: 'SLOT_CAPACITY_INVALID', kind: 'VALIDATION' }),
      );
    },
  );

  it.each([STARTS_AT, new Date('2026-11-02T08:00:00.000Z')])(
    '001-AS2: rejects an end that is not after the start (%s)',
    (endsAt) => {
      expect(() => newSlot({ endsAt })).toThrow(
        expect.objectContaining({ code: 'SLOT_TIME_RANGE_INVALID', kind: 'VALIDATION' }),
      );
    },
  );

  it('001-AS5: refuses a registration when the slot is full', () => {
    const slot = newSlot({ capacity: 2 });
    expect(() => slot.assertRoomFor(1)).not.toThrow();
    expect(() => slot.assertRoomFor(2)).toThrow(
      expect.objectContaining({
        code: 'SLOT_FULL',
        kind: 'CONFLICT',
        details: { slotId: ID, capacity: 2 },
      }),
    );
  });
});
