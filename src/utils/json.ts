import { z } from 'zod';

export function parseJsonField(raw: string | null | undefined, fallback: unknown) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function safeBody<T>(schema: z.ZodType<T>, payload: unknown) {
  return schema.parse(payload);
}
