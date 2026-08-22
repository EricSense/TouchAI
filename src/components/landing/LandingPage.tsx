import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LandingPreview } from "@/components/landing/LandingPreview";

const steps = [
  {
    key: "CREATE",
    title: "Add what you are building",
    copy: "Businesses, projects, ideas, skills, and resources become nodes in a single universe.",
  },
  {
    key: "CONNECT",
    title: "Draw the relationships",
    copy: "Owns. Supports. Depends on. Funds. The lines are how strategy becomes visible.",
  },
  {
    key: "DISCOVER",
    title: "See the next move",
    copy: "The map reveals missing resources, isolated ideas, and the center of your ecosystem.",
  },
];

export function LandingPage() {
  return (
    <div className="starfield min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost px-4 py-2 text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary px-4 py-2 text-sm">
            Build Your Universe
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid w-full max-w-6xl gap-14 px-6 pb-24 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] grid-fade" />
        <div>
          <p className="mb-5 text-[11px] tracking-[0.28em] text-gold uppercase">
            Build your own business universe.
          </p>
          <h1 className="display max-w-xl text-5xl leading-[1.05] font-semibold tracking-tight text-cream sm:text-6xl">
            Build Your Own Business Universe.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
            Visualize your businesses, ideas, projects, skills, and resources in
            one interconnected universe. See how everything connects—and discover
            what to build next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn btn-primary">
              Build Your Universe
            </Link>
            <a href="#how-it-works" className="btn btn-ghost">
              Explore the Concept
            </a>
          </div>
        </div>
        <LandingPreview />
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <p className="text-[11px] tracking-[0.24em] text-gold uppercase">The problem</p>
        <h2 className="display mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Your ideas are scattered.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="panel rounded-2xl p-6">
            <p className="text-muted leading-7">
              Your business plans live in documents.
              <br />
              Your projects live in task managers.
              <br />
              Your ideas live in notes.
              <br />
              Your skills and resources are disconnected from your opportunities.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-gold-soft p-6">
            <p className="display text-2xl text-cream">
              Billion Universe brings everything together.
            </p>
            <p className="mt-4 leading-7 text-muted">
              One visual operating system for everything you own, know, and are
              building — so you can finally see the whole field.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <p className="text-[11px] tracking-[0.24em] text-gold uppercase">How it works</p>
        <h2 className="display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Create. Connect. Discover.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.key} className="panel rounded-2xl p-6">
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
                {step.key}
              </p>
              <h3 className="display mt-3 text-xl">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="panel overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-10">
              <p className="text-[11px] tracking-[0.24em] text-gold uppercase">
                Universe Intelligence
              </p>
              <h2 className="display mt-3 text-3xl font-semibold">
                Your AI-powered strategist.
              </h2>
              <p className="mt-4 max-w-md leading-7 text-muted">
                Coming soon. Universe Intelligence will read the entire map and
                help you see what to build next — not as another chatbot, as a
                strategist that already knows your ecosystem.
              </p>
            </div>
            <blockquote className="border-t border-line bg-void-2/70 p-8 leading-8 text-cream/90 lg:border-t-0 lg:border-l sm:p-10">
              “I noticed that your AI skills, healthcare interests, and Human
              Augmentation Intelligence project are highly connected.
              <br />
              <br />
              Potential opportunity:
              <br />
              Create an AI-powered healthcare education platform.”
            </blockquote>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-28">
        <div className="rounded-3xl border border-gold/20 bg-[radial-gradient(800px_280px_at_50%_0%,rgba(201,169,106,0.12),transparent)] px-8 py-16 text-center">
          <h2 className="display text-4xl font-semibold">Start building your universe.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            The first version does one thing extremely well: help you visualize
            and organize everything you are building.
          </p>
          <Link href="/signup" className="btn btn-primary mt-8">
            Create Your Universe
          </Link>
        </div>
      </section>
    </div>
  );
}
