import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/LoginForm.jsx';
import { useAuth } from '../features/auth/auth-context.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(credentials) {
    await login(credentials);
    navigate(location.state?.from ?? '/', { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="auth-kicker">Your next screening starts here</p>
        <h1 id="login-title">Sign in</h1>
        <LoginForm onSubmit={handleLogin} />
        <p>New to Pixel Cinemas? <Link to="/register">Create an account</Link>.</p>
      </section>
    </main>
  );
}
