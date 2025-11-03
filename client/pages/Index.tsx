import React from 'react';

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Aligned 20 AI
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Fusion Starter Template Ready for Builder.io
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <p className="text-sm text-gray-500">
            Built with React Router 6 SPA + TypeScript + Vite
          </p>
        </div>
      </div>
    </div>
  );
}

export default Index;
          <p className="text-lg text-gray-600 mb-8">
            Fusion Starter Template Ready for Builder.io
          </p>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <p className="text-sm text-gray-500">
              Built with React Router 6 SPA + TypeScript + Vite
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

export default Index;

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-border/50 bg-background p-8 shadow-soft transition-all hover:shadow-md hover:border-border">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet transition-all group-hover:bg-violet/20">
        {icon}
      </div>
      <h4 className="text-base font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function Step({
  index,
  title,
  desc,
}: {
  index: number;
  title: string;
  desc: string;
}) {
  return (
    <li className="rounded-2xl border border-border/50 bg-background p-7 shadow-soft">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet/10 text-sm font-semibold text-violet">
        {index}
      </div>
      <h5 className="mt-4 text-base font-semibold">{title}</h5>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/80 p-6 text-center backdrop-blur-sm shadow-soft">
      <div className="text-3xl font-semibold text-foreground">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
              Specialized AI Agents
            </div>
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
              One platform, three roles—working in sync
            </h3>
            <p className="text-lg text-muted-foreground">
              Each agent learns your brand and collaborates to deliver on‑brand
              content at scale.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-background to-muted/30 p-8 shadow-soft transition-all hover:shadow-md hover:border-violet/50">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet/10 blur-3xl transition-all group-hover:bg-violet/20" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-lg bg-violet/10 px-3 py-1.5 text-xs font-medium text-violet">
                  Doc Agent
                </div>
                <h4 className="mt-4 text-xl font-semibold">Aligned Words</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Writes captions, blogs, emails, and CTA variations in your
                  brand voice.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-background to-muted/30 p-8 shadow-soft transition-all hover:shadow-md hover:border-coral/50">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-coral/10 blur-3xl transition-all group-hover:bg-coral/20" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-lg bg-coral/10 px-3 py-1.5 text-xs font-medium text-coral">
                  Design Agent
                </div>
                <h4 className="mt-4 text-xl font-semibold">Aligned Creative</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Produces visuals, templates, and video prompts that fit your
                  look and message.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-background to-muted/30 p-8 shadow-soft transition-all hover:shadow-md hover:border-azure/50">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-azure/10 blur-3xl transition-all group-hover:bg-azure/20" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-lg bg-azure/10 px-3 py-1.5 text-xs font-medium text-azure">
                  Advisor Agent
                </div>
                <h4 className="mt-4 text-xl font-semibold">Aligned Insights</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Studies analytics and trends, recommending what to post, when,
                  and why.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligent Brand Kits & Features */}
        <section
          id="features"
          className="relative border-y border-border/50 bg-gradient-to-b from-muted/20 to-background"
        >
          <div className="container mx-auto grid gap-12 px-4 py-20 md:py-28">
            <span
              id="security"
              className="absolute -top-16 block h-1 w-1 opacity-0"
            />
            <div className="mx-auto max-w-3xl text-center space-y-4">
              <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Intelligent Brand Kits and seamless workflows
              </h3>
              <p className="text-lg text-muted-foreground">
                Upload once. Aligned AI learns your tone, style, and compliance
                rules—then keeps every asset on‑brand.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Feature
                icon={<FileText className="h-5 w-5" />}
                title="Intelligent Brand Kits"
                desc="Create a digital brand brain from your site, docs, and brand guides."
              />
              <Feature
                icon={<Users className="h-5 w-5" />}
                title="Seamless Approval"
                desc="Threaded feedback, audit trails, and one‑click approvals."
              />
              <Feature
                icon={<LinkIcon className="h-5 w-5" />}
                title="Auto Publishing"
                desc="Push approved posts to Instagram, Facebook, LinkedIn, X, and GMB."
              />
              <Feature
                icon={<Shield className="h-5 w-5" />}
                title="Brand Isolation"
                desc="Separate, secure workspaces—no crossover, no confusion."
              />
              <Feature
                icon={<Lock className="h-5 w-5" />}
                title="Enterprise‑grade Security"
                desc="Role‑based permissions and encryption for privacy and control."
              />
              <Feature
                icon={<BarChart3 className="h-5 w-5" />}
                title="Real‑time Analytics"
                desc="Interactive dashboards with AI‑powered recommendations."
              />
            </div>
          </div>
        </section>

        {/* Monthly Engine */}
        <section
          id="engine"
          className="container mx-auto grid gap-12 px-4 py-20 md:py-28"
        >
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Automated Monthly Content Engine
            </h3>
            <p className="text-lg text-muted-foreground">
              By the 10th of each month, Aligned AI analyzes last month's
              results, drafts all blogs, emails, and social posts for next
              month, and schedules them for approval.
            </p>
          </div>
          <ol className="mx-auto grid max-w-5xl gap-6 md:grid-cols-4">
            <Step
              index={1}
              title="Analyze"
              desc="Ingests last month's performance across channels."
            />
            <Step
              index={2}
              title="Draft"
              desc="Creates on‑brand blogs, emails, and posts."
            />
            <Step
              index={3}
              title="Review"
              desc="Threaded feedback with version history."
            />
            <Step
              index={4}
              title="Schedule"
              desc="Auto‑publishes after one‑click approvals."
            />
          </ol>
          <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-muted/30 p-8 text-center shadow-soft backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Advisor Agent continuously learns from results to improve tone,
              timing, and formats.
            </p>
          </div>
        </section>

        {/* Analytics */}
        <section
          id="analytics"
          className="relative overflow-hidden border-t border-border/50"
        >
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-30%] h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-br from-azure/10 via-mint/5 to-violet/10 blur-3xl animate-glow" />
          </div>
          <div className="container mx-auto grid gap-10 px-4 py-20 md:py-28">
            <div className="mx-auto max-w-3xl text-center space-y-4">
              <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Real‑Time Analytics & AI Recommendations
              </h3>
              <p className="text-lg text-muted-foreground">
                Interactive dashboards display engagement, reach, and
                top‑performing content. Advisor Agent turns insights into
                action—suggesting new topics, times, and formats for growth.
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
              <Stat label="Engagement" value="↑ 32%" />
              <Stat label="Reach" value="↑ 21%" />
              <Stat label="Brand fidelity" value="> 80%" />
              <Stat label="Time saved" value="− 50%" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="how-it-works"
          className="container mx-auto grid gap-8 px-4 py-20 md:py-28"
        >
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Make marketing flow—on‑brand, on‑time, and one step ahead
            </h3>
            <p className="text-lg text-muted-foreground">
              One login. Infinite clarity. Switch between clients without losing
              context, content, or consistency.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-violet to-azure text-white shadow-glow hover:shadow-glow-azure"
              >
                <a href="#contact" className="inline-flex items-center">
                  Request a demo <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">See features</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-border/50 bg-background p-8 shadow-soft transition-all hover:shadow-md hover:border-border">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet transition-all group-hover:bg-violet/20">
        {icon}
      </div>
      <h4 className="text-base font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function Step({
  index,
  title,
  desc,
}: {
  index: number;
  title: string;
  desc: string;
}) {
  return (
    <li className="rounded-2xl border border-border/50 bg-background p-7 shadow-soft">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet/10 text-sm font-semibold text-violet">
        {index}
      </div>
      <h5 className="mt-4 text-base font-semibold">{title}</h5>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/80 p-6 text-center backdrop-blur-sm shadow-soft">
      <div className="text-3xl font-semibold text-foreground">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
    </div>
  );
}
