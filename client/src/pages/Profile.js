import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';
import Avatar from '../components/Avatar';
import { SPORT_META } from '../lib/constants';
import { PinIcon, LogoutIcon, CameraIcon } from '../components/Icons';

// Read an image File, centre-crop to a 256px square, return a compact JPEG data URL.
const fileToAvatar = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('created'); // 'created' | 'joined'
  const [uploading, setUploading] = useState(false);
  const [picError, setPicError] = useState('');

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file later
    if (!file) return;
    setPicError('');
    setUploading(true);
    try {
      const avatar = await fileToAvatar(file);
      await updateProfile({ avatar });
    } catch (err) {
      setPicError(err.response?.data?.message || 'Could not update photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePic = async () => {
    setPicError('');
    setUploading(true);
    try {
      await updateProfile({ avatar: '' });
    } catch (err) {
      setPicError(err.response?.data?.message || 'Could not remove photo');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    axios.get('/api/games')
      .then((res) => setGames(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const created = games.filter((g) => g.organizer._id === user._id);
  const joined = games.filter(
    (g) => g.organizer._id !== user._id && g.players.some((p) => p._id === user._id)
  );
  const shown = tab === 'created' ? created : joined;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="profile">
      <div
        className="profile-cover"
        style={{
          backgroundImage:
            'linear-gradient(80deg, rgba(12,59,36,0.93), rgba(12,59,36,0.65)), url(/img/mumbai.jpg)',
        }}
      >
        <div className="profile-head card">
          <div className="profile-avatar-wrap">
            <Avatar user={user} className="avatar-xl" />
            <button
              type="button"
              className="avatar-edit"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Change photo"
            >
              <CameraIcon size={15} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              hidden
              onChange={handlePick}
            />
          </div>
          <div className="profile-id">
            <h1>{user.name}</h1>
            <p className="muted">{user.email}</p>
            {uploading && <p className="pic-status">Updating photo…</p>}
            {picError && <p className="pic-status pic-error">{picError}</p>}
            {user.avatar && !uploading && (
              <button type="button" className="link-btn" onClick={handleRemovePic}>
                Remove photo
              </button>
            )}
            <div className="profile-tags">
              {user.city && (
                <span className="tag"><PinIcon size={13} /> {user.city}</span>
              )}
              {(user.sport || []).map((s) => (
                <span key={s} className="tag tag-sport">{SPORT_META[s]?.label || s}</span>
              ))}
            </div>
          </div>
          <div className="profile-stats">
            <div><strong>{created.length}</strong><span>posted</span></div>
            <div><strong>{joined.length}</strong><span>joined</span></div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogoutIcon size={16} /> Log out
          </button>
        </div>
      </div>

      <div className="profile-body">
        <div className="tab-bar">
          <button
            className={`tab ${tab === 'created' ? 'tab-active' : ''}`}
            onClick={() => setTab('created')}
          >
            Games I posted ({created.length})
          </button>
          <button
            className={`tab ${tab === 'joined' ? 'tab-active' : ''}`}
            onClick={() => setTab('joined')}
          >
            Games I joined ({joined.length})
          </button>
        </div>

        {loading ? (
          <div className="games-grid">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="empty-state">
            <h3>{tab === 'created' ? 'Nothing posted yet' : 'No games joined yet'}</h3>
            <p>
              {tab === 'created'
                ? 'Got a ground and a time in mind? Put it on the board.'
                : 'Find a game near you and grab a spot.'}
            </p>
            {tab === 'created'
              ? <Link to="/create" className="btn btn-primary">Post a game</Link>
              : <Link to="/" className="btn btn-primary">Browse games</Link>}
          </div>
        ) : (
          <div className="games-grid">
            {shown.map((g) => <GameCard key={g._id} game={g} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
