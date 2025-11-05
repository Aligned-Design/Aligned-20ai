import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Reveal from "@/components/Reveal";
import FooterNew from "@/components/FooterNew";

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              Features that scale your agency
            </h1>
            <p className="text-lg text-slate-600 mt-4">
              All the tools you need to plan, create, approve, schedule and
              analyze content — powered by AI.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>AI Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Generate on-brand captions, blogs, emails and more — all
                  tailored to each brand kit.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Design Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Create visuals and templates that match brand colors and
                  typography automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advisor Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Data-driven recommendations for timing, format, and content
                  that moves the needle.
                </p>
              </CardContent>
            </Card>
          </div>
        </Reveal>

        <Reveal>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Integrations Showcase
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mt-2">
              Connect publishing, analytics, and design tools for a seamless
              workflow.
            </p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {[
                "Instagram",
                "Facebook",
                "X",
                "Google Analytics",
                "Canva",
                "Zapier",
              ].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-center text-sm text-slate-800 shadow-sm hover:shadow-md transition-shadow duration-180"
                >
                  {n}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button asChild variant="default">
                <Link to="/integrations-marketing">See all integrations</Link>
              </Button>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 text-center">
          <Button asChild variant="default">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <FooterNew />
    </div>
  );
}
