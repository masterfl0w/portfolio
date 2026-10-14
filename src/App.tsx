import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Lenis from "lenis";
import portfolio from "@/content/portfolio.json";

const nav = [{ label: "Work", href: "#projects" }, { label: "Experience", href: "#career" }, { label: "About", href: "#profile" }];

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return reduced;
}

// A lightweight, locally rendered grain field. No video or third-party animation runtime.
export function GrainField({ monochrome = false, paused = false }: { monochrome?: boolean; paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let frame = 0, last = -100, visible = true;
    const width = 400, height = monochrome ? 240 : 190;
    canvas.width = width; canvas.height = height;
    const buffer = ctx.createImageData(width, height);
    const data = buffer.data;
    // Static per-pixel noise and fade, computed once instead of every frame.
    const noise = new Float32Array(width * height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) noise[y * width + x] = ((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1 + 1) % 1;
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const fadeRow = new Float32Array(height);
    for (let y = 0; y < height; y++) fadeRow[y] = Math.max(0, Math.min(1, (y / height - .36) / .64));
    // Trig terms are separable: evaluate per column / row / diagonal, never per pixel.
    const cx1 = new Float32Array(width), cx2 = new Float32Array(width), cxS = new Float32Array(width), cxC = new Float32Array(width), cxB = new Float32Array(width);
    const ry1 = new Float32Array(height), ry2 = new Float32Array(height), ryS = new Float32Array(height), ryC = new Float32Array(height);
    const diag = new Float32Array(width * 2);
    const draw = (time: number) => {
      if (visible && !document.hidden && time - last > 80) {
        last = time;
        const t = paused ? 0 : time * 0.00013;
        for (let x = 0; x < width; x++) {
          const nx = x / width;
          cx1[x] = Math.sin(nx * 10 + t); cx2[x] = Math.sin(nx * 9 + t);
          const a = nx * 8 - t; cxS[x] = Math.sin(a); cxC[x] = Math.cos(a); cxB[x] = Math.cos(nx * 9 + t);
        }
        for (let y = 0; y < height; y++) {
          const ny = y / height;
          ry1[y] = Math.cos(ny * 9 - t * 1.3); ry2[y] = Math.cos(ny * 6 - t);
          const b = ny * 3; ryS[y] = Math.sin(b); ryC[y] = Math.cos(b);
        }
        for (let d = 0; d < width * 2; d++) diag[d] = Math.sin((d / width) * 13 + t * .6);
        for (let y = 0; y < height; y++) {
          const fade = fadeRow[y];
          for (let x = 0; x < width; x++) {
            const n = noise[y * width + x];
            const i = (y * width + x) * 4;
            if (monochrome) {
              const wave = cx1[x] + ry1[y] + diag[x + Math.round(y * width / height)];
              const ink = n < Math.max(.015, (wave + 1.7) / 6) ? 33 : 241;
              data[i] = ink; data[i + 1] = ink === 33 ? 33 : 134; data[i + 2] = ink === 33 ? 33 : 162;
            } else {
              const cloud = (cx2[x] + ry2[y]) / 2;
              const grain = (n - .5) * 47;
              const r = 189 + 62 * cloud + grain, g = 153 + 44 * (cxS[x] * ryC[y] + cxC[x] * ryS[y]) + grain, bl = 213 + 30 * cxB[x] + grain;
              data[i] = r + (250 - r) * fade; data[i + 1] = g + (250 - g) * fade; data[i + 2] = bl + (247 - bl) * fade;
            }
          }
        }
        ctx.putImageData(buffer, 0, 0);
      }
      if (!paused) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas); draw(0);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [monochrome, paused]);
  return <canvas ref={canvasRef} className="grain-field" aria-hidden="true" />;
}

function WindowPanel({ title, className = "", children, draggable = false }: { title: string; className?: string; children: ReactNode; draggable?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  return <div ref={ref} className={`retro-window ${className}`}>
    <div className={`window-bar ${draggable ? "draggable" : ""}`}
      tabIndex={draggable ? 0 : undefined}
      aria-label={draggable ? `${title}. Use arrow keys to move this window on desktop.` : undefined}
      onKeyDown={e => {
        if (!draggable || window.innerWidth < 760 || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(e.key)) return;
        e.preventDefault();
        const delta = e.shiftKey ? 25 : 10;
        const x = e.key === "Home" ? 0 : Math.max(-90, Math.min(90, position.current.x + (e.key === "ArrowRight" ? delta : e.key === "ArrowLeft" ? -delta : 0)));
        const y = e.key === "Home" ? 0 : Math.max(-55, Math.min(55, position.current.y + (e.key === "ArrowDown" ? delta : e.key === "ArrowUp" ? -delta : 0)));
        position.current = { x, y }; ref.current!.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerDown={e => { if (!draggable || window.innerWidth < 760) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, left: position.current.x, top: position.current.y }; ref.current!.style.zIndex = "5"; }}
      onPointerMove={e => { if (!drag.current) return; const x = Math.max(-90, Math.min(90, drag.current.left + e.clientX - drag.current.x)); const y = Math.max(-55, Math.min(55, drag.current.top + e.clientY - drag.current.y)); position.current = { x, y }; ref.current!.style.transform = `translate(${x}px, ${y}px)`; }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <span>{title}</span><span aria-hidden="true">{draggable ? "⠿" : "▪"}</span>
    </div>
    <div className="window-body">{children}</div>
  </div>;
}

function Clock({ paused }: { paused: boolean }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { if (paused) return; const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, [paused]);
  return <><p className="clock-date">{now.toLocaleDateString("en-GB", { timeZone: "Europe/Paris", weekday: "short", day: "numeric", month: "short" })}</p><p className="clock-time">{now.toLocaleTimeString("en-GB", { timeZone: "Europe/Paris" })}</p><p className="micro">Lyon, FR / Europe–Paris</p></>;
}

function Life({ paused }: { paused: boolean }) {
  const makeSeed = () => Array.from({ length: 144 }, (_, i) => [17, 30, 40, 41, 42, 87, 88, 99, 100].includes(i));
  const [cells, setCells] = useState(makeSeed);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setCells(current => current.map((alive, i) => {
      const x = i % 12, y = Math.floor(i / 12);
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) neighbors += Number(current[((y + dy + 12) % 12) * 12 + (x + dx + 12) % 12]);
      return neighbors === 3 || (alive && neighbors === 2);
    })), 500);
    return () => clearInterval(id);
  }, [paused]);
  return <><div className="life-grid" aria-hidden="true">{cells.map((alive, i) => <i key={i} className={alive ? "alive" : ""} />)}</div><button className="text-button micro" onClick={() => setCells(makeSeed())}>↺ Reseed simulation</button></>;
}

