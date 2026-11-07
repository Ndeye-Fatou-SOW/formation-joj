import { Module } from '@nestjs/common';
import { OfficialResults, PodiumRepository } from './application/podium.repository';
import { GetMedalTable } from './application/use-cases/get-medal-table';
import { GetPodium } from './application/use-cases/get-podium';
import { SubmitPodium } from './application/use-cases/submit-podium';
import { MedalTableController } from './http/medal-table.controller';
import { PodiumsController } from './http/podiums.controller';
import { InMemoryPodiumRepository } from './infra/in-memory-podium.repository';
import { StaticOfficialResults } from './infra/static-official-results';

@Module({
  controllers: [PodiumsController, MedalTableController],
  providers: [
    { provide: PodiumRepository, useClass: InMemoryPodiumRepository },
    { provide: OfficialResults, useClass: StaticOfficialResults },
    SubmitPodium,
    GetPodium,
    GetMedalTable,
  ],
})
export class PodiumsModule {}
