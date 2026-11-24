import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { screeningsApi } from '../api/screenings.js';
import { ScreeningPicker } from '../features/screenings/ScreeningPicker.jsx';
export function ScreeningsPage() {
  const [params] = useSearchParams(); const [state, setState] = useState({ screenings: [], loading: true, error: '' });
  useEffect(() => { const controller = new AbortController(); screeningsApi.list({ movieId: params.get('movieId'), status: 'scheduled' }, controller.signal).then(({ screenings }) => setState({ screenings, loading: false, error: '' }), (error) => { if (error.name !== 'AbortError') setState({ screenings: [], loading: false, error: error.message }); }); return () => controller.abort(); }, [params]);
  if (state.loading) return <main className="catalogue-state" role="status">Loading screenings…</main>;
  if (state.error) return <main className="catalogue-state" role="alert">{state.error}</main>;
  return <main className="content-page"><p className="eyebrow">Select a session</p><h1>Screenings</h1>{state.screenings.length ? <ScreeningPicker screenings={state.screenings} /> : <p>No screenings are scheduled yet.</p>}</main>;
}
