import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { phases } from "@/lib/content";

export const metadata: Metadata = {
  title: "24-week roadmap",
  description: "The complete Cloverdew Engineering Lab learning roadmap."
};

const months = [
  {
    month: "01",
    title: "Shared state & coordination",
    weeks: [
      "Threads and lost updates",
      "Visibility and happens-before",
      "Atomic state transitions",
      "Bounded queue from first principles"
    ],
    gate: "Implement, break, and explain a bounded monitor queue."
  },
  {
    month: "02",
    title: "Execution lifecycle",
    weeks: [
      "Conditions and tenant permits",
      "Bounded executors and overload",
      "Cancellation and shutdown",
      "Liveness and first measurements"
    ],
    gate: "Defend QueryGate’s capacity, state, and shutdown policies."
  },
  {
    month: "03",
    title: "Runtime evidence",
    weeks: [
      "Processes, threads, scheduling",
      "JVM allocation and GC",
      "Remote calls and deadlines",
      "Contention and careful benchmarking"
    ],
    gate: "Explain one latency event from a thread dump or JFR recording."
  },
  {
    month: "04",
    title: "Query & streaming behavior",
    weeks: [
      "Query execution pipelines",
      "Fair tenant scheduling",
      "CDC producers and backpressure",
      "Idempotency and delivery semantics"
    ],
    gate: "Quantify tenant wait and CDC lag under a declared workload."
  },
  {
    month: "05",
    title: "Trustworthy data for AI",
    weeks: [
      "Deterministic context planning",
      "Freshness and CDC-fed context",
      "Metrics, traces, and SLOs",
      "Fault-injection campaign"
    ],
    gate: "Prove permission-before-retrieval and trace result provenance."
  },
  {
    month: "06",
    title: "Engineering proof",
    weeks: [
      "Correctness audit",
      "Capacity curve",
      "Portfolio design document",
      "Technical defense and v1.0"
    ],
    gate: "Rebuild one mechanism and defend the system without AI."
  }
];

export default function RoadmapPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell narrow">
          <p className="eyebrow">24 active weeks · 48 focused hours</p>
          <h1>A narrow road to systems ownership.</h1>
          <p>
            The schedule moves when life interrupts. It never creates catch-up
            debt, and it never adds a technology merely because it is
            interesting.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="roadmap-principles">
            <div>
              <strong>One project</strong>
              <span>QueryGate grows every month.</span>
            </div>
            <div>
              <strong>One mechanism</strong>
              <span>Each week has a narrow implementation target.</span>
            </div>
            <div>
              <strong>One interview problem</strong>
              <span>Twenty minutes, then stop.</span>
            </div>
            <div>
              <strong>One checkpoint</strong>
              <span>Every fourth week, evidence decides the pace.</span>
            </div>
          </div>

          <div className="month-list">
            {months.map((item) => (
              <article className="month-row" key={item.month}>
                <div className="month-index">{item.month}</div>
                <div className="month-title">
                  <p>Month {Number(item.month)}</p>
                  <h2>{item.title}</h2>
                </div>
                <ol>
                  {item.weeks.map((week, index) => (
                    <li key={week}>
                      <span>
                        W{(Number(item.month) - 1) * 4 + index + 1}
                      </span>
                      {week}
                    </li>
                  ))}
                </ol>
                <div className="month-gate">
                  <span>Exit gate</span>
                  <p>{item.gate}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section roadmap-phases">
        <div className="shell">
          <p className="eyebrow">Three questions</p>
          <div className="phase-question-list">
            {phases.map((phase) => (
              <div key={phase.id}>
                <span>{phase.id}</span>
                <h3>{phase.question}</h3>
              </div>
            ))}
          </div>
          <Link className="button button-primary" href="/lessons/threads-and-shared-state">
            Begin Week 1 <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
