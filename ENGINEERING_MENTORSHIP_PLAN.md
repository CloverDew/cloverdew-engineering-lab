# Six-Month Engineering Mentorship Plan

**Direction:** Java concurrency → reliable execution systems → query, streaming, and data-for-AI infrastructure  
**Time budget:** 2 focused hours per week, 24 active weeks, approximately 48 hours total  
**Primary artifact:** `QueryGate`, a production-oriented, multi-tenant concurrent task-execution service  
**Rule of pace:** An interrupted week moves the schedule; it does not create catch-up debt.

---

## 1. Diagnosis of Your Current Engineering Profile

You are not a beginner engineer, but your skill shape is uneven.

Your production intuition is ahead of your formal foundations and coding fluency. You can often recognize a suspicious design, interpret logs, narrow a failure category, and discuss system trade-offs. Those are valuable systems-engineering abilities that many people acquire only after years of work. Your experience with Flink, Spark, CDC, SQL, warehouses, incidents, and open source gives you real context for why concurrency and reliability matter.

The weak point is the path from an idea to independently justified code:

> problem → invariant → design → implementation → adversarial test → diagnosis → explanation

You can traverse parts of this path well, especially problem understanding and diagnosis, but AI frequently fills too much of the implementation section. That makes your knowledge feel uncertain because you do not yet have enough repeated evidence that you can construct the mechanism yourself.

Your current job creates a second risk. Alert handling and cross-team support can produce broad operational familiarity without clear ownership, durable artifacts, or a complete engineering feedback loop. This plan cannot change your assigned work, but it can give you a subsystem-sized loop that you own from design through load testing and postmortem.

The right strategy is not a broad “complete computer science” curriculum. It is to build a narrow, high-value spine:

1. Make Java concurrency precise and executable.
2. Use it to build a reliable multi-tenant execution subsystem.
3. Add only the OS, JVM, networking, query, and streaming concepts needed to explain that subsystem.
4. connect the result to deterministic data infrastructure for AI.
5. repair interview implementation fluency with one small algorithm problem per week.

Your target profile after six months is not “expert in everything.” It is:

> An engineer who can independently design, implement, test, debug, measure, and explain a bounded concurrent execution service, and connect its design to query engines, streaming platforms, and reliable context delivery for AI.

---

## 2. Gaps to Fix, in Priority Order

### Priority 1: Independent Java implementation and concurrency correctness

You need repeated practice translating invariants into Java without receiving an implementation first. This includes the Java Memory Model, safe publication, synchronization, state transitions, cancellation, shutdown, and bounded resource use.

Why first: these skills improve your current engineering work, open-source work, interviews, and confidence simultaneously.

### Priority 2: A rigorous correctness habit

For every component, learn to name:

- shared mutable state;
- legal state transitions;
- invariants;
- synchronization boundaries;
- happens-before edges;
- safety failures;
- liveness failures;
- overload behavior;
- failure propagation;
- shutdown behavior.

Code that passes once is not evidence of concurrent correctness.

### Priority 3: Ownership of one complete engineering loop

You need one coherent project with design notes, code, tests, fault injection, metrics, benchmarks, and a final technical defense. This creates measurable evidence even if daily work remains fragmented.

### Priority 4: Runtime foundations that explain production behavior

Learn a selective subset of operating systems, JVM internals, and networking: scheduling, blocking, memory, allocation, garbage collection, sockets, timeouts, queues, and observability. Do not attempt full courses.

### Priority 5: Query and streaming execution concepts

Connect thread pools, scheduling, queues, fairness, backpressure, retries, and state machines to inter-query concurrency, pipeline execution, CDC ingestion, checkpoints, and tenant isolation.

### Priority 6: Interview implementation fluency

One problem every week is enough at this stage if it is solved independently, tested, and explained. The goal is retrieval of patterns under pressure, not a large problem count.

### Priority 7: Data-for-AI specialization

Only after the execution foundation is stable, add metadata, permission checks, freshness, provenance, and deterministic context-building boundaries. Avoid chasing framework trends.

---

## 3. Six-Month Roadmap

The roadmap has three phases. Each fourth week is partly an integration checkpoint. A “week” means one completed two-hour session, not necessarily one calendar week.

| Phase | Weeks | Central question | Project result |
|---|---:|---|---|
| I. Concurrent execution foundations | 1–8 | Can I prove that concurrent Java code is safe, live, bounded, and stoppable? | A bounded executor with task states, tenant limits, cancellation, overload behavior, and stress tests |
| II. Runtime and data-system execution | 9–16 | Can I explain and measure how the executor interacts with the JVM, OS, remote calls, query pipelines, and CDC backpressure? | Observable simulated query/CDC workloads, fair scheduling, JFR/JMH evidence, retry/deduplication rules |
| III. Reliable data-for-AI capstone | 17–24 | Can I turn the executor into a trustworthy deterministic context service and defend its design? | Permission-aware context jobs, freshness/provenance, fault injection, capacity report, design document, and release |

### Month 1 — Shared state and coordination

Build a correct mental model of threads, races, visibility, ordering, atomicity, monitors, and wait conditions. Produce the first task state machine and bounded queue.

### Month 2 — Execution lifecycle

Build the worker pool, bounded admission, tenant limits, cancellation, exception propagation, graceful shutdown, liveness diagnosis, and the first load report.

### Month 3 — Runtime evidence

Connect Java behavior to processes, scheduling, JVM memory, garbage collection, remote I/O, contention, false sharing, thread dumps, Java Flight Recorder, and careful benchmarking.

### Month 4 — Query and streaming behavior

Model query pipelines, inter-query scheduling, fairness, CDC producers, backpressure, retry safety, idempotency, and duplicate suppression.

### Month 5 — Data-for-AI reliability

Add deterministic planning, permission checks, metadata, freshness, provenance, observability, SLOs, and a fault-injection matrix.

### Month 6 — Engineering proof

Audit correctness, simplify the design, measure capacity, document decisions, reproduce failures, and defend the system without relying on AI-generated explanations.

---

## 4. The Weekly Two-Hour Operating System

Use the same structure every week:

| Time | Activity |
|---:|---|
| 0:00–0:10 | Closed-book recall: write what you remember from last week |
| 0:10–0:25 | Predict the week’s engineering problem and failure modes before reading |
| 0:25–1:25 | Implement or debug independently |
| 1:25–1:45 | One algorithm problem or scheduled redo |
| 1:45–2:00 | Run acceptance checks and write the learning log |

Reading is demand-driven and is included in the implementation hour. Do not add a separate reading syllabus.

### Minimum viable session for a low-energy week

If you cannot complete two hours, do 45 minutes:

1. ten minutes of recall and design;
2. twenty-five minutes on one narrow code or test change;
3. ten minutes recording the next exact action.

This preserves continuity. Do not compensate by doubling the next week.

### Required weekly artifacts

Each week leaves four small pieces of evidence:

