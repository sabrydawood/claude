/**
 * Auth.Types.ts
 * TypeScript types for the Auth feature.
 */
import type { auth } from './Auth.Config';

export type TSession = Awaited<ReturnType<typeof auth.api.getSession>>;
export type TUser = NonNullable<TSession>['user'];
