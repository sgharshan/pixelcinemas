import { useEffect, useState } from 'react';
import { moviesApi } from '../api/movies.js';
import { MovieFilters } from '../features/movies/MovieFilters.jsx';
import { MovieGrid } from '../features/movies/MovieGrid.jsx';
import '../styles/movies.css';

export function MoviesPage() {
  const [filters, setFilters] = useState({ q: '', status: 'now-showing', genre: '' });
  const [state, setState] = useState({ movies: [], loading: true, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    moviesApi.list(filters, controller.signal).then(
      ({ movies }) => setState({ movies, loading: false, error: '' }),
      (error) => {
        if (error.name !== 'AbortError') {
          setState({ movies: [], loading: false, error: error.message });
        }
      },
    );
    return () => controller.abort();
  }, [filters]);

  function handleFiltersChange(nextFilters) {
    setState((current) => ({ ...current, loading: true, error: '' }));
    setFilters(nextFilters);
  }

  return (
    <main className="catalogue-page">
      <header className="page-heading">
        <p>Programme</p>
        <h1>Films at Pixel Cinemas</h1>
      </header>
      <MovieFilters value={filters} onChange={handleFiltersChange} />
      <MovieGrid {...state} />
    </main>
  );
}
