import { UnauthenticatedLayout } from "@/components/layout/UnauthenticatedLayout";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import {
  Sparkles,
  BookOpen,
  MessageCircle,
  Video,
  FileText,
  Search,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Help() {
  const faqs = [
    {
      question: "How do I get started with Aligned AI?",
      answer:
        "Sign up for a free 7-day trial, connect your social accounts, and complete the brand intake form. Our AI will learn your voice and you can start creating content immediately.",
    },
    {
      question: "Can I connect multiple brands or clients?",
      answer:
        "Yes! Our Base Plan supports 1 brand workspace. You can add up to 5 brands at $199 each. Once you have 5+ brands, pricing automatically adjusts to $99 per brand (Agency Tier).",
    },
    {
      question: "How does the AI learn my brand voice?",
      answer:
        "During onboarding, you'll complete a brand intake form covering tone, style, messaging, and values. The AI also learns from your feedback on generated content, improving over time.",
    },
    {
      question: "What platforms can I publish to?",
      answer:
        "We support Facebook, Instagram, LinkedIn, Twitter/X, TikTok, Google Business Profile, and more. Check our Integrations page for the full list.",
    },
    {
      question: "Can my clients approve content before publishing?",
      answer:
        "Absolutely. Our approval workflows let you set up client review flows, team permissions, and automated notifications for every approval stage.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes! Base Plan includes email support. Agency Tier includes priority support. We also offer optional Onboarding Concierge ($299/client) for hands-on setup assistance.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes. You can cancel or adjust your plan with 30 days' notice so we can wrap up any active projects.",
    },
    {
      question: "Is there a limit on posts or users?",
      answer:
        "No hidden limits. Each brand workspace includes unlimited posts, AI generation, and analytics. Team member limits vary by plan.",
    },
    {
      question: "How secure is my data?",
      answer:
        "We use enterprise-grade encryption, secure OAuth connections, and never store your social media passwords. All data is encrypted in transit and at rest.",
    },
    {
      question: "Can I white-label the platform for my clients?",
      answer:
        "Yes! Agency Tier includes a white-label portal. You can also add a custom domain for $49/mo.",
    },
  ];

  const resources = [
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      link: "/docs",
    },
    {
      icon: <Video className="w-8 h-8 text-indigo-600" />,
      title: "Video Tutorials",
      description: "Step-by-step video walkthroughs",
      link: "/tutorials",
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-lime-600" />,
      title: "Community Forum",
      description: "Connect with other users",
      link: "/community",
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      title: "API Documentation",
      description: "Developer resources and API reference",
      link: "/api-docs",
    },
  ];

  return (
    <UnauthenticatedLayout>
      <SiteHeader />

      {/* Hero Section */}
      <section className="min-h-[60vh] bg-gradient-to-b from-lime-50 via-white to-gray-50 pt-32 pb-16 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-lime-200/30 to-lime-100/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-purple-100/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-lime-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <HelpCircle className="w-4 h-4 text-lime-600" />
            <span className="text-sm font-semibold text-lime-900">
              We're Here to Help
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Help Center
          </h1>

          <p className="text-xl sm:text-2xl text-slate-700 font-medium mb-10 max-w-3xl mx-auto">
            Find answers, explore resources, and get the most out of Aligned AI.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
            Quick Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all hover:scale-105 text-center"
              >
                <div className="flex justify-center mb-4">{resource.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-slate-600 text-sm">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl px-6 border border-gray-200 shadow-sm"
              >
                <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:text-purple-600 transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-700 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Still need help?
          </h2>
          <p className="text-xl mb-8">
            Our support team is standing by to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-4 bg-white hover:bg-gray-100 text-purple-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-xl"
            >
              Contact Support
              <Sparkles className="w-5 h-5" />
            </a>
            <a
              href="mailto:support@aligned.ai"
              className="px-8 py-4 bg-lime-400 hover:bg-lime-300 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-xl"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </UnauthenticatedLayout>
  );
}
