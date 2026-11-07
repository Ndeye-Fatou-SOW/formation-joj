import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';

/**
 * Port de persistance des créneaux et de leurs inscriptions : ce dont les cas d'usage ont besoin,
 * rien de plus. Implémenté par DrizzleSlotRepository (infra) et InMemorySlotRepository (tests).
 */
export abstract class SlotRepository {
  abstract findById(id: string): Promise<Slot | null>;
  abstract insert(slot: Slot): Promise<void>;
  abstract countRegistrations(slotId: string): Promise<number>;
  /**
   * Lève SLOT_FULL si le créneau est complet au moment de l'écriture, même quand une autre
   * inscription arrive en même temps.
   */
  abstract insertRegistration(slot: Slot, registration: Registration): Promise<void>;
}
