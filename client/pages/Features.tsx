import { UnauthenticatedLayout } from "@/components/layout/UnauthenticatedLayout";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import {
  Sparkles,
  Brain,
  Calendar,
  BarChart3,
  Zap,
  Users,
  Shield,
  Rocket,
  Check,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "AI Content Generation",
      description:
        "Generate on-brand content that matches your voice, tone, and style. Our AI learns from your feedback to deliver better results every time.",
      benefits: [
        "Brand voice learning",
        "Multi-platform optimization",
        "Instant variations",
        "Performance-driven suggestions",
      ],
    },
    {
      icon: <Calendar className="w-8 h-8 text-indigo-600" />,
      title: "Smart Scheduling",
      description:
        "Never miss a posting window. Our intelligent calendar suggests optimal times and manages your entire content pipeline.",
      benefits: [
        "Optimal timing recommendations",
        "Drag-and-drop calendar",
        "Cross-platform coordination",
        "Automated publishing",
      ],
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-lime-600" />,
      title: "Real-Time Analytics",
      description:
        "Track what matters. See engagement, reach, and ROI across all your channels in one unified dashboard.",
      benefits: [
        "Cross-platform insights",
        "Performance tracking",
        "Audience analytics",
        "Actionable recommendations",
      ],
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Collaboration Tools",
      description:
        "Streamline approvals with team and client workflows. Everyone stays in the loop without the chaos.",
      benefits: [
        "Client approval flows",
        "Team permissions",
        "Comment threads",
        "Version history",
      ],
    },
    {
      icon: <Zap className="w-8 h-8 text-indigo-600" />,
      title: "Platform Integrations",
      description:
        "Connect all your social accounts in one place. Publish everywhere from a single platform.",
      benefits: [
        "Meta (Facebook & Instagram)",
        "LinkedIn & Twitter",
        "Google Business Profile",
        "TikTok & more",
      ],
    },
    {
      icon: <Shield className="w-8 h-8 text-lime-600" />,
      title: "Brand Safety",
      description:
        "Automated brand compliance checks ensure every post aligns with your guidelines before it goes live.",
      benefits: [
        "Brand fidelity scoring",
        "Compliance checks",
        "Safety guardrails",
        "Approval workflows",
      ],
    },
  ];

  return (
    <UnauthenticatedLayout>
      <SiteHeader />

      {/* Hero Section */}
      <section className="min-h-[60vh] bg-gradient-to-b from-purple-50 via-white to-gray-50 pt-32 pb-16 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-purple-100/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-indigo-100/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">
              Built for Modern Marketing
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Everything you need to scale your content
          </h1>

          <p className="text-xl sm:text-2xl text-slate-700 font-medium mb-10 max-w-3xl mx-auto">
            From AI generation to publishing, analytics to approvals—all in one
            platform designed for agencies and brands that move fast.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-slate-700"
                    >
                      <Check className="w-4 h-4 text-lime-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Rocket className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl mb-8">
            Start your 7-day free trial and experience all features—no credit
            card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-4 bg-white hover:bg-gray-100 text-purple-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-xl"
            >
              Start Free Trial
              <Sparkles className="w-5 h-5" />
            </a>
            <a
              href="/pricing"
              className="px-8 py-4 bg-lime-400 hover:bg-lime-300 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-xl"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </UnauthenticatedLayout>
  );
}
