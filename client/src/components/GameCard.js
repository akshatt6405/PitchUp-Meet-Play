import { Link } from 'react-router-dom';
import { SPORT_META, formatTime, formatDate, formatContribution } from '../lib/constants';
import { PinIcon, CalendarIcon, ClockIcon } from './Icons';

const GameCard = ({ game }) => {
  const meta = SPORT_META[game.sport];
  const spotsLeft = game.totalPlayers - game.players.length;
  const pct = Math.min(100, (game.players.length / game.totalPlayers) * 100);
  const isOpen = game.status === 'upcoming';

  return (
    <Link to={`/games/${game._id}`} className="game-card">
      <div className="game-card-media" style={{ backgroundImage: `url(${meta.img})` }}>
        <span className="badge badge-sport">{meta.label}</span>
        <span className={`badge badge-status badge-${game.status}`}>
          {isOpen ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left` : game.status}
        </span>
      </div>

      <div className="game-card-body">
        <h3 className="game-card-title">{game.title}</h3>
        <p className="game-card-area">
          <PinIcon size={14} /> {game.venue} · {game.area}
        </p>

        <div className="game-card-meta">
          <span><CalendarIcon size={14} /> {formatDate(game.date)}</span>
          <span><ClockIcon size={14} /> {formatTime(game.time)}</span>
          <span className={`contribution ${!game.contribution ? 'is-free' : ''}`}>
            {formatContribution(game.contribution)}
          </span>
        </div>
      </div>

      <div className="game-card-footer">
        <div className="avatar-stack">
          {game.players.slice(0, 4).map((p) => (
            <span key={p._id} className="avatar avatar-xs" title={p.name}>
              {p.name.charAt(0).toUpperCase()}
            </span>
          ))}
          {game.players.length > 4 && (
            <span className="avatar avatar-xs avatar-more">+{game.players.length - 4}</span>
          )}
        </div>
        <div className="game-card-count">
          <div className="progress">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-label">
            {game.players.length}/{game.totalPlayers} in
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
