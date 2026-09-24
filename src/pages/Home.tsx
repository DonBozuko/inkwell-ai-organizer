import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AppShell, FeatureGrid, ParagraphCapture, UploadZone } from '../components';

const features = [
  {
    title: 'Capture in Context',
    description: 'Highlight any paragraph on the web and save it directly to your AI-organized vault with a single keystroke.',
    icon: '📎',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Intelligent Organization',
    description: 'Your notes are automatically tagged, clustered, and structured so you never search for what you already know.',
    icon: '🧠',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Visual Knowledge Graph',
    description: 'See how your ideas connect. Inkwell maps relationships between captures into an explorable, living web.',
    icon: '🕸️',
    accent: 'from-fuchsia-500 to-rose-500',
  },
  {
    title: 'Universal Import',
    description: 'Drop in PDFs, EPUBs, Markdown, or entire folders. Structure and meaning preserved on first pass.',
    icon: '🗂️',
    accent: 'from-rose-500 to-amber-500',
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient background wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/20 via-fuchsia-400/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at center,currentColor 1px,transparent 1px)',
            backgroundSize: '28px 28px',
            color: 'white',
          }}
        />
      </div>

      {/* Accessible skip link handled by AppShell; SEO lives here */}
      <Helmet>
        <title>Inkwell — AI-Organized Knowledge for How You Actually Think</title>
        <meta
          name="description"
          content="Inkwell captures paragraphs you read, imports what you collect, and organizes it intelligently so knowledge finds you instead of the other way around."
        />
        <meta
          name="keywords"
          content="second brain, AI notes, knowledge graph, capturing, PARA, reading vault"
        />
        <meta property="og:title" content="Inkwell — AI-Organized Knowledge" />
        <meta
          property="og:description"
          content="Capture, import, and let AI organize what you read. Your ideas, finally structured."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <AppShell>
        {/* Hero: split capture + value */}
        <section className="mx-auto max-w-7xl px-6 pt-28 pb-20 lg:pt-36">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Now organizing 2.4M captures this month
              </div>

              <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
                Your thoughts,{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                    finally organized.
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 h-3 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8 C40 2, 80 10, 120 6 S 180 4, 198 7"
                      stroke="url(#hero-underline)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="hero-underline" x1="0" x2="1">
                        <stop offset="0" stopColor="#a5b4fc" />
                        <stop offset="0.5" stopColor="#f0abfc" />
                        <stop offset="1" stopColor="#fde68a" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">
                Inkwell turns the paragraphs you read, the files you collect,
                and the ideas you have into a living, AI-structured knowledge
                base. No folders. No friction. Just recall that feels like
                remembering.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#capture"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-medium text-slate-900 shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:shadow-white/20"
                >
                  Start capturing
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base font-medium text-white/90 backdrop-blur transition hover:bg-white/10"
                >
                  See how it thinks
                </a>
              </div>

              {/* Social proof row */}
              <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 sm:max-w-lg">
                {[
                  { value: '2.4M', label: 'Captures / month' },
                  { value: '180ms', label: 'Median organize time' },
                  { value: '94%', label: 'Recall accuracy' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-mono text-2xl text-white md:text-3xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-white/50">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right rail: live capture demo */}
            <div
              id="capture"
              className="relative lg:col-span-5"
            >
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400/70" />
                    <span className="h-3 w-3 rounded-full bg-amber-300/70" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="font-mono text-xs text-white/50">
                    inkwell · capture
                  </span>
                </div>

                <div className="flex h-[360px] flex-col justify-between gap-4">
                  <ParagraphCapture compact showTeaser />

                  <div className="rounded-xl border border-indigo-300/30 bg-indigo-400/10 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-widest text-indigo-200">
                        AI organized
                      </span>
                      <span className="font-mono text-[11px] text-white/50">
                        182ms
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['#mechanics', '#physics', '#reading', '#unresolved'].map(
                        (t, i) => (
                          <span
                            key={t}
                            className={
                              'rounded-full px-2.5 py-1 text-xs font-mono ' +
                              (i === 0
                                ? 'bg-fuchsia-400/20 text-fuchsia-200'
                                : 'bg-white/10 text-white/70')
                            }
                          >
                            {t}
                          </span>
                        ),
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                      Linked to <span className="text-white">12 related captures</span>{' '}
                      and surfaced under{' '}
                      <span className="text-white">“Why do intuitive models fail?”</span>{' '}
                      cluster.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating tags as depth cues */}
              <div
                aria-hidden
                className="absolute -left-6 top-10 hidden rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 font-mono text-xs text-white/70 shadow-lg backdrop-blur md:block"
              >
                → linked to <span className="text-fuchsia-300">#bayes</span>
              </div>
              <div
                aria-hidden
                className="absolute -right-4 bottom-24 hidden rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 font-mono text-xs text-white/70 shadow-lg backdrop-blur md:block"
              >
                surfaced in <span className="text-amber-200">3 threads</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section
          id="how"
          className="mx-auto max-w-7xl px-6 py-24"
          aria-labelledby="features-heading"
        >
          <div className="mb-14 max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              How Inkwell works
            </div>
            <h2
              id="features-heading"
              className="mt-4 font-serif text-4xl tracking-tight text-white md:text-5xl"
            >
              Four moves. A mind that remembers for you.
            </h2>
            <p className="mt-5 text-lg text-white/70">
              No reorganizing. No folder tax. Captures go in, structure comes out.
            </p>
          </div>

          <FeatureGrid items={features} columns={4} />
        </section>

        {/* Upload zone — quiet call to action */}
        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                Start with what you already have
              </div>
              <h2 className="mt-4 font-serif text-4xl tracking-tight text-white">
                Drop in your backlog. We'll find the shape.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              PDFs, EPUBs, Markdown, HTML, CSV, ODP, or a folder of bookmarks —
              Inkwell opens the file, reads the spine, and files every idea where
              it belongs.
            </p>
          </div>

          <UploadZone
            heading="Drag your reading pile here"
            subheading="or click to browse — we'll structure it in seconds"
            acceptable=".pdf,.epub,.md,.markdown,.txt,.csv,.html,.htm,.zip"
            multi
          />
        </section>

        {/* Closing aphorism strip */}
        <section className="mx-auto max-w-5xl px-6 pb-28">
          <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-amber-400/10 p-10 md:p-14">
            <blockquote className="font-serif text-3xl leading-snug tracking-tight text-white md:text-4xl">
              “Writing is thinking. Collecting is a conversation with your
              future self. Inkwell simply makes sure that conversation is never
              interrupted by search.”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-sm text-white/70">
              <span className="h-px w-8 bg-white/40" />
              <span className="font-mono">— Inkwell Manifesto, 2024</span>
            </figcaption>
          </figure>
        </section>
      </AppShell>
    </main>
  );
}