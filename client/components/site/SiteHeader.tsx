import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutGrid, Shield, BarChart3 } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Aligned AI">
          <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Aligned AI</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <LayoutGrid className="h-4 w-4" /> Features
          </a>
          <a href="#agents" className="text-muted-foreground hover:text-foreground transition-colors">Agents</a>
          <a href="#engine" className="text-muted-foreground hover:text-foreground transition-colors">Monthly Engine</a>
          <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <Shield className="h-4 w-4" /> Security
          </a>
          <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Analytics
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground shadow-md shadow-fuchsia-500/20 hover:opacity-90">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
