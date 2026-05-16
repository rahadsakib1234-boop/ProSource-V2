const noop = async () => ({ data: null as any, error: null as any });

export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';
export interface Session {
  user: {
    id: string;
    email?: string | null;
    created_at?: string | null;
  };
}

const safeAuth = {
  signInWithPassword: noop,
  signOut: noop,
  signUp: noop,
  getSession: async () => ({ data: { session: null as Session | null }, error: null }),
  getUser: async () => ({ data: { user: null as Session['user'] | null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
};

const safeFunctions = {
  invoke: noop,
};

export const supabase = {
  auth: safeAuth,
  functions: safeFunctions,
} as any;
