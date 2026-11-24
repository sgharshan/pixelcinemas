import PropTypes from 'prop-types';
import { useState } from 'react';
import '../../styles/auth.css';

function validate(values) {
  const errors = {};
  const email = values.email.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address';
  if (!values.password) errors.password = 'Enter your password';
  return errors;
}

export function LoginForm({ onSubmit }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setFormError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await onSubmit({ email: values.email.trim().toLowerCase(), password: values.password });
    } catch (error) {
      setFormError(error.message || 'Sign in could not be completed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {formError && <p className="form-alert" role="alert">{formError}</p>}
      <div className="field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          aria-invalid={Boolean(errors.email)}
          aria-errormessage={errors.email ? 'login-email-error' : undefined}
        />
        {errors.email && <p className="field-error" id="login-email-error">{errors.email}</p>}
      </div>
      <div className="field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={update('password')}
          aria-invalid={Boolean(errors.password)}
          aria-errormessage={errors.password ? 'login-password-error' : undefined}
        />
        {errors.password && <p className="field-error" id="login-password-error">{errors.password}</p>}
      </div>
      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
