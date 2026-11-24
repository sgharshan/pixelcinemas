import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm.jsx';

describe('RegisterForm', () => {
  test('shows labelled validation for missing and mismatched details', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={async () => undefined} />);

    await user.type(screen.getByLabelText(/^password$/i), 'CinemaPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByLabelText(/full name/i)).toHaveAccessibleErrorMessage(
      'Enter your full name',
    );
    expect(screen.getByLabelText(/email address/i)).toHaveAccessibleErrorMessage(
      'Enter a valid email address',
    );
    expect(screen.getByLabelText(/confirm password/i)).toHaveAccessibleErrorMessage(
      'Passwords do not match',
    );
  });

  test('submits only the API registration fields', async () => {
    const submissions = [];
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={async (details) => submissions.push(details)} />);

    await user.type(screen.getByLabelText(/full name/i), 'Alex Morgan');
    await user.type(screen.getByLabelText(/email address/i), 'Alex@Example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'CinemaPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'CinemaPass123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(submissions).toEqual([
      {
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'CinemaPass123!',
      },
    ]);
  });

  test('announces a registration conflict from the API', async () => {
    const user = userEvent.setup();
    render(
      <RegisterForm
        onSubmit={async () => {
          throw new Error('An account already uses this email');
        }}
      />,
    );

    await user.type(screen.getByLabelText(/full name/i), 'Alex Morgan');
    await user.type(screen.getByLabelText(/email address/i), 'alex@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'CinemaPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'CinemaPass123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account already uses this email',
    );
  });
});
