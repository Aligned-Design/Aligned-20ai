import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandProvider } from "@/contexts/BrandContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import CommandPalette from "@/components/ui/command-palette";
import { lazy, Suspense, useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { MediaManager } from "./pages/MediaManager";
import Demo from "./pages/Demo";
import ClientPortal from "./pages/ClientPortal";
import Pricing from "./pages/Pricing";
import ContentDashboard from "./pages/ContentDashboard";
import AnalyticsPortal from "./pages/AnalyticsPortal";
import Settings from "./pages/Settings";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";

// Lazy load authenticated pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Brands = lazy(() => import("./pages/Brands"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Assets = lazy(() => import("./pages/Assets"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BrandIntake = lazy(() => import("./pages/BrandIntake"));
const BrandSnapshot = lazy(() => import("./pages/BrandSnapshot"));
const Integrations = lazy(() => import("./pages/Integrations"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Events = lazy(() => import("./pages/Events"));
const ReviewQueue = lazy(() => import("./pages/ReviewQueue"));

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/content" element={<ContentDashboard />} />
        <Route path="/brand-intelligence" element={<BrandIntelligence />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics/:brandId" element={<AnalyticsPortal brandId="brand_1" />} />
        <Route path="/analytics/shared/:token" element={<AnalyticsPortal brandId="shared" isSharedView />} />
        <Route path="/client" element={<ClientPortal />} />
        <Route path="/onboarding" element={
          <OnboardingWizard
            userType={userType}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        } />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userType, setUserType] = useState<"agency" | "client">("agency");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user needs onboarding
      const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
      const hasSkippedOnboarding = localStorage.getItem("onboarding-skipped");

      if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
        // Check user type from URL params or API
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get("type");
        if (typeParam === "client") {
          setUserType("client");
        }
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user",
          userType,
          completedSteps: ["welcome", "setup", "integration"],
        }),
      });

      localStorage.setItem("onboarding-completed", "true");
      localStorage.setItem("user-type", userType);
      setShowOnboarding(false);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("onboarding-skipped", "true");
    localStorage.setItem("user-type", userType);
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard
        userType={userType}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <BrandProvider>
              <AppRoutes />
            </BrandProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
              <AppLayout>
                <Suspense
                  fallback={
                    <Loading fullScreen text="Loading integrations..." />
                  }
                >
                  <Integrations />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading composer..." />}
                >
                  <CreatePost />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading reviews..." />}
                >
                  <Reviews />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading events..." />}
                >
                  <Events />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-queue"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading review queue..." />}
                >
                  <ReviewQueue />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/media" element={<MediaManager />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userType, setUserType] = useState<"agency" | "client">("agency");

  useEffect(() => {
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboarding-completed", "true");
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("onboarding-skipped", "true");
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <OnboardingWizard
        userType={userType}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <BrandProvider>
              <AppRoutes />
            </BrandProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
  );
}
}
