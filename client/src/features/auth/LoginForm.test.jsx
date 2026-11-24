import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm.jsx';

describe('LoginForm', () => {
  test('labels fields and blocks an invalid submission with useful messages', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={async () => undefined} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByLabelText(/email address/i)).toHaveAccessibleErrorMessage(
      'Enter a valid email address',
    );
    expect(screen.getByLabelText(/^password/i)).toHaveAccessibleErrorMessage(
      'Enter your password',
    );
  });

  test('submits normalised credentials', async () => {
    const submissions = [];
    const user = userEvent.setup();
    render(<LoginForm onSubmit={async (credentials) => submissions.push(credentials)} />);

    await user.type(screen.getByLabelText(/email address/i), '  ALEX@Example.COM ');
    await user.type(screen.getByLabelText(/^password/i), 'CinemaPass123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(submissions).toEqual([
      { email: 'alex@example.com', password: 'CinemaPass123!' },
    ]);
  });

  test('announces a server error without clearing the email field', async () => {
    const user = userEvent.setup();
    render(
      <LoginForm
        onSubmit={async () => {
          throw new Error('Email or password is incorrect');
        }}
      />,
    );

    await user.type(screen.getByLabelText(/email address/i), 'alex@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'WrongPassword123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email or password is incorrect',
    );
    expect(screen.getByLabelText(/email address/i)).toHaveValue('alex@example.com');
  });
});
