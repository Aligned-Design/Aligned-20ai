import { UnauthenticatedLayout } from "@/components/layout/UnauthenticatedLayout";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { Sparkles, Target, Users, Zap, Heart } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Mission-Driven",
      description: "We believe content creation should empower, not exhaust. Our mission is to help brands and agencies tell better stories without burning out."
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Customer-First",
      description: "Every feature we build starts with user feedback. We're not just building software—we're building with you."
    },
    {
      icon: <Zap className="w-8 h-8 text-lime-600" />,
      title: "Innovation",
      description: "We leverage the latest AI technology to stay ahead of the curve, ensuring you always have cutting-edge tools at your fingertips."
    },
    {
      icon: <Heart className="w-8 h-8 text-purple-600" />,
      title: "Transparency",
      description: "No hidden fees. No surprise charges. No enterprise pricing mazes. What you see is what you get."
    }
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
              Our Story
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Built by marketers, for marketers
          </h1>

          <p className="text-xl sm:text-2xl text-slate-700 font-medium mb-10 max-w-3xl mx-auto">
            We're on a mission to make content creation feel less like a grind and more like a superpower.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 text-center">
            Why we built Aligned AI
          </h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-6">
            <p>
              We started Aligned AI because we experienced the pain ourselves. As agency owners and brand builders, we spent countless hours juggling spreadsheets, approval threads, and disconnected tools—just to get a single post live.
            </p>
            <p>
              The work never stopped. The tabs never closed. And "done" always felt just out of reach.
            </p>
            <p>
              So we asked ourselves: <strong>What if content creation could flow instead of fight?</strong>
            </p>
            <p>
              That question became Aligned AI—a platform designed to handle the planning, writing, scheduling, and reporting so you can get back to the work only you can do.
            </p>
            <p>
              Today, we're proud to serve agencies, brands, and creators worldwide. And we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-12 text-center">
            What we stand for
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all"
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">
            A remote-first team
          </h2>
          <p className="text-lg text-slate-700 mb-8 leading-relaxed">
            We're a distributed team of engineers, designers, marketers, and AI specialists working from around the world. What unites us? A shared belief that content shouldn't feel like a chore.
          </p>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
            <p className="text-xl font-semibold text-slate-900 mb-4">
              Want to join us?
            </p>
            <p className="text-slate-700 mb-6">
              We're always looking for talented people who share our vision.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Get in Touch
              <Sparkles className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            Ready to get Aligned?
          </h2>
          <p className="text-xl mb-8">
            Join hundreds of brands and agencies transforming their content workflow.
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
