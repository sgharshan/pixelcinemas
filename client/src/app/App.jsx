import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import logoMark from '../assets/pixel-cinemas-mark.svg';
import { AuthProvider } from '../features/auth/AuthProvider.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { MovieDetailsPage } from '../pages/MovieDetailsPage.jsx';
import { MoviesPage } from '../pages/MoviesPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <header className="site-header">
          <Link className="brand" to="/" aria-label="Pixel Cinemas home">
            <img src={logoMark} alt="" width="42" height="42" />
            <span>Pixel Cinemas</span>
          </Link>
          <nav className="primary-navigation" aria-label="Primary navigation">
            <Link to="/movies">Films</Link>
            <Link to="/movies?status=coming-soon">Coming soon</Link>
            <Link to="/bookings">My bookings</Link>
          </nav>
          <Link className="account-link" to="/login">Sign in</Link>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
