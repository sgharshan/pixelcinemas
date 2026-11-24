import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MONGODB_URI: z.string().trim().min(1),
  JWT_SECRET: z.string().min(24),
  CLIENT_ORIGIN: z.url(),
  SEAT_HOLD_SECONDS: z.coerce.number().int().positive().default(300),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export function getEnvironment(source = process.env) {
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Invalid server environment: ${fields}`);
  }

  return {
    port: result.data.PORT,
    mongoUri: result.data.MONGODB_URI,
    jwtSecret: result.data.JWT_SECRET,
    clientOrigin: result.data.CLIENT_ORIGIN,
    seatHoldSeconds: result.data.SEAT_HOLD_SECONDS,
    nodeEnv: result.data.NODE_ENV,
  };
}
