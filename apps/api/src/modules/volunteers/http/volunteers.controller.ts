import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createSlotSchema, type SlotResponse, slotSchema } from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { OpenSlot } from '../application/use-cases/open-slot';
import type { Slot } from '../domain/slot';

class CreateSlotDto extends createZodDto(createSlotSchema) {}
class SlotDto extends createZodDto(slotSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('volunteers')
@Controller('slots')
export class VolunteersController {
  constructor(private readonly openSlot: OpenSlot) {}

  @Post()
  @ZodSerializerDto(SlotDto)
  async open(@Body() body: CreateSlotDto): Promise<SlotResponse> {
    // Un créneau qui vient d'être ouvert n'a encore aucun inscrit.
    return toSlotResponse(await this.openSlot.execute(body), 0);
  }
}

function toSlotResponse(slot: Slot, registeredCount: number): SlotResponse {
  return {
    id: slot.id,
    disciplineId: slot.disciplineId,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    capacity: slot.capacity,
    registeredCount,
    createdAt: slot.createdAt.toISOString(),
  };
}
