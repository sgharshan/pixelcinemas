import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MovieFilters } from './MovieFilters.jsx';
import { MovieGrid } from './MovieGrid.jsx';

const movies = [
  {
    id: 'movie-1',
    title: 'Signal at Midnight',
    synopsis: 'A projectionist discovers a message hidden between frames.',
    genre: ['Thriller', 'Mystery'],
    durationMinutes: 118,
    ageRating: '15',
    posterUrl: '/posters/signal.svg',
    status: 'now-showing',
  },
];

function renderGrid(props) {
  render(
    <MemoryRouter>
      <MovieGrid movies={[]} {...props} />
    </MemoryRouter>,
  );
}

describe('MovieGrid', () => {
  test('announces loading, error and empty catalogue states', () => {
    const { rerender } = render(
      <MemoryRouter>
        <MovieGrid movies={[]} loading />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading films');

    rerender(
      <MemoryRouter>
        <MovieGrid movies={[]} error="The film list could not be loaded" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');

    rerender(
      <MemoryRouter>
        <MovieGrid movies={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no films match/i)).toBeVisible();
  });

  test('renders a semantic movie card with rating, genre and details link', () => {
    renderGrid({ movies });

    const article = screen.getByRole('article', { name: /signal at midnight/i });
    expect(article).toBeVisible();
    expect(screen.getByLabelText('Rated 15')).toBeVisible();
    expect(screen.getByText(/thriller, mystery/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /view signal at midnight/i })).toHaveAttribute(
      'href',
      '/movies/movie-1',
    );
  });
});

describe('MovieFilters', () => {
  test('reports search and status changes as one filter value', async () => {
    const changes = [];
    const user = userEvent.setup();
    render(<MovieFilters value={{ q: '', status: 'now-showing', genre: '' }} onChange={(next) => changes.push(next)} />);

    await user.type(screen.getByRole('searchbox', { name: /search films/i }), 'orbit');
    await user.selectOptions(screen.getByLabelText(/showing status/i), 'coming-soon');

    expect(changes.at(-1)).toEqual({ q: '', status: 'coming-soon', genre: '' });
    expect(changes.some((value) => value.q === 'o')).toBe(true);
  });
});
