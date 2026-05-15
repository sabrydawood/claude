import { http } from '@/lib/api/http-client';

export const KeysService = {
  saveKey: (apiKey: string) =>
    http.post<{ Ok: boolean; Hint: string }>('/api/v1/keys', { ApiKey: apiKey }),

  deleteKey: () =>
    http.delete<{ Ok: boolean }>('/api/v1/keys'),
};
