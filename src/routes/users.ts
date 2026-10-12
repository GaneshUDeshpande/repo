import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { parseJsonField } from '../utils/json.js';

const router = (await import('express')).Router();

router.use(requireAuth);

router.get('/me/desktop', async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId;
    const config = await prisma.desktopConfiguration.findUnique({ where: { userId } });
    if (!config) {
      const defaults = {
        wallpaper: 'classic-grid',
        theme: 'classic',
        layout: [],
        iconArrangement: [],
        appPreferences: {},
        configurationVersion: 1,
      };
      return res.json({ ok: true, desktop: defaults });
    }

    res.json({
      ok: true,
      desktop: {
        wallpaper: config.wallpaper,
        theme: config.theme,
        layout: parseJsonField(config.layout, []),
        iconArrangement: parseJsonField(config.iconArrangement, []),
        appPreferences: parseJsonField(config.appPreferences, {}),
        configurationVersion: config.configurationVersion,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/me/desktop', async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId;
    const payload = req.body ?? {};
    const safeFields = {
      wallpaper: typeof payload.wallpaper === 'string' ? payload.wallpaper : undefined,
      theme: typeof payload.theme === 'string' ? payload.theme : undefined,
      layout: Array.isArray(payload.layout) ? payload.layout : undefined,
      iconArrangement: Array.isArray(payload.iconArrangement) ? payload.iconArrangement : undefined,
      appPreferences: payload.appPreferences && typeof payload.appPreferences === 'object' ? payload.appPreferences : undefined,
      configurationVersion: Number.isInteger(payload.configurationVersion) ? payload.configurationVersion : undefined,
    };

    if (
      safeFields.wallpaper && !['classic-grid', 'neon-grid', 'sunset-pixel', 'dark-collage'].includes(safeFields.wallpaper)
    ) {
      throw new AppError('Unsupported wallpaper asset', 400);
    }

    if (safeFields.theme && !['classic', 'retro', 'dark', 'minimal'].includes(safeFields.theme)) {
      throw new AppError('Unsupported theme', 400);
    }

    if (safeFields.layout && safeFields.layout.length > 50) {
      throw new AppError('Layout item limit exceeded', 400);
    }

    const config = await prisma.desktopConfiguration.upsert({
      where: { userId },
      create: {
        userId,
        wallpaper: safeFields.wallpaper ?? 'classic-grid',
        theme: safeFields.theme ?? 'classic',
        layout: JSON.stringify(safeFields.layout ?? []),
        iconArrangement: JSON.stringify(safeFields.iconArrangement ?? []),
        appPreferences: JSON.stringify(safeFields.appPreferences ?? {}),
        configurationVersion: safeFields.configurationVersion ?? 1,
      },
      update: {
        ...(safeFields.wallpaper ? { wallpaper: safeFields.wallpaper } : {}),
        ...(safeFields.theme ? { theme: safeFields.theme } : {}),
        ...(safeFields.layout ? { layout: JSON.stringify(safeFields.layout) } : {}),
        ...(safeFields.iconArrangement ? { iconArrangement: JSON.stringify(safeFields.iconArrangement) } : {}),
        ...(safeFields.appPreferences ? { appPreferences: JSON.stringify(safeFields.appPreferences) } : {}),
        ...(safeFields.configurationVersion ? { configurationVersion: safeFields.configurationVersion } : {}),
      },
    });

    res.json({
      ok: true,
      desktop: {
        wallpaper: config.wallpaper,
        theme: config.theme,
        layout: parseJsonField(config.layout, []),
        iconArrangement: parseJsonField(config.iconArrangement, []),
        appPreferences: parseJsonField(config.appPreferences, {}),
        configurationVersion: config.configurationVersion,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/me/desktop/reset', async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId;
    const result = await prisma.desktopConfiguration.upsert({
      where: { userId },
      create: {
        userId,
        wallpaper: 'classic-grid',
        theme: 'classic',
        layout: JSON.stringify([]),
        iconArrangement: JSON.stringify([]),
        appPreferences: JSON.stringify({}),
        configurationVersion: 1,
      },
      update: {
        wallpaper: 'classic-grid',
        theme: 'classic',
        layout: JSON.stringify([]),
        iconArrangement: JSON.stringify([]),
        appPreferences: JSON.stringify({}),
        configurationVersion: 1,
      },
    });

    res.json({ ok: true, desktop: { wallpaper: result.wallpaper, theme: result.theme, layout: [], iconArrangement: [], appPreferences: {}, configurationVersion: result.configurationVersion } });
  } catch (error) {
    next(error);
  }
});

export const userRouter = router;
