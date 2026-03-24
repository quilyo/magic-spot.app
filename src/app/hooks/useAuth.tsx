import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { supabase } from '@/utils/supabase/client';
import type { UserProfile, Subscription, SubscriptionTier } from '@/app/types/subscription';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  subscriptionTier: SubscriptionTier;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function fetchUserProfile(userId: string, email: string | undefined, name: string, phone?: string): Promise<UserProfile> {
  // Phone users have no email — use a placeholder so the NOT NULL column doesn't break
  const resolvedEmail = email || (phone ? `phone_${phone.replace(/\D/g, '')}@phone.auth` : '');
  let profile: any = null;
  let sub: any = null;

  try {
    console.log('[Auth] Fetching profile for', userId);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Auth] Error fetching profile:', error.message, error.code, error.hint);
    } else {
      profile = data;
      console.log('[Auth] Profile fetched:', !!profile);
    }
  } catch (err) {
    console.error('[Auth] Profile fetch exception:', err);
  }

  try {
    console.log('[Auth] Fetching subscriptions for', userId);
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (subError) {
      console.error('[Auth] Error fetching subscriptions:', subError.message, subError.code, subError.hint);
    } else if (subData && subData.length > 0) {
      sub = subData.find((s: any) => s.status === 'active') || subData[0];
      console.log('[Auth] Subscription found:', sub?.tier, sub?.status, 'expires:', sub?.expires_at);
    } else {
      console.log('[Auth] No subscriptions found');
    }
  } catch (err) {
    console.error('[Auth] Subscription fetch exception:', err);
  }

  if (profile) {
    return {
      id: profile.id,
      email: profile.email || resolvedEmail,
      name: profile.name,
      role: profile.role || 'user',
      subscription: sub ? {
        id: sub.id,
        user_id: sub.user_id,
        tier: sub.tier,
        status: sub.status,
        starts_at: sub.starts_at,
        expires_at: sub.expires_at,
        stripe_customer_id: sub.stripe_customer_id,
        stripe_subscription_id: sub.stripe_subscription_id,
        created_at: sub.created_at,
        updated_at: sub.updated_at,
      } : null,
      created_at: profile.created_at,
    };
  }

  // Profile doesn't exist - create it
  const { data: newProfile, error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email: resolvedEmail,
      name,
      role: 'user',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating user profile:', insertError);
  }

  return {
    id: userId,
    email: resolvedEmail,
    name,
    role: 'user',
    subscription: null,
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchUserProfile(
        session.user.id,
        session.user.email,
        session.user.user_metadata?.name || '',
        session.user.phone
      );
      // flushSync ensures the state is committed synchronously so callers
      // can navigate immediately and components see the updated profile.
      flushSync(() => setUser(profile));
      return profile;
    }
    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        console.log('[Auth] Checking session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Auth] Session:', session ? 'found' : 'none');
        if (session?.user && isMounted) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name || '',
            session.user.phone
          );
          if (isMounted) setUser(profile);
          console.log('[Auth] User loaded:', profile.email, 'role:', profile.role);
        }
      } catch (error) {
        console.error('[Auth] Session check failed:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[Auth] Loading complete');
        }
      }
    };

    // Safety net: force loading=false after 20s no matter what
    let safetyTimeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[Auth] Safety timeout reached - forcing load complete');
        setLoading(false);
      }
    }, 20000);

    checkSession().then(() => {
      // Cancel safety timeout once checkSession finishes,
      // so it can't interfere with login()'s loading state later.
      clearTimeout(safetyTimeoutId);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      // Don't fetch profile here — login/signup/checkSession handle it.
      // Awaiting async work here blocks signInWithPassword from resolving.
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    console.log('[Auth] Logging in...');
    setLoading(true); // Prevent SubscriptionGate from redirecting to /pricing mid-login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('No user data returned');
      console.log('[Auth] Sign in successful, user:', data.user.id);

      // Fetch the full profile (with subscription/role) before setting user.
      let profile: UserProfile;
      try {
        profile = await fetchUserProfile(data.user.id, data.user.email, data.user.user_metadata?.name || '', data.user.phone);
        console.log('[Auth] Profile loaded on login:', profile.role, 'sub:', profile.subscription?.tier, profile.subscription?.status);
      } catch (err) {
        console.error('[Auth] Profile fetch on login failed, using minimal user:', err);
        profile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          role: 'user',
          subscription: null,
          created_at: new Date().toISOString(),
        };
      }
      // flushSync commits both updates synchronously so that
      // when the caller navigates, SubscriptionGate sees the real state.
      flushSync(() => {
        setUser(profile);
        setLoading(false);
      });
      return profile;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    console.log('[Auth] Signing up...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/email-confirmation`,
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No user data returned');
    console.log('[Auth] Signup successful, user:', data.user.id);

    setUser({
      id: data.user.id,
      email: data.user.email!,
      name,
      role: 'user',
      subscription: null,
      created_at: new Date().toISOString(),
    });

    fetchUserProfile(data.user.id, data.user.email!, name)
      .then(profile => setUser(profile))
      .catch(err => console.error('[Auth] Background profile fetch failed:', err));
  };

  const logout = async () => {
    // Always clear local state first so the user is signed out in the UI
    // even if the Supabase API call fails (e.g. 403 from an expired token).
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // Session was already invalid — local state is cleared, nothing more to do.
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const subscription = user?.subscription;
  const hasActiveSubscription = !!subscription && subscription.status === 'active' &&
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date());

  const subscriptionTier: SubscriptionTier = hasActiveSubscription
    ? (subscription?.tier || 'none')
    : 'none';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isAdmin,
      hasActiveSubscription,
      subscriptionTier,
      login,
      signup,
      logout,
      resetPassword,
      updatePassword,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
