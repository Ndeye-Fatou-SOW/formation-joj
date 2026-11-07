import type { Medals } from './podium';

export interface MedalTableRow {
  readonly country: string;
  readonly gold: number;
  readonly silver: number;
  readonly bronze: number;
  readonly total: number;
}

/** Le tableau des médailles : trié par or, puis argent, puis bronze ; à égalité, par code pays. */
export function computeMedalTable(results: readonly Medals[]): MedalTableRow[] {
  const counts = new Map<string, { gold: number; silver: number; bronze: number }>();
  const row = (country: string) => {
    let current = counts.get(country);
    if (!current) {
      current = { gold: 0, silver: 0, bronze: 0 };
      counts.set(country, current);
    }
    return current;
  };
  for (const result of results) {
    row(result.gold).gold += 1;
    row(result.silver).silver += 1;
    row(result.bronze).bronze += 1;
  }
  return [...counts]
    .map(([country, c]) => ({ country, ...c, total: c.gold + c.silver + c.bronze }))
    .sort(
      (a, b) =>
        b.gold - a.gold ||
        b.silver - a.silver ||
        b.bronze - a.bronze ||
        a.country.localeCompare(b.country),
    );
}
