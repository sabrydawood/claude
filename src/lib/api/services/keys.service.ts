import { http } from '@/lib/api/http-client';
import type { TProvider } from '@/Features/Keys/Keys.Schemas';

export const KeysService = {
  saveKey: (apiKey: string, provider: TProvider) =>
    http.post<{ Ok: boolean; Hint: string; Provider: string }>('/api/v1/keys', { ApiKey: apiKey, Provider: provider }),

  deleteKey: () =>
    http.delete<{ Ok: boolean }>('/api/v1/keys'),
};
