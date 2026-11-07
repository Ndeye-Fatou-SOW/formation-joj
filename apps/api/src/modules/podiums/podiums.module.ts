import { Module } from '@nestjs/common';
import { OfficialResults, PodiumRepository } from './application/podium.repository';
import { GetPodium } from './application/use-cases/get-podium';
import { SubmitPodium } from './application/use-cases/submit-podium';
import { PodiumsController } from './http/podiums.controller';
import { InMemoryPodiumRepository } from './infra/in-memory-podium.repository';
import { StaticOfficialResults } from './infra/static-official-results';

@Module({
  controllers: [PodiumsController],
  providers: [
    { provide: PodiumRepository, useClass: InMemoryPodiumRepository },
    { provide: OfficialResults, useClass: StaticOfficialResults },
    SubmitPodium,
    GetPodium,
  ],
})
export class PodiumsModule {}
