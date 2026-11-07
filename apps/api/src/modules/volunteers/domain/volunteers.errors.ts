import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const VOLUNTEERS_ERROR_KINDS = {
  /** Capacité qui n'est pas un entier d'au moins 1. */
  SLOT_CAPACITY_INVALID: 'VALIDATION',
  /** Fin du créneau qui n'est pas après son début. */
  SLOT_TIME_RANGE_INVALID: 'VALIDATION',
  /** Aucune discipline n'a l'identifiant donné pour le créneau. */
  SLOT_DISCIPLINE_NOT_FOUND: 'NOT_FOUND',
  /** Aucun créneau n'a cet identifiant. */
  SLOT_NOT_FOUND: 'NOT_FOUND',
  /** Le créneau compte déjà autant d'inscrits que de places. */
  SLOT_FULL: 'CONFLICT',
  /** Nom du bénévole vide, ou fait seulement d'espaces. */
  REGISTRATION_NAME_REQUIRED: 'VALIDATION',
  REGISTRATION_NAME_TOO_LONG: 'VALIDATION',
  REGISTRATION_EMAIL_INVALID: 'VALIDATION',
  /** Email plus long que la colonne en base (254 caractères). */
  REGISTRATION_EMAIL_TOO_LONG: 'VALIDATION',
} as const satisfies Record<string, ErrorKind>;

export type VolunteersErrorCode = keyof typeof VOLUNTEERS_ERROR_KINDS;

export class VolunteersError extends AppError<VolunteersErrorCode> {
  constructor(code: VolunteersErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, VOLUNTEERS_ERROR_KINDS[code], message, details);
  }
}

export function slotNotFound(id: string): VolunteersError {
  return new VolunteersError('SLOT_NOT_FOUND', `No slot with id ${id}`, { id });
}

export function slotDisciplineNotFound(disciplineId: string): VolunteersError {
  return new VolunteersError('SLOT_DISCIPLINE_NOT_FOUND', `No discipline with id ${disciplineId}`, {
    disciplineId,
  });
}

export function slotFull(slotId: string, capacity: number): VolunteersError {
  return new VolunteersError('SLOT_FULL', `Slot ${slotId} is full (${capacity} places)`, {
    slotId,
    capacity,
  });
}
