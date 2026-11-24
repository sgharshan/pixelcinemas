import PropTypes from 'prop-types';

export function MovieFilters({ value, onChange }) {
  function update(field) {
    return (event) => onChange({ ...value, [field]: event.target.value });
  }

  return (
    <form className="movie-filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="field movie-filters__search">
        <label htmlFor="movie-search">Search films</label>
        <input id="movie-search" type="search" value={value.q} onChange={update('q')} />
      </div>
      <div className="field">
        <label htmlFor="movie-status">Showing status</label>
        <select id="movie-status" value={value.status} onChange={update('status')}>
          <option value="">All active films</option>
          <option value="now-showing">Now showing</option>
          <option value="coming-soon">Coming soon</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="movie-genre">Genre</label>
        <input id="movie-genre" value={value.genre} onChange={update('genre')} placeholder="e.g. Thriller" />
      </div>
    </form>
  );
}

MovieFilters.propTypes = {
  value: PropTypes.shape({
    q: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    genre: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
