import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Brain,
  Users,
  Zap,
  ImageIcon,
  CreditCard,
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: "agency" | "client";
  onLogout?: () => void;
}

export function AppLayout({
  children,
  userRole = "agency",
  onLogout,
}: AppLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const agencyNavItems = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/brands", label: "Brands", icon: Building2 },
    { path: "/content", label: "Content", icon: FileText, badge: 3 },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/analytics/brand_1", label: "Analytics", icon: BarChart3 },
    { path: "/brand-intelligence", label: "Intelligence", icon: Brain },
    { path: "/integrations", label: "Integrations", icon: Zap },
    { path: "/media", label: "Media", icon: ImageIcon },
    { path: "/team", label: "Team", icon: Users },
    { path: "/billing", label: "Billing", icon: CreditCard },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const clientNavItems = [
    { path: "/client", label: "Overview", icon: LayoutDashboard },
    { path: "/client/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/client/approvals", label: "Approvals", icon: FileText, badge: 2 },
  ];

  const navItems = userRole === "agency" ? agencyNavItems : clientNavItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#0B0C10] text-slate-200 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Aligned AI</h2>
              <p className="text-xs text-gray-500 capitalize">
                {userRole} Portal
              </p>
            </div>
          </div>
        </div>

        {/* Search - Agency only */}
        {userRole === "agency" && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.path ||
              (item.path !== "/" && currentPath.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">john@agency.com</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
