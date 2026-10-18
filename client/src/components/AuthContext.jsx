import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { getSession, setSession } from '../api/session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSession()?.user ?? null);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    api.watchlist().then(setWatchlist).catch(() => {
      setSession(null);
      setUser(null);
    });
  }, [user]);

  const start = useCallback((session) => {
    setSession(session);
    setUser(session.user);
  }, []);

  const login = useCallback((username, password) => api.login(username, password).then(start), [start]);
  const register = useCallback((username, password) => api.register(username, password).then(start), [start]);
  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  const toggleWatch = useCallback(async (isoCode) => {
    const watched = watchlist.some((c) => c.isoCode === isoCode);
    setWatchlist(await (watched ? api.unwatch(isoCode) : api.watch(isoCode)));
  }, [watchlist]);

  const value = useMemo(
    () => ({ user, watchlist, login, register, logout, toggleWatch }),
    [user, watchlist, login, register, logout, toggleWatch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
