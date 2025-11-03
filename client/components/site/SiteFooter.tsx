import { Github, Linkedin, Mail } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t bg-background">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold">Aligned AI</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            We make marketing flow—on-brand, on-time, and one step ahead.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Features</a></li>
            <li><a href="#agents" className="hover:text-foreground">Agents</a></li>
            <li><a href="#engine" className="hover:text-foreground">Monthly Engine</a></li>
            <li><a href="#analytics" className="hover:text-foreground">Analytics</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-2"><Mail className="h-4 w-4"/> hello@aligned.ai</li>
            <li className="inline-flex items-center gap-2"><Github className="h-4 w-4"/> github.com/aligned-ai</li>
            <li className="inline-flex items-center gap-2"><Linkedin className="h-4 w-4"/> linkedin.com/company/aligned-ai</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aligned AI. All rights reserved.
      </div>
    </footer>
  );
}
