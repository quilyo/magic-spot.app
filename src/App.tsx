import { useState, useEffect } from "react";
import { Logo } from "./components/Logo";
import { ParkingMap } from "./components/ParkingMap";
import { LoginScreen } from "./components/LoginScreen";
import { ParkingData } from "./types/parking";
import * as api from "./services/api";
import * as auth from "./services/auth";
import {
  RefreshCw,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

export default function App() {
  const [parkingData, setParkingData] =
    useState<ParkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    name?: string;
  } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mapResetTrigger, setMapResetTrigger] = useState(0);

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
      console.log("First 5 spots:", data.spots.slice(0, 5));
      console.log(
        "All spot IDs:",
        data.spots.map((s) => s.id),
      );
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
      const interval = setInterval(loadParkingData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async (
    email: string,
    password: string,
  ) => {
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
    name: string,
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
      toast.success(
        `Welcome, ${name}! Account created successfully`,
      );
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen relative overflow-hidden">
      <Toaster />

      {/* Main App Content (always visible, no blur) */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-300 p-3 flex items-center justify-between shadow-md">
          <Logo onClick={handleLogoClick} />
          <div className="flex items-center gap-2">
            {/* User Dropdown Menu */}
            {userInfo && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium shadow"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {userInfo.name || userInfo.email}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 z-[2000]"
                  align="end"
                >
                  <DropdownMenuLabel>
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm text-gray-700">
                    <div className="font-medium">
                      {userInfo.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userInfo.email}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh Button */}
            <Button
              onClick={loadParkingData}
              disabled={loading || !isAuthenticated}
              size="sm"
              className="bg-gray-900 text-white hover:bg-gray-800 font-medium shadow relative"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="ml-2 hidden sm:inline">
                {loading ? "Updating..." : "Refresh"}
              </span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4 min-h-0">
          <ParkingMap
            spots={parkingData?.spots || []}
            availableCount={parkingData?.available_count || 0}
            occupiedCount={parkingData?.occupied_count || 0}
            resetTrigger={mapResetTrigger}
            isPreviewMode={!isAuthenticated && !checkingSession}
          />
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
    </div>
  );
}