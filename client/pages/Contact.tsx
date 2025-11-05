import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FooterNew from '@/components/FooterNew';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Contact Sales</h1>
          <p className="text-lg text-slate-600 mt-3">Questions? Schedule a demo or reach out and we'll get back within one business day.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Talk to a human</h2>
            <p className="text-slate-600 mb-6">Our team can help you get started with onboarding, integrations, or custom pricing.</p>
            <div className="space-y-3">
              <div className="text-sm text-slate-700">Email</div>
              <div className="text-lg font-medium">sales@aligned.ai</div>
              <div className="text-sm text-slate-700 mt-4">Phone</div>
              <div className="text-lg font-medium">+1 (555) 123-4567</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Schedule a demo</h2>
            <p className="text-slate-600 mb-6">Pick a time to see the platform in action and discuss your needs.</p>
            <Button asChild variant="default">
              <Link to="/demo">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </main>

      <FooterNew />
    </div>
  );
}
