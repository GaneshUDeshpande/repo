import { z } from 'zod';

export const createUserSchema = z.object({
  displayName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const desktopConfigSchema = z.object({
  wallpaper: z.string().min(2).max(60).optional(),
  theme: z.string().min(2).max(40).optional(),
  layout: z.array(z.object({ id: z.string(), x: z.number().min(0).max(2000), y: z.number().min(0).max(2000), width: z.number().min(100).max(2000), height: z.number().min(80).max(2000) })).max(50).optional(),
  iconArrangement: z.array(z.object({ id: z.string(), x: z.number().min(0).max(2000), y: z.number().min(0).max(2000) })).max(100).optional(),
  appPreferences: z.record(z.any()).optional(),
  configurationVersion: z.number().int().min(1).max(50).optional(),
});

export const activitySchema = z.object({
  slug: z.string().min(2).max(80),
  eraSlug: z.string().min(2).max(40),
  metadata: z.record(z.any()).optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(80).optional(),
  era: z.string().min(2).max(40).optional(),
  application: z.string().min(2).max(40).optional(),
  page: z.coerce.number().int().min(1).max(200).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});
