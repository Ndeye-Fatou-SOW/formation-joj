import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const PODIUM_ERROR_KINDS = {
  /** Aucun podium n'a cet identifiant. */
  PODIUM_NOT_FOUND: 'NOT_FOUND',
} as const satisfies Record<string, ErrorKind>;

export type PodiumErrorCode = keyof typeof PODIUM_ERROR_KINDS;

export class PodiumError extends AppError<PodiumErrorCode> {
  constructor(code: PodiumErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, PODIUM_ERROR_KINDS[code], message, details);
  }
}

export function podiumNotFound(id: string): PodiumError {
  return new PodiumError('PODIUM_NOT_FOUND', `No podium with id ${id}`, { id });
}
