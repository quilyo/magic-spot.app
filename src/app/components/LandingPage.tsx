import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';

const APP_STORE_URL = 'https://apps.apple.com/us/app/magic-spot/id6762166928';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.magicspot.app&pli=1';

function AppleIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function PlayIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
    </svg>
  );
}

export function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  // Skip landing for already-authenticated users
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/map', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Scroll-reveal animation
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
          }
        });
      },
      { threshold: 0.1 }
    );
    root.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mslp" ref={rootRef}>
      {/* ─── Fixed top nav with store links always visible ─── */}
      <nav className="mslp-nav">
        <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img src="/logo.png" alt="MagicSpot" />
          <span className="nav-brand-text">MAGIC<b>SPOT</b></span>
        </a>
        <div className="nav-links">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="nav-store dark">
            <AppleIcon size={16} />
            <span>App Store</span>
          </a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="nav-store light">
            <PlayIcon size={15} />
            <span>Google Play</span>
          </a>
          <button className="nav-web" onClick={() => navigate('/login')}>Web App</button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-badge"><span className="pulse" />Live parking data — New York City</div>
        <h1>LOOKING FOR<br /><span>PARKING SPOTS?</span></h1>
        <p className="hero-sub">Real-time street parking for NYC. Green dots mean open. Red dots mean taken. Know before you go.</p>
        <div className="btns">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="store-badge dark">
            <AppleIcon size={24} />
            <span className="sb-text"><small>Download on the</small><b>App Store</b></span>
          </a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="store-badge light">
            <PlayIcon size={22} />
            <span className="sb-text"><small>Get it on</small><b>Google Play</b></span>
          </a>
          <button className="btn-g" onClick={() => navigate('/login')}>Open Web App →</button>
        </div>
        <div className="phones-row">
          <div className="pf side"><img src="/screens/signin.png" alt="Sign in screen" loading="lazy" /></div>
          <div className="pf main"><img src="/screens/map-live.png" alt="Live parking map" /></div>
          <div className="pf side"><img src="/screens/spot-detail.png" alt="Spot detail" loading="lazy" /></div>
        </div>
      </section>

      {/* ─── Feature blocks ─── */}
      <section>
        <div className="container">

          <div className="fb reveal">
            <div className="ft">
              <p className="stag">Live map</p>
              <h3>EVERY SPOT.<br />RIGHT NOW.</h3>
              <p>MagicSpot overlays parking data on a live street map. Green dots are available spaces, red dots are occupied — with a real-time counter at the top showing exactly how many of each are in your area.</p>
              <p>The timestamp tells you exactly when the last data refresh came in, so you always know how fresh the picture is.</p>
              <div className="pills">
                <span className="pill on">● Available spots</span>
                <span className="pill on">● Occupied spots</span>
                <span className="pill">Live counter</span>
                <span className="pill">Last update time</span>
              </div>
            </div>
            <div className="fp"><div className="pf"><img src="/screens/map-live.png" alt="Live map with available and occupied spots" loading="lazy" /></div></div>
          </div>

          <div className="fb flip reveal">
            <div className="ft">
              <p className="stag">Smart filter</p>
              <h3>FILTER IN<br />ONE TAP.</h3>
              <p>Tap the <strong style={{ color: '#22C55E' }}>Available</strong> badge to show only open spots — the map clears to just green dots so you're not distracted by taken spaces.</p>
              <p>Tap <strong style={{ color: '#E8281E' }}>Occupied</strong> to flip it and show only taken spots. One tap toggles between full view, available-only, and occupied-only.</p>
              <div className="pills">
                <span className="pill on">Available-only filter</span>
                <span className="pill on">Occupied-only filter</span>
                <span className="pill">Instant map update</span>
              </div>
            </div>
            <div className="fp"><div className="pf"><img src="/screens/map-filtered.png" alt="Map filtered to available spots only" loading="lazy" /></div></div>
          </div>

          <div className="fb reveal">
            <div className="ft">
              <p className="stag">Navigate to spot</p>
              <h3>TAP A DOT.<br />DRIVE THERE.</h3>
              <p>Tap any spot on the map and a card slides up showing its current status and when it was last checked. Hit <strong>Navigate to Spot</strong> and you're handed off to Maps with turn-by-turn directions to that exact space.</p>
              <div className="pills">
                <span className="pill on">Spot status popup</span>
                <span className="pill on">Navigate to Spot</span>
                <span className="pill">Last-checked timestamp</span>
              </div>
            </div>
            <div className="fp"><div className="pf"><img src="/screens/spot-detail.png" alt="Spot detail with Navigate button" loading="lazy" /></div></div>
          </div>

          <div className="fb flip reveal">
            <div className="ft">
              <p className="stag">Alerts</p>
              <h3>GET NOTIFIED<br />INSTANTLY.</h3>
              <p>Tap the blue bell button to set up alerts for your area. When a spot opens up, MagicSpot pushes a notification straight to your phone — so you head out at exactly the right moment.</p>
              <p>No more obsessively refreshing the app. Just set it and get pinged.</p>
              <div className="pills">
                <span className="pill on">Push notifications</span>
                <span className="pill">Bell icon shortcut</span>
                <span className="pill">Area-based alerts</span>
              </div>
            </div>
            <div className="fp"><div className="pf"><img src="/screens/signup.png" alt="Sign up screen" loading="lazy" /></div></div>
          </div>

        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="stats-s">
        <div className="container">
          <div className="sg reveal">
            <div><div className="sn">FREE</div><div className="sl">Always. No subscription, no ads.</div></div>
            <div><div className="sn">24/7</div><div className="sl">Live spot data, around the clock</div></div>
            <div><div className="sn">NYC</div><div className="sl">Built for New York's streets</div></div>
          </div>
        </div>
      </section>

      {/* ─── All features ─── */}
      <section>
        <div className="container">
          <div className="reveal">
            <p className="stag">Features</p>
            <h2>EVERYTHING<br />YOU NEED</h2>
            <p className="sdesc">Every feature was built around the real frustrations of parking in New York City.</p>
          </div>
          <div className="fg reveal">
            <div className="fi"><div className="fic">🗺️</div><h3>Live parking map</h3><p>Real-time green and red dots on a street map. Every tracked spot in your area, updated continuously.</p></div>
            <div className="fi"><div className="fic">🔴</div><h3>Available / Occupied filter</h3><p>Tap the counter badges to instantly filter the map to only open spots or only taken ones. The map responds immediately.</p></div>
            <div className="fi"><div className="fic">🧭</div><h3>Navigate to spot</h3><p>Tap any dot to see its status and last-checked time, then hit Navigate to get turn-by-turn directions to that exact space.</p></div>
            <div className="fi"><div className="fic">🔔</div><h3>Spot alerts</h3><p>Set up area notifications via the bell button. Get an instant alert the moment a spot opens near your destination.</p></div>
            <div className="fi"><div className="fic">🔄</div><h3>Manual refresh</h3><p>Hit the refresh button anytime for the latest data. A timestamp shows exactly when the last update came in.</p></div>
            <div className="fi"><div className="fic">👤</div><h3>Simple accounts</h3><p>Sign up with name and email. Your account syncs across the iPhone app, the Android app, and the web app at magic-spot.com.</p></div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="cta-s">
        <div className="container reveal">
          <p className="stag">Get the app</p>
          <h2>STOP CIRCLING.<br /><span style={{ color: 'var(--red)' }}>START PARKING.</span></h2>
          <p className="cta-sub">Free on iPhone, Android, and the web. No subscription, no ads.</p>
          <div className="btns">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="store-badge dark">
              <AppleIcon size={24} />
              <span className="sb-text"><small>Download on the</small><b>App Store</b></span>
            </a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="store-badge light">
              <PlayIcon size={22} />
              <span className="sb-text"><small>Get it on</small><b>Google Play</b></span>
            </a>
            <button className="btn-g" onClick={() => navigate('/login')}>Open Web App →</button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mslp-footer">
        <div className="fb2"><img src="/logo.png" alt="" /><span>MAGICSPOT</span></div>
        <div className="fl">
          <a href="/support/">Support</a>
          <a href="/account-deletion.html">Account Deletion</a>
          <a href="/privacy/">Privacy Policy</a>
          <a href="/terms/">Terms</a>
        </div>
        <div className="fc">© {new Date().getFullYear()} MagicSpot · New York City</div>
      </footer>

      <style>{`
.mslp{
  --red:#E8281E;--red-dark:#B81F16;
  --black:#0A0A0A;--dark:#111111;--dark2:#181818;
  --surface:#1E1E1E;--surface2:#272727;
  --border:rgba(255,255,255,0.08);--border-red:rgba(232,40,30,0.22);
  --text:#F0EDE8;--text2:#9A9087;--green:#22C55E;--radius:14px;
  font-family:'DM Sans',sans-serif;background:var(--black);color:var(--text);
  font-size:16px;line-height:1.65;overflow-x:hidden;min-height:100vh;
}
.mslp .mslp-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 48px;background:rgba(10,10,10,0.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
.mslp .nav-brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}
.mslp .nav-brand img{width:36px;height:36px;border-radius:8px;object-fit:contain;}
.mslp .nav-brand-text{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:1px;color:var(--text);line-height:1;}
.mslp .nav-brand-text b{color:var(--red);font-weight:normal;}
.mslp .nav-links{display:flex;align-items:center;gap:10px;}
.mslp .nav-store{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;padding:9px 18px;border-radius:50px;text-decoration:none;transition:transform 0.15s,box-shadow 0.2s;white-space:nowrap;}
.mslp .nav-store.dark{background:#000;color:#fff;border:1px solid rgba(255,255,255,0.2);}
.mslp .nav-store.light{background:#fff;color:#111;}
.mslp .nav-store:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.45);}
.mslp .nav-web{background:transparent;color:var(--text2);border:1px solid rgba(255,255,255,0.15);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;padding:9px 18px;border-radius:50px;cursor:pointer;transition:border-color 0.2s,color 0.2s;white-space:nowrap;}
.mslp .nav-web:hover{border-color:var(--red);color:var(--red);}
.mslp .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:140px 24px 80px;position:relative;overflow:hidden;}
.mslp .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 50% 25%,rgba(232,40,30,0.13) 0%,transparent 65%),radial-gradient(ellipse 35% 25% at 15% 85%,rgba(232,40,30,0.07) 0%,transparent 60%);pointer-events:none;}
.mslp .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,40,30,0.1);border:1px solid rgba(232,40,30,0.35);border-radius:50px;padding:6px 18px;font-size:13px;font-weight:500;color:var(--red);margin-bottom:28px;animation:mslp-fadeUp 0.5s ease both;position:relative;}
.mslp .pulse{width:7px;height:7px;border-radius:50%;background:var(--red);animation:mslp-blink 2s infinite;}
.mslp h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(44px,10vw,118px);line-height:0.9;letter-spacing:2px;margin:0 0 24px;animation:mslp-fadeUp 0.5s 0.1s ease both;position:relative;}
.mslp h1 span{color:var(--red);}
.mslp .hero-sub{font-size:clamp(16px,2vw,19px);color:var(--text2);font-weight:300;max-width:520px;margin:0 auto 40px;animation:mslp-fadeUp 0.5s 0.2s ease both;position:relative;}
.mslp .btns{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:center;animation:mslp-fadeUp 0.5s 0.3s ease both;position:relative;}
.mslp .store-badge{display:inline-flex;align-items:center;gap:11px;padding:12px 26px;border-radius:50px;text-decoration:none;transition:transform 0.15s,box-shadow 0.2s;}
.mslp .store-badge.dark{background:#000;color:#fff;border:1px solid rgba(255,255,255,0.2);box-shadow:0 0 40px rgba(232,40,30,0.18);}
.mslp .store-badge.light{background:#fff;color:#111;}
.mslp .store-badge:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.5);}
.mslp .sb-text{display:flex;flex-direction:column;align-items:flex-start;line-height:1.2;}
.mslp .sb-text small{font-size:10px;font-weight:400;opacity:0.65;}
.mslp .sb-text b{font-size:16px;font-weight:600;}
.mslp .btn-g{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--text2);font-family:'DM Sans',sans-serif;font-weight:500;font-size:16px;padding:15px 32px;border-radius:50px;text-decoration:none;border:1px solid rgba(255,255,255,0.15);cursor:pointer;transition:border-color 0.2s,color 0.2s,transform 0.15s;}
.mslp .btn-g:hover{border-color:var(--red);color:var(--red);transform:translateY(-2px);}
.mslp .phones-row{display:flex;justify-content:center;align-items:flex-end;gap:20px;margin-top:72px;position:relative;animation:mslp-fadeUp 0.7s 0.4s ease both;}
.mslp .phones-row::after{content:'';position:absolute;bottom:-30px;left:50%;transform:translateX(-50%);width:700px;height:160px;background:radial-gradient(ellipse at 50% 100%,rgba(232,40,30,0.16) 0%,transparent 65%);pointer-events:none;}
.mslp .pf{border-radius:42px;border:2px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.04);flex-shrink:0;}
.mslp .pf img{display:block;width:100%;height:auto;}
.mslp .pf.main{width:220px;}
.mslp .pf.side{width:178px;opacity:0.72;transform:scale(0.91);}
.mslp section{padding:100px 24px;}
.mslp .container{max-width:1100px;margin:0 auto;}
.mslp .stag{font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:var(--red);margin-bottom:14px;}
.mslp h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(40px,6vw,72px);line-height:0.95;letter-spacing:1.5px;margin:0 0 18px;}
.mslp .sdesc{font-size:17px;color:var(--text2);font-weight:300;max-width:500px;line-height:1.7;}
.mslp .fb{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;margin-bottom:96px;}
.mslp .fb.flip{direction:rtl;}.mslp .fb.flip>*{direction:ltr;}
.mslp .ft h3{font-family:'Bebas Neue',sans-serif;font-size:clamp(32px,4vw,52px);letter-spacing:1px;line-height:1;margin:0 0 16px;color:var(--text);}
.mslp .ft p{font-size:16px;color:var(--text2);line-height:1.75;font-weight:300;margin-bottom:14px;}
.mslp .ft p strong{color:var(--text);}
.mslp .pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
.mslp .pill{background:var(--surface);border:1px solid var(--border-red);border-radius:50px;padding:6px 16px;font-size:13px;font-weight:500;color:var(--text2);}
.mslp .pill.on{background:rgba(232,40,30,0.1);color:var(--red);border-color:rgba(232,40,30,0.3);}
.mslp .fp{display:flex;justify-content:center;position:relative;}
.mslp .fp::before{content:'';position:absolute;inset:-20px;border-radius:50%;background:radial-gradient(circle,rgba(232,40,30,0.09) 0%,transparent 65%);pointer-events:none;}
.mslp .fp .pf{width:260px;}
.mslp .stats-s{background:var(--dark2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.mslp .sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:48px;text-align:center;}
.mslp .sn{font-family:'Bebas Neue',sans-serif;font-size:72px;color:var(--red);line-height:1;letter-spacing:2px;}
.mslp .sl{font-size:14px;color:var(--text2);margin-top:8px;font-weight:300;}
.mslp .fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2px;margin-top:52px;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;}
.mslp .fi{background:var(--surface);padding:32px 28px;transition:background 0.2s;}
.mslp .fi:hover{background:var(--surface2);}
.mslp .fic{width:44px;height:44px;border-radius:10px;background:rgba(232,40,30,0.1);border:1px solid rgba(232,40,30,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px;}
.mslp .fi h3{font-size:17px;font-weight:600;margin:0 0 8px;color:var(--text);}
.mslp .fi p{font-size:14px;color:var(--text2);line-height:1.65;}
.mslp .cta-s{text-align:center;position:relative;overflow:hidden;background:var(--dark2);border-top:1px solid var(--border);}
.mslp .cta-s::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 55% 80% at 50% 50%,rgba(232,40,30,0.1) 0%,transparent 70%);pointer-events:none;}
.mslp .cta-sub{color:var(--text2);font-size:18px;margin-bottom:36px;font-weight:300;}
.mslp .mslp-footer{padding:36px 48px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;}
.mslp .fb2{display:flex;align-items:center;gap:8px;}
.mslp .fb2 img{width:28px;height:28px;border-radius:6px;object-fit:contain;}
.mslp .fb2 span{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;}
.mslp .fl{display:flex;flex-wrap:wrap;gap:24px;}
.mslp .fl a{font-size:13px;color:var(--text2);text-decoration:none;transition:color 0.2s;}
.mslp .fl a:hover{color:var(--text);}
.mslp .fc{font-size:12px;color:var(--text2);}
.mslp .reveal{opacity:0;transform:translateY(32px);transition:opacity 0.65s ease,transform 0.65s ease;}
.mslp .reveal.visible{opacity:1;transform:translateY(0);}
@keyframes mslp-blink{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.35;transform:scale(0.7);}}
@keyframes mslp-fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
@media(max-width:900px){
  .mslp .fb{grid-template-columns:1fr;gap:40px;}
  .mslp .fb.flip{direction:ltr;}
  .mslp .mslp-nav{padding:10px 16px;}
  .mslp section{padding:72px 20px;}
  .mslp .mslp-footer{padding:28px 20px;flex-direction:column;align-items:flex-start;}
  .mslp .nav-web{display:none;}
}
@media(max-width:600px){
  .mslp .pf.side{display:none;}
  .mslp .pf.main{width:200px;}
  .mslp .nav-store{padding:9px 12px;}
  .mslp .nav-store span{display:none;}
}
      `}</style>
    </div>
  );
}
