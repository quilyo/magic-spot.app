import { Users, Settings, LogOut, Menu, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { UserRole } from '../types/parking';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TopBannerProps {
  availableCount: number;
  occupiedCount: number;
  totalCount: number;
  userRole: UserRole;
  onAdminPanelToggle: () => void;
  onRoleToggle: () => void;
  showAdminPanel: boolean;
}

export function TopBanner({
  availableCount,
  occupiedCount,
  totalCount,
  userRole,
  onAdminPanelToggle,
  onRoleToggle,
  showAdminPanel
}: TopBannerProps) {
  return (
    <div className="bg-white border-b-2 border-gray-300 px-6 py-4 shadow-md">
      <div className="flex items-center justify-between">
        {/* Empty left side for balance */}
        <div></div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white text-gray-900 border-gray-900 hover:bg-gray-100 font-medium shadow"
              >
                <Menu className="w-4 h-4 mr-2" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Current Role</DropdownMenuLabel>
              <DropdownMenuItem disabled className="text-gray-900 font-medium">
                <Users className="w-4 h-4 mr-2" />
                {userRole === 'admin' ? 'Developer' : 'User'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRoleToggle}>
                <Users className="w-4 h-4 mr-2" />
                Switch to {userRole === 'admin' ? 'User' : 'Developer'}
              </DropdownMenuItem>
              {userRole === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onAdminPanelToggle}>
                    <Settings className="w-4 h-4 mr-2" />
                    {showAdminPanel ? 'Hide' : 'Show'} Admin Panel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}