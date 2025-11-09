import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import "@/lib/builder";
import { BuilderPage } from "@/components/BuilderPage";
import { Builder } from "@builder.io/react";

// Import existing components
import Index from "./pages/Index";

// Lazy load pages for performance
const Demo = lazy(() => import("./pages/Demo"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HelpLibrary = lazy(() => import("./pages/HelpLibrary"));
const Features = lazy(() => import("./pages/Features"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const IntegrationsMarketing = lazy(
  () => import("./pages/IntegrationsMarketing"),
);
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Support = lazy(() => import("./pages/Support"));
const ContentDashboard = lazy(() => import("./pages/ContentDashboard"));
const BrandIntelligence = lazy(() => import("./pages/BrandIntelligence"));
const AnalyticsPortal = lazy(() => import("./pages/AnalyticsPortal"));
const Settings = lazy(() => import("./pages/Settings"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));

// Additional pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Brands = lazy(() => import("./pages/Brands"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Integrations = lazy(() => import("./pages/Integrations"));
const MediaManager = lazy(() => import("./pages/MediaManagerV2")); // Using V2 for enhanced features
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const Billing = lazy(() => import("./pages/Billing"));
const ClientSettings = lazy(() => import("./pages/ClientSettings"));

// Builder.io pages
const NeonNest = lazy(() => import("./pages/NeonNest"));

// Authentication and missing pages
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Events = lazy(() => import("./pages/Events"));
const Reviews = lazy(() => import("./pages/Reviews"));
const ReviewQueue = lazy(() => import("./pages/ReviewQueue"));
const BrandIntake = lazy(() => import("./pages/BrandIntake"));
const BrandSnapshot = lazy(() => import("./pages/BrandSnapshot"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const ContentGenerator = lazy(() => import("./pages/ContentGenerator"));

// Register custom components with Builder.io
Builder.registerComponent(BuilderPage, {
  name: "Custom Page",
  inputs: [{ name: "model", type: "string", defaultValue: "page" }],
});

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppContent />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Welcome to Aligned AI</h2>
          <p className="text-gray-600 mb-6">
            Get started with your AI-powered marketing platform
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleOnboardingComplete}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Get Started
            </button>
            <button
              onClick={handleOnboardingSkip}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes without layout */}
      <Route path="/" element={<Index />} />
      <Route
        path="/pricing"
        element={
          <Suspense fallback={<PageLoader />}>
            <Pricing />
          </Suspense>
        }
      />
      <Route
        path="/features"
        element={
          <Suspense fallback={<PageLoader />}>
            <Features />
          </Suspense>
        }
      />
      <Route
        path="/contact"
        element={
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        }
      />
      <Route
        path="/legal"
        element={
          <Suspense fallback={<PageLoader />}>
            <Legal />
          </Suspense>
        }
      />
      <Route
        path="/demo"
        element={
          <Suspense fallback={<PageLoader />}>
            <Demo />
          </Suspense>
        }
      />
      <Route
        path="/help"
        element={
          <Suspense fallback={<PageLoader />}>
            <HelpLibrary />
          </Suspense>
        }
      />

      {/* Newly added marketing pages */}
      <Route
        path="/integrations-marketing"
        element={
          <Suspense fallback={<PageLoader />}>
            <IntegrationsMarketing />
          </Suspense>
        }
      />
      <Route
        path="/about"
        element={
          <Suspense fallback={<PageLoader />}>
            <About />
          </Suspense>
        }
      />
      <Route
        path="/terms"
        element={
          <Suspense fallback={<PageLoader />}>
            <Terms />
          </Suspense>
        }
      />
      <Route
        path="/privacy"
        element={
          <Suspense fallback={<PageLoader />}>
            <Privacy />
          </Suspense>
        }
      />
      <Route
        path="/support"
        element={
          <Suspense fallback={<PageLoader />}>
            <Support />
          </Suspense>
        }
      />
      <Route
        path="/neon-nest"
        element={
          <Suspense fallback={<PageLoader />}>
            <NeonNest />
          </Suspense>
        }
      />

      {/* Agency routes with layout */}
      <Route
        path="/dashboard"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/brands"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Brands />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/content"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <ContentDashboard />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/calendar"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Calendar />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/brand-intelligence"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <BrandIntelligence />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/analytics/:brandId"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPortal brandId="brand_1" />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/integrations"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Integrations />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/media"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <MediaManager />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/team"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <TeamManagement />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/billing"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Billing />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          </AppLayout>
        }
      />

      {/* Client routes with layout */}
      <Route
        path="/client"
        element={
          <AppLayout userRole="client">
            <Suspense fallback={<PageLoader />}>
              <ClientPortal />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/client/settings"
        element={
          <AppLayout userRole="client">
            <Suspense fallback={<PageLoader />}>
              <ClientSettings />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/client/*"
        element={
          <AppLayout userRole="client">
            <Suspense fallback={<PageLoader />}>
              <ClientPortal />
            </Suspense>
          </AppLayout>
        }
      />

      {/* Shared routes */}
      <Route
        path="/analytics/shared/:token"
        element={
          <Suspense fallback={<PageLoader />}>
            <AnalyticsPortal brandId="shared" isSharedView />
          </Suspense>
        }
      />

      {/* Authentication routes */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/signup"
        element={
          <Suspense fallback={<PageLoader />}>
            <Signup />
          </Suspense>
        }
      />

      {/* Additional Agency Feature Routes */}
      <Route
        path="/events"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Events />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/reviews"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <Reviews />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/review-queue"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <ReviewQueue />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/brand-intake"
        element={
          <Suspense fallback={<PageLoader />}>
            <BrandIntake />
          </Suspense>
        }
      />
      <Route
        path="/brand-snapshot"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <BrandSnapshot />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/content/create"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <CreatePost />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/content/generator"
        element={
          <AppLayout userRole="agency">
            <Suspense fallback={<PageLoader />}>
              <ContentGenerator />
            </Suspense>
          </AppLayout>
        }
      />

      {/* Builder.io dynamic routes */}
      <Route path="/builder/*" element={<BuilderPage model="page" />} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Page Not Found
              </h1>
              <p className="text-gray-600 mt-2">
                The page you're looking for doesn't exist.
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default App;
