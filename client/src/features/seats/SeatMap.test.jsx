import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeatMap } from './SeatMap.jsx';

const seats = [
  { id: 'A-1', row: 'A', number: 1, type: 'standard', accessible: true },
  { id: 'A-2', row: 'A', number: 2, type: 'premium', accessible: false },
];

test('announces seat metadata, disables unavailable seats and selects by keyboard', async () => {
  const user = userEvent.setup();
  const selections = [];
  render(<SeatMap seats={seats} unavailableSeatIds={['A-2']} selectedSeatIds={[]} onToggle={(id) => selections.push(id)} />);
  const accessible = screen.getByRole('button', { name: /row a seat 1, standard, accessible, available/i });
  expect(screen.getByRole('button', { name: /row a seat 2, premium, held/i })).toBeDisabled();
  await user.tab();
  await user.keyboard('{Enter}');
  expect(accessible).toHaveFocus();
  expect(selections).toEqual(['A-1']);
});
