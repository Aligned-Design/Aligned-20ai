import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  Star,
  ArrowRight,
  Calculator,
  Zap,
  Shield,
  Users,
  BarChart3,
  Clock,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRICING_TIERS,
  TRIAL_INFO,
  PricingTier,
  PricingCalculation,
} from "@shared/pricing";

export default function Pricing() {
  const [brandCount, setBrandCount] = useState(5);
  const [isYearly, setIsYearly] = useState(false);
  const [calculation, setCalculation] = useState<PricingCalculation | null>(
    null,
  );

  React.useEffect(() => {
    calculatePricing();
  }, [brandCount, isYearly]);

  const calculatePricing = () => {
    const tier = PRICING_TIERS.find(
      (t) =>
        brandCount >= t.minBrands &&
        (t.maxBrands === null || brandCount <= t.maxBrands),
    );

    if (!tier) return;

    const monthlyTotal = tier.pricePerBrand * brandCount;
    const yearlyTotal = monthlyTotal * 12;
    const yearlySavings = isYearly ? monthlyTotal * 2 : 0; // 2 months free yearly

    setCalculation({
      selectedTier: tier,
      brandCount,
      monthlyTotal,
      yearlyTotal: yearlyTotal - yearlySavings,
      yearlySavings,
      pricePerBrand: tier.pricePerBrand,
    });
  };

  const handleStartTrial = async (tierId: string) => {
    // TODO: Implement trial signup
    console.log(`Starting trial for tier: ${tierId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start your 7-day free trial today. No credit card required. Cancel
              anytime.
            </p>

            {/* Trial Highlight */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    7-Day Free Trial Included
                  </h3>
                  <p className="text-green-700">
                    Full access to AI content generation across all your
                    channels
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {TRIAL_INFO.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-green-800"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn("font-medium", !isYearly && "text-primary")}>
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={cn("font-medium", isYearly && "text-primary")}>
                Yearly
              </span>
              {isYearly && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Save 2 months
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Pricing Calculator */}
        <Card className="mb-12 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Calculator className="h-6 w-6" />
              Calculate Your Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="max-w-md mx-auto">
            <div className="space-y-4">
              <div>
                <Label>How many brands do you manage?</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={brandCount}
                  onChange={(e) => setBrandCount(parseInt(e.target.value) || 1)}
                  className="text-center text-lg font-semibold"
                />
              </div>

              {calculation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-sm text-blue-600 mb-1">
                    {calculation.selectedTier.name} Plan
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mb-1">
                    $
                    {isYearly
                      ? Math.round(calculation.yearlyTotal / 12)
                      : calculation.monthlyTotal}
                    <span className="text-lg font-normal">/month</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    ${calculation.pricePerBrand} per brand
                    {isYearly && calculation.yearlySavings > 0 && (
                      <span className="block text-green-600 font-medium">
                        Save ${calculation.yearlySavings}/year
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isYearly={isYearly}
              isRecommended={calculation?.selectedTier.id === tier.id}
              onStartTrial={() => handleStartTrial(tier.id)}
            />
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Aligned AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to scale your social media agency with
              AI-powered automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Zap className="h-8 w-8" />}
              title="AI Content Generation"
              description="Create weeks of content in minutes with brand-voice AI that learns your style"
              color="blue"
            />
            <BenefitCard
              icon={<Users className="h-8 w-8" />}
              title="Client Collaboration"
              description="Streamlined approval workflows with white-labeled client portals"
              color="green"
            />
            <BenefitCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Advanced Analytics"
              description="Prove ROI with comprehensive reporting and AI-powered insights"
              color="purple"
            />
            <BenefitCard
              icon={<Shield className="h-8 w-8" />}
              title="Enterprise Security"
              description="SOC 2 compliant with enterprise-grade security and data protection"
              color="orange"
            />
            <BenefitCard
              icon={<Clock className="h-8 w-8" />}
              title="Save 20+ Hours/Week"
              description="Automate content creation, scheduling, and reporting tasks"
              color="red"
            />
            <BenefitCard
              icon={<Phone className="h-8 w-8" />}
              title="Expert Support"
              description="Dedicated support team with social media marketing expertise"
              color="indigo"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FAQItem
              question="What's included in the 7-day free trial?"
              answer="Full access to all features including AI content generation, multi-platform publishing, analytics, client portals, and team collaboration tools. No credit card required."
            />
            <FAQItem
              question="Can I change my plan anytime?"
              answer="Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle."
            />
            <FAQItem
              question="Is there a setup fee?"
              answer="No setup fees, ever. We'll help you get started with free onboarding and training sessions."
            />
            <FAQItem
              question="Do you offer custom enterprise pricing?"
              answer="Yes! For agencies managing 50+ brands, we offer custom pricing and dedicated support. Contact our sales team for details."
            />
            <FAQItem
              question="What social platforms do you support?"
              answer="Instagram, Facebook, LinkedIn, Twitter, TikTok, Google Business Profile, Pinterest, and YouTube. More platforms added regularly."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes! We're SOC 2 compliant with enterprise-grade security, encryption, and regular security audits."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Agency?
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              Join 500+ agencies already using Aligned AI to scale their social
              media operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => handleStartTrial("growth")}
              >
                Start 7-Day Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              No credit card required • Cancel anytime • Full feature access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  tier: PricingTier;
  isYearly: boolean;
  isRecommended: boolean;
  onStartTrial: () => void;
}

function PricingCard({
  tier,
  isYearly,
  isRecommended,
  onStartTrial,
}: PricingCardProps) {
  const monthlyPrice = tier.pricePerBrand;
  const yearlyPrice = Math.round(monthlyPrice * 10); // 2 months free
  const displayPrice = isYearly ? yearlyPrice : monthlyPrice;

  return (
    <Card
      className={cn(
        "relative transition-all hover:shadow-xl",
        isRecommended && "ring-2 ring-primary shadow-lg",
        tier.isPopular && "border-primary",
      )}
    >
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-white px-4 py-1">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{tier.name}</CardTitle>
        <p className="text-gray-600">{tier.description}</p>

        <div className="py-4">
          <div className="text-4xl font-bold text-gray-900">
            ${displayPrice}
            <span className="text-lg font-normal text-gray-600">
              /brand/month
            </span>
          </div>

          <div className="text-sm text-gray-500 mt-1">
            {tier.minBrands === tier.maxBrands
              ? `${tier.minBrands} brand${tier.minBrands > 1 ? "s" : ""}`
              : `${tier.minBrands}${tier.maxBrands ? `-${tier.maxBrands}` : "+"} brands`}
          </div>

          {tier.savings && (
            <Badge
              variant="secondary"
              className="mt-2 bg-green-100 text-green-800"
            >
              {tier.savings}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-6">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onStartTrial}
          className={cn(
            "w-full",
            tier.isPopular
              ? "bg-primary hover:bg-primary/90"
              : "bg-gray-900 hover:bg-gray-800",
          )}
        >
          Start Free Trial
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <p className="text-xs text-gray-500 text-center mt-3">
          7-day free trial • No credit card required
        </p>
      </CardContent>
    </Card>
  );
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function BenefitCard({ icon, title, description, color }: BenefitCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
    indigo: "text-indigo-600 bg-indigo-100",
  };

  return (
    <div className="text-center">
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
          colorClasses[color as keyof typeof colorClasses],
        )}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
          {question}
        </h3>
      </button>
      {isOpen && <p className="text-gray-600 leading-relaxed">{answer}</p>}
    </div>
  );
}
