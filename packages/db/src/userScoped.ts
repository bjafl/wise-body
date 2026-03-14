/**
 * Typed helpers that enforce userId in every Prisma where clause at compile time.
 *
 * Usage in API route handlers:
 *
 *   const entry = await prisma.energyEntry.findMany({
 *     where: userScoped(req.userId, { date: "2025-01-15" }),
 *   });
 *
 * This makes it impossible to accidentally omit the userId filter — the type
 * system will reject a query that doesn't satisfy UserScopedWhere<T>.
 */

export type UserScopedWhere<T extends object = object> = T & { userId: string };

export function userScoped<T extends object>(
  userId: string,
  extra?: T,
): UserScopedWhere<T> {
  return { ...((extra ?? {}) as T), userId };
}

/**
 * Wraps a Prisma create/update data payload with userId.
 * Useful so handlers never forget to stamp the owner on new rows.
 */
export function withUserId<T extends object>(
  userId: string,
  data: T,
): T & { userId: string } {
  return { ...data, userId };
}
