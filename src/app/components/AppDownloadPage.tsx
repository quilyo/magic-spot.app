import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const APP_STORE_URL = 'https://apps.apple.com/us/app/magic-spot/id6762166928';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.magicspot.app&pli=1';

export function AppDownloadPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">

          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-gray-900" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">MagicSpot</h1>
          <p className="text-blue-200 text-base mb-1">Real-time parking at your fingertips</p>
          <p className="text-white/50 text-sm mb-8">Get the app for the best experience</p>

          {/* App Store */}
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 w-full bg-black text-white rounded-2xl py-4 px-6 mb-3 hover:bg-gray-900 active:scale-95 transition-all shadow-lg border border-white/10"
          >
            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs text-gray-400 leading-none mb-0.5">Download on the</div>
              <div className="text-xl font-semibold leading-tight">App Store</div>
            </div>
          </a>

          {/* Play Store */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 w-full bg-white text-gray-900 rounded-2xl py-4 px-6 mb-8 hover:bg-gray-50 active:scale-95 transition-all shadow-lg"
          >
            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4CAF50" d="M7.5 4.1C7.05 4.35 6.67 4.74 6.47 5.27L24.24 23.09l6.02-6.02L7.5 4.1z"/>
              <path fill="#FF3D00" d="M41.16 21.52l-5.87-3.28-6.63 6.63 6.63 6.63 5.92-3.3C42.81 27.28 42.81 24.44 41.16 21.52z"/>
              <path fill="#FFC107" d="M6.47 42.73c.2.53.58.92 1.03 1.16L30.26 30.93l-6.02-6.02L6.47 42.73z"/>
              <path fill="#1976D2" d="M24.24 24L6.47 5.27C6.67 4.74 7.05 4.35 7.5 4.1L30.26 17.07 24.24 24zM30.26 30.93L7.5 43.89c-.45-.24-.83-.63-1.03-1.16L24.24 24.91l6.02 6.02z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs text-gray-500 leading-none mb-0.5">Get it on</div>
              <div className="text-xl font-semibold leading-tight">Google Play</div>
            </div>
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Continue to website */}
          <Button
            onClick={() => navigate('/map', { replace: true })}
            className="w-full border border-white/30 text-white bg-white/10 hover:bg-white/20 rounded-2xl py-3 text-base font-medium shadow-none"
          >
            Continue to website →
          </Button>

          <p className="mt-6 text-white/30 text-xs">
            MagicSpot — Real-time Parking Monitoring
          </p>
        </div>
      </div>
    </div>
  );
}
