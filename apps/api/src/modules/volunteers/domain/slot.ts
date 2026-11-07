import { slotFull, VolunteersError } from './volunteers.errors';

export interface SlotProps {
  id: string;
  disciplineId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  createdAt: Date;
}

export interface NewSlot {
  id: string;
  disciplineId: string;
  startsAt: Date;
  endsAt: Date;
  /** Vérifiée ici : le domaine ne fait pas confiance à la validation HTTP. */
  capacity: number;
  now: Date;
}

/** Un créneau d'accueil d'une discipline : une plage horaire et un nombre de places. */
export class Slot {
  private constructor(private readonly props: SlotProps) {}

  static create({ id, disciplineId, startsAt, endsAt, capacity, now }: NewSlot): Slot {
    assertTimeRange(startsAt, endsAt);
    return new Slot({
      id,
      disciplineId,
      startsAt,
      endsAt,
      capacity: validCapacity(capacity),
      createdAt: now,
    });
  }

  /** Reconstruit un créneau depuis la persistance, sans rejouer les règles de création. */
  static restore(props: SlotProps): Slot {
    return new Slot({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get disciplineId(): string {
    return this.props.disciplineId;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get endsAt(): Date {
    return this.props.endsAt;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** Lève SLOT_FULL si le créneau compte déjà autant d'inscrits que de places. */
  assertRoomFor(registeredCount: number): void {
    if (registeredCount >= this.props.capacity) {
      throw slotFull(this.props.id, this.props.capacity);
    }
  }
}

function validCapacity(capacity: number): number {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new VolunteersError('SLOT_CAPACITY_INVALID', 'A slot needs a capacity of at least 1', {
      capacity,
    });
  }
  return capacity;
}

function assertTimeRange(startsAt: Date, endsAt: Date): void {
  if (!(endsAt.getTime() > startsAt.getTime())) {
    throw new VolunteersError('SLOT_TIME_RANGE_INVALID', 'A slot must end after it starts', {
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
  }
}
