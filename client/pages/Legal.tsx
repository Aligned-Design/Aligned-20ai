import React from 'react';
import FooterNew from '@/components/FooterNew';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Legal</h1>
          <p className="text-lg text-slate-600 mt-3">Terms of service, privacy policy, and other legal information.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <section className="prose prose-slate max-w-none">
          <h2>Terms of Service</h2>
          <p>This is a placeholder for Terms of Service. Replace with actual legal copy.</p>

          <h2>Privacy Policy</h2>
          <p>This is a placeholder for the privacy policy. Replace with actual legal copy.</p>
        </section>
      </main>

      <FooterNew />
    </div>
  );
}
