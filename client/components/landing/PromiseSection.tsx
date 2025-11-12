import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface PromiseSectionProps {
  onCTA?: () => void;
}

export function PromiseSection({ onCTA }: PromiseSectionProps) {
  const { ref: headingRef, isVisible: headingVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
      {/* Premium gradient orbs with animation */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-10 animate-gradient-shift"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow"></div>
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-50/20 rounded-full blur-3xl pointer-events-none -z-10"
        style={{ animationDelay: "1s" }}
      ></div>
      {/* Light reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto text-center">
        <div
          ref={headingRef}
          className={`transition-all duration-700 ${
            headingVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            Every piece of content. Every approval. Every post.
          </h2>

          <p className="text-lg sm:text-xl text-indigo-600 font-bold mb-6">
            All created, scheduled, and optimized — automatically — without ever
            losing your voice.
          </p>

          <p className="text-base sm:text-lg text-slate-700 mb-6 leading-relaxed">
            We don't flatten brands. We understand them. Your visuals, your
            tone, your rhythm — learned once, carried through every channel.
          </p>

          <p className="text-base sm:text-lg text-slate-700 mb-8 leading-relaxed">
            So your agency finally runs like it looks: clean, confident,
            consistent.
          </p>
        </div>

        <div
          ref={contentRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 ${
            contentVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-indigo-200/60 p-6 md:p-8 hover:bg-white/60 hover:border-indigo-300/80 hover:shadow-xl hover:shadow-indigo-200/30 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎨</span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                  Brand Management
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Dynamic brand guides that embed your tone, voice, and visual
                  identity. AI learns your brand voice and applies it
                  automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-indigo-200/60 p-6 md:p-8 hover:bg-white/60 hover:border-indigo-300/80 hover:shadow-xl hover:shadow-indigo-200/30 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start gap-4">
              <span className="text-3xl">✨</span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                  Content Automation
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  AI drafts posts, emails, and content—all aligned with your
                  brand. Your team reviews and approves. It ships automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-indigo-200/60 p-6 md:p-8 hover:bg-white/60 hover:border-indigo-300/80 hover:shadow-xl hover:shadow-indigo-200/30 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start gap-4">
              <span className="text-3xl">👥</span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                  Client Collaboration
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  White-labeled approval portals. Clients review, comment, and
                  approve from anywhere. No scattered feedback.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-indigo-200/60 p-6 md:p-8 hover:bg-white/60 hover:border-indigo-300/80 hover:shadow-xl hover:shadow-indigo-200/30 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start gap-4">
              <span className="text-3xl">📊</span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                  AI-Powered Reporting
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Automated reports with insights, trends, and actionable
                  recommendations. No data chaos. Pure clarity.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={ctaRef}
          className={`transition-all duration-700 ${
            ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={onCTA}
            data-cta="promise-primary"
            className="px-8 py-3 mb-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all active:scale-95 inline-flex items-center gap-2 text-lg shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 group border border-indigo-500/50 hover:border-indigo-400"
          >
            Start Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-sm text-slate-600 font-medium">
            (We'll take it from here.)
          </p>
        </div>
      </div>
    </section>
  );
}
