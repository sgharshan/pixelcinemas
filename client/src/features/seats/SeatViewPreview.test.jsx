import { render, screen } from '@testing-library/react';
import { SeatViewPreview } from './SeatViewPreview.jsx';
test('labels the view as an approximation and presents metrics', () => {
  render(<SeatViewPreview seat={{ id: 'A-3' }} view={{ distanceMetres: 4.5, angleDegrees: 0, qualityLabel: 'Central view', transform: { translateXPercent: 0, scale: 1 } }} onClose={() => {}} />);
  expect(screen.getByRole('dialog', { name: /view from seat a-3/i })).toHaveTextContent(/approximate/i);
  expect(screen.getByText(/4.5 metres/i)).toBeInTheDocument();
});