1. a design note containing the invariant and failure model;
2. a code change you can explain line by line;
3. at least one adversarial test;
4. a learning-log entry answering “what evidence changed my mind?”

---

## 5. Cumulative Project: `QueryGate`

`QueryGate` is an in-process Java service that accepts simulated query, CDC, and context-building tasks. It is intentionally not a full database, network server, or Flink clone.

### Conceptual architecture

```text
Submitter / workload simulator
            |
            v
     AdmissionController
       |           |
 queue capacity   per-tenant permits
       |           |
       +-----+-----+
             v
       FairTaskScheduler
             |
             v
        WorkerExecutor
             |
      +------+-------+
      |              |
  TaskRunner      TaskRegistry
      |              |
 timeout/retry    state machine
 cancellation     terminal result
      |
      v
 Simulated query / CDC / context stages

Cross-cutting: metrics, trace IDs, fault injection, graceful shutdown
```

### Core task state machine

Start with:

```text
SUBMITTED -> QUEUED -> RUNNING -> SUCCEEDED
                         |  |-> FAILED
                         |  `-> CANCELLED
                         `----> TIMED_OUT

SUBMITTED or QUEUED may also become REJECTED or CANCELLED.
Terminal states never transition.
```

You may revise this state machine, but every transition must have one owner and a test.

### Initial invariants

1. Accepted tasks are either terminal or still discoverable in the registry.
2. A task reaches at most one terminal state.
3. Queue size never exceeds its configured capacity.
4. Running tasks for a tenant never exceed that tenant’s limit.
5. Rejected tasks never execute.
6. A caller can distinguish overload, execution failure, cancellation, and timeout.
7. Shutdown rejects new work, handles queued work according to a documented policy, interrupts running work when required, and terminates within a bound.
8. Retry is allowed only when the task’s safety policy permits it.
9. Metrics do not silently change the correctness of task execution.

### Suggested repository shape

```text
query-gate/
  README.md
  pom.xml
  docs/
    invariants.md
    architecture.md
    failure-model.md
    benchmark-report.md
    decisions/
  src/main/java/.../
    task/
    queue/
    admission/
    execution/
    scheduling/
    metrics/
    workload/
  src/test/java/.../
    unit/
    stress/
    fault/
```

Use Java 21, Maven, and JUnit 5. Add JMH or jcstress only when the plan reaches them; do not spend Week 1 building infrastructure.

---

## 6. Detailed First Eight Weeks: Java Multithreading and High Concurrency

The mentor protocol for every core exercise is:

1. I give you the problem and constraints, not the implementation.
2. You submit a design with shared state, invariants, transitions, and shutdown behavior.
3. You write the first version.
4. I review correctness before style.
5. We add adversarial tests.
6. You explain the happens-before argument and production connection.
7. Only after acceptance may you compare with a reference implementation.

Keep each week to one primary mechanism and roughly 50–120 lines of production code, excluding tests. If the acceptance criteria do not fit in the session, stop at a compiling, tested boundary and repeat that active week next session; do not rush ahead or silently borrow an implementation.

### Week 1 — A completion counter that lies

**Engineering problem:** Several worker threads execute simulated query fragments and increment a shared completion count. The final count is occasionally smaller than the number of completed fragments.

**Concepts**

- process versus thread;
- per-thread stack versus shared heap;
- thread creation, `start`, `run`, `join`, and lifecycle states;
- scheduling nondeterminism;
- shared mutable state;
- read-modify-write races;
- atomicity;
- why `count++` is not one indivisible action;
- safety versus liveness.

**Implementation task**

Create a small `CompletionCounterExperiment`:

1. start several platform threads with a coordinated start gate;
2. have each thread perform many increments;
3. record expected and observed totals;
4. implement one deliberately unsafe counter;
5. implement one correct counter using `synchronized`;
6. wait for completion with `join`, not `sleep`.

Do not use an executor, atomic class, or concurrent collection yet.

**Debugging exercise**

Begin with the unsafe counter. Run it repeatedly with different thread counts. Explain why a run that returns the correct number does not prove safety. Add a start barrier using `CountDownLatch` only as test scaffolding; you are not required to explain the latch internals yet.

**Expected outputs**

- a table with threads, increments per thread, expected value, observed value;
- at least one observed lost-update run, or a written explanation of why nondeterministic reproduction is not guaranteed;
- an exact final value from the synchronized version across repeated runs;
- a short event interleaving showing how two increments become one.

**Review questions**

1. What memory is shared and what is thread-local?
2. Why does calling `run()` directly not create concurrent execution?
3. What does `join()` guarantee that `sleep()` does not?
4. Is `int` assignment being atomic enough to make `count++` safe?
5. State the invariant of the corrected counter.
6. How is this similar to aggregating completed query fragments?

**Common mistakes**

- using `sleep` to guess when workers finish;
- synchronizing on a different object for each call;
- making the counter `volatile` and assuming increment becomes atomic;
- testing only once;
- confusing “I did not observe failure” with “failure is impossible.”

**Acceptance criteria**

- you can write both versions without AI-generated code;
- the main thread waits correctly for every worker;
- the synchronized version has an explicit lock identity;
- you can show a three-step read/add/write lost-update interleaving;
- you classify the bug as a safety failure, not merely “a timing issue.”

**Production connection:** Parallel query fragments, sink-writer counters, metrics, and completion tracking all encounter the same distinction between an atomic read/write and an atomic state transition.

---

### Week 2 — A worker that refuses to stop

**Engineering problem:** A background worker loops until a shutdown flag changes, but under optimization it may not observe the update. A newly started worker may also observe incompletely published configuration.

**Concepts**

- visibility and ordering;
- compiler, JIT, and CPU reordering at the level needed by a Java programmer;
- the Java Memory Model as a set of allowed observations;
- program order, synchronization order, `synchronizes-with`, and happens-before;
- `volatile` read/write semantics;
- monitor unlock/lock and thread start/join happens-before edges;
- safe publication;
- immutable state and `final` fields;
- why visibility is not compound atomicity.

**Implementation task**

Build `StoppableWorker` with:

- an immutable worker configuration;
- `start()` and `stop()` lifecycle methods;
- a loop that performs a small unit of simulated work;
- a bounded `awaitTermination`;
- a documented single-start policy.

First write a plain-boolean version as a reasoning artifact. Then make the shutdown flag correct with `volatile`. Do not add locks unless you can name the invariant they protect.

**Debugging exercise**

Inspect a broken version with:

- a non-volatile stop flag;
- configuration that escapes from a constructor or is mutated after start;
- `Thread.sleep` used as synchronization.

For each, draw the missing or existing happens-before edge. The goal is reasoning; the missing-visibility bug need not reproduce on every machine.

**Expected outputs**

- a happens-before diagram for construction → `start()` → worker read;
- a second diagram for caller’s volatile stop write → worker’s volatile stop read;
- a test that starts, observes some progress, stops, and joins within a deadline;
- a paragraph explaining why `volatile int count; count++` remains unsafe.

**Review questions**

