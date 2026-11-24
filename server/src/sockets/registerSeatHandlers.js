import { seatHoldService as defaultService } from '../seats/SeatHoldService.js';
import { seatEvents } from './events.js';

const room = (screeningId) => `screening:${screeningId}`;
function grouped(holds) { return Map.groupBy(holds, (hold) => hold.screeningId); }

export function registerSeatHandlers(io, service = defaultService) {
  io.seatHoldService = service;
  const timer = setInterval(() => {
    for (const [screeningId, holds] of grouped(service.expire())) io.to(room(screeningId)).emit(seatEvents.RELEASED, { seatIds: holds.map((hold) => hold.seatId), reason: 'expired' });
  }, Math.max(25, Math.min(1_000, Math.floor(service.ttlMs / 2))));
  timer.unref?.();
  io.on('close', () => clearInterval(timer));
  io.on('connection', (socket) => {
    const ownerId = String(socket.handshake.auth?.ownerId || socket.id);
    socket.data.ownerId = ownerId;
    socket.on(seatEvents.JOIN, ({ screeningId } = {}, acknowledge = () => {}) => {
      if (!screeningId) return acknowledge({ ok: false, error: { code: 'INVALID_SCREENING', message: 'Choose a screening' } });
      socket.join(room(screeningId)); socket.data.screeningId = screeningId;
      const data = { holds: service.getActive(screeningId), bookedSeatIds: service.getBooked(screeningId) };
      socket.emit(seatEvents.STATE, data); return acknowledge({ ok: true, data });
    });
    socket.on(seatEvents.HOLD, ({ screeningId, seatIds } = {}, acknowledge = () => {}) => {
      if (!screeningId || !Array.isArray(seatIds) || !seatIds.length) return acknowledge({ ok: false, error: { code: 'INVALID_HOLD', message: 'Choose at least one seat' } });
      const result = service.hold(screeningId, seatIds, ownerId);
      if (!result.ok) return acknowledge({ ok: false, error: { code: 'SEAT_UNAVAILABLE', message: 'One or more seats are no longer available', seatIds: result.conflictSeatIds } });
      const data = { seatIds, ownerId, expiresAt: result.holds[0].expiresAt };
      io.to(room(screeningId)).emit(seatEvents.HELD, data); return acknowledge({ ok: true, data });
    });
    socket.on(seatEvents.RELEASE, ({ screeningId, seatIds } = {}, acknowledge = () => {}) => {
      const released = service.release(screeningId, seatIds ?? [], ownerId);
      if (released.length) io.to(room(screeningId)).emit(seatEvents.RELEASED, { seatIds: released.map((hold) => hold.seatId), reason: 'released' });
      acknowledge({ ok: true });
    });
    socket.on('disconnect', () => {
      for (const [screeningId, holds] of grouped(service.releaseOwner(ownerId))) io.to(room(screeningId)).emit(seatEvents.RELEASED, { seatIds: holds.map((hold) => hold.seatId), reason: 'disconnected' });
    });
  });
  return service;
}

export function broadcastBooked(io, screeningId, seatIds) { io?.to(room(screeningId)).emit(seatEvents.BOOKED, { seatIds }); }
