import type { INestApplication } from '@nestjs/common';
import { medalTableSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

describe('/api/medal-table (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app?.close());

  it('005-AS1: returns the official medal table, sorted', async () => {
    const response = await api().get('/api/medal-table').expect(200);

    const table = medalTableSchema.parse(response.body);
    expect(table[0]).toMatchObject({ country: 'USA', gold: 1, silver: 1, total: 2 });
    expect(table.find((r) => r.country === 'SEN')).toMatchObject({ gold: 1, bronze: 1, total: 2 });
  });

  it('005-AS3: ignores podiums submitted by journalists', async () => {
    const before = (await api().get('/api/medal-table').expect(200)).body;

    await api()
      .post('/api/podiums')
      .send({ journalist: 'Awa', event: '100 m filles', gold: 'EGY', silver: 'CIV', bronze: 'JPN' })
      .expect(201);

    const after = (await api().get('/api/medal-table').expect(200)).body;
    expect(after).toEqual(before);
  });
});
