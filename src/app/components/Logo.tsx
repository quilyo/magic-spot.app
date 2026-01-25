interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  return (
    <div className="flex items-center cursor-pointer" onClick={onClick}>
      <span className="text-xl font-bold text-black">MagicSpot</span>
    </div>
  );
}