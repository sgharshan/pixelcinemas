import { broadcastBooked } from '../../sockets/registerSeatHandlers.js';
import { cancelBooking, createBooking, deleteBooking, getBooking, listAllBookings, listMyBookings } from './booking.service.js';
export async function create(request, response) { const booking = await createBooking({ userId: request.user.id, ...request.body, holdService: request.app.locals.seatHoldService }); broadcastBooked(request.app.locals.io, request.body.screeningId, request.body.seatIds); response.status(201).json({ booking }); }
export async function mine(request, response) { response.json({ bookings: await listMyBookings(request.user.id) }); }
export async function list(_request, response) { response.json({ bookings: await listAllBookings() }); }
export async function detail(request, response) { response.json({ booking: await getBooking(request.params.id, request.user) }); }
export async function cancel(request, response) { response.json({ booking: await cancelBooking(request.params.id, request.user, request.app.locals.seatHoldService) }); }
export async function remove(request, response) { await deleteBooking(request.params.id); response.status(204).end(); }
