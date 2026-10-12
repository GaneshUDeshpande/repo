import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

const router = (await import('express')).Router();

router.get('/', async (_req: Request, res: Response, next) => {
  try {
    const collectibles = await prisma.collectible.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    res.json({ ok: true, collectibles: collectibles.map((item) => ({ id: item.id, slug: item.slug, name: item.name, description: item.description, category: item.category, rarity: item.rarity, assetReference: item.assetReference, unlockRequirements: JSON.parse(item.unlockRequirements || '{}') })) });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req: Request, res: Response, next) => {
  try {
    const collectible = await prisma.collectible.findUnique({ where: { slug: req.params.slug } });
    if (!collectible) throw new AppError('Collectible not found', 404);
    res.json({ ok: true, collectible: { id: collectible.id, slug: collectible.slug, name: collectible.name, description: collectible.description, category: collectible.category, rarity: collectible.rarity, unlockRequirements: JSON.parse(collectible.unlockRequirements || '{}') } });
  } catch (error) {
    next(error);
  }
});

export const collectibleRouter = router;
