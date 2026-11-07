import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createSlotSchema,
  registerVolunteerSchema,
  type RegistrationResponse,
  registrationSchema,
  slotIdParamsSchema,
  type SlotResponse,
  slotSchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { OpenSlot } from '../application/use-cases/open-slot';
import { RegisterVolunteer } from '../application/use-cases/register-volunteer';
import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';

class CreateSlotDto extends createZodDto(createSlotSchema) {}
class SlotDto extends createZodDto(slotSchema) {}
class SlotIdParamsDto extends createZodDto(slotIdParamsSchema) {}
class RegisterVolunteerDto extends createZodDto(registerVolunteerSchema) {}
class RegistrationDto extends createZodDto(registrationSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('volunteers')
@Controller('slots')
export class VolunteersController {
  constructor(
    private readonly openSlot: OpenSlot,
    private readonly registerVolunteer: RegisterVolunteer,
  ) {}

  @Post()
  @ZodSerializerDto(SlotDto)
  async open(@Body() body: CreateSlotDto): Promise<SlotResponse> {
    // Un créneau qui vient d'être ouvert n'a encore aucun inscrit.
    return toSlotResponse(await this.openSlot.execute(body), 0);
  }

  @Post(':slotId/registrations')
  @ZodSerializerDto(RegistrationDto)
  async register(
    @Param() { slotId }: SlotIdParamsDto,
    @Body() body: RegisterVolunteerDto,
  ): Promise<RegistrationResponse> {
    return toRegistrationResponse(await this.registerVolunteer.execute(slotId, body));
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

function toRegistrationResponse(registration: Registration): RegistrationResponse {
  return {
    id: registration.id,
    slotId: registration.slotId,
    name: registration.name,
    email: registration.email,
    createdAt: registration.createdAt.toISOString(),
  };
}
