import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge as _Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Brain,
  Users,
  Search,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainNavigationProps {
  userRole: 'agency' | 'client';
  brandName?: string;
  onLogout?: () => void;
}

export function MainNavigation({ userRole, brandName, onLogout }: MainNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const agencyNavItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      badge: null
    },
    { 
      path: '/content', 
      label: 'Content', 
      icon: FileText,
      badge: { count: 3, variant: 'destructive' as const }
    },
    { 
      path: '/analytics/brand_1', 
      label: 'Analytics', 
      icon: BarChart3,
      badge: null
    },
    { 
      path: '/brand-intelligence', 
      label: 'Intelligence', 
      icon: Brain,
      badge: null
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings,
      badge: null
    }
  ];

  const clientNavItems = [
    { 
      path: '/client', 
      label: 'Overview', 
      icon: LayoutDashboard,
      badge: null
    },
    { 
      path: '/client/analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      badge: null
    },
    { 
      path: '/client/approvals', 
      label: 'Approvals', 
      icon: FileText,
      badge: { count: 2, variant: 'default' as const }
    }
  ];

  const navItems = userRole === 'agency' ? agencyNavItems : clientNavItems;

  return (
    <nav className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {userRole === 'agency' ? 'Aligned AI' : brandName || 'Brand Portal'}
            </h2>
            <p className="text-xs text-gray-500 capitalize">{userRole} Portal</p>
          </div>
        </div>
      </div>

      {/* Search - Agency only */}
      {userRole === 'agency' && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content, brands..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || 
            (item.path !== '/' && currentPath.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant={item.badge.variant}>
                  {item.badge.count}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      {/* Help & Support Section */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/help"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            currentPath === '/help'
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          <span className="flex-1">Help & Support</span>
        </Link>
      </div>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Demo User</p>
            <p className="text-xs text-gray-500">{userRole}@example.com</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
