import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreeningForm } from './ScreeningForm.jsx';

test('uses labelled validation and submits a generated-layout configuration', async () => {
  const user = userEvent.setup();
  const submissions = [];
  render(<ScreeningForm movies={[{ id: 'm1', title: 'Signal' }]} onSubmit={async (data) => submissions.push(data)} />);
  await user.click(screen.getByRole('button', { name: /save screening/i }));
  expect(screen.getByLabelText(/film/i)).toHaveAccessibleErrorMessage(/choose/i);
  await user.selectOptions(screen.getByLabelText(/film/i), 'm1');
  await user.type(screen.getByLabelText(/start time/i), '2027-12-20T19:30');
  await user.click(screen.getByRole('button', { name: /save screening/i }));
  expect(submissions[0]).toMatchObject({ movieId: 'm1', auditoriumName: 'Screen One', prices: { standard: 9.99, premium: 14.99, recliner: 18.99 } });
});
