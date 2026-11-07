import { type PodiumResponse, podiumSchema, type SubmitPodiumInput } from '@joj/shared';
import { api } from '@/lib/api';

/** Les appels HTTP de la fonctionnalité Podiums, réponse validée par le schéma partagé. */
export const podiumsApi = {
  submit: (input: SubmitPodiumInput) =>
    api.request<PodiumResponse>('/podiums', { method: 'POST', body: input, schema: podiumSchema }),
};
