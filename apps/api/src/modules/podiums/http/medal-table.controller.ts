import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { type MedalTableRow, medalTableRowSchema } from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { GetMedalTable } from '../application/use-cases/get-medal-table';

class MedalTableRowDto extends createZodDto(medalTableRowSchema) {}

/** Couche fine : appeler le cas d'usage et sérialiser. */
@ApiTags('podiums')
@Controller('medal-table')
export class MedalTableController {
  constructor(private readonly getMedalTable: GetMedalTable) {}

  @Get()
  @ZodSerializerDto([MedalTableRowDto])
  async get(): Promise<MedalTableRow[]> {
    return this.getMedalTable.execute();
  }
}
