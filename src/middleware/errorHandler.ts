import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ok: false,
      message: error.message,
      details: error.details ?? null,
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }

  return res.status(500).json({ ok: false, message: 'Unexpected error' });
}
