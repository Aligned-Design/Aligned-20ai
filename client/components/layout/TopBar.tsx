import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, HelpCircle } from 'lucide-react';

interface TopBarProps {
  userRole: 'agency' | 'client';
}

export function TopBar({ userRole }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Page title will be set by individual pages */}
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'agency' && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Content
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}
}
