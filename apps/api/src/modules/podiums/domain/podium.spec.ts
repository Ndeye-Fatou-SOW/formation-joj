import { describe, expect, it } from 'vitest';
import { compareToOfficial, eventKey } from './podium';

const official = { gold: 'CIV', silver: 'EGY', bronze: 'JPN' };

describe('compareToOfficial', () => {
  it('004-AS1: certifies a podium identical to the official result', () => {
    expect(compareToOfficial({ gold: 'CIV', silver: 'EGY', bronze: 'JPN' }, official)).toEqual({
      status: 'certifie',
      gaps: [],
    });
  });

  it('004-AS2: lists the gaps when the podium differs from the official result', () => {
    expect(compareToOfficial({ gold: 'EGY', silver: 'CIV', bronze: 'JPN' }, official)).toEqual({
      status: 'en-ecart',
      gaps: [
        { medal: 'or', submitted: 'EGY', official: 'CIV' },
        { medal: 'argent', submitted: 'CIV', official: 'EGY' },
      ],
    });
  });

  it('004-AS3: keeps the podium provisional without an official result', () => {
    expect(compareToOfficial({ gold: 'JPN', silver: 'CHN', bronze: 'CIV' }, undefined)).toEqual({
      status: 'provisoire',
      gaps: [],
    });
  });

  it('matches an event regardless of case and surrounding spaces', () => {
    expect(eventKey(' 100 M Filles ')).toBe(eventKey('100 m filles'));
  });
});
