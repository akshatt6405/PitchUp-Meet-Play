import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { SPORT_META, formatTime, formatContribution, AREA_COORDS, MUMBAI_CENTER } from '../lib/constants';
import {
  PinIcon, CalendarIcon, ClockIcon, UsersIcon,
  ArrowLeftIcon, TrashIcon, CheckIcon,
} from '../components/Icons';
import VenueMap from '../components/VenueMap';
import Avatar from '../components/Avatar';
import Chat from '../components/Chat';

const GameDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'info'|'error', text }

  useEffect(() => {
    axios.get(`/api/games/${id}`)
      .then((res) => setGame(res.data.data))
      .catch(() => setError('Game not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Real-time player updates for this game
  useSocket('game:updated', (updated) => {
    if (updated._id === id) setGame(updated);
  });

  useSocket('game:deleted', ({ gameId }) => {
    if (gameId === id) navigate('/');
  });

  const hasJoined = game && user && game.players.some((p) => p._id === user._id);
  const isOrganizer = game && user && game.organizer._id === user._id;
  const spotsLeft = game ? game.totalPlayers - game.players.length : 0;

  const handleJoin = async () => {
    setActionLoading(true); setMsg(null);
    try {
      const res = await axios.put(`/api/games/${id}/join`);
      setGame(res.data.data);
      setMsg({ type: 'success', text: "You're in! See you on the pitch." });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to join' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true); setMsg(null);
    try {
      const res = await axios.put(`/api/games/${id}/leave`);
      setGame(res.data.data);
      setMsg({ type: 'info', text: 'You left the game.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to leave' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this game? Players will be notified.')) return;
    try {
      await axios.delete(`/api/games/${id}`);
      navigate('/');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete' });
    }
  };

  if (loading) {
    return (
      <div className="page-pad">
        <div className="skeleton-banner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-pad">
        <div className="empty-state">
          <h3>{error}</h3>
          <p>This game may have been deleted by its organiser.</p>
          <Link to="/" className="btn btn-primary">Browse games</Link>
        </div>
      </div>
    );
  }

  const meta = SPORT_META[game.sport];
  const dateStr = new Date(game.date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const pct = Math.min(100, (game.players.length / game.totalPlayers) * 100);
  const isOpen = game.status === 'upcoming';
  // exact pin if set, else the area's centre, else Mumbai
  const mapCoords = game.location?.coordinates?.length === 2
    ? game.location.coordinates
    : AREA_COORDS[game.area] || MUMBAI_CENTER;

  return (
    <div className="detail">
      {/* Banner */}
      <div className="detail-banner" style={{ backgroundImage: `url(${meta.img})` }}>
        <div className="detail-banner-overlay" />
        <div className="detail-banner-content">
          <button onClick={() => navigate(-1)} className="btn btn-glass btn-sm">
            <ArrowLeftIcon size={16} /> Back
          </button>
          <div>
            <div className="detail-badges">
              <span className="badge badge-sport">{meta.label}</span>
              <span className={`badge badge-status badge-${game.status}`}>
                {isOpen ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} open` : game.status}
              </span>
            </div>
            <h1>{game.title}</h1>
            <p className="detail-banner-area">
              <PinIcon size={16} /> {game.venue} · {game.area}, Mumbai
            </p>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left — info */}
        <div className="detail-info">
          <div className="card">
            <h3 className="card-title">Match details</h3>
            <div className="detail-facts">
              <div className="fact">
                <CalendarIcon size={18} />
                <div><span>Date</span><strong>{dateStr}</strong></div>
              </div>
              <div className="fact">
                <ClockIcon size={18} />
                <div><span>Time</span><strong>{formatTime(game.time)}</strong></div>
              </div>
              <div className="fact">
                <UsersIcon size={18} />
                <div><span>Players</span><strong>{game.players.length} of {game.totalPlayers}</strong></div>
              </div>
              <div className="fact">
                <PinIcon size={18} />
                <div><span>Venue</span><strong>{game.venue}</strong></div>
              </div>
            </div>

            {game.description && (
              <>
                <h3 className="card-title">From the organiser</h3>
                <p className="detail-desc">{game.description}</p>
              </>
            )}
          </div>

          <div className="card">
            <h3 className="card-title">Where to play</h3>
            <p className="map-venue">
              <PinIcon size={15} /> {game.venue} · {game.area}, Mumbai
            </p>
            <VenueMap coords={mapCoords} label={`${game.venue} (${game.area})`} />
            {!game.location?.coordinates?.length && (
              <p className="map-note">Approximate location, centred on {game.area}.</p>
            )}
          </div>

          <div className="card">
            <h3 className="card-title">
              Squad <span className="muted">({game.players.length}/{game.totalPlayers})</span>
            </h3>
            <div className="progress progress-lg">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <ul className="squad-list">
              {game.players.map((p) => (
                <li key={p._id} className="squad-member">
                  <Avatar user={p} />
                  <span className="squad-name">{p.name}</span>
                  {p._id === game.organizer._id && <span className="tag-organiser">Organiser</span>}
                  {user && p._id === user._id && <span className="tag-you">You</span>}
                </li>
              ))}
              {[...Array(Math.min(3, Math.max(0, spotsLeft)))].map((_, i) => (
                <li key={`open-${i}`} className="squad-member squad-open">
                  <span className="avatar avatar-empty">?</span>
                  <span className="squad-name muted">Open spot, could be you</span>
                </li>
              ))}
              {spotsLeft > 3 && (
                <li className="squad-member squad-open">
                  <span className="avatar avatar-empty">+</span>
                  <span className="squad-name muted">{spotsLeft - 3} more open spots</span>
                </li>
              )}
            </ul>
          </div>

          <div className="card">
            <h3 className="card-title">Game chat</h3>
            {user && (hasJoined || isOrganizer) ? (
              <Chat gameId={game._id} currentUserId={user._id} />
            ) : (
              <p className="muted chat-locked">
                {user
                  ? 'Join this game to chat with the squad.'
                  : <><Link to="/login">Log in</Link> and join this game to chat.</>}
              </p>
            )}
          </div>
        </div>

        {/* Right — action panel */}
        <aside className="detail-aside">
          <div className="card action-card">
            <div className="cost-row">
              <span className="muted">Contribution</span>
              <strong className={!game.contribution ? 'cost-free' : ''}>
                {formatContribution(game.contribution)}
              </strong>
            </div>

            <div className="action-organiser">
              <Avatar user={game.organizer} />
              <div>
                <span className="muted">Organised by</span>
                <strong>{game.organizer.name}</strong>
              </div>
            </div>

            {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

            {user ? (
              isOrganizer ? (
                <button onClick={handleDelete} className="btn btn-danger btn-full">
                  <TrashIcon size={16} /> Delete game
                </button>
              ) : hasJoined ? (
                <>
                  <div className="joined-note"><CheckIcon size={16} /> You've joined this game</div>
                  <button onClick={handleLeave} className="btn btn-secondary btn-full" disabled={actionLoading}>
                    {actionLoading ? 'Leaving…' : 'Leave game'}
                  </button>
                </>
              ) : isOpen ? (
                <button onClick={handleJoin} className="btn btn-primary btn-full btn-lg" disabled={actionLoading}>
                  {actionLoading ? 'Joining…' : 'Join this game'}
                </button>
              ) : (
                <button className="btn btn-disabled btn-full" disabled>
                  {game.status === 'full' ? 'Game is full'
                    : game.status === 'cancelled' ? 'Game cancelled'
                    : 'Game completed'}
                </button>
              )
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-full btn-lg">Log in to join</Link>
                <p className="action-hint">
                  New here? <Link to="/register">Create a free account</Link>
                </p>
              </>
            )}

            <p className="action-live">Spots update in real time</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GameDetail;
