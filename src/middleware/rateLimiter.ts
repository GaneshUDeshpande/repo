import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

const hitStore = new Map<string, number[]>();

export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    const previous = hitStore.get(ip) ?? [];
    const fresh = previous.filter((timestamp) => now - timestamp < windowMs);
    fresh.push(now);
    hitStore.set(ip, fresh);

    if (fresh.length > max) {
      return next(new AppError('Rate limit exceeded', 429));
    }

    next();
  };
}
