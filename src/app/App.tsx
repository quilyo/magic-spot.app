import { useState, useEffect } from "react";
import { Logo } from "@/app/components/Logo";
import { ParkingMap } from "@/app/components/ParkingMap";
import { LoginScreen } from "@/app/components/LoginScreen";
import { ParkingData } from "@/app/types/parking";
import * as api from "@/app/services/api";
import * as auth from "@/app/services/auth";
import { RefreshCw, LogOut, User, ChevronDown, Mail, ChevronRight, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export default function App() {
  const [parkingData, setParkingData] = useState<ParkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    name?: string;
  } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mapResetTrigger, setMapResetTrigger] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isContactSubmenuOpen, setIsContactSubmenuOpen] = useState(false);
  const [isAccountSubmenuOpen, setIsAccountSubmenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load parking data for authenticated users only
  const loadParkingData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchParkingData();
      console.log("Loaded parking data:", {
        timestamp: data.timestamp,
        total_spots: data.total_spots,
        available: data.available_count,
        occupied: data.occupied_count,
        spots: data.spots.length,
      });
      setParkingData(data);
    } catch (error) {
      console.error("Failed to fetch parking data:", error);
      toast.error("Failed to load parking data");
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          setUserInfo({
            email: session.user.email,
            name: session.user.name,
          });
          // Load parking data only after confirming authentication
          await loadParkingData();
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setCheckingSession(false);
      }
    };

    // Only check session, don't load data yet
    checkSession();
  }, []);

  // Set up auto-refresh when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(loadParkingData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Track user location in real-time when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      toast.error("Geolocation not supported");
      return;
    }

    console.log("Starting geolocation tracking...");
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User location updated:", { lat: latitude, lon: longitude });
        setUserLocation({ lat: latitude, lon: longitude });
        setLocationError(null);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Location error";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000, // Update every 5 seconds if position changes
      }
    );

    return () => {
      console.log("Stopping geolocation tracking...");
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await auth.login({ email, password });
      setIsAuthenticated(true);
      setUserInfo({
        email: result.user.email,
        name: result.user.name,
      });
      toast.success("Logged in successfully");
      // Load parking data after successful login
      await loadParkingData();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleSignup = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const result = await auth.signup({
        email,
        password,
        name,
      });
      setIsAuthenticated(true);
      setUserInfo({
        email: result.user.email,
        name: result.user.name,
      });
      toast.success(`Welcome, ${name}! Account created successfully`);
      // Load parking data after successful signup
      await loadParkingData();
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setIsAuthenticated(false);
      setParkingData(null);
      setUserInfo(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const handleLogoClick = () => {
    setMapResetTrigger((prev) => prev + 1);
  };

  const handleDeleteAccount = async () => {
    if (!userInfo || deleteEmailInput !== userInfo.email) {
      toast.error("Email doesn't match. Please type your email correctly.");
      return;
    }

    try {
      const session = await auth.getSession();
      if (!session) {
        toast.error("No active session found");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-42996a40/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete account");
      }

      toast.success("Account deleted successfully");
      setShowDeleteModal(false);
      setDeleteEmailInput("");
      await handleLogout();
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen relative overflow-hidden">
      <Toaster />

      {/* Full-Screen Map Background */}
      <div className="absolute inset-0">
        <ParkingMap
          spots={parkingData?.spots || []}
          availableCount={parkingData?.available_count || 0}
          occupiedCount={parkingData?.occupied_count || 0}
          resetTrigger={mapResetTrigger}
          isPreviewMode={!isAuthenticated && !checkingSession}
          userLocation={userLocation}
        />
      </div>

      {/* Floating Header with Logo and Buttons */}
      <div className="absolute top-4 left-4 right-4 z-[1500] flex items-start justify-between mx-[0px] my-[-12px]">
        {/* User Dropdown Menu - Left Side */}
        {userInfo && (
          <div className="relative mx-[37px] user-dropdown-container">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white/20 backdrop-blur-md border-white/30 text-gray-900 hover:bg-white/30 font-medium shadow-lg pointer-events-auto mx-[-40px] my-[0px]"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {userInfo.name || userInfo.email}
              </span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            
            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 bg-white/20 backdrop-blur-md rounded-lg shadow-2xl border border-white/30"
                style={{ zIndex: 99999 }}
              >
                <div className="p-2">
                  {/* My Account Submenu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountSubmenuOpen(!isAccountSubmenuOpen)}
                      className="w-full flex items-center justify-between px-2 py-2 text-sm text-gray-900 hover:bg-gray-500/20 rounded cursor-pointer font-medium transition-colors"
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Account
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isAccountSubmenuOpen ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {/* Account Submenu Content */}
                    {isAccountSubmenuOpen && (
                      <div className="mt-1 ml-2 bg-white/10 rounded p-2 space-y-1">
                        <div className="px-2 py-2 text-sm text-gray-900 rounded">
                          <div className="font-medium text-gray-900">{userInfo.name}</div>
                          <div className="text-xs text-gray-800">{userInfo.email}</div>
                        </div>
                        
                        {/* Subscription Button */}
                        <button
                          onClick={() => {
                            toast.info("Subscription feature coming soon!");
                          }}
                          className="w-full flex items-center px-2 py-2 text-sm text-gray-900 hover:bg-green-500/20 hover:text-green-600 rounded cursor-pointer font-medium transition-colors"
                        >
                          <CreditCard className="w-3 h-3 mr-2" />
                          Subscription
                        </button>
                        
                        {/* Delete Account Button */}
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-500/20 rounded cursor-pointer font-medium transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete My Account
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Contact Us Button */}
                  <div className="relative mt-1">
                    <button
                      onClick={() => setIsContactSubmenuOpen(!isContactSubmenuOpen)}
                      className="w-full flex items-center justify-between px-2 py-2 text-sm text-gray-900 hover:bg-blue-500/20 hover:text-blue-600 rounded cursor-pointer font-medium transition-colors"
                    >
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Us
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isContactSubmenuOpen ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {/* Contact Submenu */}
                    {isContactSubmenuOpen && (
                      <div className="mt-1 ml-2 bg-white/10 rounded p-2">
                        <a
                          href="mailto:magicspot@5flutesdynamics.com"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                            setIsContactSubmenuOpen(false);
                          }}
                          className="flex items-center px-2 py-2 text-sm text-gray-900 hover:bg-blue-500/20 hover:text-blue-600 rounded cursor-pointer transition-colors break-all"
                        >
                          <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="text-xs text-[9px] font-bold font-normal">magicspot@5flutesdynamics.com</span>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full mt-1 flex items-center px-2 py-2 text-sm text-gray-900 hover:bg-red-500/20 hover:text-red-600 rounded cursor-pointer font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Buttons - Right Side */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <Button
              onClick={loadParkingData}
              disabled={loading || !isAuthenticated}
              size="sm"
              className="bg-white/20 backdrop-blur-md border border-white/30 text-gray-900 hover:bg-white/30 font-medium shadow-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="ml-2 hidden sm:inline">
                {loading ? "Updating..." : "Refresh"}
              </span>
            </Button>
          </div>
          
          {/* Available/Occupied Stats */}
          <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-lg p-3 border border-white/30">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-800"></div>
                <span className="text-sm text-black font-medium">Available: {parkingData?.available_count || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-900"></div>
                <span className="text-sm text-black font-medium">Occupied: {parkingData?.occupied_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Logo at Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1500]">
        <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg border border-white/30 mx-[0px] my-[60px]">
          <Logo onClick={handleLogoClick} />
        </div>
      </div>

      {/* Login Screen Overlay - Floating on top */}
      {(!isAuthenticated || checkingSession) && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto animate-in fade-in zoom-in-95 duration-500">
            {checkingSession ? (
              <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-2xl p-8">
                <div className="text-gray-900 text-lg">
                  Checking session...
                </div>
              </div>
            ) : (
              <div className="relative">
                <LoginScreen
                  onLogin={handleLogin}
                  onSignup={handleSignup}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            </div>
            
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <p className="text-sm text-red-700">
                All your account data, settings, and information will be permanently deleted. You will lose access to all MagicSpot features.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Type your email to confirm: <span className="text-red-600">{userInfo?.email}</span>
              </label>
              <input
                type="email"
                value={deleteEmailInput}
                onChange={(e) => setDeleteEmailInput(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteEmailInput("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteEmailInput !== userInfo?.email}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}