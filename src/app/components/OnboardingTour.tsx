import { useState, type ReactNode } from 'react';
import { Button } from '@/app/components/ui/button';
import { MapPin, LocateFixed, Navigation, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

const ONBOARDED_KEY = 'magicspot_onboarded_v1';

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

function markOnboardingSeen() {
  try {
    localStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    // ignore — worst case the tour shows again next time
  }
}

interface Slide {
  icon: ReactNode;
  title: string;
  body: string;
}

const slides: Slide[] = [
  {
    icon: <MapPin className="w-8 h-8 text-gray-900" />,
    title: 'Welcome to MagicSpot',
    body: 'MagicSpot shows you parking spots in real time. Each dot on the map is a spot — green means available, red means occupied.',
  },
  {
    icon: <LocateFixed className="w-8 h-8 text-blue-600" />,
    title: 'Find yourself',
    body: 'Tap the locate button to center the map on your current location, shown as a blue dot. Make sure location permission is enabled.',
  },
  {
    icon: <Navigation className="w-8 h-8 text-green-600" />,
    title: 'Jump to the nearest spot',
    body: 'Tap “Nearest spot” and MagicSpot finds the closest available spot to you, opens its details, and gives you a one-tap “Navigate to Spot” button that opens Google Maps directions.',
  },
  {
    icon: <Bell className="w-8 h-8 text-blue-600" />,
    title: 'Get alerts',
    body: 'Turn on the bell to be alerted when a spot opens up near you. You’re all set — happy parking!',
  },
];

export function OnboardingTour({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;
  const slide = slides[index];

  const finish = () => {
    markOnboardingSeen();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[4000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Skip */}
        <div className="flex justify-end">
          <button onClick={finish} className="text-xs text-gray-400 hover:text-gray-600">
            Skip
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center my-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            {slide.icon}
          </div>
        </div>

        {/* Text */}
        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">{slide.title}</h2>
        <p className="text-sm text-gray-600 text-center leading-relaxed min-h-[80px]">{slide.body}</p>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 my-5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-gray-900' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {index > 0 ? (
            <Button
              variant="outline"
              onClick={() => setIndex(i => i - 1)}
              className="flex-1 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : (
            <div className="flex-1" />
          )}

          {isLast ? (
            <Button
              onClick={finish}
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-semibold"
            >
              Get started
            </Button>
          ) : (
            <Button
              onClick={() => setIndex(i => i + 1)}
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-semibold"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
