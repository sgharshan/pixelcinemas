import {
  archiveMovie,
  createMovie,
  getMovie,
  listMovies,
  updateMovie,
} from './movie.service.js';

export async function list(request, response) {
  const movies = await listMovies(request.validated?.query ?? request.query);
  response.json({ movies });
}

export async function detail(request, response) {
  const movie = await getMovie(request.params.id);
  response.json({ movie });
}

export async function create(request, response) {
  const movie = await createMovie(request.body);
  response.status(201).json({ movie });
}

export async function update(request, response) {
  const movie = await updateMovie(request.params.id, request.body);
  response.json({ movie });
}

export async function archive(request, response) {
  const movie = await archiveMovie(request.params.id);
  response.json({ movie });
}
