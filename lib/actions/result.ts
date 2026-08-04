/** Standard server-action result envelope (Part 9.3). Never leak DB errors. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: { code: string; message: string; fields?: Record<string, string>; correlationId?: string } };

export function ok<T>(data?: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  code: string,
  message: string,
  fields?: Record<string, string>
): ActionResult<never> {
  return { ok: false, error: { code, message, fields, correlationId: crypto.randomUUID() } };
}
