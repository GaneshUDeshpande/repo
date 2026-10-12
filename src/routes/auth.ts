import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors.js';
import { createUserSchema, loginSchema } from '../utils/validation.js';

export const authRouter = (async () => {
  const router = (await import('express')).Router();

  router.post('/register', async (req, res, next) => {
    try {
      const payload = createUserSchema.parse(req.body);
      const email = payload.email && payload.email.trim().length ? payload.email.trim().toLowerCase() : null;
      const passwordHash = await bcrypt.hash(payload.password, 10);

      const user = await prisma.user.create({
        data: {
          displayName: payload.displayName.trim(),
          email: email ?? undefined,
          passwordHash,
        },
      });

      const token = jwt.sign({ userId: user.id, email: user.email, displayName: user.displayName }, env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ ok: true, token, user: { id: user.id, displayName: user.displayName, email: user.email } });
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const payload = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });

      if (!user || !user.passwordHash) {
        throw new AppError('Invalid credentials', 401);
      }

      const valid = await bcrypt.compare(payload.password, user.passwordHash);
      if (!valid) throw new AppError('Invalid credentials', 401);

      const token = jwt.sign({ userId: user.id, email: user.email, displayName: user.displayName }, env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ ok: true, token, user: { id: user.id, displayName: user.displayName, email: user.email } });
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication required', 401);
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) throw new AppError('User not found', 404);

      res.json({ ok: true, user: { id: user.id, displayName: user.displayName, email: user.email } });
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout', (_req, res) => {
    res.json({ ok: true, message: 'Logged out successfully' });
  });

  return router;
})();