1. What behavior does the JMM permit when a data race exists?
2. Which exact action publishes the configuration?
3. Does `volatile` make surrounding operations mutually exclusive?
4. Why must interruption eventually become the preferred blocking-operation cancellation mechanism?
5. What changes if two callers may call `start()` concurrently?
6. How does safe publication appear in operator initialization or configuration refresh?

**Common mistakes**

- describing `volatile` as “reading directly from main memory” rather than using happens-before;
- using a stop flag without addressing blocking calls;
- allowing `this` to escape during construction;
- swallowing `InterruptedException`;
- claiming a test proves the absence of all visibility bugs.

**Acceptance criteria**

- shutdown terminates within the test bound;
- configuration is immutable or safely published;
- you can list at least four happens-before rules used in ordinary Java;
- you distinguish visibility, ordering, and atomicity using this code;
- the design states who owns lifecycle transitions.

**Production connection:** Source-reader shutdown, query cancellation, configuration publication, and worker lifecycle are all JMM problems before they are framework problems.

---

### Week 3 — A task with two final outcomes

**Engineering problem:** Completion, cancellation, and timeout race with one another. A task must have exactly one terminal outcome.

**Concepts**

- atomic variables;
- compare-and-set;
- optimistic state transition;
- linearization point;
- retry loops around CAS;
- atomic reference versus lock-protected compound state;
- the limits of lock-free reasoning;
- brief awareness of ABA, without attempting an advanced lock-free structure.

**Implementation task**

Create `TaskState` and `TaskRecord`. Use `AtomicReference<TaskState>` to implement legal transitions such as:

- `SUBMITTED -> QUEUED`;
- `QUEUED -> RUNNING`;
- `RUNNING -> SUCCEEDED | FAILED | CANCELLED | TIMED_OUT`;
- `SUBMITTED | QUEUED -> CANCELLED`.

The method must report whether the caller won the transition. Keep result/error fields out of the first version unless you can publish them consistently with the state.

**Debugging exercise**

Write a test that releases a completion thread and a cancellation thread at the same time. The broken version uses check-then-act:

```text
if (!terminal) {
    state = CANCELLED;
}
```

Make the test run many coordinated races and assert that exactly one transition wins.

**Expected outputs**

- a state-transition table;
- a diagram marking illegal transitions;
- a two-contender test;
- a written identification of the CAS linearization point;
- a decision note explaining when you would prefer one lock over multiple atomics.

**Review questions**

1. What exactly is atomic in `compareAndSet`?
2. Why can two individually atomic fields still form an inconsistent pair?
3. Where is the linearization point?
4. What happens if result data is written after the terminal CAS?
5. When would a lock make the design easier to prove?
6. How does this map to a query’s `RUNNING`, `CANCELLED`, and `FINISHED` race?

**Common mistakes**

- performing side effects before knowing the CAS succeeded;
- allowing transition out of a terminal state;
- using separate atomics for coupled invariants;
- writing the result after publishing `SUCCEEDED`;
- calling code “lock-free” without proving progress properties.

**Acceptance criteria**

- only legal transitions can succeed;
- exactly one terminal contender wins;
- terminal state safely publishes any associated immutable result or error;
- tests coordinate contenders rather than depend only on random sleeps;
- you can defend either CAS or a lock for this specific state machine.

**Production connection:** Query status, checkpoint state, asynchronous request completion, and cancellation all need a single authoritative terminal transition.

---

### Week 4 — A bounded queue from first principles

**Engineering problem:** Producers can submit faster than workers consume. An unbounded list eventually exhausts memory; a bounded queue must block correctly without losing or duplicating tasks.

**Concepts**

- intrinsic locks and monitor ownership;
- reentrancy;
- guarded blocks;
- `wait`, `notifyAll`, and wait sets;
- condition predicates;
- spurious wakeups;
- why waiting occurs in a loop;
- producer-consumer;
- backpressure as an explicit policy;
- interruptible waiting.

**Implementation task**

Implement `MonitorBoundedQueue<T>` from scratch using:

- a fixed capacity;
- one intrinsic lock;
- `put(T)` that waits while full;
- `take()` that waits while empty;
- `size()` with a consistent synchronization policy;
- interruption propagation.

This is a learning component. It will later be replaced in production code by a standard `BlockingQueue`.

**Debugging exercise**

Create broken variants or reason through mutations:

- replace `while` with `if`;
- replace `notifyAll` with an unjustified `notify`;
- check the predicate outside the lock;
- swallow interruption;
- call unknown task code while holding the queue lock.

Use multiple producers and consumers, unique task IDs, and a thread-safe test-side result set to detect missing or duplicate items.

**Expected outputs**

- a documented invariant: `0 <= size <= capacity`;
- a predicate table for “not full” and “not empty”;
- a stress test that accounts for every submitted ID;
- an interruption test for a blocked producer or consumer;
- Month 1 checkpoint notes.

**Review questions**

1. Why does `wait()` release the monitor but `sleep()` does not?
2. Why must the condition be rechecked after waking?
3. Which thread changes each predicate from false to true?
4. Why is executing user code under the queue lock dangerous?
5. Is blocking the only possible backpressure policy?
6. What would an unbounded mailbox mean for a streaming operator under overload?

**Common mistakes**

- `if` instead of `while`;
- forgetting that every access to the guarded state follows the same lock policy;
- notifying before the state change;
- returning internal mutable storage;
- tests that can hang forever when the implementation is broken.

**Acceptance criteria**

- capacity is never exceeded;
- no accepted item is lost or duplicated in the coordinated test;
- blocked operations are interruptible;
- test methods have time bounds and cannot hang the suite indefinitely;
- you can explain why the implementation is safe and where liveness still depends on consumers/producers.

**Production connection:** Bounded mailboxes, source-to-sink imbalance, admission queues, and network buffers all turn excess demand into waiting, rejection, shedding, or failure.

---

### Month 1 Checkpoint

Pass only if you can do all of the following without notes:

- explain atomicity, visibility, and ordering with distinct examples;
- draw the happens-before edges for `synchronized`, `volatile`, `start`, and `join`;
- implement a correct synchronized counter;
- explain and test a one-terminal-state CAS transition;
- implement the central `put`/`take` logic of a bounded monitor queue;
- identify one safety and one liveness risk in each component.

If one of the first four items fails, Week 5 becomes a consolidation week. Do not add new primitives.

---

### Week 5 — Multiple conditions and tenant permits

**Engineering problem:** One queue condition wakes too many unrelated waiters, and a noisy tenant can occupy every worker.

**Concepts**

- `ReentrantLock`;
- `Condition`;
- interruptible lock acquisition;
- `try/finally` ownership discipline;
- fairness and its throughput cost;
- semaphores for permits;
- latches and barriers as coordination tools;
- deadlock preconditions introduced through multi-resource acquisition.

**Implementation task**

