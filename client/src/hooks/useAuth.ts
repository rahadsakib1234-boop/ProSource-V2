import { useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // In a real app, we would fetch the user's profile and organization from the 'profiles' table
        const user: User = {
          id: data.user.id,
          username: data.user.email || 'User',
          role: 'admin', // Default to admin for now, will be fetched from profile in Phase 2
          createdAt: data.user.created_at ? new Date(data.user.created_at).getTime() : Date.now(),
        };

        setAuthState({ user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const registerAdmin = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          username: data.user.email || 'Admin',
          role: 'admin',
          createdAt: data.user.created_at ? new Date(data.user.created_at).getTime() : Date.now(),
        };

        setAuthState({ user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin registration failed:', error);
      return false;
    }
  }, []);

  const addUser = useCallback(async (email: string, password: string, role: 'admin' | 'employee') => {
    console.warn('addUser now requires a server-side administrative API to avoid exposing service role keys.');
    return false;
  }, []);

  const deleteUser = useCallback((id: string) => {
    console.warn('deleteUser now requires a server-side administrative API.');
    return false;
  }, []);

  const getUsers = useCallback(async (): Promise<User[]> => {
    console.warn('getUsers now requires a server-side API call to the profiles table.');
    return [];
  }, []);

  const hasAdmin = useCallback(async () => {
    const users = await getUsers();
    return users.some((user) => user.role === 'admin');
  }, [getUsers]);

  useEffect(() => {
    // Handle initial session and auth changes
    supabase.auth.onAuthStateChanged((event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          username: session.user.email || 'User',
          role: 'admin', // Will be dynamically fetched from profiles table in Phase 2
          createdAt: session.user.created_at ? new Date(session.user.created_at).getTime() : Date.now(),
        };
        setAuthState({ user, isAuthenticated: true });
      } else {
        setAuthState({ user: null, isAuthenticated: false });
      }
      setLoading(false);
    });

    return () => {
      // Unsubscribe would go here if the SDK returned a subscription object
    };
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
