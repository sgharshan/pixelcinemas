import PropTypes from 'prop-types';
import { useState } from 'react';

const defaults = {
  title: '',
  synopsis: '',
  genre: '',
  durationMinutes: '100',
  ageRating: 'PG',
  posterUrl: '',
  backdropUrl: '',
  trailerUrl: '',
  releaseDate: '',
  status: 'coming-soon',
};

function toFormValues(movie) {
  if (!movie) return defaults;
  return {
    ...defaults,
    ...movie,
    genre: movie.genre?.join(', ') ?? '',
    durationMinutes: String(movie.durationMinutes ?? ''),
    releaseDate: movie.releaseDate?.slice(0, 10) ?? '',
  };
}

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Enter a title';
  const duration = Number(values.durationMinutes);
  if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
    errors.durationMinutes = 'Enter a duration from 1 to 600 minutes';
  }
  if (!values.releaseDate) errors.releaseDate = 'Choose a release date';
  if (values.synopsis.trim().length < 20) errors.synopsis = 'Enter at least 20 characters';
  if (!values.genre.trim()) errors.genre = 'Enter at least one genre';
  if (!values.posterUrl.trim()) errors.posterUrl = 'Enter a poster path';
  if (!values.backdropUrl.trim()) errors.backdropUrl = 'Enter a backdrop path';
  return errors;
}

export function MovieForm({ movie, onSubmit }) {
  const [values, setValues] = useState(() => toFormValues(movie));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = {
      ...values,
      title: values.title.trim(),
      synopsis: values.synopsis.trim(),
      genre: values.genre.split(',').map((item) => item.trim()).filter(Boolean),
      durationMinutes: Number(values.durationMinutes),
      posterUrl: values.posterUrl.trim(),
      backdropUrl: values.backdropUrl.trim(),
      trailerUrl: values.trailerUrl.trim(),
    };
    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit(payload);
    } catch (error) {
      setFormError(error.message || 'The movie could not be saved');
    } finally {
      setSubmitting(false);
    }
  }

  const input = (field, label, type = 'text') => (
    <div className="field">
      <label htmlFor={`movie-${field}`}>{label}</label>
      <input
        id={`movie-${field}`}
        type={type}
        value={values[field]}
        onChange={update(field)}
        aria-invalid={Boolean(errors[field])}
        aria-errormessage={errors[field] ? `movie-${field}-error` : undefined}
      />
      {errors[field] && <p className="field-error" id={`movie-${field}-error`}>{errors[field]}</p>}
    </div>
  );

  return (
    <form className="movie-form" onSubmit={handleSubmit} noValidate>
      {formError && <p className="form-alert" role="alert">{formError}</p>}
      {input('title', 'Title')}
      <div className="field movie-form__wide">
        <label htmlFor="movie-synopsis">Synopsis</label>
        <textarea
          id="movie-synopsis"
          value={values.synopsis}
          onChange={update('synopsis')}
          aria-invalid={Boolean(errors.synopsis)}
          aria-errormessage={errors.synopsis ? 'movie-synopsis-error' : undefined}
        />
        {errors.synopsis && <p className="field-error" id="movie-synopsis-error">{errors.synopsis}</p>}
      </div>
      {input('genre', 'Genres (comma separated)')}
      {input('durationMinutes', 'Duration in minutes', 'number')}
      <div className="field">
        <label htmlFor="movie-ageRating">Age rating</label>
        <select id="movie-ageRating" value={values.ageRating} onChange={update('ageRating')}>
          {['U', 'PG', '12A', '12', '15', '18'].map((rating) => <option key={rating}>{rating}</option>)}
        </select>
      </div>
      {input('posterUrl', 'Poster path')}
      {input('backdropUrl', 'Backdrop path')}
      {input('trailerUrl', 'Trailer URL', 'url')}
      {input('releaseDate', 'Release date', 'date')}
      <div className="field">
        <label htmlFor="movie-status-field">Catalogue status</label>
        <select id="movie-status-field" value={values.status} onChange={update('status')}>
          <option value="coming-soon">Coming soon</option>
          <option value="now-showing">Now showing</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <button className="primary-button movie-form__wide" type="submit" disabled={submitting}>
        {submitting ? 'Saving movie…' : 'Save movie'}
      </button>
    </form>
  );
}

MovieForm.propTypes = {
  movie: PropTypes.shape({
    title: PropTypes.string,
    synopsis: PropTypes.string,
    genre: PropTypes.arrayOf(PropTypes.string),
    durationMinutes: PropTypes.number,
    ageRating: PropTypes.string,
    posterUrl: PropTypes.string,
    backdropUrl: PropTypes.string,
    trailerUrl: PropTypes.string,
    releaseDate: PropTypes.string,
    status: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
};
