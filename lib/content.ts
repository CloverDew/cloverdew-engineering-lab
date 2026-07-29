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

export type LessonQuestion = {
  prompt: string;
  answer: string[];
  bullets?: string[];
  code?: string;
  codeLabel?: string;
  distributed?: string;
  alternatives?: {
    api: string;
    fit: string;
    tradeoff: string;
  }[];
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
  questions: LessonQuestion[];
};

export const lessons: Lesson[] = [
  {
    slug: "threads-and-shared-state",
    week: 1,
    title: "Threads, shared state, and the counter that lies",
    dek: "Learn how processes and threads begin, why count++ loses updates, and how to reason from an invariant instead of a lucky run.",
    readTime: "24 min",
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
      {
        prompt: "What happens between launching a Java program and entering main?",
        answer: [
          "A shell, IDE, service manager, or container runtime asks the operating system to create a process. The OS assigns a process identity and virtual address space, prepares inherited handles and environment data, and loads the Java launcher. The launcher initializes the JVM: class loading, runtime services, heap, garbage collector, and native integration all begin before application code runs.",
          "The JVM creates the initial non-daemon application thread, initializes the requested main class, and invokes public static void main(String[] args). Static initialization may therefore run before the first line inside main. If initialization throws, main may never be entered."
        ],
        bullets: [
          "Process creation establishes an isolation and failure boundary.",
          "JVM startup establishes the managed Java runtime inside that process.",
          "Class initialization establishes static state before the class is first actively used.",
          "Thread.start later creates a happens-before edge from the caller’s earlier actions to the new thread."
        ],
        codeLabel: "Observe class initialization and the main thread",
        code: `public final class BootOrder {
    static {
        System.out.println("static init: "
                + Thread.currentThread().getName());
    }

    public static void main(String[] args) {
        System.out.println("main: "
                + Thread.currentThread().getName());
    }
}`,
        distributed:
          "A process on another machine has no shared JVM startup state. Configuration, identity, and readiness must cross explicit boundaries. If a service advertises readiness before static initialization, migrations, or dependency checks finish, callers can route traffic to a process that exists but cannot yet serve requests."
      },
      {
        prompt: "When is a separate process a better boundary than another thread?",
        answer: [
          "Choose a process when failure containment, permissions, memory limits, runtime independence, or independent deployment matters. Choose a thread when work belongs to one application lifetime and deliberately shares in-process objects.",
          "Threads are cheaper to coordinate, but a corrupting native call, heap exhaustion, or System.exit can affect the whole process. A child process costs more to start and requires serialization or IPC, but it can be killed, limited, upgraded, and observed separately."
        ],
        codeLabel: "Two boundaries with different contracts",
        code: `// Shared heap and lifecycle:
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    Future<Result> result = pool.submit(() -> query.run());
    consume(result.get());
}

// Separate heap and failure boundary:
Process worker = new ProcessBuilder(
        "java", "-jar", "query-worker.jar")
        .redirectErrorStream(true)
        .start();
boolean exited = worker.waitFor(30, TimeUnit.SECONDS);`,
        alternatives: [
          {
            api: "Thread / ExecutorService",
            fit: "CPU work or coordinated in-process tasks over shared objects.",
            tradeoff: "Low overhead; weak isolation and one shared failure domain."
          },
          {
            api: "ProcessBuilder",
            fit: "Untrusted tools, separate runtimes, hard memory or lifecycle boundaries.",
            tradeoff: "Stronger isolation; IPC, startup, and supervision are explicit."
          },
          {
            api: "CompletableFuture",
            fit: "Compose asynchronous stages, especially non-blocking continuations.",
            tradeoff: "It represents completion, not isolation; the chosen executor still matters."
          },
          {
            api: "Remote service / container",
            fit: "Independent scaling, ownership, deployment, or host-level isolation.",
            tradeoff: "Network partitions, retries, serialization, and version compatibility enter the contract."
          }
        ],
        distributed:
          "Turning a method call into an RPC changes the failure model. The caller may time out without knowing whether the server executed the operation. You need deadlines, idempotency rules, request identifiers, and observable ownership; a thread-level try/catch is no longer enough."
      },
      {
        prompt: "What data is shared, and what remains thread-local?",
        answer: [
          "Threads in one JVM share heap objects, static fields, and process resources. Each thread has its own call stack, program counter, and current execution state. A local variable is stored in one thread’s stack frame, but the object referenced by that local can still be shared.",
          "ThreadLocal associates a value with a thread, but it does not make an object safe. Passing the ThreadLocal value elsewhere, using mutable static state inside it, or forgetting to remove values from pooled threads can reintroduce sharing or retain data across requests."
        ],
        codeLabel: "A private reference can point to shared mutable state",
        code: `List<String> shared = new ArrayList<>();

Runnable task = () -> {
    List<String> localReference = shared; // reference is local
    localReference.add(Thread.currentThread().getName());
};

// Concurrent execution can corrupt ArrayList's internal state.
new Thread(task).start();
new Thread(task).start();`,
        alternatives: [
          {
            api: "Immutable value",
            fit: "Configuration, identifiers, snapshots, and messages.",
            tradeoff: "Easiest to publish and reason about; updates create a new value."
          },
          {
            api: "ThreadLocal<T>",
            fit: "Thread-confined context when an API cannot pass it explicitly.",
            tradeoff: "Pool reuse can leak context; remove values in finally."
          },
          {
            api: "ConcurrentHashMap",
            fit: "Shared key-based state with independent atomic map operations.",
            tradeoff: "Multi-key or map-plus-field invariants still need a protocol."
          },
          {
            api: "synchronized / Lock",
            fit: "Multiple mutable fields that form one invariant.",
            tradeoff: "Clear atomic boundary; contention and lock ordering must be managed."
          }
        ],
        distributed:
          "Machines do not share a Java heap. A ConcurrentHashMap protects only one JVM. If several service instances update the same logical quota, use an authoritative database transaction, a partition owner, a consensus-backed store, or another cross-process protocol."
      },
      {
        prompt: "Why does calling run() directly not start a new thread?",
        answer: [
          "run is an ordinary method. Calling worker.run() pushes a new frame onto the current thread’s stack and returns before that thread continues. start is a lifecycle operation: the JVM asks the runtime to create a new execution path, and that new thread invokes run.",
          "Calling run directly can make a concurrency test pass accidentally because every task executes sequentially. It also moves blocking work onto the caller—often the request thread or UI event thread—causing latency or freezes."
        ],
        codeLabel: "Print the execution identity",
        code: `Runnable probe = () -> System.out.println(
        Thread.currentThread().getName());

Thread worker = new Thread(probe, "query-worker");
worker.run();   // prints the caller's name, often "main"
worker.start(); // prints "query-worker"
worker.join();`,
        distributed:
          "The analogous distributed mistake is constructing a request or handler object but never dispatching it through the transport. Local invocation bypasses timeouts, serialization, authentication, load balancing, and failure behavior, so it does not test the real remote path."
      },
      {
        prompt: "What exact interleaving loses an update?",
        answer: [
          "value++ is a read-modify-write operation, not one indivisible action. Suppose value is 41. Thread A reads 41. Thread B reads 41. A computes and writes 42. B computes and writes 42. Both methods return, yet the final value is 42 rather than 43.",
          "The invariant fails because there is no single owner for the transition from the old value to the new value. Making the getter synchronized would not help if increment still performs its read and write outside the same lock."
        ],
        codeLabel: "Expose the conceptual actions",
        code: `void increment() {
    int observed = value;  // A: 41, B: 41
    int updated = observed + 1;
    value = updated;       // A: 42, B: 42
}`,
        bullets: [
          "A failing stress run proves the race exists.",
          "A passing run proves only that this schedule did not expose it.",
          "The fix must make the complete read-modify-write transition atomic."
        ],
        distributed:
          "The same lost update occurs when two service instances read version 41 from a database and both write version 42. A JVM lock cannot help across instances. Use an atomic UPDATE, optimistic version check, transaction, serialized partition owner, or compare-and-set supported by the shared store."
      },
      {
        prompt: "Why would volatile not make value++ atomic?",
        answer: [
          "volatile gives visibility and ordering for reads and writes of that field. It does not combine the read, addition, and write into one atomic transition. Two threads can still read the same volatile value and overwrite each other.",
          "Select the primitive from the invariant. AtomicInteger is suitable for one atomic numeric state. synchronized or ReentrantLock is usually clearer when several fields must change together. LongAdder scales hot statistics by spreading contention, but sum is not an atomic snapshot and it is a poor choice for exact admission decisions."
        ],
        codeLabel: "Visibility is not a compound atomic operation",
        code: `private volatile int wrong;
private final AtomicInteger exact = new AtomicInteger();
private final LongAdder metric = new LongAdder();

void update() {
    wrong++;             // still a race
    exact.incrementAndGet(); // atomic transition
    metric.increment();  // scalable statistical counter
}`,
        alternatives: [
          {
            api: "AtomicInteger",
            fit: "Exact single-value counters, sequence numbers, or CAS state.",
            tradeoff: "Lock-free atomic operations; contention concentrates on one memory location."
          },
          {
            api: "LongAdder",
            fit: "High-write metrics where an approximate concurrent observation is acceptable.",
            tradeoff: "Better throughput under contention; sum is not a linearizable snapshot."
          },
          {
            api: "synchronized",
            fit: "One stable monitor protects a compound invariant.",
            tradeoff: "Simple semantics and automatic release; one wait set."
          },
          {
            api: "ReentrantLock",
            fit: "Interruptible/timed acquisition or multiple Condition wait sets.",
            tradeoff: "More control; unlock must occur in finally."
          }
        ],
        distributed:
          "volatile and java.util.concurrent atomics stop at the process boundary. For an exact distributed count, decide whether you need a transactionally exact total, a partitioned owner, or an eventually merged metric. A distributed counter optimized like LongAdder may converge, but cannot safely enforce a hard global quota at every instant."
      },
      {
        prompt: "What does join() contribute to the correctness argument?",
        answer: [
          "A successful return from join means the target thread terminated, and all actions in that thread happen-before actions after join returns. It therefore solves both completion and publication for the final read.",
          "join does not make concurrent increments mutually exclusive. Without atomic increments, joining every worker merely guarantees that the caller observes the final—possibly already corrupted—result. sleep is not a substitute because elapsed time neither proves termination nor creates the same memory-model edge."
        ],
        codeLabel: "Completion plus publication, not mutual exclusion",
        code: `for (Thread worker : workers) {
    worker.start();
}
for (Thread worker : workers) {
    worker.join();
}

// All worker actions are now visible here,
// but their shared updates still needed synchronization.
assertEquals(expected, counter.get());`,
        alternatives: [
          {
            api: "Thread.join",
            fit: "Wait for a specific platform thread to terminate.",
            tradeoff: "Direct and precise; low-level lifecycle management."
          },
          {
            api: "Future.get",
            fit: "Wait for an executor task and retrieve its result or failure.",
            tradeoff: "Surfaces ExecutionException; blocking and timeout policy must be explicit."
          },
          {
            api: "CountDownLatch",
            fit: "Wait until a known group reaches a one-shot milestone.",
            tradeoff: "Good coordination; worker exceptions need a separate channel."
          },
          {
            api: "CompletableFuture.allOf",
            fit: "Compose several asynchronous completions.",
            tradeoff: "Composition-friendly; inspect component failures and executor choice."
          }
        ],
        distributed:
          "There is no distributed join over a network partition. A coordinator needs durable task identities, heartbeats or leases, terminal records, and timeout semantics. Losing contact with a worker means unknown outcome—not proof that work stopped."
      }
    ]
  },
  {
    slug: "happens-before",
    week: 2,
    title: "Happens-before, without the folklore",
    dek: "Replace vague ideas about “main memory” with a precise rule for when one thread must observe another thread’s action.",
    readTime: "18 min",
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
      {
        prompt: "What behavior is permitted when a data race exists?",
        answer: [
          "A data race exists when conflicting accesses to the same variable are not ordered by happens-before and at least one is a write. The Java Memory Model then does not promise that another thread observes the latest wall-clock write. Reads may see stale values, and legal compiler or processor reorderings can make intuitive line-by-line reasoning fail.",
          "This is not the same as saying anything whatsoever can happen: Java still provides type safety and specific rules for correctly synchronized programs. The engineering response is to remove the race and name the synchronization edge, not to rely on a particular CPU, debug logging, or repeated successful tests."
        ],
        codeLabel: "A racy check can observe an obsolete state",
        code: `final class Switch {
    private boolean enabled; // data race

    void enable() {
        enabled = true;
    }

    void awaitEnabled() {
        while (!enabled) {
            Thread.onSpinWait();
        }
    }
}`,
        bullets: [
          "Thread.onSpinWait is a performance hint, not a visibility guarantee.",
          "Logging can perturb timing and hide the symptom without repairing the race.",
          "Correct synchronization restores a portable specification-level guarantee."
        ],
        distributed:
          "Distributed systems have a stronger form of stale observation: replicas can legitimately lag even when each JVM is correctly synchronized. Decide whether the operation requires linearizable reads, monotonic reads, read-your-writes, or eventual consistency; a local volatile field cannot choose a database consistency level."
      },
      {
        prompt: "Which action publishes immutable configuration to a new thread?",
        answer: [
          "All actions in the caller before Thread.start happen-before actions in the started thread. Constructing an immutable configuration completely, storing it in the task, and then calling start safely publishes that configuration to the new thread.",
          "Final fields add useful initialization guarantees when the object does not escape its constructor. Mutating the object after start is a separate communication event and needs its own synchronization; the original start edge does not cover future writes."
        ],
        codeLabel: "Construct, attach, then start",
        code: `record WorkerConfig(URI endpoint, Duration timeout) {}

WorkerConfig config = new WorkerConfig(
        URI.create("https://service.internal"),
        Duration.ofSeconds(2));

Thread worker = new Thread(() -> use(config));
worker.start(); // publishes the completed config

// Do not mutate shared configuration after start.`,
        alternatives: [
          {
            api: "Thread.start",
            fit: "Initial publication from creator to a new thread.",
            tradeoff: "Covers actions before start, not later reconfiguration."
          },
          {
            api: "ExecutorService.submit",
            fit: "Publish a task to executor workers through a thread-safe queue.",
            tradeoff: "The executor supplies the edge; captured mutable objects still need discipline."
          },
          {
            api: "volatile reference",
            fit: "Replace an immutable configuration snapshot at runtime.",
            tradeoff: "Readers see whole snapshots; do not mutate a published snapshot."
          },
          {
            api: "AtomicReference",
            fit: "Conditional snapshot updates or get-and-update operations.",
            tradeoff: "Atomic for one reference; external side effects are not part of the CAS."
          }
        ],
        distributed:
          "Publishing configuration to another process requires versioned serialization and an acknowledgment or observable applied version. Sending a message only proves transport acceptance unless the protocol says otherwise; mixed configuration versions can otherwise coexist during a rolling update."
      },
      {
        prompt: "What does volatile guarantee, and what does it not guarantee?",
        answer: [
          "A write to a volatile field happens-before a later read of that same field that observes it. Actions before the write become visible to actions after the read, and accesses to the volatile field cannot be freely reordered across that boundary.",
          "volatile does not turn compound operations into transactions, lock several fields together, enforce a business transition, or make a mutable collection thread-safe. It fits flags and immutable-snapshot references when each update is an independent assignment."
        ],
        codeLabel: "Publish data by writing the flag last",
        code: `private int result;
private volatile boolean ready;

void produce() {
    result = compute();
    ready = true; // release-like publication
}

int consume() {
    if (!ready) throw new IllegalStateException();
    return result; // visible after observing ready
}`,
        alternatives: [
          {
            api: "volatile",
            fit: "Flags and replaceable immutable snapshots.",
            tradeoff: "Cheap visibility/order; no compound invariant."
          },
          {
            api: "AtomicReference",
            fit: "CAS transitions on one state object.",
            tradeoff: "Supports atomic read-modify-write on the reference."
          },
          {
            api: "synchronized / Lock",
            fit: "Several fields and operations form one invariant.",
            tradeoff: "Mutual exclusion plus visibility at lock boundaries."
          },
          {
            api: "BlockingQueue",
            fit: "Transfer both data and ownership between threads.",
            tradeoff: "Encodes waiting and publication; capacity policy matters."
          }
        ],
        distributed:
          "A volatile ready flag cannot publish data stored on another node. Use a protocol in which durable data and its visible status are committed consistently—for example one database transaction, an atomic record, or a log entry whose offset defines visibility."
      },
      {
        prompt: "Why is sleep not a synchronization mechanism?",
        answer: [
          "sleep pauses the current thread for at least roughly the requested duration, but it does not release locks, wait for a predicate, prove another task completed, or create the publication edge you intended. Scheduler load, GC pauses, host contention, and CI variance make timing guesses unreliable.",
          "Use an API that names the event: join for thread termination, Future.get for task completion, CountDownLatch for a milestone, BlockingQueue for handoff, Condition.await for a guarded predicate, or Awaitility-style polling with a real observable predicate in tests."
        ],
        codeLabel: "Wait for evidence, not elapsed time",
        code: `// Fragile:
worker.start();
Thread.sleep(100);
assertTrue(worker.finished());

// Contractual:
worker.start();
worker.join(1_000);
assertFalse(worker.isAlive());
assertTrue(worker.finished());`,
        distributed:
          "Waiting five seconds after sending an RPC or deployment command does not establish completion. Poll a durable operation resource, consume an acknowledgment with defined semantics, or wait on a stream offset/state version with a deadline. Otherwise slow success is mistaken for failure and retries may duplicate work."
      },
      {
        prompt: "How would a blocking worker change the shutdown design?",
        answer: [
          "A volatile stop flag works only when the worker returns to read it. A worker blocked in queue.take, lock acquisition, sleep, or interruptible I/O may need interruption to wake. The loop should treat InterruptedException as a cancellation signal, restore the interrupt status when it cannot rethrow, and exit through cleanup in finally.",
          "Some operations ignore interruption, including badly behaved libraries and certain native calls. Add operation-level deadlines, close the resource when that is the documented unblock mechanism, and bound the shutdown wait. Thread.stop is unsafe because it can terminate code while invariants are half-updated and locks or external effects are in an unknown state."
        ],
        codeLabel: "Cooperative cancellation of a blocking loop",
        code: `void runLoop() {
    try {
        while (!Thread.currentThread().isInterrupted()) {
            Work item = queue.take(); // interruptible wait
            processWithDeadline(item);
        }
    } catch (InterruptedException cancelled) {
        Thread.currentThread().interrupt();
    } finally {
        closeOwnedResources();
    }
}

worker.interrupt();
worker.join(shutdownBudget.toMillis());`,
        alternatives: [
          {
            api: "Thread.interrupt",
            fit: "Cooperative signal for code that owns or checks the thread.",
            tradeoff: "A request, not forced termination; code must preserve the signal."
          },
          {
            api: "Future.cancel(true)",
            fit: "Cancel an executor task and request interruption if running.",
            tradeoff: "Future cancellation does not prove underlying I/O stopped."
          },
          {
            api: "ExecutorService.shutdownNow",
            fit: "Request interruption and drain work during forced shutdown phase.",
            tradeoff: "Best effort; still await and report non-termination."
          },
          {
            api: "Socket/read deadline",
            fit: "Bound network waits that interruption may not reliably end.",
            tradeoff: "Timeout is local; the remote operation may continue."
          }
        ],
        distributed:
          "Cancelling the caller’s Future or closing its socket does not automatically cancel remote work. Propagate a deadline or cancellation token, give the operation an idempotent identity, and let the server record a terminal outcome. During a partition the caller may know only that it stopped waiting."
      }
    ]
  },
  {
    slug: "one-terminal-outcome",
    week: 3,
    title: "One task, one terminal outcome",
    dek: "Use compare-and-set to resolve completion, cancellation, and timeout races without publishing inconsistent result state.",
    readTime: "19 min",
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
      {
        prompt: "Where is the transition’s linearization point?",
        answer: [
          "For state.compareAndSet(RUNNING, SUCCEEDED), the successful compare-and-set is the instant at which the transition logically takes effect. Before it, another contender may still win. After it, all threads must treat SUCCEEDED as the authoritative decision.",
          "A failed CAS is not a transition. The caller should inspect the current state and decide whether to retry a still-legal edge or report that another terminal outcome won. Blindly looping can violate the transition graph—for example, changing CANCELLED to SUCCEEDED."
        ],
        codeLabel: "Make the legal edge explicit",
        code: `boolean complete(Result value) {
    Outcome current = outcome.get();
    if (!(current instanceof Outcome.Running)) {
        return false;
    }
    Outcome next = Outcome.succeeded(value);
    return outcome.compareAndSet(current, next);
}`,
        bullets: [
          "The expected value expresses the source state.",
          "The update expresses the entire published destination.",
          "The boolean return tells the caller whether it owns follow-up work."
        ],
        distributed:
          "A database conditional update can be the distributed linearization point: UPDATE task SET state='SUCCEEDED' WHERE id=? AND state='RUNNING'. Affected-row count identifies the winner. A local CAS cannot coordinate several service instances."
      },
      {
        prompt: "Why are two atomic fields not automatically one atomic invariant?",
        answer: [
          "Each AtomicReference or AtomicInteger linearizes its own operation. There is still an interval between updating field A and field B. A reader can observe a combination that no business transition permits, such as state=SUCCEEDED with result=null.",
          "When fields describe one logical outcome, publish one immutable aggregate through one AtomicReference, or protect every read and write of the group with the same lock. Do not try to repair inconsistent reads by changing field order; one order merely changes which invalid combination is exposed."
        ],
        codeLabel: "Publish one immutable outcome",
        code: `sealed interface Outcome {
    record Running() implements Outcome {}
    record Succeeded(Result value) implements Outcome {}
    record Failed(Throwable cause) implements Outcome {}
}

AtomicReference<Outcome> outcome =
        new AtomicReference<>(new Outcome.Running());

outcome.compareAndSet(
        current,
        new Outcome.Succeeded(result));`,
        alternatives: [
          {
            api: "AtomicReference<Outcome>",
            fit: "A small immutable state machine updated as one value.",
            tradeoff: "Elegant CAS transitions; complex retry side effects remain difficult."
          },
          {
            api: "synchronized",
            fit: "Several fields and side-effect bookkeeping share one invariant.",
            tradeoff: "Straightforward proof; monitor contention serializes access."
          },
          {
            api: "ReentrantLock",
            fit: "Same compound invariant plus timed/interruptible lock or Conditions.",
            tradeoff: "Flexible; all paths must unlock in finally."
          },
          {
            api: "StampedLock",
            fit: "Specialized read-heavy structures with carefully validated optimistic reads.",
            tradeoff: "Not reentrant; easy to misuse and rarely needed for task state."
          }
        ],
        distributed:
          "Putting state and result in separate database rows or services creates the same torn invariant, amplified by crashes. Prefer one atomic record/transaction, or design an explicit multi-step protocol with recoverable intermediate states and reconciliation."
      },
      {
        prompt: "When may a transition perform side effects?",
        answer: [
          "Irreversible or externally visible effects should occur only under a protocol that establishes ownership. If cancellation and completion race, both contenders must not send notifications, release the same quota, or bill the tenant simply because both attempted a transition.",
          "Usually the winner performs local follow-up after a successful CAS. That still leaves a crash window between deciding state and sending an external message. For durable distributed effects, store the state transition and an outbox event in one transaction, then let a retriable publisher deliver the event with a stable identifier."
        ],
        codeLabel: "Only the winner owns local follow-up",
        code: `if (outcome.compareAndSet(running, succeeded)) {
    permits.release();
    completion.complete(succeeded);
    metrics.incrementSucceeded();
}

// A loser does none of the one-time actions.`,
        bullets: [
          "Make cleanup idempotent if retries or duplicate callbacks are possible.",
          "Document whether metrics count attempts, accepted transitions, or delivered effects.",
          "Never hold a JVM lock while making an unbounded remote call."
        ],
        distributed:
          "Exactly-once remote side effects cannot be obtained from a local CAS. Use transactional outbox/inbox patterns, idempotency keys, deduplication, or a single partition owner. Without them, retry after an uncertain response can charge twice or omit the charge entirely."
      },
      {
        prompt: "What happens if the result is written after SUCCEEDED is published?",
        answer: [
          "A reader can observe SUCCEEDED and immediately read a null, stale, or previous result. The state promised that the result existed before the data was actually published. Even if a later write becomes visible, the earlier observation already violated the contract.",
          "Publishing an immutable Succeeded(result) object in one atomic or volatile reference removes the gap. Under a lock, write the result and state while holding the same lock, and require readers to acquire that lock before reading both."
        ],
        codeLabel: "Broken publication and the atomic alternative",
        code: `// Broken: state promise precedes its payload.
state.set(SUCCEEDED);
result = computed;

// Correct shape: one published value.
outcome.set(new Succeeded(computed));

Outcome snapshot = outcome.get();
if (snapshot instanceof Succeeded ok) {
    consume(ok.result());
}`,
        distributed:
          "A status endpoint that reports SUCCEEDED before the result object is durable causes consumers to fetch missing data and retry unpredictably. Commit the result and terminal metadata atomically, or expose an intermediate FINALIZING state whose recovery rules are explicit."
      },
      {
        prompt: "When would one explicit lock be easier to prove?",
        answer: [
          "Use one lock when a transition checks and changes several collections or fields, must coordinate a condition, or owns cleanup that is awkward to represent as a pure immutable CAS. The proof becomes: every access to the invariant is inside this critical section, and no path exposes partial state.",
          "A lock is not automatically slow, and CAS is not automatically scalable. Under contention, CAS loops can waste CPU and complicate fairness. Keep the critical section small, never call unknown or remote code while holding it, and use try/finally with Lock."
        ],
        codeLabel: "One lock protects one compound invariant",
        code: `private final ReentrantLock lock = new ReentrantLock();
private State state = RUNNING;
private Result result;

boolean complete(Result value) {
    lock.lock();
    try {
        if (state != RUNNING) return false;
        result = value;
        state = SUCCEEDED;
        return true;
    } finally {
        lock.unlock();
    }
}`,
        alternatives: [
          {
            api: "synchronized",
            fit: "Default choice for one clear critical section.",
            tradeoff: "Automatic release and simple visibility; no timed acquisition."
          },
          {
            api: "ReentrantLock",
            fit: "Interruptible/timed lock acquisition or several conditions.",
            tradeoff: "More policy controls; manual release discipline."
          },
          {
            api: "AtomicReference",
            fit: "Small state represented by one immutable value.",
            tradeoff: "Non-blocking transition; side effects and retry loops need care."
          },
          {
            api: "Concurrent collection",
            fit: "Independent per-key operations with no larger invariant.",
            tradeoff: "Excellent built-in algorithms; compound workflows still need coordination."
          }
        ],
        distributed:
          "A ReentrantLock protects only one process and disappears on crash. Cross-node ownership needs a database transaction, consensus/lease service, queue partition, or actor-style single owner. Distributed locks add lease expiry, fencing, and failure recovery; copying local lock intuition is unsafe."
      }
    ]
  },
  {
    slug: "bounded-queues",
    week: 4,
    title: "Bounded queues turn overload into policy",
    dek: "Build producer-consumer coordination from a guarded predicate, then connect capacity to streaming backpressure.",
    readTime: "20 min",
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
      {
        prompt: "Why does wait belong inside a while loop?",
        answer: [
          "wait may return because of a notification, interruption, or spurious wakeup. Even after a legitimate notification, another awakened thread can acquire the monitor first and consume the only item. A notification says that state may have changed; it does not reserve the condition for one waiter.",
          "The predicate must be checked while holding the same monitor that protects the queue. After wait reacquires that monitor, the loop rechecks the current state. Using if turns a hint about past state into permission to act on present state."
        ],
        codeLabel: "The incorrect and correct guarded wait",
        code: `// Incorrect: wakeup is treated as a permit.
synchronized (lock) {
    if (queue.isEmpty()) lock.wait();
    return queue.removeFirst(); // may now be empty
}

// Correct: current state grants permission.
synchronized (lock) {
    while (queue.isEmpty()) lock.wait();
    E item = queue.removeFirst();
    lock.notifyAll();
    return item;
}`,
        alternatives: [
          {
            api: "wait / notifyAll",
            fit: "Learning monitor predicates or maintaining a tiny existing monitor.",
            tradeoff: "One wait set; easy to notify or guard incorrectly."
          },
          {
            api: "Condition",
            fit: "Custom synchronizer needing separate notEmpty/notFull wait sets.",
            tradeoff: "Clearer targeting; requires ReentrantLock discipline."
          },
          {
            api: "ArrayBlockingQueue",
            fit: "Bounded FIFO producer-consumer handoff.",
            tradeoff: "Production default; optional fairness can reduce throughput."
          },
          {
            api: "LinkedBlockingQueue",
            fit: "Optionally bounded queue with separate put/take coordination.",
            tradeoff: "Node allocation and capacity must still be configured."
          }
        ],
        distributed:
          "A message notification is likewise not ownership. Consumers must claim work through the broker or durable state transition, handle redelivery, and acknowledge only at the protocol-defined point. Otherwise two consumers can act on one logical item."
      },
      {
        prompt: "Which operation changes not-empty from false to true?",
        answer: [
          "A successful put that changes size from zero to one makes the not-empty predicate true. That transition is why consumers may need a signal. Similarly, a successful take that changes size from capacity to capacity-minus-one makes not-full true for producers.",
          "Signaling after every mutation can be correct but noisy. Signaling only on the boundary transition can be efficient, but the implementation must prove it cannot strand waiters. notifyAll is often safer for a learning monitor with both producer and consumer predicates sharing one wait set."
        ],
        codeLabel: "Signal after changing guarded state",
        code: `synchronized (lock) {
    while (queue.size() == capacity) {
        lock.wait();
    }
    boolean wasEmpty = queue.isEmpty();
    queue.addLast(item);
    if (wasEmpty) {
        lock.notifyAll();
    }
}`,
        bullets: [
          "Change the state before signaling so awakened threads can observe the predicate.",
          "Hold the monitor during both mutation and notification.",
          "Do not infer that a signaled thread runs immediately; it must reacquire the monitor."
        ],
        distributed:
          "In a broker, appending the first message may change a partition from idle to runnable, but notifications can be lost or duplicated. Consumers must also poll or recover from durable offsets; correctness cannot depend on one best-effort wakeup packet."
      },
      {
        prompt: "Why is sleep different from wait?",
        answer: [
          "sleep pauses the current thread while retaining every monitor it owns. wait requires owning a specific monitor, atomically releases that monitor, suspends, and reacquires it before returning. That release is what lets another thread enter the critical section and make the guarded predicate true.",
          "Sleeping while holding the queue lock can block the producer that would add the needed item, creating an avoidable stall or deadlock-like liveness failure. Sleeping outside the lock avoids that blockage but becomes polling: it adds latency and wastes scheduling or CPU."
        ],
        codeLabel: "Sleeping with the lock prevents progress",
        code: `synchronized (lock) {
    while (queue.isEmpty()) {
        Thread.sleep(100); // lock is still held
        // Producer cannot acquire lock to add an item.
    }
}

// wait() releases lock until a notification/wakeup:
synchronized (lock) {
    while (queue.isEmpty()) lock.wait();
}`,
        alternatives: [
          {
            api: "Thread.sleep",
            fit: "Deliberate delay, pacing, or simple backoff outside critical sections.",
            tradeoff: "Time-based only; no condition or publication guarantee."
          },
          {
            api: "Object.wait",
            fit: "Wait for a monitor-guarded predicate.",
            tradeoff: "Releases that monitor; must loop and handle interruption."
          },
          {
            api: "LockSupport.park",
            fit: "Low-level synchronizer implementations.",
            tradeoff: "Permit semantics are subtle; not an application-level queue API."
          },
          {
            api: "BlockingQueue.take",
            fit: "Application code waiting for queue data.",
            tradeoff: "Encapsulates the condition protocol and is usually preferable."
          }
        ],
        distributed:
          "Fixed polling sleeps create synchronized request bursts and slow overload recovery. Use server-provided Retry-After, exponential backoff with jitter, queue notifications plus durable polling, or streaming flow control. Still cap the total deadline."
      },
      {
        prompt: "What should interruption do to a blocked operation?",
        answer: [
          "Interruption should follow the method’s contract. A blocking queue method can declare InterruptedException and leave the queue unchanged when interrupted before mutation. If the method cannot throw it, restore the interrupt flag with Thread.currentThread().interrupt() and return or translate to a domain cancellation exception.",
          "Never swallow interruption and continue silently: shutdown code then waits for a worker that discarded its cancellation signal. Also define the commit point. If interruption arrives after an item was inserted, reporting that nothing happened can cause the caller to retry and duplicate the item."
        ],
        codeLabel: "Propagate without corrupting the queue",
        code: `E take() throws InterruptedException {
    lock.lockInterruptibly();
    try {
        while (queue.isEmpty()) {
            notEmpty.await();
        }
        E item = queue.removeFirst();
        notFull.signal();
        return item;
    } finally {
        lock.unlock();
    }
}`,
        bullets: [
          "State whether cancellation is accepted before or after the mutation point.",
          "Keep the invariant valid on every exceptional exit.",
          "Use timed operations when callers need a deadline rather than indefinite blocking."
        ],
        distributed:
          "Caller interruption does not roll back a broker publish or remote enqueue whose response was lost. Give the item a stable ID and make acceptance queryable or deduplicated. The result of a timed-out request is often unknown, not rejected."
      },
      {
        prompt: "What overload policy reaches the producer?",
        answer: [
          "A bounded queue only creates the decision point. The API must tell the producer whether it blocked, timed out, was rejected, or replaced/dropped another item. Hiding rejection behind a boolean that callers ignore simply converts overload into silent data loss.",
          "Blocking is suitable only when backpressure can safely propagate and no lock or scarce request thread is held. Timed offer bounds latency. Immediate rejection protects the service and lets callers shed or retry. Dropping or coalescing is acceptable for explicitly lossy telemetry, not money movement or unique task submissions."
        ],
        codeLabel: "Make admission outcome explicit",
        code: `boolean accepted = queue.offer(
        task, 50, TimeUnit.MILLISECONDS);

if (!accepted) {
    throw new OverloadedException(
            "queue full; retry only if task is idempotent");
}`,
        alternatives: [
          {
            api: "put",
            fit: "Backpressure may block the producer indefinitely.",
            tradeoff: "No loss; can exhaust request threads or deadlock cycles."
          },
          {
            api: "offer(timeout)",
            fit: "Wait briefly while preserving a caller latency budget.",
            tradeoff: "Explicit timeout result; still consumes a thread while waiting."
          },
          {
            api: "offer",
            fit: "Immediate admission decision and caller-driven rejection.",
            tradeoff: "Fast protection; caller must handle false."
          },
          {
            api: "Flow / reactive demand",
            fit: "Asynchronous pipelines where consumers request bounded demand.",
            tradeoff: "End-to-end participation required; does not erase buffers elsewhere."
          }
        ],
        distributed:
          "Return an explicit overload signal such as HTTP 429 or 503 with retry guidance, expose queue saturation, and require idempotency before automated retries. Without jitter and retry budgets, every client retries together, amplifying overload into a retry storm across the cluster."
      }
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
