import { Injectable } from '@nestjs/common';
import { computeMedalTable, type MedalTableRow } from '../../domain/medal-table';
import { OfficialResults } from '../podium.repository';

@Injectable()
export class GetMedalTable {
  constructor(private readonly officialResults: OfficialResults) {}

  /** Seuls les résultats officiels comptent, jamais les podiums saisis. */
  async execute(): Promise<MedalTableRow[]> {
    return computeMedalTable(await this.officialResults.all());
  }
}
