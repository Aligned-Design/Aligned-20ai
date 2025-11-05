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
  Palette
} from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
            <Sparkles className="h-4 w-4" />
            Aligned AI Platform
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Intelligent Brand Content
            <span className="text-blue-600"> at Scale</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Three specialized AI agents working together to create, review, and publish 
            on-brand content across all your social platforms.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/login">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/demo">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Three Specialized AI Agents
          </h2>
          <p className="text-lg text-gray-600">
            One platform, three roles—working in sync
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 w-fit">
                <FileText className="h-3 w-3" />
                Doc Agent
              </div>
              <CardTitle>Aligned Words</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Writes captions, blogs, emails, and CTA variations in your exact brand voice.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 w-fit">
                <Palette className="h-3 w-3" />
                Design Agent
              </div>
              <CardTitle>Aligned Creative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Creates templates, graphics, and visual content that matches your brand guidelines.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 w-fit">
                <Brain className="h-3 w-3" />
                Advisor Agent
              </div>
              <CardTitle>Aligned Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Analyzes performance data and recommends optimal posting times and content strategies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Streamlined Workflow
            </h2>
            <p className="text-lg text-gray-600">
              From brand input to published content in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
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
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600">
            Professional-grade features for agencies and brands
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Feature
            icon={<Users className="h-5 w-5" />}
            title="Seamless Approval"
            desc="Threaded feedback, audit trails, and one-click approvals."
          />
          <Feature
            icon={<LinkIcon className="h-5 w-5" />}
            title="Auto Publishing"
            desc="Push approved posts to Instagram, Facebook, LinkedIn, X, and GMB."
          />
          <Feature
            icon={<Shield className="h-5 w-5" />}
            title="Brand Isolation"
            desc="Separate, secure workspaces—no crossover, no confusion."
          />
          <Feature
            icon={<Lock className="h-5 w-5" />}
            title="Enterprise Security"
            desc="Role-based permissions and encryption for privacy and control."
          />
          <Feature
            icon={<BarChart3 className="h-5 w-5" />}
            title="Real-time Analytics"
            desc="Interactive dashboards with AI-powered recommendations."
          />
          <Feature
            icon={<Calendar className="h-5 w-5" />}
            title="Smart Scheduling"
            desc="AI-optimized posting times based on audience insights."
          />
        </div>
      </div>

      {/* Agency Positioning Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 py-16 border-t border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 mb-6">
                <span>🎯</span>
                Built by an Agency for Agencies
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                We Get Your Workflow
              </h2>
              <p className="text-lg text-gray-600">
                Aligned AI was built by agency professionals who understand the real challenges:
                managing multiple client brands, keeping approvals streamlined, and proving ROI to stakeholders.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl mb-3">🔀</div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-Client at Scale</h3>
                <p className="text-sm text-gray-600">
                  Manage unlimited brands with separate workflows, permissions, and white-label dashboards—all from one agency account.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl mb-3">✅</div>
                <h3 className="font-semibold text-gray-900 mb-2">Client-Ready Approvals</h3>
                <p className="text-sm text-gray-600">
                  Let clients approve content without seeing your full platform. Branded portals, clear feedback, zero confusion.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-2xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Built-In ROI Proof</h3>
                <p className="text-sm text-gray-600">
                  Dashboard metrics, performance reports, and growth insights you can show clients to justify retainers.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-lg border border-indigo-200">
              <p className="text-gray-700 text-center">
                <span className="font-semibold">"You're in control."</span> Aligned AI was built to enhance your team's expertise,
                not replace it. You stay in the driver's seat while AI handles the repetitive work.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Scale Your Content?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join leading agencies and brands using AI to create consistent, 
            on-brand content at scale.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Link to="/signup">
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/demo">
                Schedule Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
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
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="text-center">
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <span className="font-semibold">{number}</span>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
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
    <div className="p-6 rounded-lg border bg-white hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
