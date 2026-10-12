import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { searchSchema } from '../utils/validation.js';

const router = (await import('express')).Router();

router.get('/', async (req: Request, res: Response, next) => {
  try {
    const query = searchSchema.parse({ ...req.query, page: req.query.page ?? 1, pageSize: req.query.pageSize ?? 10 });
    const where = {
      OR: [
        { title: { contains: query.query ?? '' } },
        { body: { contains: query.query ?? '' } },
        { tags: { contains: query.query ?? '' } },
      ],
      ...(query.era ? { era: { slug: query.era } } : {}),
      ...(query.application ? { application: { slug: query.application } } : {}),
      status: 'published',
    };

    const results = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { era: true, application: true },
    });

    const total = await prisma.contentItem.count({ where });

    res.json({ ok: true, page: query.page, pageSize: query.pageSize, total, results: results.map((item) => ({ id: item.id, title: item.title, contentType: item.contentType, era: item.era?.slug ?? null, application: item.application?.slug ?? null, tags: JSON.parse(item.tags || '[]') })) });
  } catch (error) {
    next(error);
  }
});

export const searchRouter = router;
