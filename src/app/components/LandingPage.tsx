import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';

const APP_STORE_URL = 'https://apps.apple.com/us/app/magic-spot/id6762166928';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.magicspot.app&pli=1';

export function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Skip landing for already-authenticated users
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/map', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

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
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(232,40,30,0.15) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 85% 90%, rgba(232,40,30,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '440px',
        background: '#1E1E1E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: 'clamp(32px, 6vw, 48px) clamp(24px, 8vw, 40px)',
        textAlign: 'center',
        boxShadow: '0 0 0 1px rgba(232,40,30,0.08), 0 40px 100px rgba(0,0,0,0.6)',
      }}>

        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
          <img
            src="/logo.png"
            alt="MagicSpot"
            style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'contain', boxShadow: '0 0 28px rgba(232,40,30,0.3)' }}
          />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '38px', letterSpacing: '3px', color: '#F0EDE8', lineHeight: 1 }}>
            Magic<span style={{ color: '#E8281E' }}>Spot</span>
          </div>
        </div>

        <p style={{ fontSize: '15px', fontWeight: 300, color: '#9A9087', marginBottom: '12px', lineHeight: 1.6 }}>
          Real-time street parking availability<br />across New York City.
        </p>

        {/* Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: 'rgba(232,40,30,0.1)',
          border: '1px solid rgba(232,40,30,0.3)',
          borderRadius: '50px',
          padding: '5px 14px',
          fontSize: '12px', fontWeight: 500,
          color: '#E8281E',
          marginBottom: '36px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#E8281E',
            animation: 'blink 2s infinite',
          }} />
          Live parking data
        </div>

        {/* App Store */}
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            width: '100%', padding: '16px 24px',
            borderRadius: '16px',
            background: '#000', color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            textDecoration: 'none',
            marginBottom: '12px',
            transition: 'transform 0.15s, box-shadow 0.2s',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
        >
          <svg width="26" height="26" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 400, opacity: 0.65, marginBottom: '1px' }}>Download on the</span>
            <span style={{ display: 'block', fontSize: '16px', fontWeight: 600 }}>App Store</span>
          </div>
        </a>

        {/* Google Play */}
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            width: '100%', padding: '16px 24px',
            borderRadius: '16px',
            background: '#fff', color: '#111',
            textDecoration: 'none',
            marginBottom: '24px',
            transition: 'transform 0.15s, box-shadow 0.2s',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
        >
          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 400, opacity: 0.55, marginBottom: '1px' }}>Get it on</span>
            <span style={{ display: 'block', fontSize: '16px', fontWeight: 600 }}>Google Play</span>
          </div>
        </a>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#9A9087', letterSpacing: '1px', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Continue to Web App */}
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: '100%', padding: '16px 24px',
            borderRadius: '16px',
            background: 'transparent', color: '#F0EDE8',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            fontSize: '15px', fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            transition: 'border-color 0.2s, color 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => { const el = e.currentTarget; el.style.borderColor = '#E8281E'; el.style.color = '#E8281E'; el.style.boxShadow = '0 0 20px rgba(232,40,30,0.12)'; }}
          onMouseOut={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.15)'; el.style.color = '#F0EDE8'; el.style.boxShadow = ''; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Continue to Web App
        </button>

        <div style={{ marginTop: '28px', fontSize: '11px', color: 'rgba(154,144,135,0.45)', lineHeight: 1.7 }}>
          <a href="/terms/" style={{ color: 'rgba(154,144,135,0.6)', textDecoration: 'none' }}>Terms</a>
          {' · '}
          <a href="/privacy/" style={{ color: 'rgba(154,144,135,0.6)', textDecoration: 'none' }}>Privacy</a>
          <br />MagicSpot — Real-time Parking Monitoring
        </div>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.35;transform:scale(0.7);}}`}</style>
    </div>
  );
}
