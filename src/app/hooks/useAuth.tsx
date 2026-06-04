import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { supabase } from '@/utils/supabase/client';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { Capacitor } from '@capacitor/core';

// Google "Web application" OAuth client ID. On Android this is the serverClientId
// the native account picker uses to mint an ID token whose audience Supabase verifies.
// This same ID must be listed under Supabase → Auth → Providers → Google → Authorized Client IDs.
const GOOGLE_WEB_CLIENT_ID = '26050107859-liv40t29nto551r02229ovj54akbl0sq.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '26050107859-mpppgsd9l1gibi4jb7cvsllrd0lpd6hp.apps.googleusercontent.com';

// Google embeds the nonce we give the plugin into the ID token's `nonce` claim
// unmodified, while Supabase/GoTrue SHA-256-hashes the nonce we send it before
// comparing. So we hand the plugin the HASHED value and Supabase the RAW value:
// token.nonce = hashed, and GoTrue computes sha256(raw) == hashed → match.
async function generateNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return { raw, hashed };
}

// Initialise the native social-login plugin exactly once. Both Google and Apple
// must be declared here — the plugin only wires up a provider that appears in this
// call, otherwise login() rejects with "No provider was initialized". Passing an
// empty `apple` object selects the native flow (returns an idToken to JS, no
// backend redirect exchange).
let socialInitPromise: Promise<void> | null = null;
function ensureSocialInit(): Promise<void> {
  if (!socialInitPromise) {
    socialInitPromise = SocialLogin.initialize({
      google: { webClientId: GOOGLE_WEB_CLIENT_ID, iOSClientId: GOOGLE_IOS_CLIENT_ID },
      apple: {},
    }).catch((err) => {
      // Reset so a later attempt can retry initialisation
      socialInitPromise = null;
      throw err;
    });
  }
  return socialInitPromise;
}