1. Reimplement the bounded queue as `LockBoundedQueue<T>` using one `ReentrantLock` and two conditions: `notEmpty` and `notFull`.
2. Add a `TenantLimiter` backed by one `Semaphore` per tenant.
3. Return a small permit object whose `close()` releases exactly once, so task execution can use `try/finally` or try-with-resources.

Use a `CountDownLatch` in tests to coordinate starts. Perform one small `CyclicBarrier` experiment, but do not add it to production code without a real use.

**Debugging exercise**

- omit unlock from an exception path;
- leak a tenant permit when a task fails;
- acquire a queue/resource lock and tenant permit in inconsistent order;
- compare fair and non-fair semaphore behavior without claiming that one short run proves fairness.

**Expected outputs**

- the two guarded predicates and which condition signals each;
- a test proving the tenant’s running count never exceeds its limit;
- a failure-path test proving permits are returned;
- a lock-order note;
- a short comparison of monitor and explicit-lock versions.

**Review questions**

1. What ability does `Condition` add over a single monitor wait set?
2. Why must `unlock()` be in `finally`?
3. Does a fair lock guarantee application-level fairness?
4. What happens if a task acquires a tenant permit before waiting in a full global queue?
5. Is a semaphore protecting data or representing capacity?
6. How do tenant slots resemble admission control in a shared query cluster?

**Common mistakes**

- calling `await` or `signal` without holding the lock;
- leaking permits;
- interpreting semaphore availability as a perfectly consistent metric;
- choosing fair mode automatically;
- acquiring scarce resources before a potentially long queue wait.

**Acceptance criteria**

- queue behavior still satisfies Week 4’s tests;
- no permit leaks on success, failure, cancellation, or rejected admission paths already present;
- the tenant limit is never exceeded;
- lock and permit acquisition order is documented;
- you can say why standard library queues should replace your educational queue.

**Production connection:** Resource groups, tenant quotas, connector parallelism, and per-source limits are permit and scheduling policies, not merely thread counts.

---

### Week 6 — Bounded executor and explicit overload

**Engineering problem:** The service accepts work faster than it can finish. Default executor choices hide unbounded queues or uncontrolled thread creation, and exceptions disappear.

**Concepts**

- `Executor`, `ExecutorService`, `Callable`, `Future`;
- `ThreadPoolExecutor` core size, maximum size, keep-alive, and queue interaction;
- bounded `BlockingQueue`;
- rejection policies;
- admission control versus execution;
- concurrent collections and compound operations;
- thread factories and uncaught exception handling;
- `execute` versus `submit` exception visibility;
- Little’s Law as intuition, not a capacity formula to memorize.

**Implementation task**

Create `AdmissionExecutor` using an explicitly constructed `ThreadPoolExecutor`:

- fixed, configurable worker count;
- bounded queue;
- named threads;
- rejection translated into a domain result such as `REJECTED_OVERLOADED`;
- integration with `TaskRegistry` and `TenantLimiter`;
- accepted/rejected/running/completed counters;
- no unbounded executor factory.

Replace your custom queue in the main project with an appropriate standard `BlockingQueue`. Keep the custom implementations as learning labs.

**Debugging exercise**

Run a workload where tasks block on a latch so workers and queue fill deterministically. Submit one more task and verify the chosen rejection behavior. Create one task that throws under `execute` and one under `submit`; observe where each failure is reported.

**Expected outputs**

- a configuration table showing worker count, queue capacity, and rejection policy;
- a saturation test that does not depend on machine speed;
- visible failure outcomes for both task submission styles;
- metrics whose counts reconcile;
- an explanation of why an unbounded queue defeats maximum-pool-size expectations in common configurations.

**Review questions**

1. When does `ThreadPoolExecutor` create a thread versus enqueue?
2. What overload signal reaches the caller?
3. Why can caller-runs create unexpected latency or deadlock?
4. Which concurrent-map operations are atomic, and which multi-step sequences are not?
5. Where do exceptions from `submit` live?
6. How would a query gateway expose saturation differently from execution failure?

**Common mistakes**

- `Executors.newFixedThreadPool` without noticing its unbounded queue;
- silently discarding rejected tasks;
- recording `RUNNING` before execution actually starts;
- forgetting to inspect returned futures;
- treating metric counters as the source of truth for task state.

**Acceptance criteria**

- memory consumption is bounded by explicit workers and queue capacity at this layer;
- saturation produces a deterministic, observable result;
- every accepted task is traceable in the registry;
- task failures are surfaced, not merely logged by accident;
- you can explain every executor parameter and its interaction with the others.

**Production connection:** Query admission, task slots, mailbox pressure, and service overload require an explicit capacity contract.

---

### Week 7 — Cancellation, timeouts, retries, and shutdown

**Engineering problem:** A caller times out, a worker is blocked, and shutdown begins. The system must distinguish timeout from failure, stop work cooperatively, return permits, and avoid unsafe duplicate retries.

**Concepts**

- interruption as cooperative cancellation;
- interrupt status;
- blocking methods and `InterruptedException`;
- restoring interrupt status when an API cannot rethrow;
- cancellation races;
- deadlines versus elapsed timeouts;
- `Future.cancel(true)`;
- exception propagation;
- graceful versus forced shutdown;
- retry safety, idempotency, and side effects.

**Implementation task**

Add:

- a per-task deadline;
- a cancellation operation;
- retained futures or another explicit handle so asynchronous failure is observable;
- task code that checks interruption during long CPU loops;
- a two-stage shutdown: stop admission, await a grace period, then interrupt remaining work;

Write a `RetryPolicy` decision table for explicitly idempotent simulated reads, but defer its implementation to Week 16. Do not implement a general-purpose retry framework.

**Debugging exercise**

Use four fault tasks:

1. interruptible sleep;
2. blocking queue wait;
3. CPU loop that checks interruption;
4. deliberately bad loop that ignores interruption.

Observe shutdown behavior and take a thread dump for the bad case. Add a task that throws on every attempt and prove that the terminal error is retained.

**Expected outputs**

- a shutdown sequence diagram;
- tests for cancel-before-run, cancel-during-run, timeout-versus-completion race, and exception retention;
- a retry-safety table for simulated `SELECT`, metadata fetch, CDC apply, and external side effect;
- documentation of what happens to queued tasks during shutdown.

**Review questions**

1. Why can Java not safely force-stop an arbitrary thread?
2. What should code do after catching `InterruptedException`?
3. What is the difference between cancelling the caller’s wait and stopping the underlying work?
4. Which component owns the final state when completion races with timeout?
5. Why is “retry three times” not a correctness policy?
6. How do query cancellation and Flink job/operator cancellation depend on cooperative boundaries?

**Common mistakes**

- swallowing interruption;
- converting every exception into a retry;
- retrying non-idempotent effects;
- dropping `Future` objects and losing failures;
- calling `shutdownNow` and assuming all tasks stopped;
- holding locks while waiting for executor termination.

**Acceptance criteria**

