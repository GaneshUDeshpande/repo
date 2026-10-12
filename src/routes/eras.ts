import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { parseJsonField } from '../utils/json.js';

const router = (await import('express')).Router();
router.use(requireAuth);

router.get('/me/progress', async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId;
    const records = await prisma.userProgress.findMany({
      where: { userId },
      include: { era: true },
    });

    res.json({
      ok: true,
      progress: records.map((record) => ({
        era: { id: record.era.id, slug: record.era.slug, name: record.era.name },
        progress: parseJsonField(record.progress, {}),
        completedActivities: parseJsonField(record.completedActivities, []),
        lastActivityAt: record.lastActivityAt,
        metadata: parseJsonField(record.metadata, {}),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/me/progress/activities', async (req: Request, res: Response, next) => {
  try {
    const { slug, eraSlug, metadata = {} } = req.body ?? {};
    if (!slug || !eraSlug) throw new AppError('Invalid activity payload', 400);

    const era = await prisma.era.findUnique({ where: { slug: eraSlug } });
    if (!era) throw new AppError('Era not found', 404);

    const activity = await prisma.activityDefinition.findUnique({ where: { slug } });
    if (!activity) throw new AppError('Activity definition not found', 404);

    const existing = await prisma.userProgress.findUnique({ where: { userId_eraId: { userId: req.user!.userId, eraId: era.id } } });
    const completed = parseJsonField(existing?.completedActivities, []);
    const nextCompleted = Array.from(new Set([...completed, slug]));

    const progress = await prisma.userProgress.upsert({
      where: { userId_eraId: { userId: req.user!.userId, eraId: era.id } },
      create: {
        userId: req.user!.userId,
        eraId: era.id,
        progress: JSON.stringify({ lastActivity: slug, ...metadata }),
        completedActivities: JSON.stringify(nextCompleted),
        lastActivityAt: new Date(),
        metadata: JSON.stringify({ lastActivity: slug }),
      },
      update: {
        progress: JSON.stringify({ lastActivity: slug, ...metadata }),
        completedActivities: JSON.stringify(nextCompleted),
        lastActivityAt: new Date(),
        metadata: JSON.stringify({ lastActivity: slug }),
      },
    });

    res.status(201).json({ ok: true, progress: { id: progress.id, completedActivities: nextCompleted } });
  } catch (error) {
    next(error);
  }
});

router.get('/me/collectibles', async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId;
    const records = await prisma.userCollectible.findMany({
      where: { userId },
      include: { collectible: true },
    });

    res.json({
      ok: true,
      collectibles: records.map((record) => ({
        id: record.collectible.id,
        slug: record.collectible.slug,
        name: record.collectible.name,
        description: record.collectible.description,
        category: record.collectible.category,
        rarity: record.collectible.rarity,
        unlockedAt: record.unlockedAt,
        acquisitionSource: record.acquisitionSource,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/me/collectibles/resolve', async (req: Request, res: Response, next) => {
  try {
    const { activitySlug, collectibleSlug } = req.body ?? {};
    if (!activitySlug || !collectibleSlug) throw new AppError('Missing activity or collectible slug', 400);

    const activity = await prisma.activityDefinition.findUnique({ where: { slug: activitySlug } });
    if (!activity) throw new AppError('Activity definition not found', 404);

    const collectible = await prisma.collectible.findUnique({ where: { slug: collectibleSlug } });
    if (!collectible) throw new AppError('Collectible not found', 404);

    const payload = parseJsonField(activity.collectibleUnlocks, []);
    const eligible = Array.isArray(payload) ? payload.includes(collectible.id) : false;
    if (!eligible) throw new AppError('Collectible is not unlockable via this activity', 400);

    const existing = await prisma.userCollectible.findUnique({
      where: { userId_collectibleId: { userId: req.user!.userId, collectibleId: collectible.id } },
    });

    if (existing) {
      return res.json({ ok: true, award: { status: 'already-unlocked', collectibleId: collectible.id } });
    }

    const unlocked = await prisma.userCollectible.create({
      data: {
        userId: req.user!.userId,
        collectibleId: collectible.id,
        acquisitionSource: activitySlug,
        metadata: JSON.stringify({ activitySlug }),
      },
    });

    res.status(201).json({ ok: true, award: { status: 'unlocked', collectibleId: unlocked.collectibleId } });
  } catch (error) {
    next(error);
  }
});

export const userRouter = router;
