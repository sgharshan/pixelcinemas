import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthProvider.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

function renderProtected(initialSession) {
  render(
    <AuthProvider initialSession={initialSession}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/login" element={<p>Sign in route</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<p>Private booking</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('ProtectedRoute', () => {
  test('redirects a guest to sign in', () => {
    renderProtected(null);
    expect(screen.getByText('Sign in route')).toBeVisible();
    expect(screen.queryByText('Private booking')).not.toBeInTheDocument();
  });

  test('renders the protected content for an authenticated customer', () => {
    renderProtected({
      token: 'test-token',
      user: { id: 'user-1', name: 'Alex', role: 'customer' },
    });
    expect(screen.getByText('Private booking')).toBeVisible();
  });
});
