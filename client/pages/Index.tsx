import { ArrowRight, BarChart3, CheckCircle2, FileText, LayoutGrid, LinkIcon, Lock, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export default function Index() {
  return (
    <>
      <SiteHeader />
      <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[700px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-fuchsia-400/20 to-sky-400/20 blur-3xl" />
        </div>
        <div className="container mx-auto grid gap-8 px-4 pb-16 pt-20 text-center md:pb-28 md:pt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> The Future of Done‑For‑You Marketing, Done Intelligently
          </div>
          <h1 className="mx-auto max-w-5xl bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-6xl">
            Aligned AI is the intelligent brand content platform that keeps you a month ahead—without the overwhelm.
          </h1>
          <p className="mx-auto max-w-3xl text-balance text-lg text-muted-foreground md:text-xl">
            Strategy, creativity, and automation—aligned. Three coordinated AI agents learn every brand’s voice, design style, and performance data so your content isn’t just generated, it’s aligned.
          </p>
          <div className="mx-auto flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground shadow-lg shadow-fuchsia-500/20">
              <a href="#contact" className="inline-flex items-center">Request a demo <ArrowRight className="ml-2 h-4 w-4"/></a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#features">Explore features</a>
            </Button>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 text-left text-sm text-muted-foreground md:grid-cols-4">
            <div className="rounded-lg border bg-background/60 p-3 backdrop-blur"><span className="font-semibold text-foreground">50%</span> less time planning & creating</div>
            <div className="rounded-lg border bg-background/60 p-3 backdrop-blur"><span className="font-semibold text-foreground">80%+</span> brand fidelity accuracy</div>
            <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">Continuous learning from analytics</div>
            <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">Peace‑driven productivity</div>
          </div>
        </div>
      </section>

      {/* Core Value Proposition */}
      <section className="container mx-auto grid gap-6 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Automate next‑month’s marketing—aligned to every brand</h2>
          <p className="mt-3 text-lg text-muted-foreground">For agencies and growing brands that need reliable, high‑volume content, Aligned AI analyzes, writes, designs, and schedules every post, blog, and email—keeping tone, visuals, and compliance intact.</p>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground"><LayoutGrid className="h-3.5 w-3.5 text-primary"/> Three Specialized AI Agents</div>
          <h3 className="text-2xl font-bold md:text-3xl">One platform, three roles—working in sync</h3>
          <p className="mt-2 text-muted-foreground">Each agent learns your brand and collaborates to deliver on‑brand content at scale.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-background/60 p-6 shadow-sm transition hover:shadow-md">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Doc Agent</div>
            <h4 className="mt-3 text-lg font-semibold">Aligned Words</h4>
            <p className="mt-2 text-sm text-muted-foreground">Writes captions, blogs, emails, and CTA variations in your brand voice.</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-background/60 p-6 shadow-sm transition hover:shadow-md">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl" />
            <div className="inline-flex items-center gap-2 rounded-md bg-fuchsia-500/10 px-2 py-1 text-xs font-medium text-fuchsia-600">Design Agent</div>
            <h4 className="mt-3 text-lg font-semibold">Aligned Creative</h4>
            <p className="mt-2 text-sm text-muted-foreground">Produces visuals, templates, and video prompts that fit your look and message.</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-background/60 p-6 shadow-sm transition hover:shadow-md">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl" />
            <div className="inline-flex items-center gap-2 rounded-md bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-600">Advisor Agent</div>
            <h4 className="mt-3 text-lg font-semibold">Aligned Insights</h4>
            <p className="mt-2 text-sm text-muted-foreground">Studies analytics and trends, recommending what to post, when, and why.</p>
          </div>
        </div>
      </section>

      {/* Intelligent Brand Kits & Features */}
      <section id="features" className="relative border-y bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto grid gap-8 px-4 py-16 md:gap-12 md:py-24">
          <span id="security" className="absolute -top-16 block h-1 w-1 opacity-0"/>
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-2xl font-bold md:text-3xl">Intelligent Brand Kits and seamless workflows</h3>
            <p className="mt-2 text-muted-foreground">Upload once. Aligned AI learns your tone, style, and compliance rules—then keeps every asset on‑brand.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Feature icon={<FileText className="h-5 w-5"/>} title="Intelligent Brand Kits" desc="Create a digital brand brain from your site, docs, and brand guides."/>
            <Feature icon={<Users className="h-5 w-5"/>} title="Seamless Approval" desc="Threaded feedback, audit trails, and one‑click approvals."/>
            <Feature icon={<LinkIcon className="h-5 w-5"/>} title="Auto Publishing" desc="Push approved posts to Instagram, Facebook, LinkedIn, X, and GMB."/>
            <Feature icon={<Shield className="h-5 w-5"/>} title="Brand Isolation" desc="Separate, secure workspaces—no crossover, no confusion."/>
            <Feature icon={<Lock className="h-5 w-5"/>} title="Enterprise‑grade Security" desc="Role‑based permissions and encryption for privacy and control."/>
            <Feature icon={<BarChart3 className="h-5 w-5"/>} title="Real‑time Analytics" desc="Interactive dashboards with AI‑powered recommendations."/>
          </div>
        </div>
      </section>

      {/* Monthly Engine */}
      <section id="engine" className="container mx-auto grid gap-8 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-2xl font-bold md:text-3xl">Automated Monthly Content Engine</h3>
          <p className="mt-2 text-muted-foreground">By the 10th of each month, Aligned AI analyzes last month’s results, drafts all blogs, emails, and social posts for next month, and schedules them for approval.</p>
        </div>
        <ol className="mx-auto grid max-w-4xl gap-4 md:grid-cols-4">
          <Step index={1} title="Analyze" desc="Ingests last month’s performance across channels."/>
          <Step index={2} title="Draft" desc="Creates on‑brand blogs, emails, and posts."/>
          <Step index={3} title="Review" desc="Threaded feedback with version history."/>
          <Step index={4} title="Schedule" desc="Auto‑publishes after one‑click approvals."/>
        </ol>
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Advisor Agent continuously learns from results to improve tone, timing, and formats.
        </div>
      </section>

      {/* Analytics */}
      <section id="analytics" className="relative overflow-hidden border-t">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-30%] h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-400/20 via-primary/20 to-fuchsia-400/20 blur-3xl" />
        </div>
        <div className="container mx-auto grid gap-6 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-2xl font-bold md:text-3xl">Real‑Time Analytics & AI Recommendations</h3>
            <p className="mt-2 text-muted-foreground">Interactive dashboards display engagement, reach, and top‑performing content. Advisor Agent turns insights into action—suggesting new topics, times, and formats for growth.</p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-4">
            <Stat label="Engagement" value="↑ 32%"/>
            <Stat label="Reach" value="↑ 21%"/>
            <Stat label="Brand fidelity" value="> 80%"/>
            <Stat label="Time saved" value="− 50%"/>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="how-it-works" className="container mx-auto grid gap-6 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-2xl font-bold md:text-3xl">Make marketing flow—on‑brand, on‑time, and one step ahead</h3>
          <p className="mt-2 text-muted-foreground">One login. Infinite clarity. Switch between clients without losing context, content, or consistency.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground shadow-lg shadow-fuchsia-500/20">
              <a href="#contact" className="inline-flex items-center">Request a demo <ArrowRight className="ml-2 h-4 w-4"/></a>
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

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h4 className="text-base font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ index, title, desc }: { index: number; title: string; desc: string }) {
  return (
    <li className="rounded-xl border bg-card p-5">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index}</div>
      <h5 className="mt-3 text-sm font-semibold">{title}</h5>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/60 p-4 text-center backdrop-blur">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
