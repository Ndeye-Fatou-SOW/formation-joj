import { describe, expect, it } from 'vitest';
import { computeMedalTable } from './medal-table';

describe('computeMedalTable', () => {
  it('005-AS1: counts each medal once per country, with a total', () => {
    const table = computeMedalTable([
      { gold: 'CIV', silver: 'EGY', bronze: 'JPN' },
      { gold: 'USA', silver: 'FRA', bronze: 'SEN' },
    ]);

    expect(table).toHaveLength(6);
    expect(table.find((r) => r.country === 'CIV')).toEqual({
      country: 'CIV',
      gold: 1,
      silver: 0,
      bronze: 0,
      total: 1,
    });
  });

  it('005-AS2: sorts by gold, then silver, then bronze, then country code', () => {
    const table = computeMedalTable([
      { gold: 'SEN', silver: 'CIV', bronze: 'EGY' },
      { gold: 'SEN', silver: 'EGY', bronze: 'CIV' },
      { gold: 'NGA', silver: 'CIV', bronze: 'MAR' },
    ]);

    expect(table.map((r) => r.country)).toEqual(['SEN', 'NGA', 'CIV', 'EGY', 'MAR']);
  });
});
