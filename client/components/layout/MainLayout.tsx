import { ReactNode, useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { HelpDrawer } from "@/components/dashboard/HelpDrawer";
import { useLocation } from "react-router-dom";
import { useHelpState } from "@/hooks/useHelpState";
import type { PageKey } from "@/types/help";

interface MainLayoutProps {
  children: ReactNode;
}

const PAGE_MAP: Record<string, PageKey> = {
  "/dashboard": "dashboard",
  "/calendar": "calendar",
  "/library": "library",
  "/creative-studio": "studio",
  "/brand-guide": "brand",
  "/analytics": "analytics",
};

export function MainLayout({ children }: MainLayoutProps) {
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();
  const { setHelpLastOpen } = useHelpState();

  const currentPage: PageKey = PAGE_MAP[location.pathname] || "dashboard";

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
    setHelpLastOpen(true);
  };

  const handleHelpClose = () => {
    setShowHelpDrawer(false);
  };

  const handleReplayTour = () => {
    window.location.href = "/onboarding?step=5";
  };

  // Prevent blank screens during hydration: show a temporary loading overlay
  useEffect(() => {
    let mounted = true;
    const markReady = () => {
      if (mounted) setIsReady(true);
    };

    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady);
    }

    // Also ensure we don't hang the overlay forever
    const t = setTimeout(markReady, 800);

    return () => {
      mounted = false;
      window.removeEventListener("load", markReady);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showHelpDrawer) {
        handleHelpClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showHelpDrawer]);

  return (
    <div className="min-h-screen bg-white">
      <Header onHelpClick={handleHelpClick} />
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 z-30 overflow-y-auto">
          <Sidebar />
        </div>
        {/* Main content - Full width on mobile, offset on desktop */}
        <main className="w-full md:ml-64 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative">
          {children}
        </main>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={handleHelpClose}
        currentPage={currentPage}
        onReplayTour={handleReplayTour}
      />

      {/* Temporary loading overlay to avoid blank screens during hydration */}
      {!isReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <p className="text-sm text-slate-600 font-medium">Loading the app…</p>
          </div>
        </div>
      )}
    </div>
  );
}
