import { UnauthenticatedLayout } from "@/components/layout/UnauthenticatedLayout";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <UnauthenticatedLayout>
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-32 pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Shield className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">
              Last Updated: January 2025
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Privacy Policy
          </h1>

          <p className="text-lg text-slate-600">
            Your privacy matters. Here's how we protect and handle your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto prose prose-lg prose-slate">
          <h2>1. Introduction</h2>
          <p>
            Aligned AI ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li>Account information (name, email, company)</li>
            <li>Brand intake data (voice, messaging, values)</li>
            <li>Content you create or upload</li>
            <li>Payment and billing information</li>
            <li>Communications with our support team</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li>Device and browser information</li>
            <li>IP address and location data</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h3>2.3 Information from Third Parties</h3>
          <ul>
            <li>Social media platform connections (e.g., Facebook, LinkedIn)</li>
            <li>OAuth authentication data</li>
            <li>Public profile information from connected accounts</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide, operate, and maintain our services</li>
            <li>Generate AI-powered content aligned with your brand</li>
            <li>Process transactions and manage billing</li>
            <li>Send administrative and marketing communications</li>
            <li>Improve and personalize your experience</li>
            <li>Analyze usage patterns and platform performance</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          
          <h3>4.1 Service Providers</h3>
          <p>
            We work with third-party vendors who help us deliver our services, including:
          </p>
          <ul>
            <li>Cloud hosting providers (infrastructure)</li>
            <li>Payment processors (billing)</li>
            <li>Analytics platforms (usage insights)</li>
            <li>AI/ML service providers (content generation)</li>
          </ul>

          <h3>4.2 Social Media Platforms</h3>
          <p>
            When you connect your social accounts, we share content you authorize us to publish.
          </p>

          <h3>4.3 Legal Requirements</h3>
          <p>
            We may disclose information if required by law, subpoena, or to protect our rights.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul>
            <li>Encryption in transit (TLS/SSL)</li>
            <li>Encryption at rest</li>
            <li>Secure OAuth connections (we never store social media passwords)</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
          </ul>
          <p>
            However, no system is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your data by contacting us at privacy@aligned.ai.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
            <li>Opt out of marketing communications</li>
          </ul>
          <p>
            To exercise these rights, contact us at privacy@aligned.ai.
          </p>

          <h2>8. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for users under 18. We do not knowingly collect data from children.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Your data may be processed in countries outside your own. We ensure appropriate safeguards are in place for international transfers.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes via email or platform notification.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at:
          </p>
          <ul>
            <li><strong>Email:</strong> privacy@aligned.ai</li>
            <li><strong>Address:</strong> Aligned AI (Remote-first company)</li>
          </ul>
        </div>
      </section>

      <SiteFooter />
    </UnauthenticatedLayout>
  );
}
