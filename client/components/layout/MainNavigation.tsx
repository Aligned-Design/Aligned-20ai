/**
 * Main navigation component
 * Dynamically renders navigation based on route visibility metadata and user permissions
 */

import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth/useAuth";
import { useCan } from "@/lib/auth/useCan";
import { getContextualNavItems } from "@/lib/navigation-helpers";

interface MainNavigationProps {
  brandName?: string;
}

export function MainNavigation({
  brandName = "Aligned AI",
}: MainNavigationProps) {
  const location = useLocation();
  const { user, role } = useAuth();
  const canCheck = useCan;
  const canManageBrand = useCan("brand:manage");

  // Get navigation items based on user context and permissions
  const navItems = getContextualNavItems({
    isAuthenticated: !!user,
    isClient: role === "CLIENT",
    canCheck: (scope: string) => canCheck(scope),
  });

  return (
    <nav className="flex flex-col h-full">
      {/* Branding */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">
          {canManageBrand ? "Aligned AI" : brandName}
        </h2>
        <p className="text-xs text-gray-500 capitalize">
          {role ? role.toLowerCase().replace(/_/g, " ") : "Portal"}
        </p>
      </div>

      {/* Search - Agency only */}
      {canManageBrand && (
        <div className="p-4 border-b border-gray-200">
          <input
            type="search"
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm border rounded"
          />
        </div>
      )}

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 text-sm ${
              location.pathname === item.path
                ? "bg-purple-100 text-purple-900 border-r-2 border-purple-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            {item.label}
          </Link>
        ))}
      </div>

      {/* User info */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MainNavigation;
