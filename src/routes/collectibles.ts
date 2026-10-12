import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

const router = (await import('express')).Router();

router.get('/', async (req: Request, res: Response, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const era = typeof req.query.era === 'string' ? req.query.era : undefined;

    const applications = await prisma.application.findMany({
      where: { active: true, ...(era ? { era: { slug: era } } : {}) },
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.application.count({ where: { active: true, ...(era ? { era: { slug: era } } : {}) } });
    res.json({ ok: true, page, pageSize, total, applications: applications.map((app) => ({ id: app.id, slug: app.slug, name: app.name, description: app.description, category: app.category, icon: app.icon })) });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req: Request, res: Response, next) => {
  try {
    const app = await prisma.application.findUnique({ where: { slug: req.params.slug } });
    if (!app) throw new AppError('Application not found', 404);

    res.json({ ok: true, application: { id: app.id, slug: app.slug, name: app.name, description: app.description, category: app.category, icon: app.icon, config: JSON.parse(app.config || '{}') } });
  } catch (error) {
    next(error);
  }
});

export const applicationRouter = router;
