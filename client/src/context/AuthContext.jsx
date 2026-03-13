import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext(null);

const mergeUserWithAvatarFallback = (incomingUser, currentUser) => {
  if (!incomingUser) {
    return incomingUser;
  }

  return {
    ...incomingUser,
    avatarUrl:
      incomingUser.avatarUrl !== undefined
        ? incomingUser.avatarUrl
        : currentUser?.avatarUrl || '',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agriflow_token'));
  const [loading, setLoading] = useState(true);

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem('agriflow_token', nextToken);
    localStorage.setItem('agriflow_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearSession = () => {
    localStorage.removeItem('agriflow_token');
    localStorage.removeItem('agriflow_user');
    setToken(null);
    setUser(null);
  };

  const signup = async (payload) => {
    const response = await authApi.signup(payload);
    const { token: nextToken, user: nextUser } = response.data.data;
    persistSession(nextToken, nextUser);
    return nextUser;
  };

  const login = async (payload) => {
    const response = await authApi.login(payload);
    const { token: nextToken, user: nextUser } = response.data.data;
    persistSession(nextToken, nextUser);
    return nextUser;
  };

  const switchRole = async (role) => {
    const response = await authApi.switchRole(role);
    const updated = mergeUserWithAvatarFallback(response.data.data, user);
    localStorage.setItem('agriflow_user', JSON.stringify(updated));
    setUser(updated);
  };

  const toggleNotifications = async (notificationEnabled) => {
    const response = await authApi.toggleNotifications(notificationEnabled);
    const updated = mergeUserWithAvatarFallback(response.data.data, user);
    localStorage.setItem('agriflow_user', JSON.stringify(updated));
    setUser(updated);
  };

  const updateProfile = async (payload) => {
    const response = await authApi.updateProfile(payload);
    const updated = mergeUserWithAvatarFallback(response.data.data, user);
    localStorage.setItem('agriflow_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const cachedUser = localStorage.getItem('agriflow_user');
      if (cachedUser && token) {
        setUser(JSON.parse(cachedUser));
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        const profile = mergeUserWithAvatarFallback(
          response.data.data,
          cachedUser ? JSON.parse(cachedUser) : null,
        );
        localStorage.setItem('agriflow_user', JSON.stringify(profile));
        setUser(profile);
      } catch (_error) {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signup,
      login,
      logout: clearSession,
      switchRole,
      toggleNotifications,
      updateProfile,
      isAuthenticated: Boolean(token),
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