- cooperative tasks stop within a documented bound;
- the bad task is diagnosed and cannot hang the test process forever;
- futures/errors are retained and observable;
- tenant permits and other resources are released on every exit path;
- retry eligibility is explicit; retry execution remains postponed until Week 16;
- shutdown policy is written before being implemented.

**Production connection:** Query timeout, connector retry, CDC duplication, asynchronous sink failures, and service deployment shutdown all require explicit ownership and semantics.

---

### Week 8 — Liveness, stress testing, and first performance evidence

**Engineering problem:** The service is correct under normal tests but can deadlock, starve a tenant, or collapse under contention. You need evidence that distinguishes correctness from performance.

**Concepts**

- deadlock, livelock, starvation, and fairness;
- Coffman deadlock conditions;
- lock ordering and open calls;
- stress testing versus deterministic coordination;
- thread dumps and blocked/waiting states;
- throughput, latency percentiles, queue wait, and rejection rate;
- warmup and measurement errors;
- contention;
- cache lines and false sharing at a conceptual level;
- why benchmark results are not correctness proofs.

**Implementation task**

1. Build `QueryGateLoadScenario` with multiple tenants and configurable task duration.
2. Record submitted, accepted, rejected, succeeded, failed, and cancelled counts.
3. Record queue-wait and execution-time distributions.
4. Compare one deliberately contended design with a less contended design, changing one variable only.
5. Add either:
   - one small jcstress test for a Week 2 or Week 3 primitive, or
   - a repeated two-actor stress harness if setup would consume the session.

Do not tune until the accounting invariants pass.

**Debugging exercise**

- create a two-lock deadlock in a test-only lab;
- capture a thread dump and identify owners and waiters;
- correct it with a global lock order or by eliminating nested acquisition;
- describe a livelock example and a starvation scenario;
- inspect whether a global metric lock becomes a contention point.

**Expected outputs**

- an invariant reconciliation report;
- one annotated thread dump;
- a small load table with throughput, p50/p95 latency, queue wait, and rejection count;
- a before/after contention comparison with limitations;
- a one-paragraph false-sharing explanation tied to frequently updated counters;
- Month 2 checkpoint notes.

**Review questions**

1. Which Coffman conditions were present in the deadlock?
2. Can fair scheduling reduce throughput? Why?
3. Why is average latency insufficient?
4. What does a thread in `BLOCKED` mean compared with `WAITING`?
5. Why might adjacent hot counters interfere without sharing a logical variable?
6. What evidence supports correctness, and what separate evidence supports performance?

**Common mistakes**

- relying only on random sleeps to create concurrency;
- writing tests that hang with no deadline;
- benchmarking startup/JIT compilation and treating it as steady state;
- changing several variables at once;
- optimizing counters before fixing task accounting;
- claiming false sharing without measurement or layout evidence.

**Acceptance criteria**

- all accounting identities hold under the load scenario;
- the deliberate deadlock is diagnosed from evidence, not guessed;
- corrected production paths use a documented lock order or avoid nested locks;
- performance results include workload, machine/JDK context, warmup limitations, and no exaggerated claim;
- you can explain safety, liveness, performance, and maintainability separately for `QueryGate`.

**Production connection:** Backpressure incidents, thread-pool starvation, checkpoint stalls, noisy-neighbor behavior, and misleading benchmarks are common in query and streaming systems.

---

### Month 2 Checkpoint

You pass Phase I when you can:

- draw the complete `QueryGate` shared-state map;
- defend each lock, atomic, semaphore, queue, and concurrent collection;
- demonstrate bounded overload behavior;
- cancel and shut down cooperative tasks without leaking permits;
- surface asynchronous exceptions;
- diagnose a test deadlock from a thread dump;
- explain why your tests provide evidence but not a mathematical proof;
- reimplement one central component from a blank file in 30 minutes.

If the state machine, boundedness, or shutdown criteria fail, repeat an integration week before starting runtime topics.

---

## 7. Weeks 9–24: Concrete Exercises and Deliverables

These weeks remain project-oriented but are intentionally less prescriptive than Phase I. Each still uses the weekly design → implementation → test → explanation loop.

### Week 9 — Processes, threads, scheduling, and blocking

**Problem:** Explain why increasing worker count can reduce throughput.

**Work:** Observe `QueryGate` with thread dumps while tasks are CPU-bound, sleeping, lock-blocked, and queue-waiting. Record thread states and relate them to runnable work, context switching, and CPU cores. Use OS-level observations available on your machine, but do not begin kernel study.

**Deliverable:** `docs/runtime-observations.md` with four workload types, predicted behavior, observed thread states, and one worker-count experiment.

**Acceptance:** You can distinguish process resources from thread resources, runnable from running, blocking from waiting, and concurrency from parallelism.

### Week 10 — JVM memory, allocation, GC, and safepoints

**Problem:** A workload has latency spikes even though no lock is obviously contended.

**Work:** Create an allocation-heavy task and a reuse-oriented comparison. Capture a short Java Flight Recorder profile. Identify allocation rate, one GC pause observation, hot methods, and thread activity. Do not tune collectors.

**Deliverable:** One annotated JFR screenshot or text summary plus a hypothesis/evidence table.

**Acceptance:** You can explain stack, heap, object lifetime, allocation pressure, GC pause versus application lock pause, and why one recording is not universal evidence.

### Week 11 — Remote calls, TCP intuition, and timeout budgets

**Problem:** A “query” calls a simulated remote service that is slow, unavailable, or returns partial progress.

**Work:** Add a `RemoteStage` abstraction with separate connection/setup and execution/read timeout concepts, simulated without building a real server if necessary. Propagate a single end-to-end deadline through queue wait and execution. Test slow response, no response, and late success after caller timeout.

**Deliverable:** A timeout-budget diagram and tests showing that queue time reduces remaining execution time.

**Acceptance:** You can explain why retries multiply load, why a caller timeout does not automatically cancel remote work, and why TCP connection, read, and application deadlines are different concerns.

### Week 12 — Measurement, contention, and false sharing revisited

**Problem:** Decide whether a global counter/lock is a real bottleneck.

**Work:** Create a minimal JMH benchmark for one isolated question, such as `AtomicLong` versus `LongAdder` under varying contention. Include warmup and multiple forks. Optionally inspect object layout or padding only to investigate measured behavior.

**Deliverable:** `docs/benchmark-report.md` with question, hypothesis, setup, result, limitations, and decision. Complete Month 3 checkpoint.

**Acceptance:** You can distinguish microbenchmark results from end-to-end capacity and refuse to adopt the “winner” when the project’s correctness semantics differ.

### Month 3 Checkpoint

- Explain a latency spike using at least two competing hypotheses and evidence.
- Interpret a thread dump and a small JFR recording.
- Explain why CPU-bound and I/O-bound pools have different sizing pressures.
- Propagate one deadline across queue and execution.
- Defend one benchmark without overstating it.

If runtime tooling consumes too much time, keep one recorded example and move on. Tool mastery is not the objective.

### Week 13 — Query execution pipelines

