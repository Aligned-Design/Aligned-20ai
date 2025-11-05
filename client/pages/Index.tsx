import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Lock,
  LinkIcon,
  ArrowRight,
  Brain,
  FileText,
  Palette,
  Linkedin,
  Instagram,
  Facebook
} from 'lucide-react';

import ReviewsCarousel from '@/components/reviews/ReviewsCarousel';
import FooterNew from '@/components/FooterNew';
import Reveal from '@/components/Reveal';

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#071025 0%,#2b0f3a 60%)' }}>
      {/* subtle radial glow layers */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-40 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3a1466]/30 via-transparent to-transparent blur-3xl opacity-60" />
        <div className="absolute -bottom-40 right-0 w-[36rem] h-[36rem] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#66fcf1]/8 via-transparent to-transparent blur-2xl opacity-50" />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/6 backdrop-blur-sm px-4 py-2 text-sm font-medium text-[#C9F06A] mb-6 border border-white/10 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#C9F06A]" />
            Aligned AI Platform
          </div>

          <Reveal className="mx-auto"><div className="rounded-2xl bg-white/6 backdrop-blur-md border border-white/8 p-12 shadow-2xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Intelligent Brand Content
              <span className="text-[#C9F06A]"> at Scale</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Three specialized AI agents working together to create, review, and publish
              on-brand content across all your social platforms.
            </p>

            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" variant="default">
                <Link to="/login" className="inline-flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link to="/demo" className="inline-flex items-center gap-2">
                  View Demo
                </Link>
              </Button>
            </div>
          </div></Reveal>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 bg-gray-50">
        <Reveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Three Specialized AI Agents
          </h2>
          <p className="text-lg text-slate-600">
            One platform, three roles—working in sync
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 items-stretch">
          <Card className="rounded-2xl bg-white border border-gray-100 p-6 shadow-md transform transition-transform hover:-translate-y-2 h-full">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-[#A6E22E] w-fit">
                <FileText className="h-3 w-3 text-[#A6E22E]" />
                Doc Agent
              </div>
              <CardTitle className="text-slate-900">Aligned Words</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Writes captions, blogs, emails, and CTA variations in your exact brand voice.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white border border-gray-100 p-6 shadow-md transform transition-transform hover:-translate-y-2 h-full">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-[#C49CFF] w-fit">
                <Palette className="h-3 w-3 text-[#C49CFF]" />
                Design Agent
              </div>
              <CardTitle className="text-slate-900">Aligned Creative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Creates templates, graphics, and visual content that matches your brand guidelines.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white border border-gray-100 p-6 shadow-md transform transition-transform hover:-translate-y-2 h-full">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-[#9EFFB8] w-fit">
                <Brain className="h-3 w-3 text-[#9EFFB8]" />
                Advisor Agent
              </div>
              <CardTitle className="text-slate-900">Aligned Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Analyzes performance data and recommends optimal posting times and content strategies.
              </p>
            </CardContent>
          </Card>
        </div>
        </Reveal>
      </div>

      {/* Workflow Section */}
      <div className="bg-white py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Streamlined Workflow
            </h2>
            <p className="text-lg text-slate-600">
              From brand input to published content in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 items-stretch">
            <WorkflowStep
              number={1}
              title="Create"
              description="AI generates content based on your brand guidelines"
              color="blue"
            />
            <WorkflowStep
              number={2}
              title="Review"
              description="Threaded feedback with version history"
              color="purple"
            />
            <WorkflowStep
              number={3}
              title="Approve"
              description="One-click approvals with audit trails"
              color="green"
            />
            <WorkflowStep
              number={4}
              title="Schedule"
              description="Auto-publishes after one-click approvals"
              color="orange"
            />
          </div>
          </Reveal>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 bg-gray-50">
        <Reveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600">
            Professional-grade features for agencies and brands
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <Feature
            icon={<Users className="h-5 w-5 text-[#C9F06A]" />}
            title="Seamless Approval"
            desc="Threaded feedback, audit trails, and one-click approvals."
          />
          <Feature
            icon={<LinkIcon className="h-5 w-5 text-[#C9F06A]" />}
            title="Auto Publishing"
            desc="Push approved posts to Instagram, Facebook, LinkedIn, X, and GMB."
          />
          <Feature
            icon={<Shield className="h-5 w-5 text-[#C9F06A]" />}
            title="Brand Isolation"
            desc="Separate, secure workspaces—no crossover, no confusion."
          />
          <Feature
            icon={<Lock className="h-5 w-5 text-[#C9F06A]" />}
            title="Enterprise Security"
            desc="Role-based permissions and encryption for privacy and control."
          />
          <Feature
            icon={<BarChart3 className="h-5 w-5 text-[#C9F06A]" />}
            title="Real-time Analytics"
            desc="Interactive dashboards with AI-powered recommendations."
          />
          <Feature
            icon={<Calendar className="h-5 w-5 text-[#C9F06A]" />}
            title="Smart Scheduling"
            desc="AI-optimized posting times based on audience insights."
          />
        </div>
        </Reveal>
      </div>

      {/* Agency Positioning Section */}
      <div className="bg-gray-50 py-20 border-t border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 mb-6 border border-gray-100">
                <span>🎯</span>
                Built by an Agency for Agencies
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                We Get Your Workflow
              </h2>
              <p className="text-lg text-slate-600">
                Aligned AI was built by agency professionals who understand the real challenges:
                managing multiple client brands, keeping approvals streamlined, and proving ROI to stakeholders.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="text-2xl mb-3">🔀</div>
                <h3 className="font-semibold text-slate-900 mb-2">Multi-Client at Scale</h3>
                <p className="text-sm text-slate-600">
                  Manage unlimited brands with separate workflows, permissions, and white-label dashboards—all from one agency account.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="text-2xl mb-3">✅</div>
                <h3 className="font-semibold text-slate-900 mb-2">Client-Ready Approvals</h3>
                <p className="text-sm text-slate-600">
                  Let clients approve content without seeing your full platform. Branded portals, clear feedback, zero confusion.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="text-2xl mb-3">📊</div>
                <h3 className="font-semibold text-slate-900 mb-2">Built-In ROI Proof</h3>
                <p className="text-sm text-slate-600">
                  Dashboard metrics, performance reports, and growth insights you can show clients to justify retainers.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100">
              <p className="text-slate-700 text-center">
                <span className="font-semibold">"You're in control."</span> Aligned AI was built to enhance your team's expertise,
                not replace it. You stay in the driver's seat while AI handles the repetitive work.
              </p>
            </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Reviews Section (new) */}
      <ReviewsCarousel />

      {/* CTA Section */}
      <div className="py-20 relative z-10" style={{ background: 'linear-gradient(90deg,#14223a 0%, #3a1466 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Scale Your Content?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-slate-200">
            Join leading agencies and brands using AI to create consistent,
            on-brand content at scale.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="default">
              <Link to="/signup">
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Link to="/demo">
                Schedule Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <FooterNew />

    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  color,
}: {
  number: number;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-white/8 text-[#C9F06A]',
    purple: 'bg-white/8 text-[#C49CFF]',
    green: 'bg-white/8 text-[#9EFFB8]',
    orange: 'bg-white/8 text-[#FFD58A]',
  };

  return (
    <div className="text-center">
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm`}>
        <span className="font-semibold">{number}</span>
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 h-full">
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 text-[#C9F06A]">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );
}
