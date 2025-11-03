import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBrand } from '@/contexts/BrandContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  FolderOpen,
  BarChart3,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/brands', icon: Briefcase, label: 'Brands' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/assets', icon: FolderOpen, label: 'Assets' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { brands, currentBrand, setCurrentBrand } = useBrand();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Aligned AI</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {currentBrand && (
            <div className="mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="h-6 w-6 rounded"
                        style={{ backgroundColor: currentBrand.primary_color }}
                      />
                      <span className="truncate text-sm">{currentBrand.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Switch brand</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {brands.map((brand) => (
                    <DropdownMenuItem
                      key={brand.id}
                      onClick={() => setCurrentBrand(brand)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: brand.primary_color }}
                      />
                      <span className="truncate">{brand.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
