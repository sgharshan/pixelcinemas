import mongoose from 'mongoose';
import { AppError } from '../../middleware/errorHandler.js';
import { Movie } from '../../models/Movie.js';

function requireValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('INVALID_ID', 'Movie ID is invalid', 400);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listMovies(filters = {}) {
  const query = {};
  query.status = filters.status ?? { $ne: 'archived' };
  if (filters.genre) query.genre = { $regex: `^${escapeRegex(filters.genre)}$`, $options: 'i' };
  if (filters.q) {
    const search = new RegExp(escapeRegex(filters.q), 'i');
    query.$or = [{ title: search }, { synopsis: search }];
  }
  return Movie.find(query).sort({ releaseDate: 1, title: 1 });
}

export async function getMovie(id) {
  requireValidId(id);
  const movie = await Movie.findById(id);
  if (!movie) throw new AppError('MOVIE_NOT_FOUND', 'Movie not found', 404);
  return movie;
}

export async function createMovie(input) {
  return Movie.create(input);
}

export async function updateMovie(id, input) {
  requireValidId(id);
  const movie = await Movie.findByIdAndUpdate(id, input, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!movie) throw new AppError('MOVIE_NOT_FOUND', 'Movie not found', 404);
  return movie;
}

export async function archiveMovie(id) {
  return updateMovie(id, { status: 'archived' });
}
