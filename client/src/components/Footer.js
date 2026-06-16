import { Link } from 'react-router-dom';
import { SPORTS, SPORT_META } from '../lib/constants';
import { Logo } from './Icons';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <div className="brand">
          <Logo size={28} />
          <span className="brand-name footer-brand-name">PitchUp<span className="brand-dot">.</span></span>
        </div>
        <p>
          Mumbai's pickup sports community. Find a game, fill the squad,
          turn up and play. Updated live as players join.
        </p>
      </div>

      <div className="footer-col">
        <h4>Sports</h4>
        {SPORTS.map((s) => (
          <Link key={s} to={`/?sport=${s}`}>{SPORT_META[s].label}</Link>
        ))}
      </div>

      <div className="footer-col">
        <h4>Popular areas</h4>
        {['Andheri', 'Bandra', 'Dadar', 'Powai', 'Thane', 'Churchgate'].map((a) => (
          <Link key={a} to={`/?area=${a}`}>{a}</Link>
        ))}
      </div>

      <div className="footer-col">
        <h4>Get playing</h4>
        <Link to="/register">Create an account</Link>
        <Link to="/create">Post a game</Link>
        <Link to="/">Browse games</Link>
      </div>
    </div>
    <div className="footer-bar">
      <span>© {new Date().getFullYear()} PitchUp · Made for Mumbai</span>
      <span>Covering every area across Mumbai</span>
    </div>
  </footer>
);

export default Footer;
