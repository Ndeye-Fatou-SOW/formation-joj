import { Module } from '@nestjs/common';
import { DisciplineCatalog } from './application/discipline-catalog';
import { SlotRepository } from './application/slot.repository';
import { OpenSlot } from './application/use-cases/open-slot';
import { RegisterVolunteer } from './application/use-cases/register-volunteer';
import { VolunteersController } from './http/volunteers.controller';
import { DrizzleDisciplineCatalog } from './infra/drizzle-discipline-catalog';
import { DrizzleSlotRepository } from './infra/drizzle-slot.repository';

@Module({
  controllers: [VolunteersController],
  providers: [
    // Les ports (classes abstraites) sont reliés ici à leurs implémentations Drizzle.
    { provide: SlotRepository, useClass: DrizzleSlotRepository },
    { provide: DisciplineCatalog, useClass: DrizzleDisciplineCatalog },
    OpenSlot,
    RegisterVolunteer,
  ],
})
export class VolunteersModule {}
