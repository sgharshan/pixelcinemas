import { BrowserRouter, Link } from 'react-router-dom';
import logoMark from '../assets/pixel-cinemas-mark.svg';

export function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Pixel Cinemas home">
          <img src={logoMark} alt="" width="42" height="42" />
          <span>Pixel Cinemas</span>
        </Link>
        <nav className="primary-navigation" aria-label="Primary navigation">
          <Link to="/movies">Films</Link>
          <Link to="/coming-soon">Coming soon</Link>
          <Link to="/bookings">My bookings</Link>
        </nav>
        <Link className="account-link" to="/login">Sign in</Link>
      </header>
      <main className="shell-placeholder">
        <p>Now showing at Pixel Cinemas</p>
      </main>
    </BrowserRouter>
  );
}
