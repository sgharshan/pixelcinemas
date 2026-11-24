import { renderHook, waitFor } from '@testing-library/react';
import { useSeatSocket } from './useSeatSocket.js';

class FakeSocket {
  constructor() { this.handlers = {}; this.connected = false; }
  on(event, handler) { this.handlers[event] = handler; return this; }
  off(event) { delete this.handlers[event]; return this; }
  emit(event, payload, acknowledgement) { if (event === 'screening:join') acknowledgement?.({ ok: true, data: { holds: [{ seatId: 'A-1', ownerId: 'other' }], bookedSeatIds: ['B-1'] } }); }
  connect() { this.connected = true; this.handlers.connect?.(); }
  disconnect() { this.connected = false; }
}

test('replaces state on join and cleans up the socket', async () => {
  const socket = new FakeSocket();
  const { result, unmount } = renderHook(() => useSeatSocket('show-1', { socketFactory: () => socket, ownerId: 'alex' }));
  await waitFor(() => expect(result.current.connected).toBe(true));
  expect(result.current.unavailableSeatIds).toEqual(['A-1', 'B-1']);
  unmount(); expect(socket.connected).toBe(false);
});
