import { z } from 'zod';
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const createBookingSchema = z.object({ screeningId: objectId, seatIds: z.array(z.string().regex(/^[A-Z]{1,3}-\d+$/)).min(1).max(10), holdOwnerId: z.string().min(1).max(100), total: z.number().optional() }).strict();
export const bookingStatusSchema = z.object({ status: z.enum(['confirmed', 'cancelled']) }).strict();
