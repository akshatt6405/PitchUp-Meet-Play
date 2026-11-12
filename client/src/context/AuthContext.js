import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Always call the API on our OWN origin ('/api/...'). In dev the CRA proxy
// forwards it to localhost:5000; in production a Vercel rewrite forwards it to
// the Render backend. Keeping it same-origin makes the auth cookie first-party,
// so it works on mobile browsers that block third-party cookies (Safari, Brave).
axios.defaults.baseURL = '';
axios.defaults.withCredentials = true;

// Render's free backend can take around a minute to wake after idle. Retry
// safe GET requests while it starts, then let the page show its normal error.
axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    if (!config) return Promise.reject(error);
    const isRead = config.method?.toLowerCase() === 'get';
    const temporary = !error.response || [502, 503, 504].includes(error.response.status);
    config._wakeRetries = config._wakeRetries || 0;
    if (!isRead || !temporary || config._wakeRetries >= 7) {
      return Promise.reject(error);
    }
    const delays = [2000, 4000, 7000, 10000, 12000, 12000, 12000];
    const delay = delays[config._wakeRetries++];
    await new Promise(resolve => setTimeout(resolve, delay));
    return axios(config);
  }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate on page refresh
  useEffect(() => {
    axios.get('/api/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (formData) => {
    const res = await axios.post('/api/auth/register', formData);
    setUser(res.data.user);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
