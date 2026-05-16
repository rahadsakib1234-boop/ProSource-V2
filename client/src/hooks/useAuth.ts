import { useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase, type AuthChangeEvent, type Session } from '@/lib/supabase';

export type RegisterAdminResult = {
  success: boolean;
  organizationId?: string;
  error?: string;
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  const enrichUser = useCallback(async (rawUser: Session['user']): Promise<User> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, username, role')
        .eq('id', rawUser.id)
        .single();

      return {
        id: rawUser.id,
        organizationId: profile?.organization_id ?? '',
        username: profile?.username || rawUser.email || 'User',
        email: rawUser.email ?? undefined,
        role: profile?.role === 'employee' ? 'employee' : 'admin',
        createdAt: rawUser.created_at ? new Date(rawUser.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        id: rawUser.id,
        organizationId: '',
        username: rawUser.email || 'User',
        email: rawUser.email ?? undefined,
        role: 'admin',
        createdAt: rawUser.created_at ? new Date(rawUser.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const user = await enrichUser(data.user);
        setAuthState({ user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, [enrichUser]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const registerAdmin = useCallback(async (email: string, password: string): Promise<RegisterAdminResult> => {
    try {
      const electronRegister = typeof window !== 'undefined' ? window.electronAPI?.auth?.registerAdmin : undefined;
      if (electronRegister) {
        const result = await electronRegister(email, password);
        if (!result.success) {
          return { success: false, error: result.error ?? 'Failed to create admin account.' };
        }

        const signedIn = await login(email, password);
        if (!signedIn) {
          return { success: false, error: 'Admin account was created, but sign-in failed.' };
        }

        return { success: true, organizationId: result.organizationId };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          organizationId: '',
          username: data.user.email || 'Admin',
          email: data.user.email ?? undefined,
          role: 'admin',
          createdAt: data.user.created_at ? new Date(data.user.created_at).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setAuthState({ user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: 'No user was created.' };
    } catch (error) {
      console.error('Admin registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown registration error' };
    }
  }, [login]);

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
    let sub: { unsubscribe?: () => void } | null = null;

    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session ?? null;

      if (session?.user) {
        const user = await enrichUser(session.user);
        setAuthState({ user, isAuthenticated: true });
      } else {
        setAuthState({ user: null, isAuthenticated: false });
      }
      setLoading(false);

      const { data } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, nextSession: Session | null) => {
        if (nextSession?.user) {
          const u = await enrichUser(nextSession.user);
          setAuthState({ user: u, isAuthenticated: true });
        } else {
          setAuthState({ user: null, isAuthenticated: false });
        }
      });

      sub = data?.subscription ?? null;
    }

    init();

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    };
  }, [enrichUser]);

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
