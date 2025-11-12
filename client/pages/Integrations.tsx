import { UnauthenticatedLayout } from "@/components/layout/UnauthenticatedLayout";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { Sparkles, Check, ExternalLink } from "lucide-react";

export default function Integrations() {
  const integrations = [
    {
      category: "Social Media",
      platforms: [
        {
          name: "Facebook",
          logo: "📘",
          description: "Publish posts, stories, and manage pages",
          features: ["Auto-posting", "Analytics", "Ad integration"]
        },
        {
          name: "Instagram",
          logo: "📸",
          description: "Share posts, reels, and stories seamlessly",
          features: ["Feed posts", "Stories", "Reels", "Shopping tags"]
        },
        {
          name: "LinkedIn",
          logo: "💼",
          description: "Professional content for company pages and profiles",
          features: ["Company pages", "Personal profiles", "Analytics"]
        },
        {
          name: "Twitter / X",
          logo: "🐦",
          description: "Threads, tweets, and real-time engagement",
          features: ["Tweets", "Threads", "Scheduling", "Analytics"]
        },
        {
          name: "TikTok",
          logo: "🎵",
          description: "Short-form video content distribution",
          features: ["Video posts", "Scheduling", "Analytics"]
        },
        {
          name: "Google Business Profile",
          logo: "🗺️",
          description: "Local business updates and reviews",
          features: ["Posts", "Events", "Offers", "Q&A"]
        }
      ]
    },
    {
      category: "Marketing & Email",
      platforms: [
        {
          name: "Mailchimp",
          logo: "📧",
          description: "Email campaign automation",
          features: ["Campaign sync", "List management", "Analytics"]
        },
        {
          name: "Squarespace",
          logo: "🏗️",
          description: "Website content management",
          features: ["Blog posts", "Page updates", "SEO optimization"]
        }
      ]
    },
    {
      category: "Analytics & Reporting",
      platforms: [
        {
          name: "Google Analytics",
          logo: "📊",
          description: "Track website and campaign performance",
          features: ["Traffic analysis", "Conversion tracking", "Custom reports"]
        },
        {
          name: "Meta Business Suite",
          logo: "📈",
          description: "Cross-platform Facebook and Instagram insights",
          features: ["Unified analytics", "Audience insights", "Ad performance"]
        }
      ]
    }
  ];

  return (
    <UnauthenticatedLayout>
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="min-h-[60vh] bg-gradient-to-b from-indigo-50 via-white to-gray-50 pt-32 pb-16 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-indigo-100/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-purple-100/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">
              Connect Everything
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            One platform. All your channels.
          </h1>

          <p className="text-xl sm:text-2xl text-slate-700 font-medium mb-10 max-w-3xl mx-auto">
            Aligned AI integrates with the platforms you already use—so you can publish everywhere from one place.
          </p>
        </div>
      </section>

      {/* Integrations by Category */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          {integrations.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-3xl font-black text-slate-900 mb-8">
                {category.category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.platforms.map((platform, platIndex) => (
                  <div 
                    key={platIndex}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all hover:scale-105"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{platform.logo}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">
                          {platform.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-4">
                      {platform.description}
                    </p>
                    <ul className="space-y-2">
                      {platform.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check className="w-4 h-4 text-lime-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-6">
            More integrations coming soon
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            We're constantly adding new platforms based on user feedback. Need a specific integration?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            Request an Integration
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            Connect your platforms today
          </h2>
          <p className="text-xl mb-8">
            Start publishing across all your channels in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-4 bg-white hover:bg-gray-100 text-indigo-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-xl"
            >
              Get Started Free
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
