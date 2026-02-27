import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/hooks/useAuth';
import { SubscriptionGate, AuthGate, AdminGate } from '@/app/components/SubscriptionGate';
import { LoginPage } from '@/app/components/LoginPage';
import { ResetPasswordPage } from '@/app/components/ResetPasswordPage';
import { EmailConfirmationPage } from '@/app/components/EmailConfirmationPage';
import { PricingPage } from '@/app/components/PricingPage';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { TermsPage } from '@/app/components/TermsPage';
import { ParkingMap } from '@/app/components/ParkingMap';
import { ParkingData } from '@/app/types/parking';
import * as api from '@/app/services/api';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import {
  RefreshCw,
  LogOut,
  User,
  ChevronDown,
  Mail,
  ChevronRight,
  Trash2,
  CreditCard,
  Shield,
  MapPin,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

/* ─── Map Page (main authenticated view) ─── */
function MapPage() {
  const {
    user,
    isAdmin,
    subscriptionTier,
    logout,
  } = useAuth();
  const navigate = useNavigate();

  const [parkingData, setParkingData] = useState<ParkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapResetTrigger, setMapResetTrigger] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const loadParkingData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchParkingData();
      setParkingData(data);
    } catch (error) {
      console.error("Failed to fetch parking data:", error);
      toast.error('Failed to load parking data');
    } finally {
      setLoading(false);
    }
  };

  // Load data and set up auto-refresh
  useEffect(() => {
    loadParkingData();
    const interval = setInterval(loadParkingData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Geolocation tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Close dropdown on outside click
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
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
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
      
      // Construct the Supabase URL using the project ID (same as client.tsx)
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

  const tierBadge = subscriptionTier === 'pro'
    ? <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2">PRO</span>
    : subscriptionTier === 'beta'
    ? <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2">BETA</span>
    : null;

  return (
    <div className="flex flex-col relative overflow-hidden bg-gray-100" style={{ height: '100dvh', minHeight: '100dvh' }}>
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <ParkingMap
          spots={parkingData?.spots || []}
          availableCount={parkingData?.available_count || 0}
          occupiedCount={parkingData?.occupied_count || 0}
          resetTrigger={mapResetTrigger}
          isPreviewMode={false}
          userLocation={userLocation}
        />
      </div>

      {/* Floating Top Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1500] flex items-start justify-between">
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
              {tierBadge}
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
                        {tierBadge && <div className="mt-1">{tierBadge}</div>}
                      </div>
                      <button onClick={() => { navigate('/pricing'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                        <CreditCard className="w-3.5 h-3.5" /> Subscription
                      </button>
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

                  {/* Admin */}
                  {isAdmin && (
                    <button onClick={() => { navigate('/admin'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-purple-700 hover:bg-purple-50 rounded-lg transition-colors mt-1">
                      <Shield className="w-4 h-4" /><span className="font-medium">Admin Dashboard</span>
                    </button>
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
          <Button onClick={loadParkingData} disabled={loading} size="sm" className="bg-white/90 backdrop-blur-xl border border-white/60 text-gray-900 hover:bg-white font-medium shadow-lg rounded-xl">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-2 hidden sm:inline">{loading ? 'Updating...' : 'Refresh'}</span>
          </Button>
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-3 border border-white/60">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700 flex-shrink-0"></div>
                <span className="text-sm text-gray-900 font-medium">Available: {parkingData?.available_count || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-800 flex-shrink-0"></div>
                <span className="text-sm text-gray-900 font-medium">Occupied: {parkingData?.occupied_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Logo */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1500]">
        <button onClick={() => setMapResetTrigger((p) => p + 1)} className="bg-white/90 backdrop-blur-xl rounded-xl px-5 py-2.5 shadow-lg border border-white/60 flex items-center gap-2 hover:bg-white transition-colors">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">MagicSpot</span>
        </button>
      </div>

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
        <Toaster position="top-center" toastOptions={{ className: 'rounded-xl' }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/pricing" element={<AuthGate><PricingPage /></AuthGate>} />
          <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
          <Route path="/" element={<SubscriptionGate><MapPage /></SubscriptionGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}