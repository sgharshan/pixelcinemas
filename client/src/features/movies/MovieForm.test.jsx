import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MovieForm } from './MovieForm.jsx';

describe('MovieForm', () => {
  test('shows labelled errors for title, duration and release date', async () => {
    const user = userEvent.setup();
    render(<MovieForm onSubmit={async () => undefined} />);

    await user.clear(screen.getByLabelText(/duration in minutes/i));
    await user.type(screen.getByLabelText(/duration in minutes/i), '0');
    await user.click(screen.getByRole('button', { name: /save movie/i }));

    expect(screen.getByLabelText(/^title/i)).toHaveAccessibleErrorMessage('Enter a title');
    expect(screen.getByLabelText(/duration in minutes/i)).toHaveAccessibleErrorMessage(
      'Enter a duration from 1 to 600 minutes',
    );
    expect(screen.getByLabelText(/release date/i)).toHaveAccessibleErrorMessage(
      'Choose a release date',
    );
  });

  test('submits a normalised movie payload', async () => {
    const submissions = [];
    const user = userEvent.setup();
    render(<MovieForm onSubmit={async (movie) => submissions.push(movie)} />);

    await user.type(screen.getByLabelText(/^title/i), 'Signal at Midnight');
    await user.type(
      screen.getByLabelText(/synopsis/i),
      'A projectionist discovers a message hidden between frames.',
    );
    await user.type(screen.getByLabelText(/genres/i), 'Thriller, Mystery');
    await user.clear(screen.getByLabelText(/duration in minutes/i));
    await user.type(screen.getByLabelText(/duration in minutes/i), '118');
    await user.selectOptions(screen.getByLabelText(/age rating/i), '15');
    await user.type(screen.getByLabelText(/poster path/i), '/posters/signal.svg');
    await user.type(screen.getByLabelText(/backdrop path/i), '/backdrops/signal.svg');
    await user.type(screen.getByLabelText(/release date/i), '2026-12-04');
    await user.selectOptions(screen.getByLabelText(/catalogue status/i), 'now-showing');
    await user.click(screen.getByRole('button', { name: /save movie/i }));

    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      title: 'Signal at Midnight',
      genre: ['Thriller', 'Mystery'],
      durationMinutes: 118,
      ageRating: '15',
      releaseDate: '2026-12-04',
      status: 'now-showing',
    });
  });
});
