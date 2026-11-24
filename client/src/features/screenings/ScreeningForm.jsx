import PropTypes from 'prop-types';
import { useState } from 'react';

export function ScreeningForm({ movies, onSubmit }) {
  const [form, setForm] = useState({ movieId: '', auditoriumName: 'Screen One', startsAt: '', rows: 'A,B,C,D,E,F', seatsPerRow: 10, standard: 9.99, premium: 14.99, recliner: 18.99 });
  const [errors, setErrors] = useState({});
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!form.movieId) next.movieId = 'Choose a film';
    if (!form.startsAt) next.startsAt = 'Choose a start time';
    setErrors(next);
    if (Object.keys(next).length) return;
    const rows = form.rows.split(',').map((row) => row.trim()).filter(Boolean);
    await onSubmit({ movieId: form.movieId, auditoriumName: form.auditoriumName, startsAt: new Date(form.startsAt).toISOString(), layoutConfig: { rows, seatsPerRow: Number(form.seatsPerRow), accessibleSeats: [`${rows.at(-1)}-1`], premiumRows: rows.slice(-2, -1), reclinerRows: rows.slice(-1) }, prices: { standard: Number(form.standard), premium: Number(form.premium), recliner: Number(form.recliner) } });
  }
  return <form className="admin-form" onSubmit={submit} noValidate>
    <label>Film<select value={form.movieId} onChange={set('movieId')} aria-invalid={Boolean(errors.movieId)} aria-errormessage={errors.movieId ? 'screening-movie-error' : undefined}><option value="">Choose a film</option>{movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}</select></label>{errors.movieId && <span id="screening-movie-error" className="field-error">{errors.movieId}</span>}
    <label>Auditorium<input value={form.auditoriumName} onChange={set('auditoriumName')} /></label>
    <label>Start time<input type="datetime-local" value={form.startsAt} onChange={set('startsAt')} aria-invalid={Boolean(errors.startsAt)} aria-errormessage={errors.startsAt ? 'screening-start-error' : undefined} /></label>{errors.startsAt && <span id="screening-start-error" className="field-error">{errors.startsAt}</span>}
    <label>Rows<input value={form.rows} onChange={set('rows')} /></label><label>Seats per row<input type="number" value={form.seatsPerRow} onChange={set('seatsPerRow')} /></label>
    <fieldset><legend>Ticket prices</legend><label>Standard<input type="number" step="0.01" value={form.standard} onChange={set('standard')} /></label><label>Premium<input type="number" step="0.01" value={form.premium} onChange={set('premium')} /></label><label>Recliner<input type="number" step="0.01" value={form.recliner} onChange={set('recliner')} /></label></fieldset>
    <button className="button button--amber" type="submit">Save screening</button>
  </form>;
}
ScreeningForm.propTypes = { movies: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired })).isRequired, onSubmit: PropTypes.func.isRequired };
