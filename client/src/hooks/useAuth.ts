import { useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '../types';

const USERS_KEY = 'ps_users';
const SESSION_KEY = 'ps_session';

function fallbackHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fallback_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function createId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function hashPassword(password: string): Promise<string> {
  try {
    const cryptoObj = globalThis.crypto;
    if (cryptoObj?.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fall through to deterministic fallback
  }

  return fallbackHash(password);
}

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

  const hasAdmin = useCallback(() => getUsers().some((user) => user.role === 'admin'), [getUsers]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const users = getUsers();
      const passwordHash = await hashPassword(password);
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
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, [getUsers, saveUsers]);

  const logout = useCallback(() => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const registerAdmin = useCallback(async (username: string, password: string) => {
    try {
      const users = getUsers();
      if (users.some(u => u.role === 'admin')) return false;

      const passwordHash = await hashPassword(password);
      const admin: User = {
        id: createId(),
        username,
        passwordHash,
        role: 'admin',
        createdAt: Date.now(),
      };

      saveUsers([...users, admin]);
      return login(username, password);
    } catch (error) {
      console.error('Admin registration failed:', error);
      return false;
    }
  }, [getUsers, saveUsers, login]);

  const addUser = useCallback(async (username: string, password: string, role: 'admin' | 'employee') => {
    try {
      if (authState.user?.role !== 'admin') return false;

      const users = getUsers();
      if (users.find(u => u.username === username)) return false;

      const passwordHash = await hashPassword(password);
      const newUser: User = {
        id: createId(),
        username,
        passwordHash,
        role,
        createdAt: Date.now(),
      };

      saveUsers([...users, newUser]);
      return true;
    } catch (error) {
      console.error('Add user failed:', error);
      return false;
    }
  }, [authState.user, getUsers, saveUsers]);

  const deleteUser = useCallback((id: string) => {
    try {
      if (authState.user?.role !== 'admin' || authState.user.id === id) return false;
      const users = getUsers();
      saveUsers(users.filter(u => u.id !== id));
      return true;
    } catch (error) {
      console.error('Delete user failed:', error);
      return false;
    }
  }, [authState.user, getUsers, saveUsers]);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        setAuthState({ user: JSON.parse(storedSession), isAuthenticated: true });
      }
    } finally {
      setLoading(false);
    }
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
    hasAdmin,
  };
}
