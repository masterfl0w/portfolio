import { useEffect } from "react";
import Lenis from "lenis";

import portfolio from "@/content/portfolio.json";

const sections = [
  { label: "Profile", href: "#profile" },
  { label: "Studies", href: "#studies" },
  { label: "Career", href: "#career" },
  { label: "Skills", href: "#skills" },
  { label: "Links", href: "#links" },
];

export default function App() {
  const { profile, hero, studies, careers, skills, links } = portfolio;

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    let frame = 0;

    const onFrame = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(onFrame);
    };

    frame = window.requestAnimationFrame(onFrame);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.24,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    document.querySelectorAll("[data-reveal]").forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="relative z-10">
        <section id="home" className="relative flex min-h-screen items-center justify-center">
          <div className="portfolio-shell flex min-h-screen items-center justify-center pt-16 text-center sm:pt-20">
            <div className="flex max-w-7xl flex-col items-center">
              <p className="animate-fade-rise mb-6 text-sm uppercase tracking-[0.4em] text-muted-foreground">
                {profile.role} · {profile.country}
              </p>

              <h1
                className="animate-fade-rise text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Where <em className="not-italic text-muted-foreground">dreams</em>{" "}
                rise{" "}
                <em className="not-italic text-muted-foreground">
                  through the silence.
                </em>
              </h1>

              <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {hero.description}
              </p>

              <a
                href="#profile"
                className="liquid-glass animate-fade-rise-delay-2 mt-12 inline-flex rounded-full px-14 py-5 text-base text-foreground transition-transform duration-300 hover:scale-[1.03]"
              >
                Begin Journey
              </a>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {sections.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="liquid-glass inline-flex rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="portfolio-flow relative z-10 pb-24">
          <section id="profile" className="portfolio-section" data-reveal>
            <div className="portfolio-shell">
              <div className="portfolio-panel grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <p className="section-kicker">Profile</p>
                  <h2
                    className="section-title max-w-3xl"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {profile.name}, crafting machine learning systems from France.
                  </h2>
                  <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    {profile.summary}
                  </p>
                </div>

                <div className="portfolio-card space-y-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                      Role
                    </p>
                    <p className="mt-2 text-2xl text-foreground">{profile.role}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                      Base
                    </p>
                    <p className="mt-2 text-2xl text-foreground">{profile.country}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                      Focus
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      Applied ML, LLM products, data pipelines, model serving,
                      experimentation, and production reliability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="studies" className="portfolio-section" data-reveal>
            <div className="portfolio-shell">
              <div className="portfolio-panel">
                <div className="mb-12 space-y-4">
                  <p className="section-kicker">Studies</p>
                  <h2
                    className="section-title"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    Academic foundations shaped for applied machine learning.
                  </h2>
                </div>

                <div className="grid gap-6">
                  {studies.map((study) => (
                    <article
                      key={`${study.period}-${study.title}`}
                      className="portfolio-card"
                    >
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-2xl text-foreground">{study.title}</h3>
                          <p className="mt-2 text-muted-foreground">
                            {study.institution}
                          </p>
                        </div>
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                          {study.period}
                        </p>
                      </div>
                      <p className="max-w-3xl leading-relaxed text-muted-foreground">
                        {study.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="career" className="portfolio-section" data-reveal>
            <div className="portfolio-shell">
              <div className="portfolio-panel">
                <div className="mb-12 space-y-4">
                  <p className="section-kicker">Career</p>
                  <h2
                    className="section-title"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    Production-minded work across ML engineering and applied AI.
                  </h2>
                </div>

                <div className="grid gap-6">
                  {careers.map((career) => (
                    <article
                      key={`${career.period}-${career.title}`}
                      className="portfolio-card"
                    >
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-2xl text-foreground">{career.title}</h3>
                          <p className="mt-2 text-muted-foreground">
                            {career.company}
                          </p>
                        </div>
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                          {career.period}
                        </p>
                      </div>
                      <p className="max-w-3xl leading-relaxed text-muted-foreground">
                        {career.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="skills" className="portfolio-section" data-reveal>
            <div className="portfolio-shell">
              <div className="portfolio-panel">
                <div className="mb-12 space-y-4">
                  <p className="section-kicker">Skills</p>
                  <h2
                    className="section-title"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    Core tools and systems I use to move from prototype to production.
                  </h2>
                </div>

                <div className="flex flex-wrap gap-4">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="liquid-glass inline-flex rounded-full px-5 py-3 text-sm text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="links" className="portfolio-section" data-reveal>
            <div className="portfolio-shell">
              <div className="portfolio-panel">
                <div className="mb-12 space-y-4">
                  <p className="section-kicker">Links</p>
                  <h2
                    className="section-title"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    Places to follow the work, the code, and the next releases.
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="portfolio-card block transition-transform duration-300 hover:-translate-y-1"
                    >
                      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                        {link.label}
                      </p>
                      <p className="mt-4 text-xl text-foreground">{link.href}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
