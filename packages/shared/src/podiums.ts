import { z } from 'zod';

/** Statut d'un podium saisi, une fois comparé au résultat officiel. */
export const PODIUM_STATUSES = ['certifie', 'en-ecart', 'provisoire'] as const;
export const podiumStatusSchema = z.enum(PODIUM_STATUSES);
export type PodiumStatus = z.infer<typeof podiumStatusSchema>;

export const MEDALS = ['or', 'argent', 'bronze'] as const;
export const medalSchema = z.enum(MEDALS);
export type Medal = z.infer<typeof medalSchema>;

/** Code pays à trois lettres majuscules (CIV, EGY, SEN…). */
export const countryCodeSchema = z.string().regex(/^[A-Z]{3}$/, 'Expected a three-letter code');

export const PODIUM_TEXT_MAX_LENGTH = 100;

/** Corps de `POST /api/podiums`. */
export const submitPodiumSchema = z
  .object({
    journalist: z.string().trim().min(1).max(PODIUM_TEXT_MAX_LENGTH),
    event: z.string().trim().min(1).max(PODIUM_TEXT_MAX_LENGTH),
    gold: countryCodeSchema,
    silver: countryCodeSchema,
    bronze: countryCodeSchema,
  })
  .refine((p) => new Set([p.gold, p.silver, p.bronze]).size === 3, {
    message: 'A country appears twice on the podium',
    path: ['bronze'],
  });
export type SubmitPodiumInput = z.infer<typeof submitPodiumSchema>;

/** Paramètre `:id` de la route d'un podium. */
export const podiumIdParamsSchema = z.object({ id: z.uuid() });

/** Une médaille où le podium saisi diffère du résultat officiel. */
export const podiumGapSchema = z.object({
  medal: medalSchema,
  submitted: z.string(),
  official: z.string(),
});
export type PodiumGap = z.infer<typeof podiumGapSchema>;

/** Un podium tel que l'API le renvoie. */
export const podiumSchema = z.object({
  id: z.uuid(),
  journalist: z.string(),
  event: z.string(),
  gold: z.string(),
  silver: z.string(),
  bronze: z.string(),
  status: podiumStatusSchema,
  gaps: z.array(podiumGapSchema),
  submittedAt: z.iso.datetime(),
});
export type PodiumResponse = z.infer<typeof podiumSchema>;
