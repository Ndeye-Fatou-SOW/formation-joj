import { z } from 'zod';

export const VOLUNTEER_NAME_MAX_LENGTH = 100;

/** Corps de `POST /api/slots`. */
export const createSlotSchema = z
  .object({
    disciplineId: z.uuid(),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    capacity: z.int().min(1),
  })
  .refine((input) => Date.parse(input.endsAt) > Date.parse(input.startsAt), {
    message: 'The slot must end after it starts',
    path: ['endsAt'],
  });
export type CreateSlotInput = z.infer<typeof createSlotSchema>;

/** Un créneau tel que l'API le renvoie. */
export const slotSchema = z.object({
  id: z.uuid(),
  disciplineId: z.uuid(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  capacity: z.int().min(1),
  registeredCount: z.int().min(0),
  createdAt: z.iso.datetime(),
});
export type SlotResponse = z.infer<typeof slotSchema>;

/** Paramètre `:slotId` des routes d'un créneau. */
export const slotIdParamsSchema = z.object({ slotId: z.uuid() });

/** Corps de `POST /api/slots/:slotId/registrations`. */
export const registerVolunteerSchema = z.object({
  name: z.string().trim().min(1).max(VOLUNTEER_NAME_MAX_LENGTH),
  email: z.string().trim().pipe(z.email()),
});
export type RegisterVolunteerInput = z.infer<typeof registerVolunteerSchema>;

/** Une inscription telle que l'API la renvoie. */
export const registrationSchema = z.object({
  id: z.uuid(),
  slotId: z.uuid(),
  name: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
});
export type RegistrationResponse = z.infer<typeof registrationSchema>;
