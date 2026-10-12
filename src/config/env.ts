import { config as loadEnv } from 'dotenv';

loadEnv();

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret',
  DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
};
