import { Injectable } from '@nestjs/common';
import { PodiumRepository } from '../application/podium.repository';
import type { Podium } from '../domain/podium';

/** Stockage en mémoire pour TR1 : les podiums sont perdus au redémarrage de l'API. */
@Injectable()
export class InMemoryPodiumRepository extends PodiumRepository {
  private readonly podiums = new Map<string, Podium>();

  async save(podium: Podium): Promise<void> {
    this.podiums.set(podium.id, podium);
  }

  async findById(id: string): Promise<Podium | undefined> {
    return this.podiums.get(id);
  }
}