**Problem:** A query contains scan, filter, and aggregate stages with different blocking and CPU behavior.

**Work:** Model a finite query as a three-stage task or small DAG. Record per-stage timing and distinguish inter-query concurrency from intra-query parallelism. Keep data generated in memory; do not implement SQL parsing or storage.

**Deliverable:** An execution diagram and one working `SimulatedQueryPlan`.

**Acceptance:** You can explain pipeline versus blocking stages, why adding threads at every stage can oversubscribe the machine, and where backpressure belongs.

### Week 14 — Fair multi-tenant scheduling

**Problem:** One tenant fills the FIFO queue, so small tasks from another tenant wait behind all of its work.

**Work:** Implement the simplest scheduler that improves isolation: per-tenant queues with round-robin selection. Keep global and per-tenant bounds. Define behavior when tenants have unequal limits.

**Deliverable:** A before/after workload showing queue wait by tenant and an ADR explaining the fairness/throughput trade-off.

**Acceptance:** No tenant exceeds its limit, queue memory remains bounded, and a continuously active tenant cannot indefinitely starve another active tenant under the documented assumptions.

### Week 15 — Streaming producers and backpressure

**Problem:** A CDC producer emits events faster than the consumer applies them.

**Work:** Add a rate-controlled `CdcWorkload`. Track produced position, accepted position, processed position, queue lag, and rejected/blocked time. Compare block, reject, and slow-producer policies conceptually; implement only one.

**Deliverable:** A lag-over-time table or plot and a policy note.

**Acceptance:** You can explain why buffering delays overload rather than removes it, and connect queue capacity, throughput mismatch, lag, and recovery time.

### Week 16 — Delivery semantics, idempotency, and deduplication

**Problem:** A task may finish its side effect and then fail before acknowledging completion.

**Work:** Add idempotency keys to one simulated CDC apply or metadata update path. Inject failure before effect, after effect, and after acknowledgement. Implement a small bounded deduplication record or deterministic upsert rule.

**Deliverable:** A failure-point table mapping each failure to retry outcome and duplicate risk. Complete Month 4 checkpoint.

**Acceptance:** You can distinguish execution, acknowledgement, durable effect, retry, and final commit. You do not claim exactly-once without defining the boundary and durable state.

### Month 4 Checkpoint

- Explain inter-query and intra-query concurrency using your code.
- Demonstrate that tenant fairness improved under a reproducible workload.
- Explain a streaming backlog quantitatively.
- Show which failures make retry safe or unsafe.
- Relate the project to one real Flink/CDC or query-engine incident pattern you have seen.

If scheduling code becomes complex, remove weights and priorities. Keep bounded round-robin behavior and understandable invariants.

### Week 17 — Deterministic context planning for AI

**Problem:** An agent requests context, but permissions and required sources must be resolved deterministically before semantic reasoning.

**Work:** Add `ContextRequest`, `ContextPlan`, and `ContextTask` types. A deterministic planner selects permitted structured data, metadata, and simulated documents. Permission rejection happens before retrieval work enters the executor.

**Deliverable:** A context-plan schema and tests proving forbidden sources are never scheduled.

**Acceptance:** Permission enforcement is not delegated to an LLM, and every selected source has an explicit reason and identity.

### Week 18 — Freshness, versions, and CDC-fed context

**Problem:** An answer uses context that is internally consistent but stale.

**Work:** Attach source version, schema version, event position, and observed-at time to context results. Simulate a snapshot followed by CDC updates. Define a freshness requirement and reject or label results that do not meet it.

**Deliverable:** A provenance record and freshness test covering an update race.

**Acceptance:** You can distinguish event time, processing/observation time, durable source position, and “fresh enough for this request.”

### Week 19 — Metrics, traces, and service-level objectives

**Problem:** Overall latency looks healthy while one tenant experiences queue starvation and timeouts.

**Work:** Add trace IDs and structured lifecycle events. Report queue wait, execution latency, end-to-end latency, outcome, retry count, and tenant. Define two modest SLO-style objectives for the simulator.

**Deliverable:** One trace narrative and a per-tenant load report.

**Acceptance:** Metrics reconcile with task states; dimensions are bounded; queue wait is separate from execution; logs preserve the causal path of one task.

### Week 20 — Fault-injection campaign

**Problem:** Validate system behavior under overload and partial failure rather than only happy paths.

**Work:** Run a small matrix across saturation, slow task, thrown exception, permit leak attempt, ignored interruption, retryable failure, non-retryable side effect, and shutdown during load.

**Deliverable:** `docs/failure-model.md` containing expected result, actual result, evidence, and fix for each fault. Complete Month 5 checkpoint.

**Acceptance:** No fault disappears silently; invariants reconcile after each bounded test; known uncooperative tasks are reported honestly.

### Month 5 Checkpoint

- Demonstrate permission-before-retrieval.
- Trace freshness and provenance for one context result.
- Diagnose one tenant-specific SLO failure.
- Run the fault matrix without manual timing guesses.
- Explain which system decisions are deterministic and which could reasonably use AI assistance.

If the context layer weakens the executor’s clarity, keep it as a thin typed workload. Do not build embeddings, a vector database, or an agent framework.

### Week 21 — Correctness audit and simplification

**Problem:** Features accumulated faster than the proof of correctness.

**Work:** Audit every shared field and state transition. Remove redundant atomics, locks, metrics, or abstractions. Write a table with state, owner, synchronization policy, and invariant.

**Deliverable:** `docs/invariants.md` and at least one simplification commit.

**Acceptance:** Every mutable shared field has a documented policy; no lock is justified only by “thread safety”; terminal-state and shutdown ownership remain unambiguous.

### Week 22 — Capacity curve and one justified optimization

**Problem:** Find the saturation point and dominant bottleneck for one declared workload.

**Work:** Run the same workload across several concurrency levels. Record throughput, p95 latency, queue wait, rejection, CPU behavior, and tenant distribution. Make at most one optimization and rerun.

**Deliverable:** Capacity table, bottleneck hypothesis, evidence, change, and before/after result.

**Acceptance:** The test is reproducible enough to support a narrow conclusion, and you reject changes that improve throughput by violating fairness or correctness.

### Week 23 — Portfolio-quality design and incident document

**Problem:** Make the engineering legible to a reviewer who did not watch you build it.

**Work:** Write:

- architecture and component responsibilities;
- key invariants and happens-before arguments;
- overload, retry, and shutdown policies;
- three alternatives you rejected;
- a short incident report from one injected failure;
- benchmark limitations;
- query, streaming, and data-for-AI connections.

**Deliverable:** Complete `README.md`, `docs/architecture.md`, and one incident report.

**Acceptance:** Every major claim links to code, a test, or measured evidence. Remove generic claims that could describe any project.

### Week 24 — Final technical defense and release

**Problem:** Prove that the knowledge is yours, not merely present in the repository.

**Work:**

