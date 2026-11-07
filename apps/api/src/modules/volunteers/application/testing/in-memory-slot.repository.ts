import { Registration } from '../../domain/registration';
import { Slot } from '../../domain/slot';
import { SlotRepository } from '../slot.repository';

/** Fake fidèle au contrat du port (capacité vérifiée à l'écriture), pour tester sans base. */
export class InMemorySlotRepository extends SlotRepository {
  private readonly slots = new Map<string, Slot>();
  private readonly registrations: Registration[] = [];

  /** Nombre de créneaux enregistrés : pour vérifier qu'un refus n'a rien écrit. */
  get size(): number {
    return this.slots.size;
  }

  async findById(id: string): Promise<Slot | null> {
    const found = this.slots.get(id);
    return found ? cloneSlot(found) : null;
  }

  async insert(slot: Slot): Promise<void> {
    this.slots.set(slot.id, cloneSlot(slot));
  }

  async countRegistrations(slotId: string): Promise<number> {
    return this.registrations.filter((registration) => registration.slotId === slotId).length;
  }

  /** Comme le verrou en base : le comptage et l'écriture se font sans interruption. */
  async insertRegistration(slot: Slot, registration: Registration): Promise<void> {
    const stored = this.slots.get(slot.id);
    if (!stored) return;
    stored.assertRoomFor(
      this.registrations.filter((existing) => existing.slotId === slot.id).length,
    );
    this.registrations.push(cloneRegistration(registration));
  }
}

/** Copie : un test ne voit pas une modification qui n'a pas été persistée. */
function cloneSlot(slot: Slot): Slot {
  return Slot.restore({
    id: slot.id,
    disciplineId: slot.disciplineId,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    capacity: slot.capacity,
    createdAt: slot.createdAt,
  });
}

function cloneRegistration(registration: Registration): Registration {
  return Registration.restore({
    id: registration.id,
    slotId: registration.slotId,
    name: registration.name,
    email: registration.email,
    createdAt: registration.createdAt,
  });
}
