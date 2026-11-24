import mongoose from 'mongoose';
import { AppError } from '../../middleware/errorHandler.js';
import { Booking } from '../../models/Booking.js';
import { Screening } from '../../models/Screening.js';
import { calculatePrice } from '../../seats/pricing.js';
import { generateBookingReference } from './bookingReference.js';

const populate = [{ path: 'screening', populate: { path: 'movie', select: 'title posterUrl ageRating durationMinutes' } }, { path: 'user', select: 'name email' }];
function id(value) { if (!mongoose.isValidObjectId(value)) throw new AppError('INVALID_ID', 'Invalid booking identifier', 400); }

export async function createBooking({ userId, screeningId, seatIds, holdOwnerId, holdService }) {
  const screening = await Screening.findById(screeningId);
  if (!screening) throw new AppError('SCREENING_NOT_FOUND', 'Screening not found', 404);
  if (screening.status !== 'scheduled' || screening.startsAt <= new Date()) throw new AppError('SCREENING_UNAVAILABLE', 'This screening can no longer be booked', 409);
  const seats = seatIds.map((seatId) => screening.seatLayout.find((seat) => seat.id === seatId));
  if (seats.some((seat) => !seat)) throw new AppError('INVALID_SEAT', 'One or more seats do not exist', 400);
  if (!holdService.isHeldBy(screeningId, seatIds, holdOwnerId)) throw new AppError('HOLD_REQUIRED', 'Your seat hold has expired', 409);
  const quote = calculatePrice(seats, screening.prices.toObject());
  try {
    await Booking.init();
    const booking = await Booking.create({ reference: generateBookingReference(), user: userId, screening: screeningId, seatIds, seats: seats.map((seat) => ({ id: seat.id, row: seat.row, number: seat.number, type: seat.type, price: screening.prices[seat.type] })), total: quote.total });
    holdService.book(screeningId, seatIds, holdOwnerId);
    return Booking.findById(booking.id).populate(populate);
  } catch (error) {
    if (error?.code === 11000) throw new AppError('SEAT_UNAVAILABLE', 'One or more seats are already booked', 409);
    throw error;
  }
}

export async function listMyBookings(userId) { return Booking.find({ user: userId }).populate(populate).sort({ createdAt: -1 }); }
export async function listAllBookings() { return Booking.find().populate(populate).sort({ createdAt: -1 }); }
export async function getBooking(bookingId, user) { id(bookingId); const filter = { _id: bookingId, ...(user.role === 'admin' ? {} : { user: user.id }) }; const booking = await Booking.findOne(filter).populate(populate); if (!booking) throw new AppError('BOOKING_NOT_FOUND', 'Booking not found', 404); return booking; }
export async function cancelBooking(bookingId, user, holdService) {
  const booking = await getBooking(bookingId, user); if (booking.status !== 'confirmed') throw new AppError('CANNOT_CANCEL', 'This booking is already cancelled', 409);
  if (booking.screening.startsAt.getTime() - Date.now() < 2 * 60 * 60 * 1000) throw new AppError('CANNOT_CANCEL', 'Bookings cannot be cancelled within two hours of the screening', 409);
  booking.status = 'cancelled'; booking.cancelledAt = new Date(); await booking.save(); holdService.unbook(String(booking.screening.id), booking.seatIds); return booking;
}
export async function deleteBooking(bookingId) { id(bookingId); const booking = await Booking.findByIdAndDelete(bookingId); if (!booking) throw new AppError('BOOKING_NOT_FOUND', 'Booking not found', 404); return booking; }
