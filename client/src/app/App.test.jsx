import { render, screen } from '@testing-library/react';
import { App } from './App.jsx';

describe('Pixel Cinemas application shell', () => {
  test('shows the brand and primary navigation', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /pixel cinemas/i })).toBeVisible();
    const navigation = screen.getByRole('navigation', { name: /primary/i });
    expect(navigation).toBeVisible();
    expect(screen.getByRole('link', { name: /films/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /my bookings/i })).toBeVisible();
  });
});
