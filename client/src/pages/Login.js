import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Icons';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-panel">
        <div className="auth-form-side">
          <div className="auth-box">
            <Logo size={36} />
            <h1>Welcome back</h1>
            <p className="page-sub">Log in to grab your spot in the next game.</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            <p className="auth-switch">
              New to PitchUp? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>

        <div className="auth-img-side" style={{ backgroundImage: 'url(/img/gateway-dusk.jpg)' }}>
          <div className="auth-img-overlay" />
          <blockquote>
            <p>"Posted a game at Shivaji Park at 7, full squad by 7:20."</p>
            <footer>How it should be.</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Login;
