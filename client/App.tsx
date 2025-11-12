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
import { BrandProvider } from "@/contexts/BrandContext";
import MilestoneCelebrator from "@/components/MilestoneCelebrator";
import { SEOHead } from "@/components/seo";
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
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Integrations from "./pages/Integrations";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

// Route guard components
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingStep } = useAuth();

  // If authenticated and onboarding is in progress, show onboarding
  if (isAuthenticated && onboardingStep) {
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and onboarding is complete, show dashboard
  if (isAuthenticated && !onboardingStep) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not authenticated - show public content
  return children as React.ReactElement;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingStep } = useAuth();

  // Not authenticated - redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Authenticated but in onboarding - redirect to onboarding
  if (onboardingStep) {
    return <Navigate to="/onboarding" replace />;
  }

  // Authenticated and onboarding complete - show protected content
  return children as React.ReactElement;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingStep } = useAuth();

  // Authenticated but onboarding is complete - redirect to dashboard
  if (isAuthenticated && !onboardingStep) {
    return <Navigate to="/dashboard" replace />;
  }

  // Allow unauthenticated users OR users in onboarding to access /onboarding
  return children as React.ReactElement;
}

// Protected route wrapper - handles authentication and routing
function ProtectedRoutes() {
  return (
    <>
      {/* SEO Head - dynamically manages meta tags based on route */}
      <SEOHead />
      <Routes>
      {/* Public Routes - landing page */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Index />
          </PublicRoute>
        }
      />

      {/* Public pages - wrap with PublicRoute to redirect authed users */}
      <Route
        path="/pricing"
        element={
          <PublicRoute>
            <Pricing />
          </PublicRoute>
        }
      />
      <Route
        path="/features"
        element={
          <PublicRoute>
            <Features />
          </PublicRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <PublicRoute>
            <Integrations />
          </PublicRoute>
        }
      />
      <Route
        path="/help"
        element={
          <PublicRoute>
            <Help />
          </PublicRoute>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicRoute>
            <Contact />
          </PublicRoute>
        }
      />
      <Route
        path="/about"
        element={
          <PublicRoute>
            <About />
          </PublicRoute>
        }
      />
      <Route
        path="/privacy"
        element={
          <PublicRoute>
            <Privacy />
          </PublicRoute>
        }
      />
      <Route
        path="/terms"
        element={
          <PublicRoute>
            <Terms />
          </PublicRoute>
        }
      />

      {/* Auth Routes - redirect to onboarding or show onboarding */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Index />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Index />
          </PublicRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        }
      />

      {/* Protected Routes - only accessible when authenticated and onboarding complete */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content-queue"
        element={
          <ProtectedRoute>
            <ContentQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue"
        element={
          <ProtectedRoute>
            <ContentQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <Approvals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creative-studio"
        element={
          <ProtectedRoute>
            <CreativeStudio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content-generator"
        element={
          <ProtectedRoute>
            <ContentGenerator />
          </ProtectedRoute>
        }
      />

      {/* Strategy Navigation */}
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brands"
        element={
          <ProtectedRoute>
            <Brands />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brand-intake"
        element={
          <ProtectedRoute>
            <BrandIntake />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brand-guide"
        element={
          <ProtectedRoute>
            <BrandGuide />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brand-snapshot"
        element={
          <ProtectedRoute>
            <BrandSnapshot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brand-intelligence"
        element={
          <ProtectedRoute>
            <BrandIntelligence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reporting"
        element={
          <ProtectedRoute>
            <Reporting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reporting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paid-ads"
        element={
          <ProtectedRoute>
            <PaidAds />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ads"
        element={
          <ProtectedRoute>
            <PaidAds />
          </ProtectedRoute>
        }
      />

      {/* Assets Navigation */}
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal"
        element={
          <ProtectedRoute>
            <ClientPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/linked-accounts"
        element={
          <ProtectedRoute>
            <LinkedAccounts />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-settings"
        element={
          <ProtectedRoute>
            <ClientSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />

      {/* Catch-all - show 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <WorkspaceProvider>
      <UserProvider>
        <AuthProvider>
          <BrandProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <MilestoneCelebrator />
              <BrowserRouter>
                <ProtectedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </BrandProvider>
        </AuthProvider>
      </UserProvider>
    </WorkspaceProvider>
  </QueryClientProvider>
);
