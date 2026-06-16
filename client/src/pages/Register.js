import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SPORTS, SPORT_META } from '../lib/constants';
import { Logo, CheckIcon } from '../components/Icons';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', city: 'Mumbai', sport: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSport = (sport) => {
    setForm((prev) => ({
      ...prev,
      sport: prev.sport.includes(sport)
        ? prev.sport.filter((s) => s !== sport)
        : [...prev.sport, sport],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.sport.length === 0) {
      setError('Pick at least one sport you play');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <h1>Join PitchUp</h1>
            <p className="page-sub">One account, every maidan and court in Mumbai.</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-city">City</label>
                  <input id="reg-city" name="city" value={form.city} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Sports you play</label>
                <div className="filter-chips">
                  {SPORTS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`chip ${form.sport.includes(s) ? 'chip-active' : ''}`}
                      onClick={() => toggleSport(s)}
                    >
                      {form.sport.includes(s) && <CheckIcon size={14} />} {SPORT_META[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="auth-switch">
              Already on PitchUp? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>

        <div className="auth-img-side" style={{ backgroundImage: 'url(/img/cricket.jpg)' }}>
          <div className="auth-img-overlay" />
          <blockquote>
            <p>"From Churchgate maidans to Powai turfs. Find your people, find your game."</p>
            <footer>PitchUp Mumbai</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Register;
