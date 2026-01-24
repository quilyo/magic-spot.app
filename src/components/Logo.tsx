import { MapPin } from 'lucide-react';

interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  return (
    <div 
      className={`flex items-center justify-center gap-2 bg-white px-6 py-3 rounded-lg shadow-md border border-gray-300 ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <MapPin className="w-6 h-6 text-gray-900" />
      <span className="text-gray-900 font-bold">MagicSpot</span>
    </div>
  );
}