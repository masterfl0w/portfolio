import { useEffect } from "react";
import { GrainField, useReducedMotion } from "@/App";

const links = {
  paper: "https://energizer-ml.github.io/energizer/assets/energizer-ane-paper.pdf",
  site: "https://energizer-ml.github.io/energizer/",
  repo: "https://github.com/energizer-ml/energizer",
};

const expectations = [
  ["MLX and PyTorch-MPS use the ANE", "They run on the GPU. The ANE is reachable only through Core ML."],
  ["The ANE runs any model", "No fp32 operator is placed on the ANE. In fp16, only above shape thresholds."],
  ["The ANE is the fastest unit", "5.2 TFLOP/s peak against 6.0 for MLX. Fastest only on the transformer workload."],
  ["A hybrid step is cheaper", "Refreshing Core ML weights costs 260–320 ms. It never beats pure MLX."],
];

const steps = [
  { name: "MLP · width 1024", cpu: 8.9, mlx: 1.9 },
  { name: "MLP · width 2048", cpu: 40, mlx: 7.5 },
  { name: "CNN", cpu: 35.6, mlx: 4.6 },
  { name: "Transformer", cpu: 29.7, mlx: 7.2 },
];

const facts = [
  { value: "2.7 W", label: "median draw on the ANE rail when a model is placed there" },
  { value: "2.8×", label: "energy cost of the GPU path where both can run, at 1.3× the latency" },
  { value: "576", label: "Core ML configurations characterised on one Apple M4 Pro" },
  { value: "300 ms", label: "to rebuild a Core ML model after every weight update" },
];

const faq = [
  ["Can the Neural Engine train a model?", "Not on the public stack. Core ML exposes no backward pass, so a hybrid step has to rebuild the model after every weight update, and that dominates the step."],
  ["Where did the training speed-up come from?", "From keeping the whole step (forward, backward, loss and optimiser) native on the GPU through MLX. The optimiser alone is the largest single factor."],
  ["What is in the repository?", "A small PyTorch-like library (autograd, layers, optimisers, MLX backend, Core ML compiler), the measurement harness, and every raw result behind the paper."],
  ["What does the study not show?", "Larger models, other chips and later OS releases may move the thresholds. Private ANE interfaces were not used, and frozen-weight uses were not tested."],
];

