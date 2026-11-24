import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { screeningsApi } from '../api/screenings.js';
import { QuickBook } from '../features/screenings/QuickBook.jsx';
import '../styles/movies.css';

export function HomePage() {
  const [screenings, setScreenings] = useState([]);
  useEffect(() => { const controller = new AbortController(); screeningsApi.list({ status: 'scheduled' }, controller.signal).then((data) => setScreenings(data.screenings), () => {}); return () => controller.abort(); }, []);
  return (
    <main>
      <section className="cinema-hero">
        <div className="cinema-hero__frame" aria-hidden="true"><span /><span /><span /></div>
        <div className="cinema-hero__copy">
          <p>Now showing at Pixel Cinemas</p>
          <h1>Every seat tells a different story.</h1>
          <p>Choose a film, reserve live seats and preview your approximate view before booking.</p>
          <Link className="hero-action" to="/movies">Find a film</Link>
        </div>
      </section>
      <QuickBook screenings={screenings} />
    </main>
  );
}
