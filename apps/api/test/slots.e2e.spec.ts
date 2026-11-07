import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { disciplineSchema, slotSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

describe('/api/slots (e2e)', () => {
  let app: INestApplication;
  let disciplineId: string;
  const api = () => request(app.getHttpServer());

  const slotBody = (overrides: Record<string, unknown> = {}) => ({
    disciplineId,
    startsAt: '2026-11-02T09:00:00.000Z',
    endsAt: '2026-11-02T12:00:00.000Z',
    capacity: 2,
    ...overrides,
  });

  beforeAll(async () => {
    app = await createTestApp();
    const response = await api()
      .post('/api/disciplines')
      .send({ name: 'Lutte', category: 'sports-de-combat' })
      .expect(201);
    disciplineId = disciplineSchema.parse(response.body).id;
  });

  afterAll(() => app?.close());

  it('001-AS1: opens a slot (201) with its times, its capacity and no registration', async () => {
    const response = await api().post('/api/slots').send(slotBody()).expect(201);

    expect(slotSchema.parse(response.body)).toMatchObject({
      disciplineId,
      startsAt: '2026-11-02T09:00:00.000Z',
      endsAt: '2026-11-02T12:00:00.000Z',
      capacity: 2,
      registeredCount: 0,
    });
  });

  it.each([0, -1, 1.5])('001-AS2: rejects a capacity of %j (400, RFC 9457)', async (capacity) => {
    const response = await api().post('/api/slots').send(slotBody({ capacity })).expect(400);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(response.body.errors).toEqual([expect.objectContaining({ path: 'capacity' })]);
  });

  it.each(['2026-11-02T09:00:00.000Z', '2026-11-02T08:00:00.000Z'])(
    '001-AS2: rejects an end at %s, not after the start (400)',
    async (endsAt) => {
      const response = await api().post('/api/slots').send(slotBody({ endsAt })).expect(400);

      expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
      expect(response.body.errors).toEqual([expect.objectContaining({ path: 'endsAt' })]);
    },
  );

  it('001-AS3: rejects a slot for an unknown discipline (404)', async () => {
    const unknownId = randomUUID();
    const response = await api()
      .post('/api/slots')
      .send(slotBody({ disciplineId: unknownId }))
      .expect(404);

    expect(response.body).toMatchObject({
      status: 404,
      code: 'SLOT_DISCIPLINE_NOT_FOUND',
      details: { disciplineId: unknownId },
    });
  });
});
