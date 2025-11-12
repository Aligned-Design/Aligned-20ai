/**
 * Header component
 * Displays branding, search, help, notifications, and user menu
 */

import { useAuth } from "@/lib/auth/useAuth";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <div className="flex items-center justify-between h-16 px-6">
      {/* Logo and branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
          A
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Aligned</h1>
          <p className="text-xs text-gray-500">AI Platform</p>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-6">
        {/* Help button */}
        <button className="text-gray-600 hover:text-gray-900" title="Help">
          ?
        </button>

        {/* Notifications */}
        <button
          className="relative text-gray-600 hover:text-gray-900"
          title="Notifications"
        >
          🔔
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
            {user?.name?.substring(0, 1).toUpperCase() || "U"}
          </div>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Header;
