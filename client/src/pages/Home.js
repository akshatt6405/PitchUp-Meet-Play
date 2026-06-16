import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import GameCard from '../components/GameCard';
import { useSocket } from '../hooks/useSocket';
import { SPORTS, SPORT_META, MUMBAI_AREAS, POPULAR_VENUES } from '../lib/constants';
import { SearchIcon, ArrowRightIcon, PinIcon } from '../components/Icons';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sportFilter = searchParams.get('sport') || '';
  const areaFilter = searchParams.get('area') || '';
  const filtering = sportFilter || areaFilter;

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (sportFilter) params.sport = sportFilter;
      if (areaFilter) params.area = areaFilter;
      const res = await axios.get('/api/games', { params });
      setGames(res.data.data);
    } catch (err) {
      setError('Could not load games. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [sportFilter, areaFilter]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  // Real-time: someone joined / left a game
  useSocket('game:updated', (updatedGame) => {
    setGames((prev) => prev.map((g) => (g._id === updatedGame._id ? updatedGame : g)));
  });

  // Real-time: new game posted anywhere in the city
  useSocket('game:created', (newGame) => {
    const matchesSport = !sportFilter || newGame.sport === sportFilter;
    const matchesArea = !areaFilter || newGame.area.toLowerCase().includes(areaFilter.toLowerCase());
    if (matchesSport && matchesArea) setGames((prev) => [newGame, ...prev]);
  });

  useSocket('game:deleted', ({ gameId }) => {
    setGames((prev) => prev.filter((g) => g._id !== gameId));
  });

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  const openSpots = games.reduce(
    (sum, g) => sum + Math.max(0, g.totalPlayers - g.players.length), 0
  );

  return (
    <div className="home">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div
          className="hero-bg"
          style={{
            backgroundImage:
              'linear-gradient(78deg, rgba(8,38,23,0.96) 0%, rgba(8,38,23,0.82) 38%, rgba(8,38,23,0.35) 72%, rgba(8,38,23,0.55) 100%), url(/img/mumbai.jpg)',
          }}
        />
        <div className="hero-inner">
          <h1>
            Your next game in <em>Mumbai</em> is waiting.
          </h1>
          <p>
            Pickup cricket, football, badminton and pickleball, from Oval Maidan
            to Powai turfs. See who's playing, grab an open spot, or post your own game.
          </p>
          <div className="hero-cta">
            <a href="#games" className="btn btn-light btn-lg">
              <SearchIcon size={18} /> Find a game
            </a>
            <Link to="/create" className="btn btn-outline-light btn-lg">
              Post a game <ArrowRightIcon size={18} />
            </Link>
          </div>
          <div className="hero-stats">
            <div><strong>{loading ? '·' : games.length}</strong><span>upcoming games</span></div>
            <div><strong>{loading ? '·' : openSpots}</strong><span>open spots</span></div>
            <div><strong>4</strong><span>sports</span></div>
            <div><strong>All</strong><span>Mumbai areas</span></div>
          </div>
        </div>
      </section>

      {/* ─── Filter bar ───────────────────────────────────── */}
      <section className="filter-bar" id="games">
        <div className="filter-chips">
          <button
            className={`chip ${!sportFilter ? 'chip-active' : ''}`}
            onClick={() => setFilter('sport', '')}
          >
            All sports
          </button>
          {SPORTS.map((s) => (
            <button
              key={s}
              className={`chip ${sportFilter === s ? 'chip-active' : ''}`}
              onClick={() => setFilter('sport', sportFilter === s ? '' : s)}
            >
              {SPORT_META[s].label}
            </button>
          ))}
        </div>
        <div className="filter-area">
          <PinIcon size={16} />
          <select value={areaFilter} onChange={(e) => setFilter('area', e.target.value)}>
            <option value="">All of Mumbai</option>
            {MUMBAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </section>

      {/* ─── Sport tiles (only on the unfiltered view) ────── */}
      {!filtering && (
        <section className="section">
          <div className="section-head">
            <h2>Pick your sport</h2>
            <p>Four sports, one city, zero excuses.</p>
          </div>
          <div className="sport-grid">
            {SPORTS.map((s) => (
              <button key={s} className="sport-tile" onClick={() => setFilter('sport', s)}>
                <div className="sport-tile-img" style={{ backgroundImage: `url(${SPORT_META[s].img})` }} />
                <div className="sport-tile-overlay" />
                <div className="sport-tile-text">
                  <h3>{SPORT_META[s].label}</h3>
                  <span>{SPORT_META[s].tagline}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── Games grid ───────────────────────────────────── */}
      <section className="section">
        <div className="section-head row">
          <div>
            <h2>
              {filtering
                ? `${sportFilter ? SPORT_META[sportFilter].label : 'Games'}${areaFilter ? ` in ${areaFilter}` : ' across Mumbai'}`
                : 'Happening soon'}
            </h2>
            <p>Updates live as players join</p>
          </div>
          {filtering && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchParams({})}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="games-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : games.length === 0 ? (
          <div className="empty-state">
            <h3>No games here yet</h3>
            <p>
              Nobody's posted a {sportFilter ? SPORT_META[sportFilter].label.toLowerCase() : ''} game
              {areaFilter ? ` in ${areaFilter}` : ''}. Be the first.
            </p>
            <Link to="/create" className="btn btn-primary">Post a game</Link>
          </div>
        ) : (
          <div className="games-grid">
            {games.map((game) => <GameCard key={game._id} game={game} />)}
          </div>
        )}
      </section>

      {/* ─── Popular grounds ──────────────────────────────── */}
      {!filtering && (
        <section className="section section-grounds">
          <div className="section-head">
            <h2>Iconic grounds & courts</h2>
            <p>The places Mumbai plays at, every single day.</p>
          </div>
          <div className="venue-strip">
            {POPULAR_VENUES.map((v) => (
              <button
                key={v.name}
                className="venue-pill"
                onClick={() => setSearchParams({ sport: v.sport, area: v.area })}
              >
                <span className="venue-pill-name">{v.name}</span>
                <span className="venue-pill-meta">{v.area} · {SPORT_META[v.sport].label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── How it works ─────────────────────────────────── */}
      {!filtering && (
        <section className="section how-section">
          <div className="section-head">
            <h2>How PitchUp works</h2>
            <p>From your couch to the crease in three steps.</p>
          </div>
          <div className="how-grid">
            <div className="how-card">
              <span className="how-num">1</span>
              <h3>Find or post a game</h3>
              <p>Browse open games by sport and area, or post your own with the venue, time and players needed.</p>
            </div>
            <div className="how-card">
              <span className="how-num">2</span>
              <h3>Squad fills up live</h3>
              <p>Spots update the moment someone joins. Watch your game fill up from a couple of players to a full house.</p>
            </div>
            <div className="how-card">
              <span className="how-num">3</span>
              <h3>Turn up & play</h3>
              <p>Everyone knows the ground, the time and who's coming. All that's left is the game.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
