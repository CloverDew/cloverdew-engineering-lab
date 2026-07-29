import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "QueryGate project",
  description:
    "The cumulative multi-tenant execution system built throughout the learning track."
};

const invariants = [
  "Every accepted task is terminal or still discoverable.",
  "A task reaches at most one terminal state.",
  "Queue size never exceeds configured capacity.",
  "Running tasks never exceed a tenant’s limit.",
  "Rejected tasks never execute.",
  "Overload, failure, timeout, and cancellation remain distinguishable.",
  "Shutdown terminates cooperative work within a declared bound.",
  "Only explicitly safe operations may be retried."
];

export default function ProjectPage() {
  return (
    <>
      <section className="page-hero project-hero">
        <div className="shell narrow">
          <p className="eyebrow">The cumulative project</p>
          <h1>QueryGate</h1>
          <p>
            A small multi-tenant execution service for simulated query, CDC,
            and context-building tasks. It is not a database or a Flink clone.
            It is one subsystem you can own completely.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell project-grid">
          <div>
            <p className="eyebrow">Execution path</p>
            <h2>Make responsibility visible.</h2>
            <p className="section-copy">
              The architecture stays deliberately legible. Each arrow creates
              a question about ownership, capacity, failure, or visibility.
            </p>
          </div>
          <div className="architecture" aria-label="QueryGate architecture">
            <div className="arch-node accent">
              <small>01 · submit</small>
              <strong>AdmissionController</strong>
              <span>global bound + tenant policy</span>
            </div>
            <div className="arch-connector">
              <span>accepted</span>
              <i />
            </div>
            <div className="arch-split">
              <div className="arch-node">
                <small>02 · wait</small>
                <strong>Bounded queue</strong>
                <span>backpressure + rejection</span>
              </div>
              <div className="arch-node">
                <small>03 · isolate</small>
                <strong>TenantLimiter</strong>
                <span>permits + fairness</span>
              </div>
            </div>
            <div className="arch-connector">
              <span>scheduled</span>
              <i />
            </div>
            <div className="arch-node">
              <small>04 · execute</small>
              <strong>WorkerExecutor</strong>
              <span>deadline + cancellation + failure</span>
            </div>
            <div className="arch-connector">
              <span>observed</span>
              <i />
            </div>
            <div className="arch-split">
              <div className="arch-node">
                <small>05 · truth</small>
                <strong>TaskRegistry</strong>
                <span>one terminal outcome</span>
              </div>
              <div className="arch-node">
                <small>06 · evidence</small>
                <strong>Metrics & traces</strong>
                <span>queue, execution, outcome</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section invariant-section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Non-negotiable</p>
              <h2>Eight invariants before eight features.</h2>
            </div>
            <p>
              Every implementation choice must make these easier to prove,
              observe, or maintain.
            </p>
          </div>
          <div className="invariant-grid">
            {invariants.map((invariant, index) => (
              <div className="invariant-card" key={invariant}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{invariant}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section state-section">
        <div className="shell">
          <div className="state-copy">
            <p className="eyebrow">Core protocol</p>
            <h2>The state machine is the product contract.</h2>
            <p>
              Each transition has one owner. Terminal states have no outgoing
              edges. Associated result data must be published consistently with
              the terminal decision.
            </p>
          </div>
          <div className="state-machine">
            <div className="state-line">
              <span>SUBMITTED</span>
              <i>→</i>
              <span>QUEUED</span>
              <i>→</i>
              <span className="active">RUNNING</span>
            </div>
            <div className="state-branches">
              <span>SUCCEEDED</span>
              <span>FAILED</span>
              <span>CANCELLED</span>
              <span>TIMED_OUT</span>
            </div>
            <p>SUBMITTED or QUEUED may also become REJECTED or CANCELLED.</p>
          </div>
        </div>
      </section>

      <section className="section project-cta">
        <div className="shell">
          <h2>Begin with a counter, not an executor.</h2>
          <p>
            Every later component depends on the reasoning habit formed in
            Week 1.
          </p>
          <Link className="button button-primary" href="/lessons/threads-and-shared-state">
            Open the first lesson <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
