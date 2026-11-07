import type { INestApplication } from '@nestjs/common';
import { podiumSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

describe('/api/podiums (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());
  const awa = { journalist: 'Awa', event: '100 m filles' };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app?.close());

  it('004-AS1: certifies a podium identical to the official result', async () => {
    const response = await api()
      .post('/api/podiums')
      .send({ ...awa, gold: 'CIV', silver: 'EGY', bronze: 'JPN' })
      .expect(201);

    expect(podiumSchema.parse(response.body)).toMatchObject({ status: 'certifie', gaps: [] });
  });

  it('004-AS2: flags a podium that differs and lists the gaps', async () => {
    const response = await api()
      .post('/api/podiums')
      .send({ ...awa, gold: 'EGY', silver: 'CIV', bronze: 'JPN' })
      .expect(201);

    expect(response.body).toMatchObject({
      status: 'en-ecart',
      gaps: [
        { medal: 'or', submitted: 'EGY', official: 'CIV' },
        { medal: 'argent', submitted: 'CIV', official: 'EGY' },
      ],
    });
  });

  it('004-AS3: keeps a podium provisional when there is no official result', async () => {
    const response = await api()
      .post('/api/podiums')
      .send({
        journalist: 'Awa',
        event: '1500 m garçons',
        gold: 'JPN',
        silver: 'CHN',
        bronze: 'CIV',
      })
      .expect(201);

    expect(response.body).toMatchObject({ status: 'provisoire', gaps: [] });
  });

  it('004-AS4: rejects an invalid submission (400)', async () => {
    for (const body of [
      { ...awa, journalist: '', gold: 'CIV', silver: 'EGY', bronze: 'JPN' },
      { ...awa, event: ' ', gold: 'CIV', silver: 'EGY', bronze: 'JPN' },
      { ...awa, gold: 'ci', silver: 'EGY', bronze: 'JPN' },
      { ...awa, gold: 'CIV', silver: 'CIV', bronze: 'JPN' },
    ]) {
      const response = await api().post('/api/podiums').send(body).expect(400);
      expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    }
  });

  it('004-AS5: returns a podium by id, and 404 for an unknown id', async () => {
    const created = await api()
      .post('/api/podiums')
      .send({ ...awa, gold: 'EGY', silver: 'CIV', bronze: 'JPN' })
      .expect(201);

    const found = await api().get(`/api/podiums/${created.body.id}`).expect(200);
    expect(found.body).toMatchObject({ event: '100 m filles', status: 'en-ecart' });
    expect(found.body.gaps).toHaveLength(2);

    const missing = await api()
      .get('/api/podiums/0199f5c2-0000-7000-8000-000000000000')
      .expect(404);
    expect(missing.body).toMatchObject({ code: 'PODIUM_NOT_FOUND' });
  });
});
