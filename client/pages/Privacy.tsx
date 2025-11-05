import React from "react";
import Reveal from "@/components/Reveal";
import FooterNew from "@/components/FooterNew";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 mt-3">
            How we collect, use, and protect your data.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <Reveal>
          <section className="prose prose-slate max-w-none">
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide and data necessary to operate
              and improve our services.
            </p>

            <h2>How We Use Data</h2>
            <p>
              We use data to provide the service, improve features, and for
              security and compliance.
            </p>

            <h2>Your Rights</h2>
            <p>
              You may access, correct, or delete your personal data by
              contacting support.
            </p>
          </section>
        </Reveal>
      </main>

      <FooterNew />
    </div>
  );
}
