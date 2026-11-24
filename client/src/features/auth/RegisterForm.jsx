import PropTypes from 'prop-types';
import { useState } from 'react';
import '../../styles/auth.css';

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (values.password.length < 8) errors.password = 'Use at least 8 characters';
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

export function RegisterForm({ onSubmit }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (error) {
      setFormError(error.message || 'Account creation could not be completed');
    } finally {
      setSubmitting(false);
    }
  }

  const fields = [
    ['name', 'Full name', 'text', 'name'],
    ['email', 'Email address', 'email', 'email'],
    ['password', 'Password', 'password', 'new-password'],
    ['confirmPassword', 'Confirm password', 'password', 'new-password'],
  ];

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {formError && <p className="form-alert" role="alert">{formError}</p>}
      {fields.map(([field, label, type, autoComplete]) => (
        <div className="field" key={field}>
          <label htmlFor={`register-${field}`}>{label}</label>
          <input
            id={`register-${field}`}
            name={field}
            type={type}
            autoComplete={autoComplete}
            value={values[field]}
            onChange={update(field)}
            aria-invalid={Boolean(errors[field])}
            aria-errormessage={errors[field] ? `register-${field}-error` : undefined}
          />
          {errors[field] && (
            <p className="field-error" id={`register-${field}-error`}>{errors[field]}</p>
          )}
        </div>
      ))}
      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
