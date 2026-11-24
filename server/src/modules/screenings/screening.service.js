import mongoose from 'mongoose';
import { AppError } from '../../middleware/errorHandler.js';
import { Movie } from '../../models/Movie.js';
import { Screening } from '../../models/Screening.js';
import { generateSeatLayout } from '../../seats/layout.js';

function ensureId(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('INVALID_ID', 'Invalid screening identifier', 400);
}

export async function listScreenings(query = {}) {
  const filter = {};
  if (query.movieId) filter.movie = query.movieId;
  if (query.status) filter.status = query.status;
  if (query.date) {
    const start = new Date(`${query.date}T00:00:00.000Z`);
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
    filter.startsAt = { $gte: start, $lt: end };
  }
  return Screening.find(filter).populate('movie', 'title posterUrl ageRating durationMinutes status').sort({ startsAt: 1 });
}

export async function getScreening(id) {
  ensureId(id);
  const screening = await Screening.findById(id).populate('movie', 'title posterUrl ageRating durationMinutes status');
  if (!screening) throw new AppError('SCREENING_NOT_FOUND', 'Screening not found', 404);
  return screening;
}

export async function createScreening(data) {
  if (data.startsAt <= new Date()) throw new AppError('SCREENING_IN_PAST', 'Screening must start in the future', 400);
  if (!await Movie.exists({ _id: data.movieId, status: { $ne: 'archived' } })) throw new AppError('MOVIE_NOT_FOUND', 'Movie not found', 404);
  return Screening.create({ movie: data.movieId, auditoriumName: data.auditoriumName, startsAt: data.startsAt,
    prices: data.prices, status: data.status, seatLayout: generateSeatLayout(data.layoutConfig) });
}

export async function updateScreening(id, data) {
  ensureId(id);
  if (data.startsAt && data.startsAt <= new Date()) throw new AppError('SCREENING_IN_PAST', 'Screening must start in the future', 400);
  const update = { ...data };
  if (update.movieId) { update.movie = update.movieId; delete update.movieId; }
  if (update.layoutConfig) { update.seatLayout = generateSeatLayout(update.layoutConfig); delete update.layoutConfig; }
  const screening = await Screening.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!screening) throw new AppError('SCREENING_NOT_FOUND', 'Screening not found', 404);
  return screening;
}

export async function cancelScreening(id) { return updateScreening(id, { status: 'cancelled' }); }
