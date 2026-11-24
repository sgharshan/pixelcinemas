import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider.jsx';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { MovieDetailsPage } from '../pages/MovieDetailsPage.jsx';
import { MoviesPage } from '../pages/MoviesPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { ScreeningsPage } from '../pages/ScreeningsPage.jsx';
import { SeatSelectionPage } from '../pages/SeatSelectionPage.jsx';
import { CheckoutPage } from '../pages/CheckoutPage.jsx';
import { ConfirmationPage } from '../pages/ConfirmationPage.jsx';
import { MyBookingsPage } from '../pages/MyBookingsPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.jsx';
import '../styles/seats.css';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/screenings" element={<ScreeningsPage />} />
          <Route path="/screenings/:id/seats" element={<SeatSelectionPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:id" element={<ConfirmationPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}><Route path="/admin" element={<AdminDashboardPage />} /></Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
