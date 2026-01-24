import { supabase } from '../utils/supabase/client';

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: data.name,
      },
      accessToken: authData.session?.access_token || '',
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Signup failed');
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    if (!authData.user) throw new Error('No user data returned');

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name || '',
      },
      accessToken: authData.session?.access_token || '',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || '',
      },
      accessToken: session.access_token,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

// Auth state listener
export const auth = {
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
