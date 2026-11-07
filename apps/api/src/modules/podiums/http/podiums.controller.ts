import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  podiumIdParamsSchema,
  type PodiumResponse,
  podiumSchema,
  submitPodiumSchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { GetPodium } from '../application/use-cases/get-podium';
import { SubmitPodium } from '../application/use-cases/submit-podium';
import type { Podium } from '../domain/podium';

class SubmitPodiumDto extends createZodDto(submitPodiumSchema) {}
class PodiumIdParamsDto extends createZodDto(podiumIdParamsSchema) {}
class PodiumDto extends createZodDto(podiumSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('podiums')
@Controller('podiums')
export class PodiumsController {
  constructor(
    private readonly submitPodium: SubmitPodium,
    private readonly getPodium: GetPodium,
  ) {}

  @Post()
  @ZodSerializerDto(PodiumDto)
  async submit(@Body() body: SubmitPodiumDto): Promise<PodiumResponse> {
    return toResponse(await this.submitPodium.execute(body));
  }

  @Get(':id')
  @ZodSerializerDto(PodiumDto)
  async get(@Param() { id }: PodiumIdParamsDto): Promise<PodiumResponse> {
    return toResponse(await this.getPodium.execute(id));
  }
}

function toResponse(podium: Podium): PodiumResponse {
  return {
    id: podium.id,
    journalist: podium.journalist,
    event: podium.event,
    gold: podium.gold,
    silver: podium.silver,
    bronze: podium.bronze,
    status: podium.status,
    gaps: [...podium.gaps],
    submittedAt: podium.submittedAt.toISOString(),
  };
}
