import "./global.css";
import "./styles/tokens.css";
import "./styles/animations.css";

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
import { Navigate } from "react-router-dom";
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
import ClientPortal from "./pages/ClientPortal";
import BrandIntelligence from "./pages/BrandIntelligence";
import ContentGenerator from "./pages/ContentGenerator";
import ClientSettings from "./pages/ClientSettings";
import Brands from "./pages/Brands";
import BrandIntake from "./pages/BrandIntake";
import BrandSnapshot from "./pages/BrandSnapshot";
import Billing from "./pages/Billing";

const queryClient = new QueryClient();

// Protected route wrapper - handles authentication and routing
function ProtectedRoutes() {
  const { isAuthenticated, onboardingStep } = useAuth();

  return (
    <Routes>
      {/* Landing page - accessible to all, shown when not authenticated */}
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Index />} />

      {/* Onboarding flow - shown when authenticated but onboarding not complete */}
      <Route
        path="/onboarding"
        element={
          isAuthenticated && onboardingStep ? <Onboarding /> : <Index />
        }
      />

      {/* Auth aliases */}
      <Route
        path="/login"
        element={
          isAuthenticated && onboardingStep ? <Onboarding /> : <Index />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated && onboardingStep ? <Onboarding /> : <Index />
        }
      />

      {/* Protected routes - only show when authenticated and onboarding complete */}
      <Route
        path="/dashboard"
        element={isAuthenticated && !onboardingStep ? <Dashboard /> : <Index />}
      />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/content-queue" element={<ContentQueue />} />
      <Route path="/queue" element={<ContentQueue />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/creative-studio" element={<CreativeStudio />} />
      <Route path="/content-generator" element={<ContentGenerator />} />

      {/* Strategy Navigation */}
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/brand-intake" element={<BrandIntake />} />
      <Route path="/brand-guide" element={<BrandGuide />} />
      <Route path="/brand-snapshot" element={<BrandSnapshot />} />
      <Route path="/brand-intelligence" element={<BrandIntelligence />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reporting" element={<Reporting />} />
      <Route path="/reports" element={<Reporting />} />
      <Route path="/paid-ads" element={<PaidAds />} />
      <Route path="/ads" element={<PaidAds />} />

      {/* Assets Navigation */}
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/client-portal" element={<ClientPortal />} />
      <Route path="/events" element={<Events />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/linked-accounts" element={<LinkedAccounts />} />

      {/* Settings */}
      <Route path="/settings" element={<Settings />} />
      <Route path="/client-settings" element={<ClientSettings />} />
      <Route path="/billing" element={<Billing />} />

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
