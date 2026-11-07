import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { SubmitPodiumInput } from '@joj/shared';
import { compareToOfficial, type Podium } from '../../domain/podium';
import { OfficialResults, PodiumRepository } from '../podium.repository';

@Injectable()
export class SubmitPodium {
  constructor(
    private readonly podiums: PodiumRepository,
    private readonly officialResults: OfficialResults,
  ) {}

  async execute(input: SubmitPodiumInput): Promise<Podium> {
    const official = await this.officialResults.findByEvent(input.event);
    const podium: Podium = {
      id: randomUUID(),
      journalist: input.journalist,
      event: input.event,
      gold: input.gold,
      silver: input.silver,
      bronze: input.bronze,
      ...compareToOfficial(input, official),
      submittedAt: new Date(),
    };
    await this.podiums.save(podium);
    return podium;
  }
}
