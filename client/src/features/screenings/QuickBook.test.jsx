import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QuickBook } from './QuickBook.jsx';

const screenings = [{ id: 's1', movie: { id: 'm1', title: 'Signal at Midnight' }, startsAt: '2027-12-20T19:30:00.000Z' }];

test('requires a dependent film, date and time before continuing', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><QuickBook screenings={screenings} /></MemoryRouter>);
  const button = screen.getByRole('link', { name: /choose seats/i });
  expect(button).toHaveAttribute('aria-disabled', 'true');
  await user.selectOptions(screen.getByLabelText(/film/i), 'm1');
  await user.selectOptions(screen.getByLabelText(/date/i), '2027-12-20');
  await user.selectOptions(screen.getByLabelText(/time/i), 's1');
  expect(button).toHaveAttribute('href', '/screenings/s1/seats');
});
