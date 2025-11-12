import { Link } from "react-router-dom";
import { Github, Linkedin, Mail } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t bg-background">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold">Aligned AI</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            We make marketing flow—on-brand, on-time, and one step ahead.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/integrations"
                className="hover:text-foreground transition-colors"
              >
                Integrations
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/help"
                className="hover:text-foreground transition-colors"
              >
                Help Center
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" /> hello@aligned.ai
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aligned AI. All rights reserved.
      </div>
    </footer>
  );
}
