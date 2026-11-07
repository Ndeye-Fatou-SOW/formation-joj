import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { CreateSlotInput } from '@joj/shared';
import { Slot } from '../../domain/slot';
import { slotDisciplineNotFound } from '../../domain/volunteers.errors';
import { DisciplineCatalog } from '../discipline-catalog';
import { SlotRepository } from '../slot.repository';

@Injectable()
export class OpenSlot {
  constructor(
    private readonly slots: SlotRepository,
    private readonly disciplines: DisciplineCatalog,
  ) {}

  async execute(input: CreateSlotInput): Promise<Slot> {
    const slot = Slot.create({
      id: randomUUID(),
      disciplineId: input.disciplineId,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      capacity: input.capacity,
      now: new Date(),
    });
    if (!(await this.disciplines.exists(slot.disciplineId))) {
      throw slotDisciplineNotFound(slot.disciplineId);
    }
    await this.slots.insert(slot);
    return slot;
  }
}
