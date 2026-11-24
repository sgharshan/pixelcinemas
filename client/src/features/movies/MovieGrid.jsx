import PropTypes from 'prop-types';
import { MovieCard } from './MovieCard.jsx';

export function MovieGrid({ movies, loading = false, error = '' }) {
  if (loading) return <p className="catalogue-state" role="status">Loading films…</p>;
  if (error) return <p className="catalogue-state catalogue-state--error" role="alert">{error}</p>;
  if (!movies.length) {
    return (
      <div className="catalogue-state">
        <h2>No films match these filters</h2>
        <p>Try another title, genre or showing status.</p>
      </div>
    );
  }

  return <div className="movie-grid">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>;
}

MovieGrid.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};