1. Reimplement a bounded state transition or small blocking component from a blank file.
2. Debug one previously unseen seeded concurrency bug.
3. Give a 15-minute recorded explanation of the architecture.
4. Answer the final defense questions below.
5. Tag or otherwise record version `v1.0`.

**Final defense questions**

- What are the three most important invariants?
- Where are the critical happens-before edges?
- What is bounded, and what could still grow?
- Who owns cancellation and terminal state?
- How are asynchronous failures surfaced?
- What overload policy does the caller observe?
- How can a tenant be starved?
- Which retries are safe, and why?
- What would change inside a real query engine or Flink operator?
- Which deterministic boundaries make the service suitable for AI context delivery?

**Deliverable:** Final demo, defense recording/notes, release commit, and a next-six-month gap assessment.

**Acceptance:** You can answer from code and evidence without asking AI to generate the explanation.

---

## 8. AI Assistance Rules

AI is a mentor, reviewer, adversarial tester, and documentation navigator. It is not the first implementer of core exercises.

### The assistance ladder

For core exercises, move through these levels in order:

| Level | What AI may do |
|---:|---|
| 0 | No AI for the first 20 minutes: write the problem model, shared state, invariants, and proposed API |
| 1 | Ask Socratic questions and identify missing concerns; no code or pseudocode |
| 2 | Give one localized conceptual hint or point to one relevant API/document section |
| 3 | Give pseudocode for the difficult fragment, not a compilable class |
| 4 | Review your compiling attempt and identify defects; propose minimal edits, not a rewrite |
| 5 | After acceptance, provide a reference implementation for comparison |

Do not jump from Level 0 to Level 4 because the first attempt fails.

### Allowed from the beginning

- asking for clarification of terminology;
- asking for official documentation locations;
- asking AI to quiz you;
- asking AI to review a design without producing code;
- asking AI to propose adversarial scenarios after you write your initial test plan;
- asking AI to explain a compiler error after you first read it and form a hypothesis.

### Restricted during core implementation

- no complete class generation before your first compiling attempt;
- no copy-pasting code you cannot explain line by line;
- no asking AI to “fix all tests”;
- no accepting a primitive because it appears to work;
- no AI-written design explanation submitted as your own;
- no broad refactor until the smallest failing invariant is identified.

### The ownership test for any AI-assisted code

Code is yours only if you can:

1. explain each shared field and synchronization operation;
2. predict behavior when a lock, `volatile`, CAS, or interrupt check is removed;
3. write an adversarial test;
4. modify it for a changed requirement without asking for regeneration;
5. re-create its central mechanism from a blank file one week later.

If you cannot do these, mark the component “borrowed, not learned” and revisit it.

### Prompt format to use with me as mentor

```text
Problem:
My invariant:
Shared mutable state:
Proposed synchronization:
Failure and shutdown behavior:
What I have tried:
Evidence:
Assistance level requested (1-5):
```

I should be technically strict: first separate correctness, safety, liveness, performance, and maintainability; then give the least explicit help that moves you forward.

---

## 9. Lightweight Algorithm-Interview Track

Do exactly **one 20-minute problem per week**. On checkpoint weeks, redo a prior problem from a blank editor instead of adding a new one. This is the smallest useful sustainable dose.

### Twenty-minute protocol

1. **2 minutes:** restate inputs, outputs, constraints, and examples.
2. **4 minutes:** name the brute-force approach and target pattern.
3. **10 minutes:** implement without AI or autocomplete-generated logic.
4. **4 minutes:** test edge cases and state time/space complexity.

If unfinished, stop at 20 minutes, record where reasoning broke, study the missing idea after the core session, and redo it on the next checkpoint week. Do not turn one problem into a two-hour contest.

### Weekly sequence

| Week | Pattern / problem |
|---:|---|
| 1 | Arrays + hash map: Two Sum |
| 2 | Stack: Valid Parentheses |
| 3 | Binary search: first occurrence in sorted array |
| 4 | Redo the weakest of Weeks 1–3 from blank |
| 5 | Sliding window: longest substring without repeating characters |
| 6 | Heap: top K frequent elements |
| 7 | Linked list: reverse a linked list |
| 8 | Redo the weakest of Weeks 5–7 |
| 9 | Two pointers: remove duplicates or sorted two-sum |
| 10 | Tree BFS: level-order traversal |
| 11 | Tree DFS: maximum depth and explain recursion stack |
| 12 | Redo the weakest of Weeks 9–11 |
| 13 | Graph/grid DFS or BFS: number of islands |
| 14 | Intervals: merge intervals |
| 15 | Heap: merge K sorted streams/lists, with a small K |
| 16 | Redo the weakest of Weeks 13–15 |
| 17 | Backtracking: subsets |
| 18 | Basic DP: climbing stairs, then state the recurrence |
| 19 | Linked-list cycle detection |
| 20 | Redo the weakest of Weeks 17–19 |
| 21 | Monotonic stack: daily temperatures |
| 22 | Binary search: rotated sorted array |
| 23 | Queue/hash map design: small LRU cache design; implementation may remain partial at 20 minutes |
| 24 | Randomly select and solve one previous problem under a 20-minute recording |

### Interview evidence

Maintain one page with:

- pattern;
- recognition signal;
- invariant;
- common edge cases;
- time/space complexity;
- date first solved;
- date re-solved from blank.

Success after six months is not “24 solved problems.” It is being able to recognize and independently implement the core patterns represented here under a modest time limit.

---

## 10. Measuring True Understanding

### The evidence ladder

A topic is not learned because it sounds familiar. Use five levels:

| Level | Evidence |
|---:|---|
| 0. Recognition | You recognize terms when prompted |
| 1. Explanation | You can explain the mechanism in your own words |
| 2. Construction | You can implement the central idea from a blank file |
| 3. Adversarial proof | You can state invariants and create tests that expose broken variants |
| 4. Transfer | You can apply the concept to a changed query, streaming, or production scenario |

Core concurrency topics require Level 3 before moving on. The phase as a whole requires at least Level 4 for bounded execution, cancellation, and backpressure.

### Weekly scorecard

Score each dimension 0–3:

- **Correctness:** Does the implementation meet its invariant under adversarial interleavings?
- **Mechanism:** Can you explain why it works in JMM/API terms?
- **Implementation:** Can you write the core without generation?
- **Debugging:** Can you use evidence to locate a seeded defect?
- **Transfer:** Can you connect it to query/streaming/data infrastructure?

A topic passes at **12/15**, with no score below 2 for correctness or mechanism.

### Required proof questions for every concurrent component

1. What state is shared?
2. What is the invariant?
3. What operation is the linearization point, if applicable?
4. What establishes visibility?
5. Can any operation block, and for how long?
6. What happens on interruption or exception?
7. Can resources leak?
8. What is bounded?
9. How does it shut down?
10. What test would fail if the synchronization were removed?

### Spaced re-check

One week after learning a primitive, re-create its essential mechanism for 10 minutes without notes. One month later, explain it through a different component. If you cannot, lower the topic’s evidence level rather than protecting an optimistic score.

