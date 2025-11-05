import React from "react";
import Reveal from "@/components/Reveal";
import FooterNew from "@/components/FooterNew";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 mt-3">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <Reveal>
          <section className="prose prose-slate max-w-none">
            <h2>1. Acceptance</h2>
            <p>By using Aligned AI you agree to these terms.</p>

            <h2>2. Services</h2>
            <p>We provide AI-powered content tools for agencies and brands.</p>

            <h2>3. Eligibility</h2>
            <p>Users must be at least 18 years old to create an account.</p>

            <h2>4. Account & Security</h2>
            <p>
              Keep your account secure and notify us of any unauthorized access.
            </p>
          </section>
        </Reveal>
      </main>

      <FooterNew />
    </div>
  );
}
