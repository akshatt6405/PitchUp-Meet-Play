// Shows a user's uploaded photo, or falls back to their first initial.
// Sizing comes from the className (e.g. avatar-xs, avatar-xl) — same as
// the plain .avatar spans used elsewhere.
const Avatar = ({ user, className = '' }) => {
  const name = user?.name || '';
  if (user?.avatar) {
    return (
      <img
        className={`avatar avatar-img ${className}`}
        src={user.avatar}
        alt={name}
        title={name}
      />
    );
  }
  return (
    <span className={`avatar ${className}`} title={name}>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
};

export default Avatar;
