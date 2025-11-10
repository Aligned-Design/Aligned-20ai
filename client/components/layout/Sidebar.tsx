import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  ListTodo,
  Zap,
  Palette,
  BarChart3,
  Library,
  MapPin,
  Star,
  DollarSign,
  Link2,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { CreateWorkspaceModal } from "@/components/dashboard/CreateWorkspaceModal";
import { useState } from "react";

// Navigation items organized by group
const navGroups = [
  {
    title: "Main",
    items: [
      { icon: Home, label: "Dashboard", href: "/dashboard" },
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: ListTodo, label: "Content Queue", href: "/content-queue" },
      { icon: Sparkles, label: "Creative Studio", href: "/creative-studio" },
    ],
  },
  {
    title: "Strategy",
    items: [
      { icon: Zap, label: "Campaigns", href: "/campaigns" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
      { icon: Star, label: "Reviews", href: "/reviews" },
      { icon: DollarSign, label: "Paid Ads", href: "/paid-ads" },
      { icon: MapPin, label: "Events", href: "/events" },
    ],
  },
  {
    title: "Assets",
    items: [
      { icon: Palette, label: "Brand Guide", href: "/brand-guide" },
      { icon: Library, label: "Library", href: "/library" },
      { icon: Link2, label: "Linked Accounts", href: "/linked-accounts" },
    ],
  },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Sign Out", href: "/auth/logout" },
];

const systemLabel = "System";

export function Sidebar() {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
          isActive
            ? "bg-lime-400 text-indigo-950 shadow-md shadow-lime-400/30"
            : "text-white/70 hover:text-white hover:bg-white/10"
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <aside className="w-64 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800">
        {/* Workspace Switcher */}
        <div className="px-3 py-4 border-b border-white/10">
          <WorkspaceSwitcher onCreateClick={() => setShowCreateModal(true)} />
        </div>

        {/* Main Navigation Groups */}
        <nav className="flex-1 px-4 py-6 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 px-4 mb-3">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System Navigation */}
      <nav className="px-4 py-4 space-y-1 border-t border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 px-4 mb-3">
          {systemLabel}
        </h3>
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </nav>
      </aside>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
