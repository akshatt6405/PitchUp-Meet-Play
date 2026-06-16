import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { withCredentials: true });
  }
  return socket;
};

// Subscribe to a socket event; auto-unsubscribes on unmount
export const useSocket = (event, handler) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const s = getSocket();
    const cb = (...args) => handlerRef.current(...args);
    s.on(event, cb);
    return () => s.off(event, cb);
  }, [event]);
};
