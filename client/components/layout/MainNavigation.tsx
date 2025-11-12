/**
 * Main navigation component
 * Displays different nav items based on user role
 */

import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth/useAuth";
import { useCan } from "@/lib/auth/useCan";

const agencyNavItems = [
  { label: "Dashboard", icon: "📊", path: "/dashboard" },
  { label: "Creative Studio", icon: "✨", path: "/creative-studio" },
  { label: "Content Queue", icon: "📝", path: "/content-queue" },
  { label: "Approvals", icon: "✓", path: "/approvals" },
  { label: "Campaigns", icon: "📢", path: "/campaigns" },
  { label: "Analytics", icon: "📈", path: "/analytics" },
  { label: "Calendar", icon: "📅", path: "/calendar" },
  { label: "Brand Guide", icon: "🎨", path: "/brand-guide" },
  { label: "Library", icon: "📚", path: "/library" },
];

const clientNavItems = [
  { label: "Dashboard", icon: "📊", path: "/dashboard" },
  { label: "Approvals", icon: "✓", path: "/approvals" },
  { label: "Analytics", icon: "📈", path: "/analytics" },
  { label: "Calendar", icon: "📅", path: "/calendar" },
];

interface MainNavigationProps {
  brandName?: string;
}

export function MainNavigation({
  brandName = "Aligned AI",
}: MainNavigationProps) {
  const location = useLocation();
  const { user, role } = useAuth();

  // Determine which nav items to show based on role
  // BRAND_MANAGER+ see agency items, others see client items
  const canManageBrand = useCan('brand:manage');
  const navItems = canManageBrand ? agencyNavItems : clientNavItems;

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
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 text-sm ${
              location.pathname === item.path
                ? "bg-purple-100 text-purple-900 border-r-2 border-purple-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </a>
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
