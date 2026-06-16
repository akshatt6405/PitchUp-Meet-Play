import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SPORTS, SPORT_META, MUMBAI_AREAS, POPULAR_VENUES, AREA_COORDS } from '../lib/constants';
import { CheckIcon } from '../components/Icons';

const CreateGame = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sport: 'cricket',
    title: '',
    venue: '',
    area: 'Andheri',
    date: '',
    time: '',
    totalPlayers: SPORT_META.cricket.defaultPlayers,
    contribution: 0,
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (e) => update(e.target.name, e.target.value);

  const pickSport = (sport) =>
    setForm((prev) => ({ ...prev, sport, totalPlayers: SPORT_META[sport].defaultPlayers }));

  const pickVenue = (v) =>
    setForm((prev) => ({ ...prev, venue: v.name, area: v.area, sport: v.sport,
      totalPlayers: SPORT_META[v.sport].defaultPlayers }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const coords = AREA_COORDS[form.area]; // [lng, lat] for the chosen area
      const payload = {
        ...form,
        totalPlayers: Number(form.totalPlayers),
        contribution: Number(form.contribution) || 0,
        ...(coords ? { lng: coords[0], lat: coords[1] } : {}),
      };
      const res = await axios.post('/api/games', payload);
      navigate(`/games/${res.data.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to create game'
      );
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const suggestions = POPULAR_VENUES.filter((v) => v.sport === form.sport);

  return (
    <div className="create">
      <div className="create-grid">
        <div className="create-main card">
          <h1 className="page-title">Post a game</h1>
          <p className="page-sub">
            Set the ground, time and squad size. Mumbai takes care of the rest.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            {/* Sport picker */}
            <div className="form-group">
              <label>Sport</label>
              <div className="sport-picker">
                {SPORTS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`sport-option ${form.sport === s ? 'sport-option-active' : ''}`}
                    onClick={() => pickSport(s)}
                  >
                    <span
                      className="sport-option-img"
                      style={{ backgroundImage: `url(${SPORT_META[s].img})` }}
                    />
                    <span className="sport-option-label">
                      {form.sport === s && <CheckIcon size={14} />} {SPORT_META[s].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Game title</label>
              <input
                id="title"
                name="title"
                placeholder="e.g. Sunday Morning Tennis-Ball Cricket"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            {/* Venue */}
            <div className="form-group">
              <label htmlFor="venue">Ground / court name</label>
              <input
                id="venue"
                name="venue"
                placeholder="e.g. Oval Maidan, Andheri Sports Complex"
                value={form.venue}
                onChange={handleChange}
                required
              />
              {suggestions.length > 0 && (
                <div className="venue-suggest">
                  {suggestions.map((v) => (
                    <button type="button" key={v.name} className="chip chip-sm" onClick={() => pickVenue(v)}>
                      {v.name} · {v.area}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Area */}
            <div className="form-group">
              <label htmlFor="area">Area</label>
              <select id="area" name="area" value={form.area} onChange={handleChange}>
                {MUMBAI_AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>

            {/* Date & Time */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input id="date" type="date" name="date" min={today} value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="time">Start time</label>
                <input id="time" type="time" name="time" value={form.time} onChange={handleChange} required />
              </div>
            </div>

            {/* Players & contribution */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="totalPlayers">
                  Players needed <span className="optional">(2 to 100)</span>
                </label>
                <input
                  id="totalPlayers"
                  type="number"
                  name="totalPlayers"
                  min="2"
                  max="100"
                  value={form.totalPlayers}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contribution">
                  Contribution / head <span className="optional">(₹, 0 = free)</span>
                </label>
                <input
                  id="contribution"
                  type="number"
                  name="contribution"
                  min="0"
                  value={form.contribution}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">
                Notes for players <span className="optional">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Skill level, what to bring, turf charges to split…"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Posting…' : 'Post game'}
            </button>
          </form>
        </div>

        {/* Side panel */}
        <aside
          className="create-side"
          style={{ backgroundImage: `url(${SPORT_META[form.sport].img})` }}
        >
          <div className="create-side-overlay" />
          <div className="create-side-text">
            <h3>{SPORT_META[form.sport].label} in Mumbai</h3>
            <p>{SPORT_META[form.sport].tagline}</p>
            <ul>
              <li>Your game appears on the board instantly</li>
              <li>Players join in real time, no group-chat chaos</li>
              <li>You're auto-added as the first player</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateGame;
