import React from 'react';
import Reveal from '@/components/Reveal';
import FooterNew from '@/components/FooterNew';
import { Button } from '@/components/ui/button';

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Support</h1>
          <p className="text-lg text-slate-600 mt-3">Find help articles or contact our support team for assistance.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Help Center</h2>
            <p className="text-slate-600">Search knowledge base articles, view tutorials, or reach out to our support team.</p>
            <div className="mt-6">
              <Button size="lg" variant="default">Search Help</Button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">Common Issues</h3>
              <p className="text-sm text-slate-600">Troubleshooting steps for common problems with integrations, publishing, and accounts.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">Account & Billing</h3>
              <p className="text-sm text-slate-600">Questions about billing, plans, and invoices.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">Contact Support</h3>
              <p className="text-sm text-slate-600">Email us at <a href="mailto:support@aligned.ai" className="text-[#C9F06A]">support@aligned.ai</a> or use the chat in the app.</p>
            </div>
          </div>
        </Reveal>
      </main>

      <FooterNew />
    </div>
  );
}
