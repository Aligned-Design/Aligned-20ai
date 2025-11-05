import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Reveal from '@/components/Reveal';
import FooterNew from '@/components/FooterNew';

const partnerLogos = [
  { id: 'ig', name: 'Instagram', logo: '📷' },
  { id: 'fb', name: 'Facebook', logo: '📘' },
  { id: 'tw', name: 'X', logo: '🐦' },
  { id: 'ga', name: 'Google Analytics', logo: '📊' },
  { id: 'canva', name: 'Canva', logo: '🎨' },
  { id: 'zapier', name: 'Zapier', logo: '⚡' },
];

export default function IntegrationsMarketing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Integrations</h1>
          <p className="text-lg text-slate-600 mt-3">Connect the tools your agency already uses — seamless publishing, analytics, and automation.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <Reveal>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Built for the tools agencies love</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Publish directly, import assets, sync analytics, and automate workflows with our integrations ecosystem.</p>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
            {partnerLogos.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-180">
                <div className="text-2xl">{p.logo}</div>
                <div className="text-sm font-medium text-slate-800">{p.name}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Schedule and publish posts across Instagram, Facebook, X, LinkedIn and Google Business Profile.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Sync analytics to uncover what content drives engagement and conversions.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Use Zapier and webhooks to automate workflows and speed up repetitive tasks.</p>
              </CardContent>
            </Card>
          </div>
        </Reveal>

        <div className="text-center mt-8">
          <Button size="lg" variant="default">Explore Integrations</Button>
        </div>
      </main>

      <FooterNew />
    </div>
  );
}
