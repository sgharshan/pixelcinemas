import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const day = (date) => date.slice(0, 10);
export function QuickBook({ screenings }) {
  const [movieId, setMovieId] = useState('');
  const [date, setDate] = useState('');
  const [screeningId, setScreeningId] = useState('');
  const movies = useMemo(() => [...new Map(screenings.map((screening) => [screening.movie.id, screening.movie])).values()], [screenings]);
  const dates = [...new Set(screenings.filter((item) => item.movie.id === movieId).map((item) => day(item.startsAt)))];
  const times = screenings.filter((item) => item.movie.id === movieId && day(item.startsAt) === date);
  const ready = Boolean(screeningId);
  return (
    <section className="quick-book" aria-labelledby="quick-book-heading">
      <div><span>Fast track</span><h2 id="quick-book-heading">Quick book</h2></div>
      <label>Film<select value={movieId} onChange={(event) => { setMovieId(event.target.value); setDate(''); setScreeningId(''); }}><option value="">Choose a film</option>{movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}</select></label>
      <label>Date<select value={date} disabled={!movieId} onChange={(event) => { setDate(event.target.value); setScreeningId(''); }}><option value="">Choose a date</option>{dates.map((value) => <option key={value} value={value}>{new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</option>)}</select></label>
      <label>Time<select value={screeningId} disabled={!date} onChange={(event) => setScreeningId(event.target.value)}><option value="">Choose a time</option>{times.map((item) => <option key={item.id} value={item.id}>{new Date(item.startsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</option>)}</select></label>
      <Link className="button button--amber" to={ready ? `/screenings/${screeningId}/seats` : '#'} aria-disabled={!ready} onClick={(event) => { if (!ready) event.preventDefault(); }}>Choose seats</Link>
    </section>
  );
}
QuickBook.propTypes = { screenings: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, startsAt: PropTypes.string.isRequired, movie: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired }).isRequired })).isRequired };
