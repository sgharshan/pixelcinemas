import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const preservedSockets = new Map();
export function disconnectPreservedSeatSocket(screeningId) { const socket = preservedSockets.get(screeningId); socket?.disconnect(); preservedSockets.delete(screeningId); }

function sessionOwnerId() {
  const stored = sessionStorage.getItem('pixel-seat-owner');
  if (stored) return stored;
  const created = crypto.randomUUID(); sessionStorage.setItem('pixel-seat-owner', created); return created;
}

export function useSeatSocket(screeningId, options = {}) {
  const ownerId = useMemo(() => options.ownerId ?? sessionOwnerId(), [options.ownerId]);
  const socketFactoryRef = useRef(options.socketFactory);
  const preserveRef = useRef(false);
  const deferredDisconnectRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false); const [holds, setHolds] = useState([]); const [bookedSeatIds, setBooked] = useState([]); const [error, setError] = useState('');
  const replaceState = useCallback((data) => { setHolds(data.holds ?? []); setBooked(data.bookedSeatIds ?? []); }, []);
  useEffect(() => {
    const socketFactory = socketFactoryRef.current ?? ((url, config) => io(url, config));
    const socket = socketFactory(import.meta.env.VITE_SOCKET_URL ?? window.location.origin, { auth: { ownerId }, autoConnect: false }); socketRef.current = socket;
    socket.on('connect', () => { setConnected(true); socket.emit('screening:join', { screeningId }, (result) => { if (result.ok) replaceState(result.data); else setError(result.error.message); }); });
    socket.on('disconnect', () => setConnected(false)); socket.on('seat:state', replaceState);
    socket.on('seat:held', (data) => setHolds((current) => [...current.filter((hold) => !data.seatIds.includes(hold.seatId)), ...data.seatIds.map((seatId) => ({ seatId, ownerId: data.ownerId, expiresAt: data.expiresAt }))]));
    socket.on('seat:released', ({ seatIds }) => setHolds((current) => current.filter((hold) => !seatIds.includes(hold.seatId))));
    socket.on('seat:booked', ({ seatIds }) => { setHolds((current) => current.filter((hold) => !seatIds.includes(hold.seatId))); setBooked((current) => [...new Set([...current, ...seatIds])]); });
    socket.connect(); return () => { if (preserveRef.current) { deferredDisconnectRef.current = setTimeout(() => { socket.disconnect(); preservedSockets.delete(screeningId); socketRef.current = null; }, 310_000); } else { socket.disconnect(); socketRef.current = null; } };
  }, [ownerId, replaceState, screeningId]);
  const holdSeats = useCallback((seatIds) => new Promise((resolve) => socketRef.current.emit('seat:hold', { screeningId, seatIds }, (result) => { if (!result.ok) setError(result.error.message); resolve(result); })), [screeningId]);
  const releaseSeats = useCallback((seatIds) => new Promise((resolve) => socketRef.current.emit('seat:release', { screeningId, seatIds }, resolve)), [screeningId]);
  const unavailableSeatIds = [...holds.filter((hold) => hold.ownerId !== ownerId).map((hold) => hold.seatId), ...bookedSeatIds];
  const myHolds = holds.filter((hold) => hold.ownerId === ownerId);
  const preserveConnection = () => { preserveRef.current = true; if (socketRef.current) preservedSockets.set(screeningId, socketRef.current); };
  const disconnect = () => { clearTimeout(deferredDisconnectRef.current); socketRef.current?.disconnect(); preservedSockets.delete(screeningId); socketRef.current = null; };
  return { connected, error, ownerId, holds, myHolds, bookedSeatIds, unavailableSeatIds, holdSeats, releaseSeats, preserveConnection, disconnect };
}
