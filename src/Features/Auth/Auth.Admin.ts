/**
 * Auth.Admin.ts
 * Admin access check using ADMIN_EMAILS environment variable.
 */

/**
 * Checks whether an email is in the admin list.
 * @param Email - Email address to check
 */
export function IsAdminEmail(Email: string | null | undefined): boolean {
  if (!Email) return false;
  const Allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((E) => E.trim().toLowerCase())
    .filter(Boolean);
  return Allowed.includes(Email.toLowerCase());
}
