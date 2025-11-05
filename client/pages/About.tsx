import React from "react";
import Reveal from "@/components/Reveal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import FooterNew from "@/components/FooterNew";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">
            About Aligned AI
          </h1>
          <p className="text-lg text-slate-600 mt-3">
            We build AI that helps agencies create consistent, on-brand content
            at scale.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Our Mission
            </h2>
            <p className="text-slate-600">
              To empower creative teams with tools that amplify expertise and
              remove repetitive work — so agencies can focus on strategy and
              relationships.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Built for Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Multi-brand support, white-label capabilities, and approval
                  workflows that map to agency needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We treat client data with care, providing enterprise-grade
                  controls and secure integrations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI + Humans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Our tools augment human creativity — keeping teams in control
                  while automating repetitive tasks.
                </p>
              </CardContent>
            </Card>
          </div>
        </Reveal>

        <Reveal>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Leadership
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A small team of industry veterans from agencies and AI research —
              focused on building practical tools that scale.
            </p>
          </div>
        </Reveal>
      </main>

      <FooterNew />
    </div>
  );
}
