import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export function MovieCard({ movie }) {
  return (
    <article className="movie-card" aria-labelledby={`movie-${movie.id}-title`}>
      <div className="movie-card__poster">
        <img src={movie.posterUrl} alt={`Poster for ${movie.title}`} />
        <span className="rating-badge" aria-label={`Rated ${movie.ageRating}`}>
          {movie.ageRating}
        </span>
      </div>
      <div className="movie-card__body">
        <h2 id={`movie-${movie.id}-title`}>{movie.title}</h2>
        <p>{movie.genre.join(', ')}</p>
        <p>{movie.durationMinutes} minutes · Rated {movie.ageRating}</p>
        <Link to={`/movies/${movie.id}`} aria-label={`View ${movie.title}`}>
          View film
        </Link>
      </div>
    </article>
  );
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    genre: PropTypes.arrayOf(PropTypes.string).isRequired,
    durationMinutes: PropTypes.number.isRequired,
    ageRating: PropTypes.string.isRequired,
    posterUrl: PropTypes.string.isRequired,
  }).isRequired,
};
