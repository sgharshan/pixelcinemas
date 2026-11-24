import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../features/auth/RegisterForm.jsx';
import { useAuth } from '../features/auth/auth-context.js';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleRegister(details) {
    await register(details);
    navigate('/', { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <p className="auth-kicker">Reserve your place</p>
        <h1 id="register-title">Create an account</h1>
        <RegisterForm onSubmit={handleRegister} />
        <p>Already registered? <Link to="/login">Sign in</Link>.</p>
      </section>
    </main>
  );
}
