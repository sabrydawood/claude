/**
 * Api.Types.ts
 * Standard API response types used across all endpoints.
 */

export interface TApiMeta {
  Page: number;
  Limit: number;
  Total: number;
}

export interface TApiSuccess<T> {
  Success: true;
  Data: T;
  Message?: string;
  Meta?: TApiMeta;
}

export interface TApiError {
  Success: false;
  Error: {
    Code: string;
    Details?: Record<string, string[]>;
  };
}

export type TApiResponse<T> = TApiSuccess<T> | TApiError;
