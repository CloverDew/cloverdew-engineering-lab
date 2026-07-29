export type LessonSection = {
  eyebrow: string;
  title: string;
  body: string[];
  bullets?: string[];
  sequence?: {
    title: string;
    body: string;
  }[];
  comparison?: {
    label: string;
    title: string;
    body: string;
    bullets: string[];
  }[];
  code?: string;
  codeLabel?: string;
  note?: string;
};

export type Lesson = {
  slug: string;
  week: number;
  title: string;
  dek: string;
  readTime: string;
  status: "published" | "upcoming";
  tags: string[];
  keyIdea: string;
  sections: LessonSection[];
  questions: string[];
};

export const lessons: Lesson[] = [
  {
    slug: "threads-and-shared-state",
    week: 1,
    title: "Threads, shared state, and the counter that lies",
    dek: "Learn how processes and threads begin, why count++ loses updates, and how to reason from an invariant instead of a lucky run.",
    readTime: "12 min",
    status: "published",
    tags: ["threads", "race conditions", "synchronized"],
    keyIdea:
      "A concurrent component is correct only when every possible interleaving preserves its invariant.",
    sections: [
      {
        eyebrow: "Runtime foundations",
        title: "The operating system starts a process; a thread runs its code",
        body: [
          "A program is code stored on disk. A process is one running instance of that program, with an operating-system identity, a private virtual address space, and resources such as open files. Starting an application from a shell, IDE, service manager, or container runtime sends a launch request to the operating system.",
          "For a Java application, the new process starts the JVM. The JVM creates an initial application thread and invokes your main method on it. That main thread can do the work itself, start more threads in the same process, or ask the operating system to create a separate child process."
        ],
        sequence: [
          {
            title: "Something requests a launch",
            body: "A shell, IDE, service manager, or already-running program asks the operating system to run the application."
          },
          {
            title: "The operating system creates a process",
            body: "It assigns a process ID, an address space, security context, and handles for resources."
          },
          {
            title: "The runtime creates the initial thread",
            body: "The JVM initializes and starts the application’s main thread."
          },
          {
            title: "Application code begins",
            body: "The main thread enters main and may later start child processes or additional threads."
          }
        ],
        codeLabel: "Starting a separate process from Java",
        code: `Process child = new ProcessBuilder(
        "java", "-jar", "worker.jar")
    .inheritIO()
    .start();

int exitCode = child.waitFor();`,
        note:
          "A child process has its own heap and lifecycle. The parent and child exchange data only through an explicit channel such as pipes, sockets, files, or shared memory."
      },
      {
        eyebrow: "The problem",
        title: "The final count is smaller than the work completed",
        body: [
          "Imagine four query workers. Each completes 100,000 fragments and increments one shared counter. The expected result is 400,000. Sometimes you get it; sometimes you do not.",
          "This is not primarily a performance problem. It is a safety failure: the program reaches a state its specification forbids."
        ],
        codeLabel: "A deceptively simple race",
        code: `final class UnsafeCounter {
    private int value;

    void increment() {
        value++;
    }

    int get() {
        return value;
    }
}`,
        note:
          "Do not fix this snippet yet. First expand value++ into its conceptual read, add, and write actions."
      },
      {
        eyebrow: "Starting threads",
        title: "Creating a Thread object does not start a thread",
        body: [
          "new Thread(task) creates an ordinary Java object that describes work. Calling start() asks the JVM to create and schedule a new execution path in the current process. The new thread then calls task.run(); the thread that called start() continues independently.",
          "Calling run() yourself is only a normal method call on the current thread. No new stack or concurrent execution appears. In production code, executors usually manage thread creation and reuse, but the same boundary remains: submitting work may cause a pool to start a worker according to its policy."
        ],
        codeLabel: "One task, two very different calls",
        code: `Thread worker = new Thread(
    () -> counter.increment());

worker.start(); // New thread runs the task.
worker.join();  // Wait for that thread to finish.

// worker.run(); would run on the current thread.`,
        comparison: [
          {
            label: "Separate runtime boundary",
            title: "Start a process when",
            body: "The work needs isolation or an independently managed lifetime.",
            bullets: [
              "A user launches a new application instance.",
              "A program starts a child with ProcessBuilder.start().",
              "The work needs a separate heap, permissions, runtime, or failure boundary."
            ]
          },
          {
            label: "Shared runtime boundary",
            title: "Start a thread when",
            body: "Concurrent work belongs inside an existing process and may share its objects.",
            bullets: [
              "The process’s initial thread starts as part of application startup.",
              "Code calls Thread.start(), or an executor starts or reuses a worker.",
              "Tasks need low-cost coordination over in-process state."
            ]
          }
        ],
        note:
          "Threads are not started for every method call or object. Start one only when work should make progress concurrently; use a process when the isolation boundary matters more than sharing memory."
      },
      {
        eyebrow: "Mental model",
        title: "A thread has private execution state, not private objects",
        body: [
          "Threads in one process share the heap. Each thread has its own stack and program counter, but references on different stacks can point to the same heap object.",
          "Two threads can both read value = 41, both compute 42, and both write 42. Two completed increments have produced one visible increase."
        ],
        bullets: [
          "Atomicity asks whether an operation can be observed halfway through.",
          "Visibility asks whether one thread is guaranteed to observe another thread’s write.",
          "Ordering asks which observations the Java Memory Model permits."
        ]
      },
      {
        eyebrow: "Your experiment",
        title: "Make the race visible without pretending to prove correctness",
        body: [
          "Start several platform threads behind a CountDownLatch start gate. Let each thread increment many times. Join every worker before reading the result.",
          "Then protect the read-modify-write operation with one stable intrinsic lock. Repeat the same workload."
        ],
        bullets: [
          "Record expected and observed totals for at least ten runs.",
          "Never use sleep to guess that workers finished; join establishes completion.",
          "A failing run proves the unsafe version is broken. A passing run does not prove it is safe."
        ]
      },
      {
        eyebrow: "Production bridge",
        title: "The same bug wears more expensive clothes",
        body: [
          "Query fragment completion, sink acknowledgements, task metrics, and tenant quota accounting all use shared transitions. The names change; the proof obligation does not.",
          "Your first habit should be to write the invariant before selecting a concurrency primitive."
        ],
        note:
          "Invariant for this exercise: after all workers join, value equals the sum of successful increments."
      }
    ],
    questions: [
      "What happens between launching a Java program and entering main?",
      "When is a separate process a better boundary than another thread?",
      "What data is shared, and what remains thread-local?",
      "Why does calling run() directly not start a new thread?",
      "What exact interleaving loses an update?",
      "Why would volatile not make value++ atomic?",
      "What does join() contribute to the correctness argument?"
    ]
  },
  {
    slug: "happens-before",
    week: 2,
    title: "Happens-before, without the folklore",
    dek: "Replace vague ideas about “main memory” with a precise rule for when one thread must observe another thread’s action.",
    readTime: "9 min",
    status: "published",
    tags: ["JMM", "volatile", "visibility"],
    keyIdea:
      "Happens-before is an ordering guarantee between actions, not a claim about wall-clock time.",
    sections: [
      {
        eyebrow: "The problem",
        title: "A worker may never notice that it should stop",
        body: [
          "One thread runs a loop while another writes a shutdown flag. With an ordinary data race, the Java Memory Model does not require the loop to observe that write.",
          "The compiler and runtime may reuse a previously read value as long as the resulting execution remains legal under the memory model."
        ],
        codeLabel: "Missing a visibility guarantee",
        code: `final class Worker implements Runnable {
    private boolean stopped;

    public void run() {
        while (!stopped) {
            doOneUnit();
        }
    }

    void stop() {
        stopped = true;
    }
}`,
        note:
          "This may appear to work in a test. The question is not what usually happens; it is what the specification guarantees."
      },
      {
        eyebrow: "Mental model",
        title: "Build a graph of guaranteed observations",
        body: [
          "If action A happens-before action B, the effects of A are visible to B and A is ordered before B. The relation is transitive.",
          "A volatile write synchronizes-with a later read of that same variable. An unlock synchronizes-with a later lock of the same monitor. Calling start and successfully returning from join also create useful edges."
        ],
        bullets: [
          "Program order: earlier actions in one thread happen-before later actions in that thread.",
          "Monitor rule: unlock happens-before a later lock of the same monitor.",
          "Volatile rule: a write happens-before a later read of the same volatile field.",
          "Thread rules: start publishes prior actions; successful join publishes the terminated thread’s actions."
        ]
      },
      {
        eyebrow: "Your experiment",
        title: "Draw the edge before writing the keyword",
        body: [
          "Make the stop flag volatile and draw this chain: caller’s ordinary actions → volatile stop write → worker’s volatile stop read → worker’s later actions.",
          "Keep worker configuration immutable. Publish it before Thread.start rather than mutating it after the worker begins."
        ],
        bullets: [
          "Test start, progress, stop, and bounded termination.",
          "Explain which edge publishes configuration.",
          "Explain why the volatile stop flag does not protect a separate count++."
        ]
      },
      {
        eyebrow: "Production bridge",
        title: "Lifecycle is a memory-model problem",
        body: [
          "Source-reader shutdown, query cancellation, configuration refresh, and operator initialization all depend on publication and visibility.",
          "Framework APIs can create the edge for you, but you still need to know which edge you are relying on."
        ]
      }
    ],
    questions: [
      "What behavior is permitted when a data race exists?",
      "Which action publishes immutable configuration to a new thread?",
      "What does volatile guarantee, and what does it not guarantee?",
      "Why is sleep not a synchronization mechanism?",
      "How would a blocking worker change the shutdown design?"
    ]
  },
  {
    slug: "one-terminal-outcome",
    week: 3,
    title: "One task, one terminal outcome",
    dek: "Use compare-and-set to resolve completion, cancellation, and timeout races without publishing inconsistent result state.",
    readTime: "10 min",
    status: "published",
    tags: ["CAS", "atomics", "state machines"],
    keyIdea:
      "The linearization point is the single instant at which a concurrent operation logically takes effect.",
    sections: [
      {
        eyebrow: "The problem",
        title: "Completion and cancellation arrive together",
        body: [
          "A query finishes while its caller cancels it. If both paths perform a separate check and write, each may believe it owns the terminal state.",
          "The correct design begins with a legal transition table, not an AtomicReference."
        ],
        codeLabel: "Check-then-act is not one action",
        code: `if (!state.isTerminal()) {
    state = CANCELLED;
}`,
        note:
          "Another thread can change state after the check and before the write."
      },
      {
        eyebrow: "Mental model",
        title: "CAS turns a transition into a contest with one winner",
        body: [
          "compareAndSet(expected, update) changes the value only if the current value still equals expected. The successful CAS is the transition’s linearization point.",
          "CAS does not make a group of unrelated fields atomic. If SUCCEEDED must publish a result, construct or store the result consistently before publishing that terminal state."
        ],
        bullets: [
          "Write every legal edge in the state graph.",
          "Terminal states have no outgoing edges.",
          "Side effects occur only after a caller knows whether it won, unless the state and side effect are designed as one protocol.",
          "Prefer one lock when multiple fields form an invariant that is awkward to encode atomically."
        ]
      },
      {
        eyebrow: "Your experiment",
        title: "Coordinate two contenders",
        body: [
          "Release a completion thread and a cancellation thread from the same latch. Assert that exactly one legal transition succeeds.",
          "Repeat the coordinated race. Avoid using random sleeps as the only source of concurrency."
        ],
        bullets: [
          "Produce a transition table before code.",
          "Return whether each transition succeeded.",
          "Test every terminal state against attempted later transitions."
        ]
      },
      {
        eyebrow: "Production bridge",
        title: "Status fields are protocols",
        body: [
          "Query status, asynchronous request completion, checkpoint progress, and deployment jobs all need a single authoritative terminal decision.",
          "The difficult part is rarely storing an enum. It is defining ownership of the transition and consistent publication of the associated result."
        ]
      }
    ],
    questions: [
      "Where is the transition’s linearization point?",
      "Why are two atomic fields not automatically one atomic invariant?",
      "When may a transition perform side effects?",
      "What happens if the result is written after SUCCEEDED is published?",
      "When would one explicit lock be easier to prove?"
    ]
  },
  {
    slug: "bounded-queues",
    week: 4,
    title: "Bounded queues turn overload into policy",
    dek: "Build producer-consumer coordination from a guarded predicate, then connect capacity to streaming backpressure.",
    readTime: "11 min",
    status: "published",
    tags: ["monitors", "queues", "backpressure"],
    keyIdea:
      "A queue does not remove overload; it decides where excess demand waits, fails, or is shed.",
    sections: [
      {
        eyebrow: "The problem",
        title: "Producers are faster than consumers",
        body: [
          "An unbounded queue can make latency and memory grow while the service continues to look healthy. A bounded queue forces the system to expose its capacity limit.",
          "The queue invariant is simple: its size is never below zero and never above capacity. Coordinating waiters correctly is not."
        ]
      },
      {
        eyebrow: "Mental model",
        title: "Wait for a predicate, not a notification",
        body: [
          "A producer may proceed when the queue is not full. A consumer may proceed when it is not empty. Those predicates are guarded by the same lock as the queue state.",
          "wait releases the monitor and suspends the thread. After waking and reacquiring the monitor, the thread must recheck its predicate: another thread may have consumed the condition, or the wakeup may be spurious."
        ],
        codeLabel: "The shape, not the solution",
        code: `synchronized (lock) {
    while (!predicate()) {
        lock.wait();
    }
    changeGuardedState();
    lock.notifyAll();
}`,
        note:
          "Your implementation must define the concrete predicates and state changes. Do not copy this shape without explaining each line."
      },
      {
        eyebrow: "Your experiment",
        title: "Account for every item",
        body: [
          "Use multiple producers and consumers with unique IDs. At the end, every accepted ID must appear exactly once in the consumed set.",
          "Add a test that interrupts a producer blocked on a full queue or a consumer blocked on an empty queue. Every test needs a time bound so broken code cannot hang the suite."
        ],
        bullets: [
          "Mutate while to if and predict the failure.",
          "Move the predicate check outside the lock and identify the race.",
          "Never execute unknown task code while holding the queue lock."
        ]
      },
      {
        eyebrow: "Production bridge",
        title: "Backpressure is an end-to-end contract",
        body: [
          "A bounded mailbox, query admission queue, connector buffer, or network buffer only controls one boundary. The upstream system still needs a response: block, retry later, reject, sample, or shed.",
          "In Month 2, this learning queue will be replaced by a standard BlockingQueue. Reimplementing it once teaches the contract; maintaining a custom queue in production creates unnecessary risk."
        ]
      }
    ],
    questions: [
      "Why does wait belong inside a while loop?",
      "Which operation changes not-empty from false to true?",
      "Why is sleep different from wait?",
      "What should interruption do to a blocked operation?",
      "What overload policy reaches the producer?"
    ]
  },
  {
    slug: "locks-conditions-permits",
    week: 5,
    title: "Locks, conditions, and tenant permits",
    dek: "Separate wait sets, protect release paths, and model tenant concurrency as scarce capacity.",
    readTime: "8 min",
    status: "upcoming",
    tags: ["ReentrantLock", "Condition", "Semaphore"],
    keyIdea: "A semaphore represents capacity; it is not a substitute for a state invariant.",
    sections: [],
    questions: []
  },
  {
    slug: "bounded-executors",
    week: 6,
    title: "Executors that admit overload exists",
    dek: "Configure worker count, queue capacity, rejection, and exception visibility explicitly.",
    readTime: "9 min",
    status: "upcoming",
    tags: ["executors", "thread pools", "rejection"],
    keyIdea: "Every executor has a capacity policy, including the ones that hide it.",
    sections: [],
    questions: []
  },
  {
    slug: "cancellation-shutdown",
    week: 7,
    title: "Cancellation is a cooperative protocol",
    dek: "Handle interruption, deadlines, asynchronous failures, and graceful shutdown without pretending threads can be force-stopped safely.",
    readTime: "10 min",
    status: "upcoming",
    tags: ["interruption", "timeouts", "shutdown"],
    keyIdea: "Cancelling a wait is not automatically the same as stopping the underlying work.",
    sections: [],
    questions: []
  },
  {
    slug: "liveness-and-measurement",
    week: 8,
    title: "Liveness, contention, and honest measurements",
    dek: "Diagnose deadlock and starvation, then measure latency and throughput without confusing speed with correctness.",
    readTime: "12 min",
    status: "upcoming",
    tags: ["deadlock", "contention", "testing"],
    keyIdea: "Correctness evidence and performance evidence answer different questions.",
    sections: [],
    questions: []
  }
];