export default function EnergizerPage() {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.title = "Energizer — the Neural Engine, measured · Florian Grima";
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return <div className="case-page">
    <a className="skip-link" href="#case-main">Skip to content</a>
    <header className="case-header">
      <a className="wordmark" href="/" aria-label="Back to Florian Grima’s portfolio"><span className="brand-mark" aria-hidden="true">✳</span> Florian Grima<span className="wordmark-period">.</span></a>
      <nav aria-label="Project links"><a href={links.site} target="_blank" rel="noreferrer">Website ↗</a><a href={links.paper} target="_blank" rel="noreferrer">Paper ↗</a><a className="contact-link" href="/#projects">All work <span>↖</span></a></nav>
    </header>
    <main id="case-main">
      <section className="case-hero">
        <GrainField paused={reduced} />
        <div className="case-window retro-window">
          <div className="window-bar"><span>energizer 0.2</span><span aria-hidden="true">▪</span></div>
          <div className="window-body"><span className="micro">PROJECT / 2026 / RESEARCH</span><h1>The Neural Engine,<br />measured.</h1><p>Energizer is a small PyTorch-like library for Apple silicon, built as a testbed to find out what the Apple Neural Engine can, and cannot, do for deep-learning training.</p>
            <div className="case-cta"><a className="contact-link" href={links.paper} target="_blank" rel="noreferrer">Read the paper <span>↗</span></a><a className="underlined-link" href={links.site} target="_blank" rel="noreferrer">Visit the website <span>↗</span></a><a className="underlined-link" href={links.repo} target="_blank" rel="noreferrer">Source on GitHub <span>↗</span></a></div></div>
        </div>
      </section>

      <section className="case-section content-width">
        <div className="section-label micro"><span>01 / THE QUESTION</span><span>ONE MACHINE · APPLE M4 PRO</span></div>
        <h2 className="display-heading" data-reveal>Expected.<br />Measured.</h2>
        <p className="case-lead" data-reveal>Training on Apple silicon is usually framed as “GPU or ANE”. The ANE can’t be programmed directly and the public stack gives inference only, so I measured it instead of assuming.</p>
        <div className="expect-grid">{expectations.map(([expected, measured], i) => <article key={expected} className="expect-card" data-reveal><span className="micro">[0{i + 1}] EXPECTED</span><h3>{expected}</h3><span className="micro">MEASURED</span><p>{measured}</p></article>)}</div>
      </section>

      <section className="case-section case-dark">
        <div className="content-width">
          <div className="section-label micro"><span>02 / WHAT ACTUALLY WENT FASTER</span><span>ADAM TRAINING STEP, MS</span></div>
          <h2 className="display-heading" data-reveal>4–8× faster.<br />From the GPU,<br />not the ANE.</h2>
          <div className="step-chart" role="img" aria-label="Training step time, NumPy CPU versus MLX: MLP 1024 8.9 vs 1.9 ms, MLP 2048 40 vs 7.5 ms, CNN 35.6 vs 4.6 ms, Transformer 29.7 vs 7.2 ms.">
            {steps.map(step => <div key={step.name} className="step-row" data-reveal><span className="micro">{step.name}</span>
              <div className="bar-track"><i className="bar bar-cpu" style={{ width: `${step.cpu / 40 * 100}%` }} /><b className="micro">CPU {step.cpu} ms</b></div>
              <div className="bar-track"><i className="bar bar-mlx" style={{ width: `${step.mlx / 40 * 100}%` }} /><b className="micro">MLX {step.mlx} ms</b></div></div>)}
          </div>
          <p className="case-note micro">The whole step (forward, backward, loss and optimiser) runs natively on the GPU through MLX.</p>
        </div>
      </section>

      <section className="case-section content-width">
        <div className="section-label micro"><span>03 / WHAT THE ANE IS GOOD FOR</span><span>INFERENCE, NOT TRAINING</span></div>
        <h2 className="display-heading" data-reveal>An efficient<br />inference engine.</h2>
        <div className="metrics case-facts">{facts.map(f => <div key={f.value} data-reveal><strong>{f.value}</strong><p>{f.label}</p></div>)}</div>
        <p className="case-lead" data-reveal>On this stack the ANE is an efficient engine for fixed-weight, fp16 inference of sufficiently large operators. It cannot run a backward pass, and a hybrid step only matches fp32 accuracy by refreshing weights every step, at about 300× the energy.</p>
      </section>

      <section className="case-section content-width">
        <div className="section-label micro"><span>04 / FAQ</span><span>THE SHORT ANSWERS</span></div>
        <div className="faq-list">{faq.map(([q, a]) => <details key={q} className="faq-row" data-reveal><summary><strong>{q}</strong><span className="detail-plus">+</span></summary><p className="faq-answer">{a}</p></details>)}</div>
      </section>

      <section className="case-section case-footer">
        <GrainField paused={reduced} />
        <div className="content-width contact-content"><h2 className="display-heading">Read the<br />whole study.</h2>
          <div className="case-cta"><a className="contact-link" href={links.paper} target="_blank" rel="noreferrer">Paper (PDF) <span>↗</span></a><a className="underlined-link" href={links.site} target="_blank" rel="noreferrer">Website <span>↗</span></a><a className="underlined-link" href={links.repo} target="_blank" rel="noreferrer">GitHub <span>↗</span></a><a className="underlined-link" href="/">Back to portfolio <span>↖</span></a></div>
        </div>
      </section>
    </main>
  </div>;
}
