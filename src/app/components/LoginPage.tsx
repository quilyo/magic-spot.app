import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isAppleSignInAvailable } from '@/app/hooks/useAuth';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const REMEMBERED_EMAIL_KEY = 'magicspot_remembered_email';
const KEEP_LOGGED_IN_KEY = 'magicspot_keep_logged_in';

const inp = {
  width: '100%',
  background: '#272727',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '12px 16px',
  color: '#F0EDE8',
  fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
} as const;

const lbl = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 500,
  color: '#9A9087',
  marginBottom: '6px',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
} as const;

const primaryBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '14px 24px',
  borderRadius: '12px',
  background: '#E8281E',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
  boxShadow: '0 0 24px rgba(232,40,30,0.25)',
  transition: 'background 0.2s',
} as const;

export function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirmPassword, setSuConfirmPassword] = useState('');
  const [suTerms, setSuTerms] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const { login, signInWithGoogle, signInWithApple, isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const showApple = isAppleSignInAvailable();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !authLoading) navigate('/map', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const keepLoggedIn = localStorage.getItem(KEEP_LOGGED_IN_KEY);
    if (savedEmail && keepLoggedIn === 'true') { setSiEmail(savedEmail); setRememberMe(true); }
  }, []);

  const validatePassword = (p: string): string | null => {
    if (p.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(p)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(p)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(p)) return 'Password must contain a number';
    return null;
  };

  const redirectAfterAuth = (_profile: any) => navigate('/map', { replace: true });

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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const profile = await signInWithGoogle();
      toast.success('Signed in with Google');
      redirectAfterAuth(profile);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (!/cancel|canceled|cancelled|dismiss|13:|user/i.test(msg)) toast.error(msg || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const profile = await signInWithApple();
      toast.success('Signed in with Apple');
      redirectAfterAuth(profile);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (!/cancel|canceled|cancelled|dismiss|1001|user/i.test(msg)) toast.error(msg || 'Apple sign-in failed');
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token: otp, type: 'signup' });
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

  const goToSignIn = () => {
    setIsSignup(false);
    setSuName(''); setSuEmail(''); setSuPassword(''); setSuConfirmPassword(''); setSuTerms(false);
    setOtpSent(false); setOtp(''); setPendingEmail('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Red ambient glow */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(232,40,30,0.15) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 85% 90%, rgba(232,40,30,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '440px',
        background: '#1E1E1E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: 'clamp(32px,6vw,48px) clamp(24px,8vw,40px)',
        boxShadow: '0 0 0 1px rgba(232,40,30,0.08), 0 40px 100px rgba(0,0,0,0.6)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '28px' }}>
          <img src="/logo.png" alt="MagicSpot" style={{ width: '52px', height: '52px', borderRadius: '13px', objectFit: 'contain', boxShadow: '0 0 24px rgba(232,40,30,0.3)' }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', letterSpacing: '3px', color: '#F0EDE8', lineHeight: 1 }}>
            Magic<span style={{ color: '#E8281E' }}>Spot</span>
          </div>
        </div>

        {/* Sign In / Sign Up toggle */}
        {!otpSent && (
          <div style={{ display: 'flex', background: '#272727', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
            {(['Sign In', 'Sign Up'] as const).map((label) => {
              const active = label === 'Sign In' ? !isSignup : isSignup;
              return (
                <button key={label} type="button"
                  onClick={label === 'Sign In' ? goToSignIn : () => setIsSignup(true)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                    fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s',
                    background: active ? '#E8281E' : 'transparent',
                    color: active ? '#fff' : '#9A9087',
                    boxShadow: active ? '0 2px 12px rgba(232,40,30,0.3)' : 'none',
                  }}
                >{label}</button>
              );
            })}
          </div>
        )}

        {/* Apple */}
        {!otpSent && showApple && (
          <button type="button" onClick={handleAppleSignIn} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '13px 20px', borderRadius: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: '10px', opacity: loading ? 0.5 : 1 }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (
              <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            )}
            Continue with Apple
          </button>
        )}

        {/* Google */}
        {!otpSent && (
          <div style={{ marginBottom: '20px' }}>
            <button type="button" onClick={handleGoogleSignIn} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '13px 20px', borderRadius: '12px', background: '#272727', color: '#F0EDE8', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.5 : 1 }}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              Continue with Google
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '11px', color: '#9A9087', letterSpacing: '1px', textTransform: 'uppercase' as const }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>
          </div>
        )}

        {/* OTP */}
        {otpSent && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📧</div>
              <div style={{ fontSize: '17px', fontWeight: 600, color: '#F0EDE8' }}>Check your email</div>
              <div style={{ fontSize: '13px', color: '#9A9087', marginTop: '6px' }}>
                We sent a 6-digit code to{' '}
                <span style={{ color: '#F0EDE8', fontWeight: 600 }}>{pendingEmail}</span>
              </div>
            </div>
            <div>
              <label style={lbl}>Confirmation Code</label>
              <input type="text" inputMode="numeric" placeholder="123456" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ ...inp, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 700 }}
                disabled={loading} autoFocus />
            </div>
            <button type="submit" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.5 : 1 }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</> : 'Confirm Account'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#9A9087', marginBottom: '6px' }}>Didn't receive it? Check your spam folder.</div>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }}
                style={{ fontSize: '13px', color: '#9A9087', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                ← Use a different email
              </button>
            </div>
          </form>
        )}

        {/* Sign In */}
        {!otpSent && !isSignup && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={lbl}>Email</label>
              <input type="email" placeholder="Enter your email" value={siEmail}
                onChange={e => setSiEmail(e.target.value)} style={inp} disabled={loading} />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input type="password" placeholder="Enter your password" value={siPassword}
                onChange={e => setSiPassword(e.target.value)} style={inp} disabled={loading} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  disabled={loading} style={{ accentColor: '#E8281E', width: '15px', height: '15px' }} />
                <span style={{ fontSize: '13px', color: '#9A9087' }}>Keep me logged in</span>
              </label>
              <button type="button" onClick={() => navigate('/reset-password')}
                style={{ fontSize: '13px', fontWeight: 500, color: '#E8281E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.5 : 1 }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        )}

        {/* Sign Up */}
        {!otpSent && isSignup && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={lbl}>Full Name</label>
              <input type="text" placeholder="Enter your name" value={suName}
                onChange={e => setSuName(e.target.value)} style={inp} disabled={loading} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input type="email" placeholder="Enter your email" value={suEmail}
                onChange={e => setSuEmail(e.target.value)} style={inp} disabled={loading} />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input type="password" placeholder="Min 8 chars, uppercase, lowercase, number" value={suPassword}
                onChange={e => setSuPassword(e.target.value)} style={inp} disabled={loading} />
              {suPassword && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {([
                    [suPassword.length >= 8, 'At least 8 characters'],
                    [/[A-Z]/.test(suPassword), 'One uppercase letter'],
                    [/[a-z]/.test(suPassword), 'One lowercase letter'],
                    [/[0-9]/.test(suPassword), 'One number'],
                  ] as [boolean, string][]).map(([ok, label]) => (
                    <div key={label} style={{ fontSize: '12px', color: ok ? '#22C55E' : '#9A9087' }}>
                      {ok ? '✓' : '○'} {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>Confirm Password</label>
              <input type="password" placeholder="Re-enter your password" value={suConfirmPassword}
                onChange={e => setSuConfirmPassword(e.target.value)} style={inp} disabled={loading} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#272727', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
              <input type="checkbox" id="suTerms" checked={suTerms} onChange={e => setSuTerms(e.target.checked)}
                disabled={loading} style={{ accentColor: '#E8281E', width: '15px', height: '15px', marginTop: '1px', flexShrink: 0 }} />
              <label htmlFor="suTerms" style={{ fontSize: '12px', color: '#9A9087', lineHeight: 1.6, cursor: 'pointer' }}>
                I agree to the{' '}
                <button type="button" onClick={() => navigate('/terms')} style={{ color: '#E8281E', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" }}>Terms</button>
                {' '}and{' '}
                <button type="button" onClick={() => navigate('/privacy')} style={{ color: '#E8281E', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" }}>Privacy Policy</button>.
              </label>
            </div>
            <button type="submit" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.5 : 1 }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: 'rgba(154,144,135,0.4)' }}>
          MagicSpot — Real-time Parking Monitoring
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
