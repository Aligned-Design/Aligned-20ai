import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

// Import existing components
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load pages for performance
const Demo = lazy(() => import("./pages/Demo"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ContentDashboard = lazy(() => import("./pages/ContentDashboard"));
const BrandIntelligence = lazy(() => import("./pages/BrandIntelligence"));
const AnalyticsPortal = lazy(() => import("./pages/AnalyticsPortal"));
const Settings = lazy(() => import("./pages/Settings"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));

// Additional missing pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Brands = lazy(() => import("./pages/Brands"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Integrations = lazy(() => import("./pages/Integrations"));
const MediaManager = lazy(() => import("./pages/MediaManager"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const Billing = lazy(() => import("./pages/Billing"));

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
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('onboarding-skipped', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Welcome to Aligned AI</h2>
          <p className="text-gray-600 mb-6">Get started with your AI-powered marketing platform</p>
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
      <Route path="/pricing" element={
        <Suspense fallback={<PageLoader />}>
          <Pricing />
        </Suspense>
      } />
      <Route path="/demo" element={
        <Suspense fallback={<PageLoader />}>
          <Demo />
        </Suspense>
      } />

      {/* Agency routes with layout */}
      <Route path="/dashboard" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/brands" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <Brands />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/content" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <ContentDashboard />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/calendar" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <Calendar />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/brand-intelligence" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <BrandIntelligence />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/analytics/:brandId" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <AnalyticsPortal brandId="brand_1" />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/integrations" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <Integrations />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/media" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <MediaManager />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/team" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <TeamManagement />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/billing" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <Billing />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/settings" element={
        <AppLayout userRole="agency">
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        </AppLayout>
      } />

      {/* Client routes with layout */}
      <Route path="/client" element={
        <AppLayout userRole="client">
          <Suspense fallback={<PageLoader />}>
            <ClientPortal />
          </Suspense>
        </AppLayout>
      } />
      <Route path="/client/*" element={
        <AppLayout userRole="client">
          <Suspense fallback={<PageLoader />}>
            <ClientPortal />
          </Suspense>
        </AppLayout>
      } />

      {/* Shared routes */}
      <Route path="/analytics/shared/:token" element={
        <Suspense fallback={<PageLoader />}>
          <AnalyticsPortal brandId="shared" isSharedView />
        </Suspense>
      } />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
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
