import { render, screen } from '@testing-library/react';
import { BookingCard } from './BookingCard.jsx';
import { MemoryRouter } from 'react-router-dom';
test('presents ticket reference, seats, time and cancellation action', () => {
  render(<MemoryRouter><BookingCard booking={{ id: 'b1', reference: 'PX-ABC12345', status: 'confirmed', seatIds: ['A-1'], total: 14.99, screening: { startsAt: '2027-12-20T19:30:00Z', movie: { title: 'Signal' } } }} onCancel={() => {}} /></MemoryRouter>);
  expect(screen.getByText('PX-ABC12345')).toBeInTheDocument(); expect(screen.getByText(/A-1/)).toBeInTheDocument(); expect(screen.getByRole('button', { name: /cancel booking/i })).toBeInTheDocument();
});
