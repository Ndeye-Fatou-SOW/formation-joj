import type { Medals, Podium } from '../domain/podium';

/** Port de stockage des podiums saisis par les journalistes. */
export abstract class PodiumRepository {
  abstract save(podium: Podium): Promise<void>;
  abstract findById(id: string): Promise<Podium | undefined>;
}

/** Port de lecture des résultats officiels des Jeux, par épreuve. */
export abstract class OfficialResults {
  abstract findByEvent(event: string): Promise<Medals | undefined>;
}
