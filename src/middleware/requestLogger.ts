import type { NextFunction, Request, Response } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const requestId = Math.random().toString(36).slice(2, 10);
  const headers = { ...req.headers };
  if (headers.authorization) delete headers.authorization;
  console.info(`[${requestId}] ${req.method} ${req.originalUrl} ${JSON.stringify(headers)}`);
  next();
}
