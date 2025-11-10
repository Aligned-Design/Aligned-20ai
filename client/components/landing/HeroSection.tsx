import { ArrowRight, Sparkles } from "lucide-react";
import { ZiaMascot } from "@/components/dashboard/ZiaMascot";
import { DashboardVisual } from "./DashboardVisual";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/lib/analytics";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  onCTA?: () => void;
}

export function HeroSection({ onCTA }: HeroSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = (source: "hero" | "sticky" | "footer") => {
    analytics.track("cta_click", {
      source,
      auth_state: user ? "authed" : "anon",
    });
    navigate(user ? "/dashboard" : "/onboarding");
  };

  return (
    <section className="min-h-[70vh] md:min-h-[80vh] bg-gradient-to-b from-indigo-50 via-white to-blue-50/30 pt-32 pb-16 md:pb-24 px-4 sm:px-6 md:px-8 relative overflow-hidden">
      {/* Luxury background with animated gradient orbs */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10">
        {/* Primary indigo glow */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-indigo-100/10 rounded-full blur-3xl animate-gradient-shift"></div>
        {/* Secondary blue glow */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-blue-100/10 rounded-full blur-3xl animate-pulse-glow"></div>
        {/* Accent lime glow (subtle) */}
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-lime-200/5 rounded-full blur-3xl animate-float-soft" style={{ animationDelay: "1s" }}></div>
        {/* Light reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Copy with staggered animation */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 leading-tight">
                You built your agency for stories, not spreadsheets.
              </h1>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <p className="text-lg sm:text-xl text-indigo-600 font-bold mb-6">
                Now the work never stops, the tabs never close, and "done" always feels just out of reach. That's where we come in.
              </p>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-base sm:text-lg text-slate-700 mb-8 leading-relaxed">
                Aligned handles your content — the planning, writing, scheduling, and reporting — so you can get back to the work only you can do.
              </p>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-lime-500">✓</span> Brand Management
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lime-500">✓</span> Content Automation
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lime-500">✓</span> Client Approvals
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lime-500">✓</span> AI Reporting
                </div>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={() => handleCTA("hero")}
                  data-cta="hero-primary"
                  className="w-full sm:w-auto px-8 py-3 bg-lime-400 hover:bg-lime-300 text-indigo-950 font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg shadow-xl shadow-lime-400/40 hover:shadow-2xl hover:shadow-lime-400/50 group relative overflow-hidden backdrop-blur-sm hover:backdrop-blur-md border border-lime-300/40 hover:border-lime-200/60"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Aligned
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-300 to-lime-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 -z-10"></div>
                </button>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <p className="text-sm sm:text-base text-slate-600 font-medium">
                We keep it moving so you can keep it meaningful.
              </p>
            </div>
          </div>

          {/* Right: Premium Dashboard Visual */}
          <div className="relative h-96 md:h-full flex items-center justify-center animate-slide-up-slow" style={{ animationDelay: "0.3s" }}>
            <DashboardVisual />
          </div>
        </div>

        {/* Mobile Zia Bubble */}
        <div className="md:hidden mt-12 flex justify-center animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-indigo-300/50 p-5 max-w-sm shadow-xl shadow-indigo-200/30 inline-block hover:shadow-2xl hover:shadow-indigo-300/40 transition-all hover:bg-white/70 hover:border-indigo-400/60 group">
            <p className="text-sm font-medium text-slate-700 text-center leading-relaxed">
              ✨ <span className="font-semibold text-indigo-700 group-hover:text-indigo-900 transition-colors">"Hold your horses, darling—just aligning things."</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
