import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getSocket } from '../hooks/useSocket';
import Avatar from './Avatar';

// Per-game chat. Loads history over REST, then receives new messages live
// via the game's Socket.IO room. Sending posts to REST (authenticated);
// the server broadcasts it back to everyone in the room (incl. the sender).
const Chat = ({ gameId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    axios.get(`/api/games/${gameId}/messages`)
      .then((res) => { if (active) setMessages(res.data.data); })
      .catch(() => { if (active) setError('Could not load chat'); })
      .finally(() => { if (active) setLoading(false); });

    const socket = getSocket();
    socket.emit('chat:join', gameId);

    const onMessage = (m) => {
      const mGameId = m.game?._id || m.game;
      if (mGameId !== gameId) return;
      setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
    };
    socket.on('chat:message', onMessage);

    return () => {
      active = false;
      socket.emit('chat:leave', gameId);
      socket.off('chat:message', onMessage);
    };
  }, [gameId]);

  // Auto-scroll to newest
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setSending(true);
    setError('');
    try {
      await axios.post(`/api/games/${gameId}/messages`, { text: t });
      setText(''); // the message arrives via the socket broadcast
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {loading ? (
          <p className="muted chat-empty">Loading chat…</p>
        ) : messages.length === 0 ? (
          <p className="muted chat-empty">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((m) => {
            const mine = (m.sender._id || m.sender) === currentUserId;
            return (
              <div key={m._id} className={`chat-msg ${mine ? 'chat-mine' : ''}`}>
                {!mine && <Avatar user={m.sender} className="avatar-xs" />}
                <div className="chat-bubble">
                  {!mine && <span className="chat-author">{m.sender.name}</span>}
                  <span className="chat-text">{m.text}</span>
                  <span className="chat-time">
                    {new Date(m.createdAt).toLocaleTimeString('en-IN', {
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="chat-input" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message the squad…"
          maxLength={500}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
