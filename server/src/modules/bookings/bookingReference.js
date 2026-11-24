import { randomBytes } from 'node:crypto';
export function generateBookingReference() { return `PX-${randomBytes(4).toString('hex').toUpperCase()}`; }
