import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { disciplineSchema, registrationSchema, slotSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

describe('/api/slots/:slotId/registrations (e2e)', () => {
  let app: INestApplication;
  let disciplineId: string;
  const api = () => request(app.getHttpServer());

  /** Un créneau neuf de capacité 2 pour chaque test. */
  async function openSlot(): Promise<string> {
    const response = await api()
      .post('/api/slots')
      .send({
        disciplineId,
        startsAt: '2026-11-02T09:00:00.000Z',
        endsAt: '2026-11-02T12:00:00.000Z',
        capacity: 2,
      })
      .expect(201);
    return slotSchema.parse(response.body).id;
  }

  const register = (slotId: string, body: Record<string, unknown>) =>
    api().post(`/api/slots/${slotId}/registrations`).send(body);

  beforeAll(async () => {
    app = await createTestApp();
    const response = await api()
      .post('/api/disciplines')
      .send({ name: 'Lutte', category: 'sports-de-combat' })
      .expect(201);
    disciplineId = disciplineSchema.parse(response.body).id;
  });

  afterAll(() => app?.close());

  it('001-AS4: registers a volunteer (201) with their name and email', async () => {
    const slotId = await openSlot();

    const response = await register(slotId, {
      name: 'Awa Diop',
      email: 'awa@example.sn',
    }).expect(201);

    expect(registrationSchema.parse(response.body)).toMatchObject({
      slotId,
      name: 'Awa Diop',
      email: 'awa@example.sn',
    });
  });

  it('001-AS5: refuses a third volunteer with SLOT_FULL (409)', async () => {
    const slotId = await openSlot();
    await register(slotId, { name: 'Awa Diop', email: 'awa@example.sn' }).expect(201);
    await register(slotId, { name: 'Moussa Ba', email: 'moussa@example.sn' }).expect(201);

    const response = await register(slotId, {
      name: 'Fatou Sarr',
      email: 'fatou@example.sn',
    }).expect(409);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({
      status: 409,
      code: 'SLOT_FULL',
      details: { slotId, capacity: 2 },
    });
  });

  it.each([
    [{ name: '', email: 'awa@example.sn' }, 'name'],
    [{ name: 'x'.repeat(101), email: 'awa@example.sn' }, 'name'],
    [{ name: 'Awa Diop', email: 'awa@' }, 'email'],
    [{ name: 'Awa Diop', email: 'a'.repeat(250) + '@example.sn' }, 'email'],
  ])('001-AS6: rejects an invalid registration %j (400, RFC 9457)', async (body, path) => {
    const slotId = await openSlot();

    const response = await register(slotId, body).expect(400);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(response.body.errors).toEqual([expect.objectContaining({ path })]);
  });

  it('001-AS7: rejects a registration on an unknown slot (404)', async () => {
    const unknownId = randomUUID();

    const response = await register(unknownId, {
      name: 'Awa Diop',
      email: 'awa@example.sn',
    }).expect(404);

    expect(response.body).toMatchObject({
      status: 404,
      code: 'SLOT_NOT_FOUND',
      details: { id: unknownId },
    });
  });
});
