// Configuration - Update this with your deployed backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Store auth token in localStorage
function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

function removeAuthToken() {
  localStorage.removeItem('auth_token');
}

// Store user info in localStorage
function setUserInfo(user: { id: string; email: string; name: string }) {
  localStorage.setItem('user_info', JSON.stringify(user));
}

function getUserInfo() {
  const userStr = localStorage.getItem('user_info');
  return userStr ? JSON.parse(userStr) : null;
}

function removeUserInfo() {
  localStorage.removeItem('user_info');
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Signup API error:', result);
      throw new Error(result.error || 'Signup failed');
    }

    console.log('User created successfully:', result);

    // Store auth token and user info
    setAuthToken(result.access_token);
    setUserInfo(result.user);

    return {
      user: result.user,
      accessToken: result.access_token,
    };
  } catch (error) {
    console.error('Signup process error:', error);
    throw error;
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  console.log('Attempting login for email:', data.email);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Login API error:', result);
      throw new Error(result.error || 'Login failed');
    }

    console.log('Login successful for user:', result.user.email);

    // Store auth token and user info
    setAuthToken(result.access_token);
    setUserInfo(result.user);

    return {
      user: result.user,
      accessToken: result.access_token,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  removeAuthToken();
  removeUserInfo();
}

export async function getSession() {
  const token = getAuthToken();
  const userInfo = getUserInfo();

  if (!token || !userInfo) {
    return null;
  }

  // Verify token is still valid by calling /auth/me
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token is invalid, clear storage
      removeAuthToken();
      removeUserInfo();
      return null;
    }

    const result = await response.json();

    return {
      user: result.user,
      accessToken: token,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    // On error, clear storage
    removeAuthToken();
    removeUserInfo();
    return null;
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Mock auth state listener for compatibility with existing code
export const auth = {
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Mock implementation - just return a no-op subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};