---

## 11. Monthly Checkpoints and Adjustment Rules

### Checkpoint format

At Weeks 4, 8, 12, 16, 20, and 24:

1. run the project tests;
2. reimplement one old mechanism from blank;
3. debug one seeded or deliberately reintroduced bug;
4. explain one production connection;
5. update the scorecard and next month’s risk.

### Adjustment rules

- **If less than 70% of acceptance criteria pass:** repeat one integration week. Add no new topic.
- **If one core invariant fails:** stop feature work until it is repaired.
- **If two sessions overrun:** reduce the next milestone’s feature scope; do not add study hours.
- **If implementation passes but explanation fails:** do a trace/interleaving exercise, not more coding.
- **If explanation passes but blank-file implementation fails:** repeat a smaller implementation without AI.
- **If all work feels easy for two checkpoints:** increase adversarial conditions or change one constraint; do not add another technology.
- **If work or health interrupts the plan:** preserve the last passing checkpoint, write the next exact action, and resume there.
- **If the algorithm track repeatedly consumes more than 20 minutes:** replace new problems with pattern redos until fluency improves.
- **If project abstractions multiply:** remove a feature and restore a visible execution path from submission to terminal state.

### Monthly mentor review questions

- What can you now implement that you could not implement one month ago?
- Which claim is supported by a test or measurement?
- Which component is still “borrowed, not learned”?
- What failure surprised you?
- What should be removed from next month?
- Where does the project connect to your real work or open-source experience?

---

## 12. Topics to Deliberately Postpone

These are valuable, but they have lower return during this 48-hour plan:

- virtual threads, structured concurrency, and reactive frameworks until platform-thread semantics are solid;
- Netty internals and building a high-performance network server;
- advanced lock-free queues, hazard pointers, and custom synchronizers;
- deep CPU cache-coherence protocols or assembly-level JIT analysis;
- choosing and tuning every JVM garbage collector;
- full operating-system, computer-architecture, or networking courses;
- implementing a SQL parser, cost-based optimizer, storage engine, or transaction manager;
- full Flink source-code study or building a miniature Flink;
- Kubernetes, service mesh, and cloud-certification tracks;
- vector-database internals, embedding-model training, and rapid RAG-framework churn;
- generic agent orchestration and prompt-engineering courses;
- learning Rust, Go, Scala, or another implementation language during this plan;
- competitive-programming problem volume;
- advanced dynamic programming, graph theory, or formal verification;
- a polished web UI for `QueryGate`.

When distracted by a topic, put it in a parking-lot note. It enters the plan only if a current acceptance criterion requires it.

---

## 13. Recommended Resources

Do not read any of these from beginning to end. Use only the sections demanded by the current exercise.

### Phase I, Weeks 1–8: Java concurrency

- **Primary:** Brian Goetz et al., [*Java Concurrency in Practice*](https://www.informit.com/store/java-concurrency-in-practice-9780321349606). Use selected material on thread safety, sharing objects, task execution, cancellation, liveness, and performance.
- **Supplementary:** [Official Java SE documentation](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html), especially JLS Chapter 17 and `java.util.concurrent`. Use the linked official documentation to navigate to the precise API or specification section demanded by the exercise.

### Phase II, Weeks 9–16: Runtime and data-system execution

- **Primary:** [*Operating Systems: Three Easy Pieces*](https://research.cs.wisc.edu/wind/OSTEP/). Select only processes, threads, scheduling, condition variables, and limited memory/I/O sections.
- **Supplementary:** [CMU 15-445/645](https://15445.courses.cs.cmu.edu/spring2026/syllabus.html) selected notes or lectures on query execution and parallel execution. Do not attempt the full course or projects.

### Phase III, Weeks 17–24: Reliable data and data-for-AI

- **Primary:** Martin Kleppmann and Chris Riccomini, [*Designing Data-Intensive Applications*, second edition](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/). Select sections on encoding/schema, replication/streams, consistency, batch/stream processing, and trustworthy systems as the project requires.
- **Supplementary:** Your own project evidence plus official documentation for the specific Java/JVM tool being used. This is intentionally not another course.

The algorithm track has no separate primary resource. The 24 prompts and your pattern notebook are enough for this phase.

---

## 14. Expected Skills and Portfolio Evidence After Six Months

### Skills you should possess

You should be able to:

- explain Java concurrency from shared-memory first principles;
- reason with happens-before rather than folklore;
- choose among `synchronized`, `volatile`, atomics, explicit locks, semaphores, and concurrent collections;
- implement and test bounded producer-consumer components;
- configure a bounded executor and defend its overload behavior;
- design a task state machine with one terminal outcome;
- propagate cancellation, deadlines, interruptions, and asynchronous failures;
- define safe retry and idempotency boundaries;
- detect permit/resource leaks;
- diagnose deadlock and contention using thread dumps and runtime evidence;
- make a limited, honest performance measurement;
- explain tenant isolation, fairness, queueing, and backpressure;
- connect inter-query execution, CDC lag, and context-building workloads to the same execution principles;
- enforce deterministic permissions, freshness, provenance, and query boundaries before AI reasoning;
- solve and explain the core interview patterns in the lightweight track;
- use AI as a reviewer and mentor without surrendering code ownership.

### Portfolio evidence

Your repository should contain:

- a working Java 21 `QueryGate` project;
- unit, coordinated-concurrency, stress, and fault-injection tests;
- a bounded queue learning implementation and a production path using standard concurrency utilities;
- a task registry and explicit state machine;
- bounded executor, tenant limiter, fair scheduler, cancellation, timeout, retry, and shutdown behavior;
- simulated query, CDC, and permission-aware context workloads;
- reconciled metrics and trace examples;
- one annotated deadlock/thread-dump investigation;
- one JFR observation;
- one careful microbenchmark;
- one capacity/load report with limitations;
- invariant, architecture, failure-model, and benchmark documents;
- several short architectural decision records;
- one injected-incident report;
- a final technical defense recording or notes;
- an algorithm-pattern notebook with spaced redos.

### What this evidence should let you say in an interview

Not:

> “I learned many concurrency APIs.”

But:

> “I built and defended a bounded multi-tenant execution service. I can show its task-state invariants, happens-before relationships, overload and shutdown policies, cancellation races, fairness trade-offs, fault tests, and capacity measurements. I then used the same execution model for simulated query, CDC, and permission-aware context workloads.”

That is a coherent engineering story grounded in independently produced evidence.

---

## 15. Starting the Mentorship: Your First Submission

Do not implement Week 1 yet. First send the following design:

```text
Week 1: Completion counter

1. What data is shared?
2. What is the exact correctness invariant?
3. What interleaving can violate it?
4. How will the main thread know all workers finished?
5. How will the test increase the probability of contention?
6. Which outcomes would and would not prove correctness?
7. What is your proposed class/API shape?
8. Assistance level requested: 0 or 1
```

The first mentor review should challenge the design and test strategy without giving you the implementation.
