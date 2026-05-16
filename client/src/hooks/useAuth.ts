import { useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase, type AuthChangeEvent, type Session } from '@/lib/supabase';

export type AccountType = 'company' | 'personal';

export type RegisterAdminResult = {
  success: boolean;
  organizationId?: string;
  error?: string;
};

export type RegisterAccountResult = {
  success: boolean;
  organizationId?: string;
  accountType?: AccountType;
  error?: string;
};

export type EmployeeAccessPayload = {
  email: string;
  password: string;
  role?: 'admin' | 'employee';
  permissions?: string[];
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
        .select('organization_id, username, role, account_type, permissions')
        .eq('id', rawUser.id)
        .single();

      return {
        id: rawUser.id,
        organizationId: profile?.organization_id ?? '',
        username: profile?.username || rawUser.email || 'User',
        email: rawUser.email ?? undefined,
        role: profile?.role === 'employee' ? 'employee' : 'admin',
        accountType: profile?.account_type === 'personal' ? 'personal' : 'company',
        permissions: Array.isArray(profile?.permissions) ? profile.permissions : undefined,
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
        accountType: 'company',
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

  const registerAccount = useCallback(async (email: string, password: string, accountType: AccountType): Promise<RegisterAccountResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('register-admin', {
        body: { email, password, accountType },
      });

      if (error) throw error;
      if (!data || !data.success) {
        return { success: false, error: data?.error ?? 'Failed to create account.' };
      }

      const signedIn = await login(email, password);
      if (!signedIn) {
        return { success: false, error: 'Account created, but sign-in failed.' };
      }

      return { success: true, organizationId: data.organizationId, accountType };
    } catch (error) {
      console.error('Account registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown registration error' };
    }
  }, [login]);

  const registerAdmin = useCallback(async (email: string, password: string): Promise<RegisterAdminResult> => {
    const result = await registerAccount(email, password, 'company');
    return result;
  }, [registerAccount]);

  const addUser = useCallback(async (email: string, password: string, role: 'admin' | 'employee', permissions: string[] = []) => {
    if (!authState.user) return false;
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'add',
          payload: { email, password, role, permissions },
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
        },
      });
      if (error) throw error;
      return Boolean(data?.success);
    } catch (error) {
      console.error('Add user failed:', error);
      return false;
    }
  }, [authState.user]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          payload: { userId: id },
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
        },
      });
      if (error) throw error;
      return Boolean(data?.success);
    } catch (error) {
      console.error('Delete user failed:', error);
      return false;
    }
  }, []);

  const updateUserRole = useCallback(async (id: string, role: 'admin' | 'employee', permissions: string[] = []) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update',
          payload: { userId: id, role, permissions },
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
        },
      });
      if (error) throw error;
      return Boolean(data?.success);
    } catch (error) {
      console.error('Update user failed:', error);
      return false;
    }
  }, []);

  const getUsers = useCallback(async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list', payload: {} },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
        },
      });
      if (error) throw error;
      return (data?.data || []).map((row: any) => ({
        id: row.id,
        organizationId: row.organization_id,
        username: row.username,
        email: row.email ?? undefined,
        role: row.role,
        accountType: row.organizations?.account_type === 'personal' ? 'personal' : 'company',
        permissions: row.permissions ?? [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastLogin: row.last_login,
      }));
    } catch (error) {
      console.error('getUsers failed:', error);
      return [];
    }
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
    registerAccount,
    registerAdmin,
    addUser,
    deleteUser,
    updateUserRole,
    getUsers,
    hasAdmin,
  };
}
