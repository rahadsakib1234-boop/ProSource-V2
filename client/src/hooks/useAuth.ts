import { useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '../types';

const USERS_KEY = 'ps_users';
const SESSION_KEY = 'ps_session';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  const getUsers = useCallback((): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveUsers = useCallback((users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, []);

  const login = useCallback((username: string, passwordHash: string) => {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
    
    if (user) {
      const updatedUser = { ...user, lastLogin: Date.now() };
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveUsers(updatedUsers);
      
      setAuthState({ user: updatedUser, isAuthenticated: true });
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      return true;
    }
    return false;
  }, [getUsers, saveUsers]);

  const logout = useCallback(() => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const registerAdmin = useCallback((username: string, passwordHash: string) => {
    const users = getUsers();
    if (users.length > 0) return false; // Admin already exists

    const admin: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
      role: 'admin',
      createdAt: Date.now(),
    };

    saveUsers([admin]);
    return login(username, passwordHash);
  }, [getUsers, saveUsers, login]);

  const addUser = useCallback((username: string, passwordHash: string, role: 'admin' | 'employee') => {
    if (authState.user?.role !== 'admin') return false;

    const users = getUsers();
    if (users.find(u => u.username === username)) return false;

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
      role,
      createdAt: Date.now(),
    };

    saveUsers([...users, newUser]);
    return true;
  }, [authState.user, getUsers, saveUsers]);

  const deleteUser = useCallback((id: string) => {
    if (authState.user?.role !== 'admin' || authState.user.id === id) return false;
    const users = getUsers();
    saveUsers(users.filter(u => u.id !== id));
    return true;
  }, [authState.user, getUsers, saveUsers]);

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      setAuthState({ user: JSON.parse(storedSession), isAuthenticated: true });
    }
    setLoading(false);
  }, []);

  return {
    ...authState,
    loading,
    login,
    logout,
    registerAdmin,
    addUser,
    deleteUser,
    getUsers,
  };
}
