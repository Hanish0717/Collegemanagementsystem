import { ZodError } from 'zod';

export function zodToFormErrors(err: ZodError) {
  const out: Record<string, string> = {};
  for (const e of err.errors) {
    const key = e.path[0] ? String(e.path[0]) : '_';
    if (!out[key]) out[key] = e.message;
  }
  return out;
}
