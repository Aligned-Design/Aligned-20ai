import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandProvider } from "@/contexts/BrandContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import CommandPalette from "@/components/ui/command-palette";
import { lazy, Suspense } from "react";
import { Loading } from "@/components/ui/loading";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const isAuthRoute = ["/login", "/signup", "/"].includes(location.pathname);

  return (
    <>
      {!isAuthRoute && <CommandPalette />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading dashboard..." />}
                >
                  <Dashboard />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/brands"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading brands..." />}
                >
                  <Brands />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading calendar..." />}
                >
                  <Calendar />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading assets..." />}
                >
                  <Assets />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense
                  fallback={<Loading fullScreen text="Loading analytics..." />}
                >
                  <Analytics />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/brand-intake"
          element={
            <ProtectedRoute>
              <Suspense
                fallback={<Loading fullScreen text="Loading brand intake..." />}
              >
                <BrandIntake />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/brand-snapshot"
          element={
            <ProtectedRoute>
              <Suspense
                fallback={
                  <Loading fullScreen text="Loading brand snapshot..." />
                }
              >
                <BrandSnapshot />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations"
          element={
            <ProtectedRoute>
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
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
