import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RegisterVolunteerInput } from '@joj/shared';
import { Registration } from '../../domain/registration';
import { slotNotFound } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

@Injectable()
export class RegisterVolunteer {
  constructor(private readonly slots: SlotRepository) {}

  async execute(slotId: string, input: RegisterVolunteerInput): Promise<Registration> {
    const slot = await this.slots.findById(slotId);
    if (!slot) throw slotNotFound(slotId);
    const registration = Registration.create({
      id: randomUUID(),
      slotId: slot.id,
      name: input.name,
      email: input.email,
      now: new Date(),
    });
    // Message clair dans le cas courant ; le verrou d'insertRegistration couvre deux inscriptions simultanées.
    slot.assertRoomFor(await this.slots.countRegistrations(slot.id));
    await this.slots.insertRegistration(slot, registration);
    return registration;
  }
}
