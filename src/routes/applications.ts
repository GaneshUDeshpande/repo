import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

const router = (await import('express')).Router();

router.get('/', async (_req: Request, res: Response, next) => {
  try {
    const eras = await prisma.era.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } });
    res.json({ ok: true, eras: eras.map((era) => ({ id: era.id, slug: era.slug, name: era.name, description: era.description, sortOrder: era.sortOrder })) });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req: Request, res: Response, next) => {
  try {
    const era = await prisma.era.findUnique({ where: { slug: req.params.slug } });
    if (!era) throw new AppError('Era not found', 404);
    res.json({ ok: true, era: { id: era.id, slug: era.slug, name: era.name, description: era.description, metadata: JSON.parse(era.metadata || '{}') } });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug/applications', async (req: Request, res: Response, next) => {
  try {
    const era = await prisma.era.findUnique({ where: { slug: req.params.slug } });
    if (!era) throw new AppError('Era not found', 404);

    const applications = await prisma.application.findMany({
      where: { eraId: era.id, active: true },
      orderBy: { name: 'asc' },
    });

    res.json({ ok: true, applications: applications.map((app) => ({ id: app.id, slug: app.slug, name: app.name, description: app.description, category: app.category, icon: app.icon })) });
  } catch (error) {
    next(error);
  }
});

export const eraRouter = router;