export const publishedLessons = lessons.filter(
  (lesson) => lesson.status === "published"
);

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export const phases = [
  {
    id: "01",
    weeks: "Weeks 1–8",
    title: "Concurrent execution foundations",
    question:
      "Can I prove that concurrent Java code is safe, live, bounded, and stoppable?",
    outcome:
      "A bounded executor with task states, tenant limits, cancellation, overload behavior, and stress tests.",
    topics: [
      "Shared state and the Java Memory Model",
      "Locks, atomics, conditions, and permits",
      "Bounded executors and backpressure",
      "Cancellation, shutdown, and liveness"
    ]
  },
  {
    id: "02",
    weeks: "Weeks 9–16",
    title: "Runtime and data-system execution",
    question:
      "Can I explain and measure how the executor interacts with the JVM, OS, remote calls, query pipelines, and CDC?",
    outcome:
      "Observable query and CDC workloads, fair scheduling, runtime evidence, and explicit retry/deduplication rules.",
    topics: [
      "Threads, scheduling, JVM memory, and GC",
      "Deadlines and remote failure",
      "Query pipelines and tenant fairness",
      "CDC lag, delivery semantics, and idempotency"
    ]
  },
  {
    id: "03",
    weeks: "Weeks 17–24",
    title: "Reliable data-for-AI capstone",
    question:
      "Can I make context delivery deterministic, observable, and trustworthy before AI reasoning begins?",
    outcome:
      "Permission-aware context jobs, freshness and provenance, a fault campaign, capacity report, and technical defense.",
    topics: [
      "Permission-before-retrieval",
      "Freshness, schema, and provenance",
      "Metrics, traces, and fault injection",
      "Correctness audit and capacity defense"
    ]
  }
];
