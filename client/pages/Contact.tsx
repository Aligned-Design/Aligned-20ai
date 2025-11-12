import { useState } from "react";
import { UnauthenticatedLayout } from "@/components/layout/UnauthenticatedLayout";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { Sparkles, Mail, MessageCircle, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <UnauthenticatedLayout>
      <SiteHeader />

      {/* Hero Section */}
      <section className="min-h-[50vh] bg-gradient-to-b from-indigo-50 via-white to-gray-50 pt-32 pb-16 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-indigo-100/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-purple-100/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <MessageCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">
              Get in Touch
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Let's talk
          </h1>

          <p className="text-xl sm:text-2xl text-slate-700 font-medium mb-10 max-w-3xl mx-auto">
            Have questions? Want a demo? We're here to help you get Aligned.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:outline-none"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:outline-none"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select a topic</option>
                  <option value="demo">Request a Demo</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Customer Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Sparkles className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">
              Other ways to reach us
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <Mail className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                  <p className="text-slate-600 mb-2">
                    For general inquiries and support
                  </p>
                  <a
                    href="mailto:hello@aligned.ai"
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    hello@aligned.ai
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <Calendar className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Book a Demo</h3>
                  <p className="text-slate-600 mb-2">
                    See Aligned AI in action
                  </p>
                  <a
                    href="/pricing"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Schedule a call →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <MessageCircle className="w-6 h-6 text-lime-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Live Chat</h3>
                  <p className="text-slate-600 mb-2">
                    Monday–Friday, 9am–6pm EST
                  </p>
                  <button className="text-lime-600 hover:text-lime-700 font-semibold">
                    Start chat →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <MapPin className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Location</h3>
                  <p className="text-slate-600">
                    Remote-first company
                    <br />
                    Serving clients worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-bold text-slate-900 mb-3">Support Hours</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Monday–Friday</span>
                  <span className="font-semibold">9am–6pm EST</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekend</span>
                  <span className="font-semibold">Email only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </UnauthenticatedLayout>
  );
}
