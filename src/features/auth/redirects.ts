import { routes } from "@/config/site";

/**
 * Where to go after signing in: a path inside KHITTA, never another site
 * ("//evil.com" or a full URL fall back to My projects).
 */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : routes.projects;
}
