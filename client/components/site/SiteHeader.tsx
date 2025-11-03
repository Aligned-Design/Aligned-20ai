import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-soft">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Aligned AI"
        >
          <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-azure text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Aligned AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Features
          </a>
          <a
            href="#agents"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Agents
          </a>
          <a
            href="#engine"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Monthly Engine
          </a>
          <a
            href="#security"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Security
          </a>
          <a
            href="#analytics"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Analytics
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-violet to-azure text-white shadow-glow hover:shadow-glow-azure"
          >
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
