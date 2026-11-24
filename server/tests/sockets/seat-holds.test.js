import { createServer } from 'node:http';
import { io as createClient } from 'socket.io-client';
import { Server } from 'socket.io';
import { createApp } from '../../src/app.js';
import { SeatHoldService } from '../../src/seats/SeatHoldService.js';
import { registerSeatHandlers } from '../../src/sockets/registerSeatHandlers.js';

let httpServer; let io; let url; const clients = [];
beforeEach(async () => {
  httpServer = createServer(createApp());
  io = new Server(httpServer, { cors: { origin: '*' } });
  registerSeatHandlers(io, new SeatHoldService({ ttlMs: 150 }));
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${httpServer.address().port}`;
});
afterEach(async () => { clients.forEach((client) => client.disconnect()); clients.length = 0; await io.close(); });
function client(ownerId) { const socket = createClient(url, { auth: { ownerId }, transports: ['websocket'] }); clients.push(socket); return socket; }
function emit(socket, event, payload) { return new Promise((resolve) => socket.emit(event, payload, resolve)); }
function once(socket, event) { return new Promise((resolve) => socket.once(event, resolve)); }

test('broadcasts holds, rejects conflicts and isolates screening rooms', async () => {
  const a = client('alex'); const b = client('sam'); const other = client('other');
  await Promise.all([emit(a, 'screening:join', { screeningId: 'show-1' }), emit(b, 'screening:join', { screeningId: 'show-1' }), emit(other, 'screening:join', { screeningId: 'show-2' })]);
  const broadcast = once(b, 'seat:held');
  const result = await emit(a, 'seat:hold', { screeningId: 'show-1', seatIds: ['A-1'] });
  expect(result.ok).toBe(true); expect((await broadcast).seatIds).toEqual(['A-1']);
  expect(await emit(b, 'seat:hold', { screeningId: 'show-1', seatIds: ['A-1'] })).toMatchObject({ ok: false, error: { code: 'SEAT_UNAVAILABLE' } });
  expect(other.listeners('seat:held')).toHaveLength(0);
});

test('releases holds on disconnect', async () => {
  const a = client('alex'); const b = client('sam');
  await Promise.all([emit(a, 'screening:join', { screeningId: 'show-1' }), emit(b, 'screening:join', { screeningId: 'show-1' })]);
  await emit(a, 'seat:hold', { screeningId: 'show-1', seatIds: ['A-1'] });
  const released = once(b, 'seat:released'); a.disconnect();
  expect((await released).seatIds).toEqual(['A-1']);
});