export const isAppleSignInAvailable = () => Capacitor.getPlatform() === 'ios';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  signInWithApple: () => Promise<UserProfile>;
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

  if (profile) {
    return {
      id: profile.id,
      email: profile.email || resolvedEmail,
      name: profile.name,
      role: profile.role || 'user',
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
      clearTimeout(safetyTimeoutId);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    console.log('[Auth] Logging in...');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('No user data returned');
      console.log('[Auth] Sign in successful, user:', data.user.id);

      let profile: UserProfile;
      try {
        profile = await fetchUserProfile(data.user.id, data.user.email, data.user.user_metadata?.name || '', data.user.phone);
        console.log('[Auth] Profile loaded on login:', profile.role);
      } catch (err) {
        console.error('[Auth] Profile fetch on login failed, using minimal user:', err);
        profile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          role: 'user',
          created_at: new Date().toISOString(),
        };
      }
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

  const signInWithGoogle = async (): Promise<UserProfile> => {
    console.log('[Auth] Google sign-in starting...');
    setLoading(true);

    // ── WEB: use Supabase's hosted OAuth redirect flow ──────────────────────
    // The native Social Login plugin falls back to Google Identity Services on
    // the web, which sends redirect_uri = the current page (e.g.
    // https://magic-spot.com/login) to Google — causing redirect_uri_mismatch.
    // On the web we instead hand off to Supabase, whose redirect_uri is the
    // registered https://<project>.supabase.co/auth/v1/callback URL. Supabase
    // then returns the user to `redirectTo` below.
    if (!Capacitor.isNativePlatform()) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) {
          setLoading(false);
          throw new Error(error.message);
        }
        // The browser is now navigating to Google. This promise intentionally
        // never resolves so the caller doesn't flash a success/error toast
        // before the redirect happens. Session is picked up on return via the
        // onAuthStateChange listener.
        return new Promise<UserProfile>(() => {});
      } catch (err) {
        setLoading(false);
        throw err;
      }
    }

    // ── NATIVE (Android / iOS): Credential Manager → ID token → Supabase ─────
    try {
      await ensureSocialInit();

      // Sign out of Google first so the plugin does a FRESH sign-in. Otherwise its
      // restorePreviousSignIn path returns a cached/refreshed token whose nonce
      // claim is from an earlier session and won't match the one we send Supabase.
      try { await SocialLogin.logout({ provider: 'google' }); } catch {}

      const { raw: nonce, hashed: hashedNonce } = await generateNonce();

      // NOTE: do NOT pass `scopes` here — requesting scopes triggers Google's
      // authorization flow, which requires extra MainActivity wiring. Plain
      // sign-in returns email + profile inside the ID token via Credential Manager.
      const res: any = await SocialLogin.login({
        provider: 'google',
        options: { nonce: hashedNonce },
      });

      const idToken: string | undefined = res?.result?.idToken;
      if (!idToken) {
        throw new Error('Google did not return an ID token. Check the SHA-1 fingerprint and Web client ID configuration.');
      }
      console.log('[Auth] Got Google ID token, exchanging with Supabase...');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        nonce,
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('No user data returned from Supabase');
      console.log('[Auth] Supabase session established for', data.user.id);

      const name =
        data.user.user_metadata?.name ||
        data.user.user_metadata?.full_name ||
        res?.result?.profile?.name ||
        '';

      let profile: UserProfile;
      try {
        profile = await fetchUserProfile(data.user.id, data.user.email, name, data.user.phone);
      } catch (err) {
        console.error('[Auth] Profile fetch after Google sign-in failed, using minimal user:', err);
        profile = {
          id: data.user.id,
          email: data.user.email || '',
          name,
          role: 'user',
          created_at: new Date().toISOString(),
        };
      }

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

  const signInWithApple = async (): Promise<UserProfile> => {
    console.log('[Auth] Apple sign-in starting...');
    setLoading(true);
    try {
      await ensureSocialInit();

      // Same nonce convention as Google: Apple embeds our hashed nonce in the token,
      // Supabase hashes the raw nonce we send and compares the two.
      const { raw: nonce, hashed: hashedNonce } = await generateNonce();

      const res: any = await SocialLogin.login({
        provider: 'apple',
        options: { scopes: ['email', 'name'], nonce: hashedNonce },
      });

      const idToken: string | undefined = res?.result?.idToken;
      if (!idToken) {
        throw new Error('Apple did not return an ID token. Check the Sign in with Apple capability and Supabase Apple provider configuration.');
      }
      console.log('[Auth] Got Apple ID token, exchanging with Supabase...');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: idToken,
        nonce,
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('No user data returned from Supabase');
      console.log('[Auth] Supabase session established for', data.user.id);

      // Apple only returns the user's name on the FIRST sign-in ever, so prefer the
      // plugin's profile fields and fall back to whatever Supabase already stored.
      const p = res?.result?.profile;
      const appleName = [p?.givenName, p?.familyName].filter(Boolean).join(' ').trim();
      const name =
        appleName ||
        data.user.user_metadata?.name ||
        data.user.user_metadata?.full_name ||
        '';

      let profile: UserProfile;
      try {
        profile = await fetchUserProfile(data.user.id, data.user.email, name, data.user.phone);
      } catch (err) {
        console.error('[Auth] Profile fetch after Apple sign-in failed, using minimal user:', err);
        profile = {
          id: data.user.id,
          email: data.user.email || '',
          name,
          role: 'user',
          created_at: new Date().toISOString(),
        };
      }

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
        emailRedirectTo: 'https://magic-spot.com/email-confirmation',
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
      created_at: new Date().toISOString(),
    });

    fetchUserProfile(data.user.id, data.user.email!, name)
      .then(profile => setUser(profile))
      .catch(err => console.error('[Auth] Background profile fetch failed:', err));
  };

  const logout = async () => {
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // Session was already invalid — local state is cleared, nothing more to do.
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://magic-spot.com/reset-password',
    });
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      signInWithGoogle,
      signInWithApple,
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
