import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import { supabase } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { toast } from 'sonner';
import { MapPin, Loader2 } from 'lucide-react';

const REMEMBERED_EMAIL_KEY = 'magicspot_remembered_email';
const KEEP_LOGGED_IN_KEY = 'magicspot_keep_logged_in';

export function LoginPage() {
  // ── shared ───────────────────────────────────────────────────────────────
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── sign-in ───────────────────────────────────────────────────────────────
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // ── sign-up ───────────────────────────────────────────────────────────────
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirmPassword, setSuConfirmPassword] = useState('');
  const [suTerms, setSuTerms] = useState(false);

  // ── email OTP confirmation step ───────────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const { login, isAuthenticated, hasActiveSubscription, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const mapBgRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // ── decorative background map ─────────────────────────────────────────────
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

  // ── redirect if already authenticated ────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(hasActiveSubscription ? '/' : '/pricing', { replace: true });
    }
  }, [isAuthenticated, authLoading, hasActiveSubscription, navigate]);

  // ── restore remembered email ──────────────────────────────────────────────
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const keepLoggedIn = localStorage.getItem(KEEP_LOGGED_IN_KEY);
    if (savedEmail && keepLoggedIn === 'true') {
      setSiEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // ── helpers ───────────────────────────────────────────────────────────────
  const validatePassword = (p: string): string | null => {
    if (p.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(p)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(p)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(p)) return 'Password must contain a number';
    return null;
  };

  const redirectAfterAuth = (profile: any) => {
    const sub = profile?.subscription;
    const active =
      !!sub &&
      sub.status === 'active' &&
      (!sub.expires_at || new Date(sub.expires_at) > new Date());
    navigate(active || profile?.role === 'admin' ? '/' : '/pricing', { replace: true });
  };

  // ── sign-in ───────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siEmail || !siPassword) { toast.error('Enter email and password'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siEmail)) { toast.error('Enter a valid email address'); return; }
    if (siPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, siEmail);
        localStorage.setItem(KEEP_LOGGED_IN_KEY, 'true');
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        localStorage.removeItem(KEEP_LOGGED_IN_KEY);
      }
      const profile = await login(siEmail, siPassword);
      toast.success('Signed in successfully');
      redirectAfterAuth(profile);
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // ── sign-up: submit → sends 6-digit code to email ─────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suName.trim()) { toast.error('Please enter your name'); return; }
    if (!suEmail.trim()) { toast.error('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail)) { toast.error('Enter a valid email address'); return; }
    const pwErr = validatePassword(suPassword);
    if (pwErr) { toast.error(pwErr); return; }
    if (suPassword !== suConfirmPassword) { toast.error('Passwords do not match'); return; }
    if (!suTerms) { toast.error('Please agree to the Terms and Conditions'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: suEmail,
        password: suPassword,
        options: { data: { name: suName.trim() } },
      });
      if (error) throw error;
      setPendingEmail(suEmail);
      setOtpSent(true);
      toast.success(`Confirmation code sent to ${suEmail}`);
    } catch (err: any) {
      toast.error(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  // ── sign-up: verify 6-digit email code ───────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otp,
        type: 'signup',
      });
      if (error) throw error;
      const profile = await refreshProfile();
      toast.success('Account confirmed! Welcome to MagicSpot.');
      redirectAfterAuth(profile);
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  // ── reset helpers ─────────────────────────────────────────────────────────
  const goToSignIn = () => {
    setIsSignup(false);
    setSuName(''); setSuEmail(''); setSuPassword(''); setSuConfirmPassword(''); setSuTerms(false);
    setOtpSent(false); setOtp(''); setPendingEmail('');
  };

  const goToSignUp = () => {
    setIsSignup(true);
  };

  // ── render ────────────────────────────────────────────────────────────────
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

          {/* Sign In / Sign Up toggle — hidden during OTP step */}
          {!otpSent && (
            <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
              <button
                type="button"
                onClick={goToSignIn}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  !isSignup ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={goToSignUp}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isSignup ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* ══ OTP CONFIRMATION ════════════════════════════════════════════ */}
          {otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="text-4xl mb-3">📧</div>
                <h2 className="text-lg font-bold text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-gray-900">{pendingEmail}</span>
                </p>
              </div>

              <div>
                <Label htmlFor="otp" className="text-gray-700 font-medium text-sm">Confirmation Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 rounded-xl text-center text-2xl tracking-widest font-bold"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-xl py-3 text-base shadow-lg"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                  : 'Confirm Account'}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-xs text-gray-400">Didn't receive it? Check your spam folder.</p>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  ← Use a different email
                </button>
              </div>
            </form>
          )}

          {/* ══ SIGN IN ════════════════════════════════════════════════════ */}
          {!otpSent && !isSignup && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="siEmail" className="text-gray-700 font-medium text-sm">Email</Label>
                <Input
                  id="siEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="siPassword" className="text-gray-700 font-medium text-sm">Password</Label>
                <Input
                  id="siPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={siPassword}
                  onChange={(e) => setSiPassword(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(c as boolean)}
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

              <Button
                type="submit"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-xl py-3 text-base shadow-lg"
                disabled={loading}
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : 'Sign In'}
              </Button>
            </form>
          )}

          {/* ══ SIGN UP ════════════════════════════════════════════════════ */}
          {!otpSent && isSignup && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="suName" className="text-gray-700 font-medium text-sm">Full Name</Label>
                <Input
                  id="suName"
                  type="text"
                  placeholder="Enter your name"
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="suEmail" className="text-gray-700 font-medium text-sm">Email</Label>
                <Input
                  id="suEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="suPassword" className="text-gray-700 font-medium text-sm">Password</Label>
                <Input
                  id="suPassword"
                  type="password"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  value={suPassword}
                  onChange={(e) => setSuPassword(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
                {suPassword && (
                  <div className="mt-2 text-xs space-y-1">
                    <div className={suPassword.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {suPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                    </div>
                    <div className={/[A-Z]/.test(suPassword) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {/[A-Z]/.test(suPassword) ? '✓' : '○'} One uppercase letter
                    </div>
                    <div className={/[a-z]/.test(suPassword) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {/[a-z]/.test(suPassword) ? '✓' : '○'} One lowercase letter
                    </div>
                    <div className={/[0-9]/.test(suPassword) ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {/[0-9]/.test(suPassword) ? '✓' : '○'} One number
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="suConfirmPassword" className="text-gray-700 font-medium text-sm">Confirm Password</Label>
                <Input
                  id="suConfirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={suConfirmPassword}
                  onChange={(e) => setSuConfirmPassword(e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <div className="flex items-start space-x-2 p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                <Checkbox
                  id="suTerms"
                  checked={suTerms}
                  onCheckedChange={(c) => setSuTerms(c as boolean)}
                  disabled={loading}
                  className="mt-0.5 flex-shrink-0"
                />
                <Label htmlFor="suTerms" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/terms')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/privacy')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-xl py-3 text-base shadow-lg shadow-gray-900/20"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
                  : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            MagicSpot — Real-time Parking Monitoring
          </div>
        </div>
      </div>
    </div>
  );
}
