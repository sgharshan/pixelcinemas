import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { moviesApi } from '../api/movies.js';
import '../styles/movies.css';

export function MovieDetailsPage() {
  const { id } = useParams();
  const [state, setState] = useState({ movie: null, loading: true, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    moviesApi.detail(id, controller.signal).then(
      ({ movie }) => setState({ movie, loading: false, error: '' }),
      (error) => {
        if (error.name !== 'AbortError') setState({ movie: null, loading: false, error: error.message });
      },
    );
    return () => controller.abort();
  }, [id]);

  if (state.loading) return <main className="catalogue-state" role="status">Loading film…</main>;
  if (state.error) return <main className="catalogue-state catalogue-state--error" role="alert">{state.error}</main>;
  const { movie } = state;
  return (
    <main className="movie-detail">
      <img src={movie.backdropUrl} alt="" className="movie-detail__backdrop" />
      <section className="movie-detail__content">
        <img src={movie.posterUrl} alt={`Poster for ${movie.title}`} />
        <div>
          <p>{movie.genre.join(', ')} · {movie.durationMinutes} minutes · Rated {movie.ageRating}</p>
          <h1>{movie.title}</h1>
          <p>{movie.synopsis}</p>
          <Link className="hero-action" to={`/screenings?movieId=${movie.id}`}>Choose a screening</Link>
        </div>
      </section>
    </main>
  );
}
