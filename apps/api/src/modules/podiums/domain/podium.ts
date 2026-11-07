/** Les trois médailles d'un podium, par code pays. */
export interface Medals {
  readonly gold: string;
  readonly silver: string;
  readonly bronze: string;
}

export type PodiumStatus = 'certifie' | 'en-ecart' | 'provisoire';
export type Medal = 'or' | 'argent' | 'bronze';

export interface PodiumGap {
  readonly medal: Medal;
  readonly submitted: string;
  readonly official: string;
}

const MEDAL_KEYS: ReadonlyArray<readonly [Medal, keyof Medals]> = [
  ['or', 'gold'],
  ['argent', 'silver'],
  ['bronze', 'bronze'],
];

/**
 * La règle de TR1 : sans résultat officiel, le podium est provisoire ; sinon il est certifié
 * s'il est identique, en écart avec la liste des médailles qui diffèrent.
 */
export function compareToOfficial(
  submitted: Medals,
  official: Medals | undefined,
): { status: PodiumStatus; gaps: PodiumGap[] } {
  if (!official) return { status: 'provisoire', gaps: [] };
  const gaps = MEDAL_KEYS.filter(([, key]) => submitted[key] !== official[key]).map(
    ([medal, key]) => ({ medal, submitted: submitted[key], official: official[key] }),
  );
  return { status: gaps.length === 0 ? 'certifie' : 'en-ecart', gaps };
}

/** Une épreuve est identifiée par son nom, sans tenir compte des majuscules ni des espaces. */
export function eventKey(event: string): string {
  return event.trim().toLowerCase();
}

export interface Podium extends Medals {
  readonly id: string;
  readonly journalist: string;
  readonly event: string;
  readonly status: PodiumStatus;
  readonly gaps: readonly PodiumGap[];
  readonly submittedAt: Date;
}
