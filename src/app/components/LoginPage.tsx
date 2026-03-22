import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { toast } from 'sonner';
import { MapPin, Loader2 } from 'lucide-react';

const REMEMBERED_EMAIL_KEY = 'magicspot_remembered_email';
const KEEP_LOGGED_IN_KEY = 'magicspot_keep_logged_in';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const { login, signup, isAuthenticated, hasActiveSubscription, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const mapBgRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Load a decorative blurred Leaflet map in the background
  useEffect(() => {
    const tryInit = () => {
      const L = (window as any).L;
      if (!L || !mapBgRef.current || mapInstanceRef.current) return;
      mapInstanceRef.current = L.map(mapBgRef.current, {
        center: [40.7923, -73.9369],
        zoom: 17,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        keyboard: false,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);
    };

    if ((window as any).L) {
      tryInit();
    } else {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
      if (!document.querySelector('script[src*="leaflet.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = tryInit;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Redirect if user arrives at /login while already authenticated
  // (e.g. page refresh with existing session, back-button, direct URL)
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (hasActiveSubscription) {
        navigate('/', { replace: true });
      } else {
        navigate('/pricing', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, hasActiveSubscription, navigate]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const keepLoggedIn = localStorage.getItem(KEEP_LOGGED_IN_KEY);
    if (rememberedEmail && keepLoggedIn === 'true') {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (isSignup) {
      const passwordError = validatePassword(password);
      if (passwordError) { toast.error(passwordError); return; }
      if (!name) { toast.error('Please enter your name'); return; }
      if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
      if (!agreedToTerms) { toast.error('Please agree to the Terms and Conditions'); return; }
    } else {
      if (password.length < 6) { toast.error('Password must be at least 6 characters long'); return; }
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, name);
        navigate('/email-confirmation', { state: { email }, replace: true });
        return;
      } else {
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
          localStorage.setItem(KEEP_LOGGED_IN_KEY, 'true');
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
          localStorage.removeItem(KEEP_LOGGED_IN_KEY);
        }
        const profile = await login(email, password);
        toast.success('Signed in successfully');
        // Navigate based on returned profile data (not React state)
        // to avoid race condition where state hasn't committed yet.
        const sub = profile.subscription;
        const isSubActive = !!sub && sub.status === 'active' &&
          (!sub.expires_at || new Date(sub.expires_at) > new Date());
        if (isSubActive || profile.role === 'admin') {
          navigate('/', { replace: true });
        } else {
          navigate('/pricing', { replace: true });
        }
        return; // skip finally's setLoading
      }
    } catch (error: any) {
      toast.error(error.message || `${isSignup ? 'Signup' : 'Login'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Blurred map background */}
      <div
        className="absolute inset-0"
        style={{ filter: 'blur(6px)', transform: 'scale(1.08)' }}
      >
        <div ref={mapBgRef} style={{ width: '100%', height: '100%' }} />
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MagicSpot</span>
          </div>

          <h2 className="text-center text-gray-900 mb-5 font-bold text-lg">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </h2>

          {!isSignup && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-700 text-center font-medium">
                First time here? Click "Sign up" below to create an account
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium text-sm">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 rounded-xl"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignup ? 'Min 8 chars, uppercase, lowercase, number' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 rounded-xl"
                disabled={loading}
              />
              {isSignup && password && (
                <div className="mt-2 text-xs space-y-1">
                  <div className={password.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </div>
                  <div className={/[A-Z]/.test(password) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                  </div>
                  <div className={/[a-z]/.test(password) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                  </div>
                  <div className={/[0-9]/.test(password) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {/[0-9]/.test(password) ? '✓' : '○'} One number
                  </div>
                </div>
              )}
            </div>

            {isSignup && (
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>
            )}

            {isSignup && (
              <div className="flex items-start space-x-2 p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  disabled={loading}
                  className="mt-0.5 flex-shrink-0"
                />
                <Label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    Terms and Conditions
                  </a>{' '}
                  and Privacy Policy.
                </Label>
              </div>
            )}

            {!isSignup && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                    Keep me logged in
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-xl py-3 text-base shadow-lg shadow-gray-900/20 transition-all hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isSignup ? 'Creating account...' : 'Signing in...'}</>
              ) : (
                isSignup ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const wasSignup = isSignup;
                setIsSignup(!isSignup);
                setName('');
                setPassword('');
                setConfirmPassword('');
                setAgreedToTerms(false);
                if (wasSignup) {
                  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
                  if (rememberedEmail) {
                    setEmail(rememberedEmail);
                    setRememberMe(true);
                  } else {
                    setEmail('');
                  }
                } else {
                  setEmail('');
                }
              }}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            MagicSpot - Real-time Parking Monitoring
          </div>
        </div>
      </div>
    </div>
  );
}
