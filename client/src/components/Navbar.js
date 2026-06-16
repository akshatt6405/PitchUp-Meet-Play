import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SPORTS, SPORT_META } from '../lib/constants';
import { Logo, PlusIcon, MenuIcon, CloseIcon, LogoutIcon } from './Icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo />
          <span className="brand-name">
            PitchUp<span className="brand-dot">.</span>
          </span>
          <span className="brand-city">Mumbai</span>
        </Link>

        <nav className="nav-links">
          {SPORTS.map((s) => (
            <NavLink key={s} to={`/?sport=${s}`} className="nav-link">
              {SPORT_META[s].label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/create" className="btn btn-primary btn-sm">
                <PlusIcon size={16} /> Post a game
              </Link>
              <Link to="/profile" className="nav-avatar" title={user.name}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} />
                  : user.name.charAt(0).toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
          <button
            className="nav-burger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-mobile">
          {SPORTS.map((s) => (
            <Link key={s} to={`/?sport=${s}`} className="nav-mobile-link" onClick={close}>
              {SPORT_META[s].label}
            </Link>
          ))}
          <div className="nav-mobile-divider" />
          {user ? (
            <>
              <Link to="/create" className="nav-mobile-link" onClick={close}>Post a game</Link>
              <Link to="/profile" className="nav-mobile-link" onClick={close}>My profile</Link>
              <button className="nav-mobile-link as-button" onClick={handleLogout}>
                <LogoutIcon size={16} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-mobile-link" onClick={close}>Log in</Link>
              <Link to="/register" className="nav-mobile-link" onClick={close}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
