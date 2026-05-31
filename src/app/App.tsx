import { useState, useEffect, useRef, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { AuthProvider, useAuth } from '@/app/hooks/useAuth';
import { LoginPage } from '@/app/components/LoginPage';
import { ResetPasswordPage } from '@/app/components/ResetPasswordPage';
import { EmailConfirmationPage } from '@/app/components/EmailConfirmationPage';
import { TermsPage } from '@/app/components/TermsPage';
import { PrivacyPage } from '@/app/components/PrivacyPage';
import { ParkingMap } from '@/app/components/ParkingMap';
import { OnboardingTour, hasSeenOnboarding } from '@/app/components/OnboardingTour';
import { ParkingData } from '@/app/types/parking';
import * as api from '@/app/services/api';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import {
  RefreshCw,
  LogOut,
  User,
  ChevronDown,
  Mail,
  ChevronRight,
  Trash2,
  MapPin,
  Bell,
  BellOff,
  LocateFixed,
  Navigation,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

/* ─── Deep link handler for iOS/Android password reset and email confirmation ─── */
function DeepLinkHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    let sub: any;

    // Shared handler so both the live event (warm) and the launch URL (cold start) are processed.
    const handleUrl = async (rawUrl: string) => {
      try {
        if (rawUrl.startsWith('magicspot://')) {
          navigate('/login');
          return;
        }
        const url = new URL(rawUrl);
        if (url.pathname.startsWith('/reset-password')) {
          // Apply the recovery tokens so Supabase recognises the session
          // before ResetPasswordPage mounts and checks for it
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            const { supabase } = await import('@/utils/supabase/client');
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
          navigate('/reset-password');
        } else if (url.pathname.startsWith('/email-confirmation')) {
          navigate(`/email-confirmation${url.hash}`);
        }
      } catch {}
    };

    const setup = async () => {
      // Warm path: app already running when the link is tapped
      sub = await CapApp.addListener('appUrlOpen', (event) => {
        handleUrl(event.url);
      });

      // Cold-start path: the link launched the app. The appUrlOpen event fires
      // before this listener is registered, so read the launch URL directly.
      try {
        const launch = await CapApp.getLaunchUrl();
        if (launch?.url) {
          handleUrl(launch.url);
        }
      } catch {}
    };

    setup();
    return () => { sub?.remove(); };
  }, [navigate]);
  return null;
}

/* ─── Auth guards ─── */
function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

