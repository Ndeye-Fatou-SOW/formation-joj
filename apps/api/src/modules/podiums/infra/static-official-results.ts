import { Injectable } from '@nestjs/common';
import { OfficialResults } from '../application/podium.repository';
import { eventKey, type Medals } from '../domain/podium';

/** Résultats officiels fictifs, chargés au démarrage ; leur publication arrive en TR2. */
const OFFICIAL_RESULTS: Record<string, Medals> = {
  '100 m filles': { gold: 'CIV', silver: 'EGY', bronze: 'JPN' },
  'saut en longueur filles': { gold: 'NGA', silver: 'USA', bronze: 'CHN' },
  'lutte -60 kg garçons': { gold: 'SEN', silver: 'GAM', bronze: 'MAR' },
  'basketball 3x3 filles': { gold: 'USA', silver: 'FRA', bronze: 'SEN' },
};

@Injectable()
export class StaticOfficialResults extends OfficialResults {
  async findByEvent(event: string): Promise<Medals | undefined> {
    return OFFICIAL_RESULTS[eventKey(event)];
  }

  async all(): Promise<Medals[]> {
    return Object.values(OFFICIAL_RESULTS);
  }
}
