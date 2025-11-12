import { Search, ChevronDown, Bell, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onHelpClick?: () => void;
}

export function Header({ onHelpClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-border fixed top-0 left-0 right-0 z-40 h-16">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-foreground hidden sm:inline">
            Aligned
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full placeholder-muted-foreground"
            />
          </div>

          <button
            onClick={onHelpClick}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Help"
            aria-label="Open help drawer"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-semibold">
              JD
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              Jane Doe
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
