/**
 * Main application layout
 * Provides sidebar, header, and main content area
 */

import { ReactNode } from 'react';
import { MainNavigation } from './MainNavigation';
import { Header } from './Header';
import { useCan } from '@/lib/auth/useCan';

interface AppLayoutProps {
  children: ReactNode;
  brandName?: string;
  onLogout?: () => void;
}

export function AppLayout({
  children,
  brandName = "Aligned AI",
  onLogout,
}: AppLayoutProps) {
  // Determine layout based on permissions
  const canManageBrand = useCan('brand:manage');

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <MainNavigation brandName={brandName} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <Header onLogout={onLogout} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
