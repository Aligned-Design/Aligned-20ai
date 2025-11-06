import React from "react";
import { Linkedin, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

export default function FooterNew() {
  return (
    <footer className="bg-[var(--surface-1)] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-extrabold text-white">Aligned AI</div>
          </div>

          <nav className="flex gap-6 flex-wrap">
            <Link to="/" className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]">
              Home
            </Link>
            <Link to="/features" className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]">
              Features
            </Link>
            <Link
              to="/integrations-marketing"
              className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]"
            >
              Integrations
            </Link>
            <Link to="/pricing" className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]">
              Pricing
            </Link>
            <Link to="/about" className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]">
              About
            </Link>
            <Link to="/contact" className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]">
              Contact
            </Link>
            <Link to="/terms" className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]">
              Terms
            </Link>
            <Link to="/privacy" className="text-[var(--text-main)] hover:text-[var(--indigo-mid)]">
              Privacy
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <a
              aria-label="LinkedIn"
              href="#"
              className="text-slate-300 hover:text-white"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              aria-label="Instagram"
              href="#"
              className="text-slate-300 hover:text-white"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              aria-label="Facebook"
              href="#"
              className="text-slate-300 hover:text-white"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-[var(--text-muted)]">
          © 2025 Aligned AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
