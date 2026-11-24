export class SeatHoldService {
  constructor({ ttlMs = 300_000, now = Date.now } = {}) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.holds = new Map();
    this.booked = new Map();
  }

  key(screeningId, seatId) { return `${screeningId}:${seatId}`; }

  expire() {
    const expired = [];
    const timestamp = this.now();
    for (const [key, hold] of this.holds) {
      if (hold.expiresAt <= timestamp) { this.holds.delete(key); expired.push(hold); }
    }
    return expired;
  }

  hold(screeningId, seatIds, ownerId) {
    this.expire();
    const uniqueIds = [...new Set(seatIds)];
    const conflictSeatIds = uniqueIds.filter((seatId) => {
      const existing = this.holds.get(this.key(screeningId, seatId));
      return this.booked.get(screeningId)?.has(seatId) || (existing && existing.ownerId !== ownerId);
    });
    if (conflictSeatIds.length) return { ok: false, conflictSeatIds };
    const expiresAt = this.now() + this.ttlMs;
    const holds = uniqueIds.map((seatId) => ({ screeningId, seatId, ownerId, expiresAt }));
    holds.forEach((hold) => this.holds.set(this.key(screeningId, hold.seatId), hold));
    return { ok: true, holds };
  }

  release(screeningId, seatIds, ownerId) {
    const released = [];
    for (const seatId of seatIds) {
      const key = this.key(screeningId, seatId); const hold = this.holds.get(key);
      if (hold?.ownerId === ownerId) { this.holds.delete(key); released.push(hold); }
    }
    return released;
  }

  releaseOwner(ownerId) {
    const released = [];
    for (const [key, hold] of this.holds) if (hold.ownerId === ownerId) { this.holds.delete(key); released.push(hold); }
    return released;
  }

  getActive(screeningId) { this.expire(); return [...this.holds.values()].filter((hold) => hold.screeningId === screeningId); }
  isHeldBy(screeningId, seatIds, ownerId) { this.expire(); return seatIds.every((seatId) => this.holds.get(this.key(screeningId, seatId))?.ownerId === ownerId); }
  getBooked(screeningId) { return [...(this.booked.get(screeningId) ?? [])]; }
  book(screeningId, seatIds, ownerId) {
    if (!this.isHeldBy(screeningId, seatIds, ownerId)) return false;
    const booked = this.booked.get(screeningId) ?? new Set(); seatIds.forEach((seatId) => booked.add(seatId)); this.booked.set(screeningId, booked);
    this.release(screeningId, seatIds, ownerId); return true;
  }
  unbook(screeningId, seatIds) { const booked = this.booked.get(screeningId); seatIds.forEach((seatId) => booked?.delete(seatId)); }
  clear() { this.holds.clear(); this.booked.clear(); }
}

export const seatHoldService = new SeatHoldService();
