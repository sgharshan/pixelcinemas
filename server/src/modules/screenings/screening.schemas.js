import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid movie');
const layoutConfig = z.object({
  rows: z.array(z.string().trim().min(1).max(3)).min(1).max(26),
  seatsPerRow: z.coerce.number().int().min(1).max(40),
  accessibleSeats: z.array(z.string()).default([]),
  premiumRows: z.array(z.string()).default([]),
  reclinerRows: z.array(z.string()).default([]),
}).strict();
const prices = z.object({
  standard: z.coerce.number().min(0), premium: z.coerce.number().min(0).optional(), recliner: z.coerce.number().min(0).optional(),
}).strict();
const fields = {
  movieId: objectId,
  auditoriumName: z.string().trim().min(1).max(80),
  startsAt: z.coerce.date(),
  layoutConfig,
  prices,
  status: z.enum(['scheduled', 'cancelled', 'completed']).default('scheduled'),
};
export const createScreeningSchema = z.object(fields).strict();
export const updateScreeningSchema = z.object(fields).partial().strict().refine((data) => Object.keys(data).length > 0, 'Provide a field to update');
export const screeningQuerySchema = z.object({
  movieId: objectId.optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['scheduled', 'cancelled', 'completed']).optional(),
}).strict();
