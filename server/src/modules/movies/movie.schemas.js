import { z } from 'zod';

const assetLocation = z.string().trim().refine(
  (value) => value.startsWith('/') || z.url().safeParse(value).success,
  'Enter a valid asset URL or local path',
);

const movieFields = {
  title: z.string().trim().min(1, 'Enter a title').max(120),
  synopsis: z.string().trim().min(20, 'Enter at least 20 characters').max(1200),
  genre: z.array(z.string().trim().min(1).max(40)).min(1, 'Choose at least one genre'),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  ageRating: z.enum(['U', 'PG', '12A', '12', '15', '18']),
  posterUrl: assetLocation,
  backdropUrl: assetLocation,
  trailerUrl: z.union([z.literal(''), z.url()]).default(''),
  releaseDate: z.coerce.date(),
  status: z.enum(['coming-soon', 'now-showing', 'archived']),
};

export const createMovieSchema = z.object(movieFields).strict();
export const updateMovieSchema = z.object(movieFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update',
);

export const movieQuerySchema = z
  .object({
    status: z.enum(['coming-soon', 'now-showing', 'archived']).optional(),
    genre: z.string().trim().min(1).optional(),
    q: z.string().trim().max(100).optional(),
  })
  .strict();
