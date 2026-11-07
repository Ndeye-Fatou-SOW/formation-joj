import { Injectable } from '@nestjs/common';
import type { Podium } from '../../domain/podium';
import { podiumNotFound } from '../../domain/podiums.errors';
import { PodiumRepository } from '../podium.repository';

@Injectable()
export class GetPodium {
  constructor(private readonly podiums: PodiumRepository) {}

  async execute(id: string): Promise<Podium> {
    const podium = await this.podiums.findById(id);
    if (!podium) throw podiumNotFound(id);
    return podium;
  }
}
