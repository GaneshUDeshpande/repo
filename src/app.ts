import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { AppError } from './utils/errors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { authRouter } from './routes/auth.js';
import { eraRouter } from './routes/eras.js';
import { applicationRouter } from './routes/applications.js';
import { collectibleRouter } from './routes/collectibles.js';
import { userRouter } from './routes/users.js';
import { searchRouter } from './routes/search.js';
import { healthRouter } from './routes/health.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN.split(',') }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(createRateLimiter({ windowMs: 60_000, max: 300 }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'internet-time-machine-backend', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/eras', eraRouter);
  app.use('/api/v1/applications', applicationRouter);
  app.use('/api/v1/collectibles', collectibleRouter);
  app.use('/api/v1/search', searchRouter);
  app.use('/api/v1/users', userRouter);

  app.use((_req, _res, next) => {
    next(new AppError('Route not found', 404));
  });

  app.use(errorHandler);

  return app;
}