/* ─── Map Page (main authenticated view) ─── */
function MapPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [parkingData, setParkingData] = useState<ParkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mapResetTrigger, setMapResetTrigger] = useState(0);
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [focusSpot, setFocusSpot] = useState<ParkingData['spots'][number] | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('magicspot_alerts') === '1'; } catch { return false; }
  });
  const prevSpotsRef = useRef<Map<string, number>>(new Map());
  const lastAlertAtRef = useRef<number>(0);
  const userLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const alertsEnabledRef = useRef<boolean>(alertsEnabled);
  useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);
  useEffect(() => { alertsEnabledRef.current = alertsEnabled; }, [alertsEnabled]);

  const ALERT_RADIUS_M = 200;
  const distanceMeters = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const playChime = () => {
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const loadParkingData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchParkingData();

      const prev = prevSpotsRef.current;
      const newlyFreed: typeof data.spots = [];
      for (const spot of data.spots) {
        const prevState = prev.get(spot.id);
        if (prevState === 1 && spot.occupied !== 1) newlyFreed.push(spot);
      }
      const nextMap = new Map<string, number>();
      data.spots.forEach(s => nextMap.set(s.id, s.occupied));
      prevSpotsRef.current = nextMap;

      if (alertsEnabledRef.current && userLocationRef.current && newlyFreed.length > 0) {
        const now = Date.now();
        if (now - lastAlertAtRef.current >= 60000) {
          const nearby = newlyFreed.filter(s => {
            if (!s.lat || !s.lon) return false;
            return distanceMeters(userLocationRef.current!, { lat: s.lat, lon: s.lon }) <= ALERT_RADIUS_M;
          });
          if (nearby.length > 0) {
            lastAlertAtRef.current = now;
            playChime();
            const msg = nearby.length === 1
              ? 'A parking spot just opened nearby'
              : `${nearby.length} parking spots just opened nearby`;
            toast.success(msg, {
              description: 'Tap to see it on the map',
              action: { label: 'View', onClick: () => setMapResetTrigger(p => p + 1) },
            });
          }
        }
      }

      setParkingData(data);
      setLastUpdated(new Date(data.timestamp));
    } catch (error) {
      console.error("Failed to fetch parking data:", error);
      toast.error('Failed to load parking data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlerts = () => {
    if (!userLocation && !alertsEnabled) {
      toast.error('Enable location to use spot alerts');
      return;
    }
    setAlertsEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('magicspot_alerts', next ? '1' : '0'); } catch {}
      toast.success(next ? 'Spot alerts enabled' : 'Spot alerts disabled');
      return next;
    });
  };

  // Recenter the map on the user's current location
  const handleLocateMe = () => {
    if (!userLocation) {
      toast.error('Enable location to center the map on you');
      return;
    }
    setLocateTrigger(p => p + 1);
  };

  // Find the nearest available spot to the user and open it
  const handleFindNearest = () => {
    const available = (parkingData?.spots || []).filter(
      s => s.occupied !== 1 && s.lat && s.lon
    );
    if (available.length === 0) {
      toast.error('No available spots right now');
      return;
    }
    if (!userLocation) {
      // Fallback: no location yet — just show all spots and prompt
      toast.error('Enable location to find the spot nearest you');
      setMapResetTrigger(p => p + 1);
      return;
    }
    let nearest = available[0];
    let nearestDist = distanceMeters(userLocation, { lat: nearest.lat, lon: nearest.lon });
    for (const s of available) {
      const d = distanceMeters(userLocation, { lat: s.lat, lon: s.lon });
      if (d < nearestDist) { nearest = s; nearestDist = d; }
    }
    setFocusSpot(nearest);
    setFocusTrigger(p => p + 1);
    const meters = Math.round(nearestDist);
    const dist = meters < 1000 ? `${meters} m away` : `${(meters / 1000).toFixed(1)} km away`;
    toast.success(`Nearest available spot — ${dist}`);
  };

  useEffect(() => {
    loadParkingData();
    const interval = setInterval(loadParkingData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isDropdownOpen && !(e.target as HTMLElement).closest('.user-dropdown-container')) {
        setIsDropdownOpen(false);
        setIsAccountOpen(false);
        setIsContactOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore — logout clears local state regardless
    }
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteEmailInput !== user.email) {
      toast.error("Email doesn't match");
      return;
    }
    try {
      const { supabase } = await import('@/utils/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('No active session'); return; }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const supabaseUrl = `https://${projectId}.supabase.co`;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-42996a40/delete-account`,
        { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` } }
      );
      if (!response.ok) throw new Error(await response.text());
      toast.success('Account deleted');
      setShowDeleteModal(false);
      await handleLogout();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  return (
    <div className="flex flex-col relative overflow-hidden bg-gray-100" style={{ height: '100dvh', minHeight: '100dvh' }}>
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <ParkingMap
          spots={(parkingData?.spots || []).filter(s =>
            filter === 'all' ? true : filter === 'available' ? s.occupied !== 1 : s.occupied === 1
          )}
          availableCount={parkingData?.available_count || 0}
          occupiedCount={parkingData?.occupied_count || 0}
          resetTrigger={mapResetTrigger}
          isPreviewMode={false}
          userLocation={userLocation}
          locateTrigger={locateTrigger}
          focusSpot={focusSpot}
          focusTrigger={focusTrigger}
        />
      </div>

      {/* Floating Top Bar */}
      <div className="absolute left-3 right-3 z-[1500] flex items-start justify-between" style={{ top: 'max(12px, env(safe-area-inset-top))' }}>
        {/* User Menu */}
        {user && (
          <div className="relative user-dropdown-container">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); if (isDropdownOpen) { setIsAccountOpen(false); setIsContactOpen(false); } }}
              className="bg-white/90 backdrop-blur-xl border-white/60 text-gray-900 hover:bg-white font-medium shadow-lg rounded-xl"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline max-w-[120px] truncate">{user.name || user.email}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/60 overflow-hidden" style={{ zIndex: 99999 }}>
                <div className="p-2">
                  {/* Account */}
                  <button onClick={() => setIsAccountOpen(!isAccountOpen)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" /><span className="font-medium">My Account</span></div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isAccountOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isAccountOpen && (
                    <div className="ml-3 mt-1 bg-gray-50 rounded-lg p-2 space-y-1">
                      <div className="px-3 py-2 text-sm">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <button onClick={() => { setShowDeleteModal(true); setIsDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete Account
                      </button>
                    </div>
                  )}

                  {/* Contact */}
                  <button onClick={() => setIsContactOpen(!isContactOpen)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mt-1">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /><span className="font-medium">Contact Us</span></div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isContactOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isContactOpen && (
                    <div className="ml-3 mt-1 bg-gray-50 rounded-lg p-2">
                      <a href="mailto:mshelp@magic-spot.com" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-white rounded-lg transition-colors">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" /><span className="text-xs break-all">mshelp@magic-spot.com</span>
                      </a>
                    </div>
                  )}

                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <button onClick={() => { setIsDropdownOpen(false); handleLogout(); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" /><span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFindNearest}
              size="sm"
              title="Find the nearest available spot"
              className="bg-green-600 text-white border border-green-700 hover:bg-green-700 font-medium shadow-lg rounded-xl"
            >
              <Navigation className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Nearest spot</span>
            </Button>
            <Button
              onClick={handleLocateMe}
              size="sm"
              title="Center the map on my location"
              className="bg-white/90 backdrop-blur-xl border border-white/60 text-gray-900 hover:bg-white font-medium shadow-lg rounded-xl"
            >
              <LocateFixed className="w-4 h-4" />
            </Button>
            <Button
              onClick={toggleAlerts}
              size="sm"
              title={alertsEnabled ? 'Disable spot alerts' : 'Enable spot alerts'}
              className={`backdrop-blur-xl border font-medium shadow-lg rounded-xl ${
                alertsEnabled
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  : 'bg-white/90 border-white/60 text-gray-900 hover:bg-white'
              }`}
            >
              {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
            <Button onClick={loadParkingData} disabled={loading} size="sm" className="bg-white/90 backdrop-blur-xl border border-white/60 text-gray-900 hover:bg-white font-medium shadow-lg rounded-xl">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">{loading ? 'Updating...' : 'Refresh'}</span>
            </Button>
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-900 bg-white/90 backdrop-blur-xl px-2.5 py-1 rounded-xl shadow-lg border border-white/60 leading-tight text-right">
              {loading ? 'Updating…' : (
                <>
                  Last Update{' '}
                  {lastUpdated.toDateString() === new Date().toDateString()
                    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : lastUpdated.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                      lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </span>
          )}
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-1.5 border border-white/60">
            <div className="space-y-1">
              <button
                onClick={() => setFilter(f => f === 'available' ? 'all' : 'available')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${filter === 'available' ? 'bg-green-50 ring-2 ring-green-500' : 'hover:bg-gray-50'}`}
              >
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700 flex-shrink-0"></div>
                <span className="text-sm text-gray-900 font-medium">Available: {parkingData?.available_count || 0}</span>
              </button>
              <button
                onClick={() => setFilter(f => f === 'occupied' ? 'all' : 'occupied')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${filter === 'occupied' ? 'bg-red-50 ring-2 ring-red-500' : 'hover:bg-gray-50'}`}
              >
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-800 flex-shrink-0"></div>
                <span className="text-sm text-gray-900 font-medium">Occupied: {parkingData?.occupied_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help / replay tutorial */}
      <button
        onClick={() => setShowOnboarding(true)}
        title="How MagicSpot works"
        className="absolute z-[1500] bg-white/90 backdrop-blur-xl rounded-full p-2.5 shadow-lg border border-white/60 hover:bg-white transition-colors"
        style={{ left: 'max(12px, env(safe-area-inset-left))', bottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <HelpCircle className="w-5 h-5 text-gray-900" />
      </button>

      {/* Floating Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 z-[1500]" style={{ bottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <button onClick={() => setMapResetTrigger((p) => p + 1)} className="bg-white/90 backdrop-blur-xl rounded-xl px-5 py-2.5 shadow-lg border border-white/60 flex items-center gap-2 hover:bg-white transition-colors">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">MagicSpot</span>
        </button>
      </div>

      {/* First-time welcome tour */}
      {showOnboarding && <OnboardingTour onClose={() => setShowOnboarding(false)} />}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4"><Trash2 className="w-6 h-6 text-red-600" /><h2 className="text-xl font-bold text-gray-900">Delete Account</h2></div>
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 font-medium mb-2">Warning: This action cannot be undone!</p>
              <p className="text-sm text-red-700">All your data will be permanently deleted.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Type your email to confirm: <span className="text-red-600">{user?.email}</span></label>
              <input type="email" value={deleteEmailInput} onChange={(e) => setDeleteEmailInput(e.target.value)} placeholder="Enter your email" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { setShowDeleteModal(false); setDeleteEmailInput(''); }} variant="outline" className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleDeleteAccount} disabled={deleteEmailInput !== user?.email} className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-xl disabled:opacity-50"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Root App with Router ─── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DeepLinkHandler />
        <Toaster position="top-center" toastOptions={{ className: 'rounded-xl' }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/" element={<AuthGate><MapPage /></AuthGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
