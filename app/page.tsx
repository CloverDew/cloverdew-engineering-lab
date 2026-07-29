import Link from "next/link";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { LessonFilter } from "@/components/lesson-filter";
import { lessons, phases, publishedLessons } from "@/lib/content";

export default function HomePage() {
  const current = publishedLessons[0];

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="kicker">
              <span className="status-dot" />
              A 24-week systems engineering track
            </div>
            <h1>
              Understand the code.
              <br />
              <em>Own the system.</em>
            </h1>
            <p className="hero-dek">
              Concise, experiment-first notes for building Java concurrency
              foundations and carrying them into query engines, streaming
              systems, and trustworthy data infrastructure for AI.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/lessons/${current.slug}`}>
                Start with Week 1 <ArrowIcon />
              </Link>
              <Link className="button button-quiet" href="/roadmap">
                Explore the roadmap
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <CheckIcon /> 2 hours / week
              </span>
              <span>
                <CheckIcon /> One cumulative project
              </span>
              <span>
                <CheckIcon /> Evidence over familiarity
              </span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="terminal-bar">
              <span />
              <span />
              <span />
              <small>querygate://current-track</small>
            </div>
            <div className="terminal-body">
              <p className="terminal-comment">// current objective</p>
              <p>
                <span className="terminal-key">prove</span>(
                <span className="terminal-string">
                  &quot;concurrent correctness&quot;
                </span>
                );
              </p>
              <div className="terminal-rule" />
              <dl>
                <div>
                  <dt>01</dt>
                  <dd>
                    <strong>Predict</strong>
                    <span>Expected behavior + failure modes</span>
                  </dd>
                </div>
                <div>
                  <dt>02</dt>
                  <dd>
                    <strong>Implement</strong>
                    <span>From invariants, without generated code</span>
                  </dd>
                </div>
                <div>
                  <dt>03</dt>
                  <dd>
                    <strong>Break</strong>
                    <span>Adversarial tests + fault injection</span>
                  </dd>
                </div>
                <div>
                  <dt>04</dt>
                  <dd>
                    <strong>Explain</strong>
                    <span>Mechanism, evidence, production transfer</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section current-section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Current track</p>
              <h2>Start with the failure, not the API.</h2>
            </div>
            <p>
              Each lesson is short enough for one sitting and ends with a
              concrete experiment, review questions, and a production bridge.
            </p>
          </div>
          <Link className="featured-lesson" href={`/lessons/${current.slug}`}>
            <div className="featured-number">01</div>
            <div>
              <p className="eyebrow">Read next · {current.readTime}</p>
              <h3>{current.title}</h3>
              <p>{current.dek}</p>
            </div>
            <span className="round-arrow">
              <ArrowIcon size={22} />
            </span>
          </Link>
        </div>
      </section>

      <section className="section phase-section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">The arc</p>
            <h2>One system, three levels of responsibility.</h2>
          </div>
          <div className="phase-grid">
            {phases.map((phase) => (
              <article className="phase-card" key={phase.id}>
                <div className="phase-meta">
                  <span>{phase.id}</span>
                  <span>{phase.weeks}</span>
                </div>
                <h3>{phase.title}</h3>
                <p>{phase.question}</p>
                <div className="phase-outcome">{phase.outcome}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section library-section" id="library">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Lesson library</p>
              <h2>Java concurrency, from first principles.</h2>
            </div>
            <p>
              Four lessons are ready now. Later lessons remain visible so the
              sequence stays clear without becoming overwhelming.
            </p>
          </div>
          <LessonFilter lessons={lessons} />
        </div>
      </section>

      <section className="section manifesto-section">
        <div className="shell manifesto">
          <p className="eyebrow">The standard</p>
          <blockquote>
            “Code that happens to work is not demonstrably correct.”
          </blockquote>
          <div className="manifesto-grid">
            <p>
              Name the invariant. Identify shared state. Show the
              happens-before edge. Bound resource use. Define failure and
              shutdown.
            </p>
            <Link className="text-link" href="/project">
              See how QueryGate puts this into practice <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
