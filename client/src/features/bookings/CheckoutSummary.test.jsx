import { render, screen } from '@testing-library/react';
import { CheckoutSummary } from './CheckoutSummary.jsx';
test('shows an itemised server quote without collecting card details', () => {
  render(<CheckoutSummary screening={{ movie: { title: 'Signal' }, startsAt: '2027-12-20T19:30:00Z', auditoriumName: 'Screen One' }} seats={[{ id: 'A-1', type: 'premium', price: 14.99 }]} total={14.99} expiresAt={Date.now() + 60_000} onConfirm={() => {}} />);
  expect(screen.getByText(/A-1/)).toBeInTheDocument(); expect(screen.getAllByText('£14.99')).toHaveLength(2); expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
});
