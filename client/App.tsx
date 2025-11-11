import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import PaidAds from "./pages/PaidAds";
import BrandGuide from "./pages/BrandGuide";
import Analytics from "./pages/Analytics";
import ContentQueue from "./pages/ContentQueue";
import Campaigns from "./pages/Campaigns";
import LibraryPage from "./pages/Library";
import Events from "./pages/Events";
import Reviews from "./pages/Reviews";
import LinkedAccounts from "./pages/LinkedAccounts";
import Settings from "./pages/Settings";
import Reporting from "./pages/Reporting";
import CreativeStudio from "./pages/CreativeStudio";
import Approvals from "./pages/Approvals";

const queryClient = new QueryClient();

// Protected route wrapper that checks authentication and onboarding status
function ProtectedRoutes() {
  const { isAuthenticated, onboardingStep } = useAuth();

  // If authenticated and in onboarding, show onboarding flow (accessible at /onboarding)
  if (isAuthenticated && onboardingStep) {
    return <Onboarding />;
  }

  // If not authenticated, redirect to landing page
  if (!isAuthenticated) {
    return <Index />;
  }

  // If authenticated and completed onboarding, show protected routes
  return (
    <Routes>
      {/* Core Navigation */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/content-queue" element={<ContentQueue />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/creative-studio" element={<CreativeStudio />} />
      {/* Strategy Navigation */}
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/brand-guide" element={<BrandGuide />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reporting" element={<Reporting />} />
      <Route path="/paid-ads" element={<PaidAds />} />
      {/* Assets Navigation */}
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/events" element={<Events />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/linked-accounts" element={<LinkedAccounts />} />
      {/* Settings */}
      <Route path="/settings" element={<Settings />} />
      {/* Catch-all - show 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <WorkspaceProvider>
      <UserProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ProtectedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </UserProvider>
    </WorkspaceProvider>
  </QueryClientProvider>
);