function ProjectArt({ kind }: { kind: string }) {
  return <div className={`project-art art-${kind}`} aria-hidden="true">
    {kind === "compute" ? <><div className="chip"><span>ENERGIZER</span><b>E</b><small>APPLE SILICON / ML</small></div><span className="art-caption">hardware × intelligence</span></> :
    kind === "retrieval" ? <div className="retrieval-flow"><span>Notion<br /><small>knowledge</small></span><i>→</i><span className="retrieval-core">P.A.R.S.E<br /><small>retrieve + generate</small></span><i>→</i><span>Answer<br /><small>context</small></span></div> :
    kind === "library" ? <div className="library-stack">{["discover", "build", "share"].map((s, i) => <div key={s} style={{ "--i": i } as CSSProperties}><span>↗</span>{s}<small>libropen / 0{i + 1}</small></div>)}</div> :
    kind === "life" ? <div className="orbital">{[0, 1, 2, 3].map(i => <i key={i} style={{ "--i": i } as CSSProperties} />)}<span>SIRIUS</span></div> :
    <div className="game-scene"><span className="space-ship">▟█▙<br />▀█▀</span><span className="laser">· · ━ ━</span><span className="enemy">✣</span><small>PLAYER 01 / READY</small></div>}
  </div>;
}

export default function App() {
  const { profile, hero, projects, careers, studies, skillGroups, metrics, links, alert } = portfolio;
  const reduced = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);
  const paused = reduced || motionPaused;
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("motion-paused", paused);
    if (paused) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true });
    let frame = 0;
    const animate = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(animate); };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, [paused]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => { observer.disconnect(); window.removeEventListener("keydown", close); };
  }, []);

  useEffect(() => { if (!copied) return; const id = setTimeout(() => setCopied(false), 2500); return () => clearTimeout(id); }, [copied]);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Florian Grima home"><span className="brand-mark" aria-hidden="true">✳</span> Florian Grima<span className="wordmark-period">.</span></a>
      <nav aria-label="Main navigation" className={menuOpen ? "nav-open" : ""} id="navigation">{nav.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav>
      <div className="header-actions"><a className="resume-link" href={profile.resume} target="_blank" rel="noreferrer">Résumé <span>↗</span></a><a className="contact-link" href="#links">Let’s talk <span>↗</span></a><button className="menu-button" aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close −" : "Menu +"}</button></div>
    </header>
    <main id="main">
      <section className="hero" id="home">
        <GrainField paused={paused} />
        <a className="xp-balloon" href={alert.href} role="status">
          <span className="xp-icon" aria-hidden="true">i</span>
          <span className="xp-body"><strong>{alert.title}</strong><span>{alert.text}</span><span className="xp-more micro">Click here to read the case study ↗</span></span>
        </a>
        <div className="hero-topline micro"><span>PORTFOLIO / {new Date().getFullYear()}</span><span>ML ENGINEER · {profile.location.toUpperCase()}</span></div>
        <div className="hero-content">
          <div className="intro-note"><span className="status-dot" /> {hero.eyebrow}</div>
          <h1 aria-label={hero.title.join(" ")}>{hero.title.map((line, i) => <span key={line} className={`hero-line line-${i}`}><span>{line}{i === 2 && <span className="hero-asterisk" aria-hidden="true">✳</span>}</span></span>)}</h1>
          <div className="hero-bottom"><p>{hero.description}</p><a className="underlined-link" href="#projects">Explore my work <span>↘</span></a></div>
        </div>
        <span className="vertical-code micro" aria-hidden="true">FG / HUMAN IDEAS → MACHINE INTELLIGENCE / 45.7640° N, 4.8357° E</span>
        <div className="section-edge micro"><span>✣ &nbsp; BUILT WITH CURIOSITY</span><a href="#playground">SCROLL TO EXPLORE ↓</a><span>01 — 06</span></div>
      </section>

      <section className="pink-section" id="playground" aria-labelledby="playground-title">
        <div className="section-label micro"><span id="playground-title">01 / INSIDE MY WORKSPACE</span><span>IDEAS IN MOTION</span></div>
        <div className="desktop">
          <GrainField monochrome paused={paused} />
          <span className="desktop-label micro">FLORIAN.OS / V.01</span>
          <WindowPanel title="about_me.txt" className="about-window" draggable><span className="pixel-star" aria-hidden="true">✳</span><p>{profile.name}<br /><span className="dim">{profile.role}</span></p><div className="window-rule" /><p className="micro">Software engineer.<br />AI builder. Always curious.</p></WindowPanel>
          <WindowPanel title="local_time.exe" className="clock-window" draggable><Clock paused={paused} /></WindowPanel>
          <WindowPanel title="current_explorations / 03" className="explore-window" draggable><div className="terminal-line"><span className="status-dot" /> SYSTEM READY</div><h2>From an idea.<br />To a working system.</h2><div className="terminal-list">{projects.slice(0, 3).map((project, i) => <a key={project.name} href={`#project-${project.visual}`}><span className="micro">0{i + 1}</span><strong>{project.name}</strong><span>{project.category.split(" ·")[0]}</span><b>↗</b></a>)}</div><div className="terminal-status micro"><span>Python · PyTorch · TypeScript</span><span className="blinking-cursor">█</span></div></WindowPanel>
          <WindowPanel title="glider.exe" className="life-window" draggable><Life paused={paused} /></WindowPanel>
          <div className="desktop-footer micro"><span>© {new Date().getFullYear()} Florian Grima<br />Made in France. With curiosity.</span><span className="drag-hint">⠿ DRAG A WINDOW TO EXPLORE</span></div>
        </div>
        <div className="about-section content-width" id="profile">
          <div className="section-label micro"><span>02 / THE PERSON BEHIND THE CODE</span><span>SOFTWARE → AI → IMPACT</span></div>
          <h2 className="display-heading" data-reveal>Good engineering.<br />Useful intelligence.</h2>
          <div className="about-copy" data-reveal><span className="large-star" aria-hidden="true">✳</span><div><p className="lead">{profile.summary}</p><a className="underlined-link" href={profile.resume} download>Get my résumé <span>↓</span></a></div></div>
          <div className="metrics">{metrics.map(metric => <div key={metric.value} data-reveal><strong>{metric.value}</strong><p>{metric.label}</p><span className="micro">{metric.context}</span></div>)}</div>
          <p className="metrics-note micro">Selected outcomes from my professional experience.</p>
        </div>
      </section>

      <section id="projects" className="projects-section content-width">
        <div className="section-label micro"><span>03 / SELECTED WORK</span><span>PERSONAL, ACADEMIC & PROFESSIONAL</span></div>
        <div className="section-heading" data-reveal><h2 className="display-heading">Built to<br /><em>do something.</em></h2><p>Experiments that become tools.<br />Tools that make a difference.</p></div>
        <div className="project-grid">{projects.map((project, i) => <article className={`project-card project-${project.visual}`} id={`project-${project.visual}`} key={project.name} data-reveal>
          <div className="project-meta micro"><span>0{i + 1} / {project.category}</span><span>{project.date}</span></div>
          <ProjectArt kind={project.visual} />
          <div className="project-description"><h3>{project.name}</h3><p>{project.description}</p><div className="tags">{project.skills.map(skill => <span key={skill}>{skill}</span>)}</div><details><summary>Project notes <span className="detail-plus">+</span></summary><p>{project.details}</p></details>{"href" in project && <a className="underlined-link case-link" href={project.href as string}>Read the case study <span>↗</span></a>}</div>
        </article>)}</div>
        <a className="underlined-link github-cta" href={links[0].href} target="_blank" rel="noreferrer">More on GitHub <span>↗</span></a>
      </section>

      <section id="career" className="career-section">
        <div className="content-width"><div className="section-label micro"><span>04 / EXPERIENCE</span><span>{profile.experience.toUpperCase()} OF BUILDING</span></div><h2 className="display-heading" data-reveal>Less theory.<br />More shipped.</h2>
          <div className="career-list">{careers.map((career, i) => <details key={career.company} className="career-row" open={i === 0 ? true : undefined} data-reveal><summary><span className="career-period micro">{career.period}</span><span className="career-title"><strong>{career.company}</strong><span>{career.title}</span></span><span className="detail-plus">+</span></summary><div className="career-details"><p>{career.description}</p><ul>{career.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul><div className="tags">{career.tags.map(tag => <span key={tag}>{tag}</span>)}</div><span className="micro">{career.location}</span></div></details>)}</div>
        </div>
      </section>

      <section id="skills" className="skills-section content-width">
        <div className="section-label micro"><span>05 / TOOLS & FOUNDATIONS</span><span>ALWAYS LEARNING</span></div><h2 className="display-heading" data-reveal>The right tools.<br />The whole picture.</h2>
        <div className="skills-grid">{skillGroups.map((group, i) => <div key={group.name} className="skill-group" data-reveal><span className="micro">[0{i + 1}]</span><h3>{group.name}</h3><p>{group.description}</p><div className="tags">{group.items.map(item => <span key={item}>{item}</span>)}</div></div>)}</div>
        <div className="education" id="studies"><h3 className="micro">EDUCATION /</h3><div>{studies.map(study => <article key={study.institution} data-reveal><span className="micro">{study.period}</span><h4>{study.title}</h4><p>{study.institution}</p><p className="education-description">{study.description}</p></article>)}</div></div>
        <div className="languages micro"><span>HUMAN LANGUAGES</span><span>{profile.languages.join(" / ")}</span></div>
      </section>

      <footer id="links" className="contact-section">
        <GrainField paused={paused} /><div className="content-width contact-content"><div className="section-label micro"><span>06 / THE NEXT THING STARTS WITH A CONVERSATION</span><span>LYON, FRANCE</span></div><h2 className="display-heading" data-reveal>Have something<br />in mind<span className="spinning-star" aria-hidden="true">✳</span>?</h2><a className="contact-email" href={`mailto:${profile.email}`}>Let’s build it. <span>↗</span></a><div className="contact-bottom"><div className="email-row"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="copy-button micro" onClick={async () => { try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}>{copied ? "COPIED ✓" : "COPY ↗"}</button><span className="sr-only" role="status">{copied ? "Email copied to clipboard" : copyError ? `Please copy ${profile.email} manually` : ""}</span></div><div className="social-links">{links.map(link => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}<a href={profile.resume} target="_blank" rel="noreferrer">Résumé ↗</a></div></div><div className="footer-rule micro"><span>© {new Date().getFullYear()} FLORIAN GRIMA</span><button className="text-button" aria-pressed={paused} disabled={reduced} onClick={() => setMotionPaused(!motionPaused)}>{paused ? "MOTION: OFF" : "MOTION: ON"} <span aria-hidden="true">{paused ? "○" : "◉"}</span></button><a href="#home">BACK TO TOP ↑</a></div></div>
      </footer>
    </main>
  </>;
}
