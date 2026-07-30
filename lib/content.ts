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
  searchTerms?: string[];
  keyIdea: string;
  sections: LessonSection[];
  questions: LessonQuestion[];
};

export const lessons: Lesson[] = [
  {
    slug: "threads-and-shared-state",
    week: 1,
    title: "线程、共享状态，以及会撒谎的计数器",
    dek: "从进程和线程的边界开始，理解高并发究竟要保护什么、为什么 count++ 会丢失更新，以及如何用不变量而不是一次侥幸的运行结果判断并发代码。",
    readTime: "32 分钟",
    status: "published",
    tags: ["线程", "竞态条件", "ConcurrentHashMap", "单例"],
    searchTerms: [
      "进程",
      "高并发",
      "HashMap",
      "AtomicInteger",
      "LongAdder",
      "synchronized",
      "ReentrantLock",
      "懒汉式",
      "饿汉式",
      "双重检查锁",
      "enum"
    ],
    keyIdea:
      "只有任意可能的线程交错执行都保持不变量，一个并发组件才是正确的。",
    sections: [
      {
        eyebrow: "运行时基础",
        title: "操作系统创建进程；线程在其中执行代码",
        body: [
          "程序是磁盘上的静态代码；进程是它的一次运行实例。进程有操作系统身份、独立的虚拟地址空间，以及文件句柄、网络连接等资源。你从终端、IDE、服务管理器或容器启动应用，本质上是在请求操作系统创建一个进程。",
          "对 Java 应用而言，新进程先启动 JVM。JVM 创建初始应用线程，并在该线程上调用 main 方法。main 线程可以自己完成工作、在同一进程中启动更多线程，或者请求操作系统创建一个子进程。"
        ],
        sequence: [
          {
            title: "某个主体请求启动",
            body: "终端、IDE、服务管理器或一个已运行的程序请求操作系统执行该应用。"
          },
          {
            title: "操作系统创建进程",
            body: "操作系统分配进程 ID、地址空间、安全上下文，并建立资源句柄。"
          },
          {
            title: "运行时创建初始线程",
            body: "JVM 初始化自身，并启动应用的 main 线程。"
          },
          {
            title: "应用代码开始执行",
            body: "main 线程进入 main，之后才可能启动子进程或额外线程。"
          }
        ],
        codeLabel: "从 Java 启动独立进程",
        code: `Process child = new ProcessBuilder(
        "java", "-jar", "worker.jar")
    .inheritIO()
    .start();

int exitCode = child.waitFor();`,
        note:
          "子进程拥有独立的堆和生命周期。父子进程只能通过管道、套接字、文件或共享内存等显式通道交换数据。"
      },
      {
        eyebrow: "先把问题说准确",
        title: "并发、高并发与线程安全不是同一个概念",
        body: [
          "并发表示多个任务的执行时间发生重叠；并行表示多个任务在同一时刻真正使用多个计算资源。高并发只是“同一时间窗口内有很多请求或任务”的压力场景，它不会自动带来线程安全、低延迟或高吞吐。",
          "所谓安全，通常不是保护“某个线程”，而是保护业务状态和业务不变量。例如余额不能小于零、一个任务只能有一个终态、队列长度不能超过容量、同一订单不能扣款两次。先说清不变量，才能判断究竟需要锁、原子变量、并发集合、队列还是数据库事务。"
        ],
        bullets: [
          "安全性：系统永远不进入禁止状态，例如配额不超限。",
          "活性：系统最终能够推进，例如不会永久死锁或饥饿。",
          "性能：在给定负载下的吞吐量、延迟与资源成本。",
          "高并发会放大前两类错误，却不会替你修复它们。"
        ],
        note:
          "不要从“我要用 ConcurrentHashMap”开始。先写一句可检验的话，例如“任意时刻，同一租户运行中的任务数不超过 limit”。"
      },
      {
        eyebrow: "问题出现",
        title: "最终计数小于已经完成的工作量",
        body: [
          "设想有四个查询工作线程，每个完成 100,000 个分片后给同一个计数器加一。正确结果应为 400,000；但有时能得到它，有时不能。",
          "这首先不是性能问题，而是安全性问题：程序到达了规格不允许出现的状态。高并发首先要保证的，正是共享状态及其业务不变量的安全性。"
        ],
        codeLabel: "看似简单的竞态",
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
          "先不要急着修复。请先把 value++ 展开为概念上的“读取、相加、写回”三个动作。"
      },
      {
        eyebrow: "启动线程",
        title: "创建 Thread 对象，不等于启动一个线程",
        body: [
          "new Thread(task) 只创建了一个描述任务的普通 Java 对象。调用 start() 才会请求 JVM 在当前进程中创建并调度一条新的执行路径；新线程随后调用 task.run()，调用 start() 的线程则继续向下执行。",
          "直接调用 run() 只是当前线程上的一次普通方法调用，不会出现新的栈或并发执行。生产代码通常交给执行器创建和复用线程，但边界仍然一样：提交任务后，线程池会按自己的策略让某个工作线程执行它。"
        ],
        codeLabel: "同一个任务，两种完全不同的调用",
        code: `Thread worker = new Thread(
    () -> counter.increment());

worker.start(); // 新线程执行任务。
worker.join(); // 等待该线程终止。

// worker.run() 只会在当前线程执行。`,
        comparison: [
          {
            label: "隔离的运行时边界",
            title: "应该启动进程的场景",
            body: "工作需要隔离，或需要独立管理其生命周期。",
            bullets: [
              "用户启动一个新的应用实例。",
              "程序通过 ProcessBuilder.start() 启动子进程。",
              "工作需要独立的堆、权限、运行时或故障边界。"
            ]
          },
          {
            label: "共享的运行时边界",
            title: "应该启动线程的场景",
            body: "并发工作属于现有应用生命周期，并且有意共享进程内对象。",
            bullets: [
              "进程启动时，JVM 创建初始应用线程。",
              "代码调用 Thread.start()，或执行器启动、复用工作线程。",
              "任务需要低成本协调进程内状态。"
            ]
          }
        ],
        note:
          "并不是每次方法调用或创建对象都要启动线程。只有工作需要并行推进时才创建线程；当隔离边界比共享内存更重要时，才选择进程。"
      },
      {
        eyebrow: "心智模型",
        title: "线程有私有执行状态，却没有私有对象",
        body: [
          "同一进程内的线程共享堆。每个线程有自己的调用栈和程序计数器，但不同栈上的引用可以指向同一个堆对象。",
          "两个线程都可能读到 value = 41，都计算出 42，再都写回 42。两个已经完成的加一，最终只表现为一次增长。"
        ],
        bullets: [
          "原子性：一个操作会不会被观察到只完成了一半。",
          "可见性：一个线程的写入，另一个线程是否被保证能看见。",
          "有序性：Java 内存模型允许哪些观察顺序。"
        ]
      },
      {
        eyebrow: "JDK 工具箱",
        title: "ConcurrentHashMap 保护单个映射操作，不会自动保护业务流程",
        body: [
          "HashMap 在并发读写时没有线程安全契约：除了丢失更新，结构性修改还可能让读取观察到不一致状态。ConcurrentHashMap 让常用的单键操作能够安全并发，但“先 get、判断、再 put”仍然是多个动作，仍可能被别的线程插入。",
          "需要“如果不存在就创建”时，使用 computeIfAbsent；需要“读取旧值并更新该键”时，使用 compute 或 merge。它们把同一键上的读—改—写变成一个原子映射操作。不要在计算函数中做慢速远程调用、递归修改同一个 Map，或把多键业务事务误认为已经完成。"
        ],
        codeLabel: "用 merge 原子更新每个租户的计数",
        code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

final class TenantCounters {
    private final ConcurrentMap<String, Long> counts =
            new ConcurrentHashMap<>();

    void increment(String tenantId) {
        counts.merge(tenantId, 1L, Long::sum);
    }

    long get(String tenantId) {
        return counts.getOrDefault(tenantId, 0L);
    }
}`,
        note:
          "哈希表按键查询的平均时间复杂度通常是 O(1)，但复杂度不是正确性保证。ConcurrentHashMap 的原子边界是一次映射操作；跨多个键、Map 与数据库之间的不变量仍要设计更大的协议。"
      },
      {
        eyebrow: "你的实验",
        title: "让竞态显形，但不要假装一次成功能证明正确",
        body: [
          "用 CountDownLatch 作为起跑闸门，同时放行多个平台线程；让每个线程重复加一很多次。读取结果前，必须 join 每个工作线程。",
          "然后用同一个稳定的内置锁保护完整的读取—修改—写入操作，再重复相同工作负载。"
        ],
        bullets: [
          "至少记录十次运行的期望总数和观察总数。",
          "不要用 sleep 猜测工作线程是否完成；join 明确建立完成关系。",
          "一次失败足以证明不安全版本有问题；一次成功不构成安全性的证明。"
        ]
      },
      {
        eyebrow: "生产桥梁",
        title: "同一个错误，在生产里会穿上更昂贵的外衣",
        body: [
          "查询分片完成、Sink 确认、任务指标、租户配额扣减，本质上都是共享状态转移。名称会变化，证明义务不会变化。",
          "第一习惯应当是：在挑选并发原语之前，先写下不变量。"
        ],
        note:
          "本练习的不变量：所有工作线程 join 之后，value 必须等于所有成功 increment 的总数。"
      }
    ],
    questions: [
      {
        prompt: "从启动 Java 程序到进入 main，中间发生了什么？",
        answer: [
          "终端、IDE、服务管理器或容器运行时请求操作系统创建进程。操作系统分配进程身份和虚拟地址空间，准备继承的句柄与环境数据，并加载 Java 启动器。启动器初始化 JVM：类加载、运行时服务、堆、垃圾回收器和本地集成都会先于应用代码开始。",
          "JVM 创建初始的非守护应用线程，初始化指定的 main 类，再调用 public static void main(String[] args)。因此静态初始化可能发生在 main 的第一行之前；若初始化抛出异常，main 根本不会进入。"
        ],
        bullets: [
          "进程创建建立隔离与故障边界。",
          "JVM 启动在该进程内建立受管理的 Java 运行时。",
          "类初始化在类首次被主动使用前建立静态状态。",
          "之后的 Thread.start 会把调用方此前的动作先行发生地传递给新线程。"
        ],
        codeLabel: "观察类初始化和 main 线程",
        code: `public final class BootOrder {
    static {
        System.out.println("静态初始化："
                + Thread.currentThread().getName());
    }

    public static void main(String[] args) {
        System.out.println("main："
                + Thread.currentThread().getName());
    }
}`,
        distributed:
          "另一台机器上的进程不会共享本 JVM 的启动状态。配置、身份与就绪状态都必须跨越显式边界。若服务在静态初始化、迁移或依赖检查完成前就宣告就绪，请求可能会被路由到“进程存在但尚不能服务”的实例。"
      },
      {
        prompt: "什么时候应使用独立进程，而不是再开一个线程？",
        answer: [
          "当故障隔离、权限、内存上限、运行时独立性或独立部署更重要时，选择进程；当工作属于同一个应用生命周期并且有意共享进程内对象时，选择线程。",
          "线程协调成本低，但损坏的本地调用、堆耗尽或 System.exit 可能影响整个进程。子进程启动更贵且需要序列化或 IPC，却能被独立限制、终止、升级和观测。"
        ],
        codeLabel: "两种边界，两份不同的契约",
        code: `// 共享堆和生命周期：
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    Future<Result> result = pool.submit(() -> query.run());
    consume(result.get());
}

// 独立堆和故障边界：
Process worker = new ProcessBuilder(
        "java", "-jar", "query-worker.jar")
        .redirectErrorStream(true)
        .start();
boolean exited = worker.waitFor(30, TimeUnit.SECONDS);`,
        alternatives: [
          {
            api: "Thread / ExecutorService",
            fit: "CPU 计算，或基于共享对象协作的进程内任务。",
            tradeoff: "开销低；隔离弱，故障域共享。"
          },
          {
            api: "ProcessBuilder",
            fit: "不可信工具、独立运行时，或严格的内存与生命周期边界。",
            tradeoff: "隔离强；IPC、启动与监管必须显式实现。"
          },
          {
            api: "CompletableFuture",
            fit: "组合异步阶段，尤其是非阻塞续接。",
            tradeoff: "它表示完成，不表示隔离；执行器选择仍然重要。"
          },
          {
            api: "远程服务 / 容器",
            fit: "需要独立扩缩容、归属、部署或主机级隔离。",
            tradeoff: "网络分区、重试、序列化与版本兼容性进入契约。"
          }
        ],
        distributed:
          "把方法调用变为 RPC，失败模型就改变了：调用方可能超时，却不知道服务端是否已执行操作。你需要截止时间、幂等规则、请求标识和可观测的归属；线程级的 try/catch 已经不够。"
      },
      {
        prompt: "哪些数据是共享的，哪些数据仍是线程私有的？",
        answer: [
          "同一 JVM 的线程共享堆对象、静态字段和进程资源。每个线程有自己的调用栈、程序计数器和当前执行状态。局部变量存放在某个线程的栈帧内，但局部变量所引用的对象仍可能被共享。",
          "ThreadLocal 把一个值关联到一个线程，却不能让对象自动安全。把 ThreadLocal 值传给别处、在其中使用可变静态状态，或忘记在线程池线程中 remove，都可能重新引入共享或让上一个请求的数据残留。"
        ],
        codeLabel: "私有引用可以指向共享的可变状态",
        code: `List<String> shared = new ArrayList<>();

Runnable task = () -> {
    List<String> localReference = shared; // 引用是局部变量。
    localReference.add(Thread.currentThread().getName());
};

// 并发执行可能破坏 ArrayList 的内部状态。
new Thread(task).start();
new Thread(task).start();`,
        alternatives: [
          {
            api: "不可变值",
            fit: "配置、标识、快照与消息。",
            tradeoff: "最容易安全发布和推理；更新会创建新值。"
          },
          {
            api: "ThreadLocal<T>",
            fit: "无法显式传递时的线程封闭上下文。",
            tradeoff: "线程池复用会泄漏上下文；必须在 finally 中 remove。"
          },
          {
            api: "ConcurrentHashMap",
            fit: "按键共享的状态，每个映射操作独立原子。",
            tradeoff: "多键不变量或“Map 加字段”不变量仍需要协议。"
          },
          {
            api: "synchronized / Lock",
            fit: "多个可变字段共同构成一个不变量。",
            tradeoff: "原子边界清晰；需管理竞争和锁顺序。"
          }
        ],
        distributed:
          "多台机器并不共享 Java 堆。ConcurrentHashMap 只保护一个 JVM；若多个服务实例更新同一逻辑配额，应使用权威数据库事务、分区所有者、一致性存储或其他跨进程协议。"
      },
      {
        prompt: "高并发时，到底要保证谁的安全性？",
        answer: [
          "要保护的不是“线程本身”，而是被多个执行者共同读写的业务状态及其不变量。线程只是并发执行的载体。以租户配额为例，正确性要求不是“用了 AtomicInteger”，而是“任意时刻 running 不超过 limit，且每次成功获取许可最终恰好释放一次”。",
          "先把不变量转成操作的线性化点，再选 API。若只有一个精确计数值，AtomicInteger 的 compareAndSet 可以承担线性化点；若多个字段必须一起改变，用同一把 synchronized 锁或 ReentrantLock；若是在转交工作，优先用 BlockingQueue；若状态跨 JVM，则改用共享存储的原子条件更新或单写者协议。"
        ],
        codeLabel: "用 CAS 保护一个精确的单 JVM 配额",
        code: `import java.util.concurrent.atomic.AtomicInteger;

final class LocalQuota {
    private final AtomicInteger running = new AtomicInteger();
    private final int limit;

    LocalQuota(int limit) {
        if (limit <= 0) {
            throw new IllegalArgumentException("limit 必须为正数");
        }
        this.limit = limit;
    }

    boolean tryAcquire() {
        while (true) {
            int observed = running.get();
            if (observed >= limit) {
                return false;
            }
            if (running.compareAndSet(observed, observed + 1)) {
                return true;
            }
        }
    }

    void release() {
        while (true) {
            int observed = running.get();
            if (observed == 0) {
                throw new IllegalStateException("没有可释放的许可");
            }
            if (running.compareAndSet(observed, observed - 1)) {
                return;
            }
        }
    }
}`,
        alternatives: [
          {
            api: "AtomicInteger",
            fit: "一个精确数值状态，例如本地配额或序号。",
            tradeoff: "CAS 循环需要处理竞争；不能自动保护关联字段。"
          },
          {
            api: "synchronized / ReentrantLock",
            fit: "多个字段、集合或条件共同组成不变量。",
            tradeoff: "证明直观；临界区必须短，锁顺序必须一致。"
          },
          {
            api: "Semaphore",
            fit: "把固定并发容量建模为许可。",
            tradeoff: "许可泄漏会永久减少容量；它不记录业务状态。"
          },
          {
            api: "BlockingQueue",
            fit: "有限容量的工作交接和背压。",
            tradeoff: "解决等待与交接；仍要定义超时、拒绝与取消。"
          }
        ],
        distributed:
          "这个 LocalQuota 只约束一个 JVM。部署三个实例后，每个实例都允许 limit 个任务，集群总量可能变成三倍。全局配额需要数据库条件更新、Redis Lua/事务、分区单写者，或带 fencing 的租约协议。"
      },
      {
        prompt: "ConcurrentHashMap 与 HashMap 的差别，为什么 get 后再 put 仍然不安全？",
        answer: [
          "HashMap 没有并发访问契约；并发结构修改可能丢失更新或暴露不一致的内部状态。ConcurrentHashMap 允许许多线程安全地进行独立映射操作，但它不能把你写在多个方法调用里的业务流程自动打包成事务。",
          "例如“缺失则创建”若拆成 get、判断、put，两个线程都可能看见缺失并都创建对象。computeIfAbsent 把这一个键上的判断与安装值合为原子映射操作。类似地，计数用 merge 或 compute；多键转账、跨 Map 更新或 Map 加数据库更新仍需要更大的同步或事务边界。"
        ],
        codeLabel: "把单键检查—更新缩成一个原子映射操作",
        code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

final class TaskStates {
    private final ConcurrentMap<String, TaskState> states =
            new ConcurrentHashMap<>();

    // 错误形状：即使 states 是 ConcurrentHashMap，流程仍被拆开。
    TaskState findOrCreateBroken(String taskId) {
        TaskState state = states.get(taskId);
        if (state == null) {
            state = new TaskState(taskId);
            states.put(taskId, state);
        }
        return state;
    }

    // 正确形状：同一键的缺失检查与安装值是一个原子操作。
    TaskState findOrCreate(String taskId) {
        return states.computeIfAbsent(taskId, TaskState::new);
    }
}

record TaskState(String taskId) {}`,
        bullets: [
          "不要把 HashMap 包在“偶尔加锁”的代码里；所有访问路径都必须遵守同一协议。",
          "compute、merge 的函数应短小、无阻塞、无远程调用，也不要递归修改同一个 Map。",
          "ConcurrentHashMap 不允许 null 键和值；这避免了“null 是缺失还是一个合法值”的并发歧义。"
        ],
        distributed:
          "ConcurrentHashMap 不是分布式缓存一致性方案。每个实例都有一份本地 Map 时，更新会分叉；需要共享数据库、缓存的原子脚本/版本控制、事件日志，或明确的一致性与失效策略。"
      },
      {
        prompt: "算法复杂度为 O(1)，为什么仍不能证明高并发下正确？",
        answer: [
          "时间复杂度回答的是单次操作随输入规模增长的成本；并发正确性回答的是多次操作交错时是否仍保持不变量。HashMap 按键查找平均可接近 O(1)，却没有任何“两个线程同时读写仍正确”的承诺。把算法复杂度、线程安全与分布式一致性混为一谈，是初学并发最常见的误判之一。",
          "并发设计仍会借用算法思维：先定义状态、边界条件与不变量，再找每次操作的线性化点。例如 CAS 循环像一个带重试的搜索过程：失败说明别的线程已改变状态，必须重新读取后再判断。它可能有很高吞吐，却不保证每个线程都公平地快速成功。"
        ],
        bullets: [
          "复杂度关注成本：平均 O(1)、O(log n)、O(n)。",
          "安全性关注非法状态是否可能出现。",
          "活性关注线程是否最终推进；高竞争 CAS 可能造成饥饿。",
          "分布式一致性还要回答：崩溃、网络分区和重复投递后，谁是权威。"
        ],
        distributed:
          "把本地的 O(1) 缓存查询扩展到远程缓存后，主要成本可能变成网络尾延迟和失效传播，而不是哈希查找。即使每个节点算法都高效，副本陈旧、重复请求和网络分区仍能破坏业务契约。"
      },
      {
        prompt: "为什么直接调用 run() 不会启动新线程？",
        answer: [
          "run 是普通方法。调用 worker.run() 会把新栈帧压入当前线程的调用栈，并在该线程返回后继续执行。start 是生命周期操作：JVM 创建新的执行路径，新线程才会调用 run。",
          "直接调用 run 可能让并发测试意外通过，因为所有任务实际是串行执行的。它还会把阻塞工作放到调用者身上，常见的是请求线程或 UI 事件线程，从而导致延迟或界面卡死。"
        ],
        codeLabel: "打印实际执行身份",
        code: `Runnable probe = () -> System.out.println(
        Thread.currentThread().getName());

Thread worker = new Thread(probe, "query-worker");
worker.run(); // 打印调用者名称，通常是 main。
worker.start(); // 打印 query-worker。
worker.join();`,
        distributed:
          "分布式中的同类错误是：构造了请求或处理器对象，却从未经传输层发送。直接本地调用绕开了超时、序列化、认证、负载均衡和故障行为，因此不能测试真实远程路径。"
      },
      {
        prompt: "哪个精确交错会丢失一次更新？",
        answer: [
          "value++ 是读取—修改—写入，不是不可分割的一个动作。假设 value 为 41：线程 A 读取 41，线程 B 读取 41；A 计算并写入 42，B 也计算并写入 42。两个方法都返回了，最终却是 42 而不是 43。",
          "不变量失败的原因是：从旧值到新值的转移没有唯一所有者。即使把 getter 变成 synchronized，只要 increment 的读写不在同一把锁内，问题依然存在。"
        ],
        codeLabel: "展开概念动作",
        code: `void increment() {
    int observed = value; // A：41，B：41。
    int updated = observed + 1;
    value = updated; // A：42，B：42。
}`,
        bullets: [
          "一次失败的压力运行证明竞态存在。",
          "一次成功只说明这次调度没有暴露问题。",
          "修复必须让完整的读取—修改—写入转移成为原子动作。"
        ],
        distributed:
          "两台服务实例都从数据库读到版本 41，随后都写入版本 42，也会发生同样的丢失更新。JVM 锁跨不了实例；要使用原子 UPDATE、乐观版本检查、事务、串行分区所有者，或共享存储提供的 compare-and-set。"
      },
      {
        prompt: "为什么 volatile 不能让 value++ 变为原子操作？",
        answer: [
          "volatile 为该字段的读写提供可见性和有序性，却不会把读取、加法和写回合并为一次原子状态转移。两个线程仍然可能读到相同的 volatile 值，再互相覆盖。",
          "并发原语必须由不变量决定。AtomicInteger 适合一个精确数值状态；多个字段必须一起改变时，synchronized 或 ReentrantLock 通常更清楚。LongAdder 通过分散竞争提升热点指标吞吐量，但 sum 不是线性一致快照，不适合精确准入决策。"
        ],
        codeLabel: "可见性不等于复合操作原子性",
        code: `private volatile int wrong;
private final AtomicInteger exact = new AtomicInteger();
private final LongAdder metric = new LongAdder();

void update() {
    wrong++; // 仍然存在竞态。
    exact.incrementAndGet(); // 原子状态转移。
    metric.increment(); // 可扩展的统计计数。
}`,
        alternatives: [
          {
            api: "AtomicInteger",
            fit: "精确的单值计数器、序号或 CAS 状态。",
            tradeoff: "无锁原子操作；竞争集中在一个内存位置。"
          },
          {
            api: "LongAdder",
            fit: "高写入量指标，且允许并发观察近似值。",
            tradeoff: "高竞争下吞吐量更好；sum 不是线性一致快照。"
          },
          {
            api: "synchronized",
            fit: "一把稳定监视器保护复合不变量。",
            tradeoff: "语义简单且自动释放；只有一个等待集合。"
          },
          {
            api: "ReentrantLock",
            fit: "需要可中断/可超时加锁，或多个 Condition 等待集合。",
            tradeoff: "控制更多；必须在 finally 中 unlock。"
          }
        ],
        distributed:
          "volatile 与 java.util.concurrent 的原子类止步于进程边界。精确的分布式计数必须先决定：需要事务精确总数、分区所有者，还是最终合并的指标。像 LongAdder 一样优化的分布式计数可收敛，却不能在每个瞬间安全地执行全局硬配额。"
      },
      {
        prompt: "手写单例时，懒汉式、饿汉式、静态内部类、双重检查和 enum 应怎样选？",
        answer: [
          "首先确认你是否真的需要单例。无状态服务通常可以由依赖注入容器管理；把可变全局状态塞进单例，只是把共享状态藏起来，反而更难测试和同步。单例解决的是“一个类加载器内某个对象的初始化与身份”，不是一般并发安全方案。",
          "初始化便宜且一定会用时，饿汉式最简单；需要延迟初始化时，静态内部类（Initialization-on-demand holder）通常是最清晰的手写方案；需要 Java 层面最强的单例语义和序列化安全时，enum 往往最稳妥。双重检查锁必须配合 volatile，适合你确实需要延迟创建且不能使用 Holder 的少数场景。"
        ],
        codeLabel: "四种常见初始化模式",
        code: `// 饿汉式：类初始化时创建。
final class EagerRegistry {
    private static final EagerRegistry INSTANCE = new EagerRegistry();

    private EagerRegistry() {}

    static EagerRegistry getInstance() {
        return INSTANCE;
    }
}

// 静态内部类：首次调用 getInstance 时才初始化 Holder。
final class HolderRegistry {
    private HolderRegistry() {}

    private static final class Holder {
        private static final HolderRegistry INSTANCE =
                new HolderRegistry();
    }

    static HolderRegistry getInstance() {
        return Holder.INSTANCE;
    }
}

// 双重检查锁：volatile 不可省略。
final class DclRegistry {
    private static volatile DclRegistry instance;

    private DclRegistry() {}

    static DclRegistry getInstance() {
        DclRegistry current = instance;
        if (current == null) {
            synchronized (DclRegistry.class) {
                current = instance;
                if (current == null) {
                    current = new DclRegistry();
                    instance = current;
                }
            }
        }
        return current;
    }
}

// enum：由语言保证初始化与序列化语义。
enum EnumRegistry {
    INSTANCE
}`,
        alternatives: [
          {
            api: "饿汉式 static final",
            fit: "初始化便宜、一定会被使用的对象。",
            tradeoff: "最简单；失去延迟初始化，类加载时就创建。"
          },
          {
            api: "静态内部类 Holder",
            fit: "需要延迟初始化，且不依赖外部框架的普通 Java 类。",
            tradeoff: "无需显式锁；语义清晰，通常是手写首选。"
          },
          {
            api: "volatile + 双重检查锁",
            fit: "遗留约束下必须延迟创建，且无法使用 Holder 的场景。",
            tradeoff: "正确写法细节多；漏掉 volatile 会发生不安全发布。"
          },
          {
            api: "enum",
            fit: "真正的 Java 单例值、配置枚举或注册表标识。",
            tradeoff: "最稳健；不能延迟到任意业务时点，也不适合需要继承的类型。"
          }
        ],
        distributed:
          "任何上述模式至多保证一个类加载器或一个 JVM 内的一份实例。部署十个 Pod 就可能有十份“单例”。跨节点唯一任务需要数据库唯一约束、租约/选主、分区单写者或共识协议，而不是把 synchronized 扩大到网络。"
      },
      {
        prompt: "join() 为正确性论证贡献了什么？",
        answer: [
          "join 成功返回表示目标线程已经终止，并且该线程中的所有动作都先行发生于 join 返回后的动作。因此它同时建立完成性和最终读取时的发布关系。",
          "join 并不会让并发 increment 互斥。若加一没有原子性，join 所有工作线程只保证调用方看见最终的、可能早已损坏的结果。sleep 不是替代品：经过的时间既不能证明线程终止，也不会建立相同的内存模型边。"
        ],
        codeLabel: "完成与发布，不是互斥",
        code: `for (Thread worker : workers) {
    worker.start();
}
for (Thread worker : workers) {
    worker.join();
}

// 此处可以看见所有工作线程的动作，
// 但共享更新此前仍需要同步。
assertEquals(expected, counter.get());`,
        alternatives: [
          {
            api: "Thread.join",
            fit: "等待一个明确的平台线程终止。",
            tradeoff: "直接精确；属于较底层的生命周期管理。"
          },
          {
            api: "Future.get",
            fit: "等待执行器任务，并取得结果或失败。",
            tradeoff: "会暴露 ExecutionException；阻塞和超时策略必须明确。"
          },
          {
            api: "CountDownLatch",
            fit: "等待一组已知参与者到达一次性里程碑。",
            tradeoff: "协调清晰；工作线程异常需要独立通道。"
          },
          {
            api: "CompletableFuture.allOf",
            fit: "组合多个异步完成事件。",
            tradeoff: "易组合；仍需检查各组件失败与执行器选择。"
          }
        ],
        distributed:
          "网络分区中不存在“分布式 join”。协调者需要持久任务 ID、心跳或租约、终态记录与超时语义。与某个工作者失联意味着结果未知，而不是工作已停止。"
      }
    ]
  },
  {
    slug: "happens-before",
    week: 2,
    title: "先行发生：摆脱关于内存的民间说法",
    dek: "用精确规则替代含糊的“主内存”想象：一个线程何时必须观察到另一个线程的动作？",
    readTime: "18 分钟",
    status: "published",
    tags: ["JMM", "volatile", "可见性"],
    searchTerms: [
      "happens-before",
      "安全发布",
      "中断",
      "Thread.start",
      "Thread.join",
      "CountDownLatch"
    ],
    keyIdea:
      "先行发生（happens-before）是动作之间的有序性保证，不是对墙上时钟时间的描述。",
    sections: [
      {
        eyebrow: "问题出现",
        title: "工作线程可能永远注意不到应该停止",
        body: [
          "一个线程在循环，另一个线程写入停止标志。若这是普通数据竞争，Java 内存模型并不要求循环一定观察到这次写入。",
          "只要结果仍符合内存模型，编译器与运行时可以复用此前读到的值。你在本机“经常看到它停止”，不等于规范承诺它会停止。"
        ],
        codeLabel: "缺少可见性保证",
        code: `final class Worker implements Runnable {
    private boolean stopped;

    @Override
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
          "它可能在测试中看起来正常。要问的不是“通常会发生什么”，而是“规范保证什么”。"
      },
      {
        eyebrow: "心智模型",
        title: "画出被保证的观察关系图",
        body: [
          "若动作 A 先行发生于动作 B，则 A 的效果对 B 可见，并且 A 在顺序上先于 B；该关系具有传递性。",
          "对同一 volatile 变量，写入会与之后的读取建立同步关系。同一监视器的 unlock 会与之后的 lock 建立同步关系。调用 start 与成功从 join 返回，也会建立实用的边。"
        ],
        bullets: [
          "程序顺序：同一线程中较早动作先行发生于较晚动作。",
          "监视器规则：同一监视器的 unlock 先行发生于之后的 lock。",
          "volatile 规则：同一 volatile 字段的写入先行发生于之后的读取。",
          "线程规则：start 发布此前动作；成功的 join 发布已终止线程的动作。"
        ]
      },
      {
        eyebrow: "你的实验",
        title: "先画边，再写关键字",
        body: [
          "把停止标志改为 volatile，并画出链条：调用方的普通动作 → volatile stop 写入 → 工作线程的 volatile stop 读取 → 工作线程之后的动作。",
          "工作线程配置应保持不可变。在线程启动前完整构造并发布它，而不是工作线程启动后再修改。"
        ],
        bullets: [
          "测试启动、推进、停止和有界终止。",
          "说明是哪一条边发布了配置。",
          "说明为什么 volatile 停止标志不能保护另一个 count++。"
        ]
      },
      {
        eyebrow: "生产桥梁",
        title: "生命周期也是内存模型问题",
        body: [
          "Source Reader 停止、查询取消、配置刷新和算子初始化都依赖发布与可见性。",
          "框架 API 可能替你创建边，但你仍需知道自己依赖的是哪一条边；否则重构后很容易把唯一的同步关系删掉。"
        ]
      }
    ],
    questions: [
      {
        prompt: "存在数据竞争时，Java 允许什么行为？",
        answer: [
          "当同一变量的冲突访问没有被先行发生关系排序，且至少一次是写入时，就存在数据竞争。Java 内存模型不承诺另一线程能观察到按墙上时钟最近发生的写入；读取可能看见过期值，合法的编译器或处理器重排也会让逐行直觉失效。",
          "这并不意味着任何事情都能发生：Java 仍提供类型安全，也为正确同步的程序提供明确规则。工程上的回应是消除竞争并命名同步边，而不是依赖某种 CPU、调试日志或多次成功测试。"
        ],
        codeLabel: "竞争读取可能观察到过期状态",
        code: `final class Switch {
    private boolean enabled; // 存在数据竞争。

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
          "Thread.onSpinWait 是性能提示，不是可见性保证。",
          "日志会扰动时序，可能隐藏症状，却不会修复竞态。",
          "正确同步才能恢复可移植、由规范保证的行为。"
        ],
        distributed:
          "分布式系统有更强的陈旧观察：即使每个 JVM 都正确同步，副本仍可能合法滞后。需要明确操作要求线性一致读、单调读、读己之写还是最终一致；本地 volatile 字段无法替数据库选择一致性级别。"
      },
      {
        prompt: "哪个动作把不可变配置安全发布给新线程？",
        answer: [
          "调用方在 Thread.start 之前的所有动作，先行发生于新线程中的动作。完整构造不可变配置，把它放入任务，再调用 start，就把该配置安全发布给新线程。",
          "若对象没有从构造器逸出，final 字段还提供额外的初始化保证。start 后再修改对象属于新的通信事件，需要新的同步；最初的 start 边不会覆盖未来写入。"
        ],
        codeLabel: "构造、绑定，再启动",
        code: `record WorkerConfig(URI endpoint, Duration timeout) {}

WorkerConfig config = new WorkerConfig(
        URI.create("https://service.internal"),
        Duration.ofSeconds(2));

Thread worker = new Thread(() -> use(config));
worker.start(); // 发布完整配置。

// 不要在 start 之后修改共享配置。`,
        alternatives: [
          {
            api: "Thread.start",
            fit: "创建者向新线程进行初始发布。",
            tradeoff: "覆盖 start 之前动作，不覆盖之后的重新配置。"
          },
          {
            api: "ExecutorService.submit",
            fit: "通过线程安全队列向执行器工作线程发布任务。",
            tradeoff: "执行器提供同步边；捕获的可变对象仍需约束。"
          },
          {
            api: "volatile 引用",
            fit: "运行时替换不可变配置快照。",
            tradeoff: "读者看见完整快照；不得修改已发布快照。"
          },
          {
            api: "AtomicReference",
            fit: "条件式快照更新，或 get-and-update 操作。",
            tradeoff: "只对一个引用原子；外部副作用不属于 CAS。"
          }
        ],
        distributed:
          "向另一个进程发布配置需要带版本的序列化，以及确认或可观察的已应用版本。只发送消息最多证明传输接收，除非协议另有定义；否则滚动更新期间可能长期共存多个配置版本。"
      },
      {
        prompt: "volatile 保证什么，又不保证什么？",
        answer: [
          "对同一 volatile 字段的写入，先行发生于之后观察到它的读取。写入前的动作对读取后的动作可见，并且对该 volatile 字段的访问不能自由跨越这一边界重排。",
          "volatile 不会把复合操作变成事务，不会锁住多个字段，不会强制业务状态转移，也不会让可变集合线程安全。它适合标志位和不可变快照引用，其中每次更新都是独立赋值。"
        ],
        codeLabel: "先写数据，最后写发布标志",
        code: `private int result;
private volatile boolean ready;

void produce() {
    result = compute();
    ready = true; // 类似发布动作。
}

int consume() {
    if (!ready) {
        throw new IllegalStateException("结果尚未就绪");
    }
    return result; // 观察到 ready 后可见。
}`,
        alternatives: [
          {
            api: "volatile",
            fit: "标志位与可替换的不可变快照。",
            tradeoff: "可见性/有序性开销低；没有复合不变量。"
          },
          {
            api: "AtomicReference",
            fit: "单个状态对象上的 CAS 转移。",
            tradeoff: "支持引用的原子读—改—写。"
          },
          {
            api: "synchronized / Lock",
            fit: "多个字段和操作组成同一个不变量。",
            tradeoff: "锁边界同时提供互斥与可见性。"
          },
          {
            api: "BlockingQueue",
            fit: "在线程间转交数据及其所有权。",
            tradeoff: "封装等待和发布；容量策略仍然重要。"
          }
        ],
        distributed:
          "volatile ready 无法发布存放在另一节点的数据。应使用把持久数据与可见状态一致提交的协议，例如一个数据库事务、一条原子记录，或由日志偏移量定义可见性的日志条目。"
      },
      {
        prompt: "为什么 sleep 不是同步机制？",
        answer: [
          "sleep 至多让当前线程暂停约定时长；它不释放锁、不等待某个谓词、不证明另一个任务已完成，也不会创建你想要的发布边。调度负载、GC 暂停、宿主机竞争和 CI 波动都会让时间猜测不可靠。",
          "应该使用能命名事件的 API：线程终止用 join，任务完成用 Future.get，里程碑用 CountDownLatch，交接用 BlockingQueue，受保护谓词用 Condition.await；测试中可对真实的可观察谓词进行有截止时间的轮询。"
        ],
        codeLabel: "等待证据，而不是经过的时间",
        code: `// 脆弱：
worker.start();
Thread.sleep(100);
assertTrue(worker.finished());

// 有契约：
worker.start();
worker.join(1_000);
assertFalse(worker.isAlive());
assertTrue(worker.finished());`,
        distributed:
          "发送 RPC 或部署命令后等待五秒，并不建立完成事实。应在截止时间内轮询持久操作资源、消费语义明确的确认，或等待流偏移量/状态版本；否则慢成功会被当作失败，重试又可能重复执行。"
      },
      {
        prompt: "阻塞中的工作线程会怎样改变关闭设计？",
        answer: [
          "volatile 停止标志只在工作线程返回并再次读取它时有效。若线程阻塞在 queue.take、加锁、sleep 或可中断 I/O 中，通常需要 interrupt 来唤醒。循环必须把 InterruptedException 作为取消信号；不能重抛时要恢复中断标志，并通过 finally 完成清理。",
          "某些操作会忽略中断，例如行为不良的库或部分本地调用。此时应增加操作级截止时间，在文档规定可解除阻塞时关闭资源，并限制等待关闭的总时间。Thread.stop 不安全，因为它可能在不变量只更新一半时终止代码。"
        ],
        codeLabel: "阻塞循环的协作式取消",
        code: `void runLoop() {
    try {
        while (!Thread.currentThread().isInterrupted()) {
            Work item = queue.take(); // 可中断等待。
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
            fit: "向拥有或检查该线程的代码发送协作信号。",
            tradeoff: "是请求而非强制终止；代码必须保留该信号。"
          },
          {
            api: "Future.cancel(true)",
            fit: "取消执行器任务，并在运行时请求中断。",
            tradeoff: "Future 取消不证明底层 I/O 已停止。"
          },
          {
            api: "ExecutorService.shutdownNow",
            fit: "强制关闭阶段请求中断并取回未执行工作。",
            tradeoff: "尽力而为；仍需 await 并报告未终止。"
          },
          {
            api: "Socket / 读取截止时间",
            fit: "限制中断未必能可靠结束的网络等待。",
            tradeoff: "超时是本地事实；远端操作可能仍在继续。"
          }
        ],
        distributed:
          "取消调用方的 Future 或关闭套接字，不会自动取消远端工作。必须传播截止时间或取消令牌，为操作赋予幂等身份，并让服务端记录终态。网络分区时，调用方可能只知道自己停止等待，并不知道远端结果。"
      }
    ]
  },
  {
    slug: "one-terminal-outcome",
    week: 3,
    title: "一个任务，只能有一个终态",
    dek: "用 compare-and-set 解决完成、取消与超时的竞态，同时避免发布不一致的结果状态。",
    readTime: "19 分钟",
    status: "published",
    tags: ["CAS", "原子类", "状态机"],
    searchTerms: [
      "compareAndSet",
      "AtomicReference",
      "线性化点",
      "终态",
      "outbox"
    ],
    keyIdea:
      "线性化点是并发操作在逻辑上生效的唯一瞬间。",
    sections: [
      {
        eyebrow: "问题出现",
        title: "完成与取消同时到达",
        body: [
          "查询刚完成，调用方也发起取消。若两个路径分别“检查再写入”，它们都可能认为自己拥有终态。",
          "正确设计要从合法状态转移表开始，而不是从 AtomicReference 开始。"
        ],
        codeLabel: "检查后再行动，不是一个动作",
        code: `if (!state.isTerminal()) {
    state = CANCELLED;
}`,
        note:
          "检查与写入之间，另一个线程可以改变状态。"
      },
      {
        eyebrow: "心智模型",
        title: "CAS 把一次转移变成只有一个赢家的竞争",
        body: [
          "compareAndSet(expected, update) 只有在当前值仍等于 expected 时才更新。成功的 CAS 就是该转移的线性化点。",
          "CAS 不会让一组无关字段自动原子。若 SUCCEEDED 必须携带结果，应在发布该终态前把结果构造成一致的整体，或由同一锁保护。"
        ],
        bullets: [
          "列出状态图中的每一条合法边。",
          "终态没有出边。",
          "除非状态与副作用被设计成同一协议，否则只有确认获胜后才能执行副作用。",
          "多个字段形成难以原子表达的不变量时，优先考虑一把锁。"
        ]
      },
      {
        eyebrow: "你的实验",
        title: "让两个竞争者同时起跑",
        body: [
          "从同一个 CountDownLatch 同时放行完成线程与取消线程，断言恰好一个合法转移成功。",
          "重复这个受协调的竞争。不要把随机 sleep 当作制造并发的唯一方式。"
        ],
        bullets: [
          "先于代码写出状态转移表。",
          "让每个转移返回是否成功。",
          "对每个终态测试之后试图进行的转移。"
        ]
      },
      {
        eyebrow: "生产桥梁",
        title: "状态字段本身就是协议",
        body: [
          "查询状态、异步请求完成、检查点进度和部署任务，都需要一个权威的终态决定。",
          "难点很少是存一个 enum；难点是定义谁拥有转移，以及如何一致地发布相关结果。"
        ]
      }
    ],
    questions: [
      {
        prompt: "状态转移的线性化点在哪里？",
        answer: [
          "对 state.compareAndSet(RUNNING, SUCCEEDED) 来说，成功的 compare-and-set 就是转移在逻辑上生效的瞬间。在此之前，其他竞争者仍可能获胜；在此之后，所有线程都必须把 SUCCEEDED 当作权威决定。",
          "失败的 CAS 不是转移。调用方应读取当前状态，再决定重试仍合法的边还是报告另一个终态获胜。盲目循环会违反状态图，例如把 CANCELLED 又改成 SUCCEEDED。"
        ],
        codeLabel: "显式表达合法边",
        code: `boolean complete(Result value) {
    Outcome current = outcome.get();
    if (!(current instanceof Outcome.Running)) {
        return false;
    }

    Outcome next = Outcome.succeeded(value);
    return outcome.compareAndSet(current, next);
}`,
        bullets: [
          "expected 表达源状态。",
          "update 表达完整发布的目标状态。",
          "布尔返回值告诉调用方它是否拥有后续工作。"
        ],
        distributed:
          "数据库条件更新可以成为分布式线性化点：UPDATE task SET state='SUCCEEDED' WHERE id=? AND state='RUNNING'。受影响行数标识赢家；本地 CAS 无法协调多个服务实例。"
      },
      {
        prompt: "为什么两个原子字段不会自动组成一个原子不变量？",
        answer: [
          "每个 AtomicReference 或 AtomicInteger 只线性化自己的操作。在更新字段 A 与字段 B 之间仍有间隙，读者可以观察到任意业务转移都不允许的组合，例如 state=SUCCEEDED 且 result=null。",
          "字段描述同一个逻辑结果时，应通过一个 AtomicReference 发布一个不可变整体，或者用同一把锁保护这一组字段的所有读写。改变字段更新顺序不会修复问题，只会改变暴露的是哪一种非法组合。"
        ],
        codeLabel: "发布一个不可变结果",
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
            fit: "用一个值更新的小型不可变状态机。",
            tradeoff: "CAS 转移优雅；复杂重试副作用仍难处理。"
          },
          {
            api: "synchronized",
            fit: "多个字段和副作用记账共享同一个不变量。",
            tradeoff: "证明直接；监视器竞争会串行访问。"
          },
          {
            api: "ReentrantLock",
            fit: "复合不变量外加可超时/可中断加锁或 Condition。",
            tradeoff: "更灵活；所有路径必须在 finally 中 unlock。"
          },
          {
            api: "StampedLock",
            fit: "读远多于写，且能谨慎验证乐观读的专用结构。",
            tradeoff: "不可重入、易误用，任务状态通常不需要它。"
          }
        ],
        distributed:
          "把状态和结果放进不同数据库行或不同服务，会得到同样的撕裂不变量，并被进程崩溃放大。优先使用一条原子记录或一个事务；否则设计有可恢复中间态与对账逻辑的显式多步协议。"
      },
      {
        prompt: "状态转移什么时候可以执行副作用？",
        answer: [
          "不可逆或对外可见的副作用，必须在一个能确定归属的协议下执行。取消和完成竞争时，两个竞争者不能仅因都尝试了转移，就都发送通知、都释放同一配额或都向租户计费。",
          "通常由成功 CAS 的赢家做本地后续处理。但“决定状态”和“发送外部消息”之间仍有崩溃窗口。对于持久的分布式效果，应在一个事务里写入状态转移和 outbox 事件，再由可重试发布者使用稳定标识投递。"
        ],
        codeLabel: "只有赢家拥有本地后续动作",
        code: `if (outcome.compareAndSet(running, succeeded)) {
    permits.release();
    completion.complete(succeeded);
    metrics.incrementSucceeded();
}

// 失败者不执行任何一次性动作。`,
        bullets: [
          "若可能重试或重复回调，清理必须幂等。",
          "明确指标统计的是尝试、被接受的转移，还是已送达效果。",
          "绝不要持有 JVM 锁进行无界远程调用。"
        ],
        distributed:
          "本地 CAS 得不到“远程副作用恰好一次”。应使用事务 outbox/inbox、幂等键、去重或单分区所有者。否则在不确定响应后重试，可能重复收费，也可能漏掉收费。"
      },
      {
        prompt: "如果先发布 SUCCEEDED，后写入结果会怎样？",
        answer: [
          "读者可能观察到 SUCCEEDED 后立即读到 null、过期或旧结果。状态承诺结果已经存在，但数据尚未被发布；即使稍后的写入最终可见，先前观察也已违反契约。",
          "把不可变的 Succeeded(result) 作为一个原子或 volatile 引用发布可以消除间隙。使用锁时，应在同一把锁内写入结果和状态，并要求读者也用该锁读取两者。"
        ],
        codeLabel: "错误发布与原子替代方案",
        code: `// 错误：状态承诺先于负载数据。
state.set(SUCCEEDED);
result = computed;

// 正确形状：发布一个整体。
outcome.set(new Succeeded(computed));

Outcome snapshot = outcome.get();
if (snapshot instanceof Succeeded ok) {
    consume(ok.result());
}`,
        distributed:
          "若状态接口在结果对象持久化前报告 SUCCEEDED，消费者会拉取不到数据并不可预测地重试。应原子提交结果与终态元数据，或者暴露恢复规则明确的 FINALIZING 中间状态。"
      },
      {
        prompt: "什么时候一把显式锁更容易证明正确？",
        answer: [
          "当一个转移要检查并改变多个集合或字段、要协调条件变量，或要管理难以用纯不可变 CAS 表示的清理时，使用一把锁。证明变成：对该不变量的每次访问都在临界区内，任何路径都不暴露部分状态。",
          "锁不自动慢，CAS 也不自动可扩展。竞争下 CAS 循环会耗费 CPU 并使公平性更复杂。临界区要小，持锁时不要调用未知或远程代码；使用 Lock 时一律用 try/finally。"
        ],
        codeLabel: "一把锁保护一个复合不变量",
        code: `private final ReentrantLock lock = new ReentrantLock();
private State state = RUNNING;
private Result result;

boolean complete(Result value) {
    lock.lock();
    try {
        if (state != RUNNING) {
            return false;
        }
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
            fit: "一段清晰临界区的默认选择。",
            tradeoff: "自动释放与简单可见性；没有可超时获取。"
          },
          {
            api: "ReentrantLock",
            fit: "需要可中断/可超时加锁，或多个条件队列。",
            tradeoff: "策略控制更多；必须手动保持释放纪律。"
          },
          {
            api: "AtomicReference",
            fit: "由一个不可变值表示的小型状态。",
            tradeoff: "非阻塞转移；副作用与重试循环要谨慎。"
          },
          {
            api: "并发集合",
            fit: "每个键独立操作，且没有更大不变量。",
            tradeoff: "内建算法优秀；复合工作流仍需协调。"
          }
        ],
        distributed:
          "ReentrantLock 只保护一个进程，崩溃后锁状态也会消失。跨节点归属需要数据库事务、共识/租约服务、队列分区或 actor 式单一所有者。分布式锁还会引入租约到期、fencing 与故障恢复，不能照搬本地锁直觉。"
      }
    ]
  },
  {
    slug: "bounded-queues",
    week: 4,
    title: "有界队列：把过载变成明确策略",
    dek: "从受保护谓词建立生产者—消费者协作，再把容量与流式背压连接起来。",
    readTime: "20 分钟",
    status: "published",
    tags: ["监视器", "队列", "背压"],
    searchTerms: [
      "BlockingQueue",
      "ArrayBlockingQueue",
      "wait",
      "notifyAll",
      "Condition",
      "生产者消费者"
    ],
    keyIdea:
      "队列不会消除过载；它只决定多余需求在哪里等待、失败或被丢弃。",
    sections: [
      {
        eyebrow: "问题出现",
        title: "生产者比消费者更快",
        body: [
          "无界队列会让延迟和内存持续增长，而服务表面上仍像是健康的。有界队列迫使系统暴露容量上限。",
          "队列不变量很简单：size 永远不小于零，也不大于 capacity；正确协调等待者却并不简单。"
        ]
      },
      {
        eyebrow: "心智模型",
        title: "等待谓词，而不是等待一条通知",
        body: [
          "当队列未满时，生产者才可以继续；当队列非空时，消费者才可以继续。两个谓词都必须由保护队列状态的同一把锁守护。",
          "wait 会释放监视器并挂起线程。线程被唤醒并重新获得监视器后，必须再次检查谓词：另一个线程可能已经消耗条件，或者这次唤醒本来就是伪唤醒。"
        ],
        codeLabel: "这是形状，不是完整解法",
        code: `synchronized (lock) {
    while (!predicate()) {
        lock.wait();
    }
    changeGuardedState();
    lock.notifyAll();
}`,
        note:
          "你的实现必须定义具体谓词与状态变化。不要在不能解释每一行之前照抄这个形状。"
      },
      {
        eyebrow: "你的实验",
        title: "为每个元素记账",
        body: [
          "使用多个生产者和消费者，每个元素分配唯一 ID。结束时，每个被接收的 ID 都必须在已消费集合中恰好出现一次。",
          "加入测试：中断一个阻塞在满队列上的生产者，或中断一个阻塞在空队列上的消费者。每个测试都应有时间上限，避免错误代码挂死整个测试套件。"
        ],
        bullets: [
          "把 while 改成 if，并预测故障。",
          "把谓词检查移出锁，找出竞态。",
          "持有队列锁时绝不执行未知任务代码。"
        ]
      },
      {
        eyebrow: "生产桥梁",
        title: "背压是端到端契约",
        body: [
          "有界邮箱、查询准入队列、连接器缓冲区或网络缓冲区只控制一个边界。上游仍需要收到明确回应：阻塞、稍后重试、拒绝、采样或丢弃。",
          "第二个月会用标准 BlockingQueue 替换这个学习队列。亲手实现一次是为了理解契约；在生产中长期维护自定义队列会引入不必要的风险。"
        ]
      }
    ],
    questions: [
      {
        prompt: "为什么 wait 必须放在 while 循环里？",
        answer: [
          "wait 可能因通知、中断或伪唤醒返回。即使通知真实发生，另一个被唤醒线程也可能先获得监视器并取走唯一元素。通知只说明状态可能改变，并没有把条件保留给某一个等待者。",
          "谓词必须在保护队列的同一监视器下检查。wait 重新获得该监视器后，循环会重新检查当前状态。使用 if 是把“过去状态的提示”误当成“现在可以行动的许可”。"
        ],
        codeLabel: "错误和正确的受保护等待",
        code: `// 错误：把唤醒当作许可。
synchronized (lock) {
    if (queue.isEmpty()) {
        lock.wait();
    }
    return queue.removeFirst(); // 此时可能又为空。
}

// 正确：当前状态才授予许可。
synchronized (lock) {
    while (queue.isEmpty()) {
        lock.wait();
    }
    E item = queue.removeFirst();
    lock.notifyAll();
    return item;
}`,
        alternatives: [
          {
            api: "wait / notifyAll",
            fit: "学习监视器谓词，或维护一个很小的既有监视器。",
            tradeoff: "只有一个等待集合，容易错误通知或错误守护。"
          },
          {
            api: "Condition",
            fit: "需要分离 notEmpty/notFull 等待集合的自定义同步器。",
            tradeoff: "目标更清晰；要求 ReentrantLock 的严格纪律。"
          },
          {
            api: "ArrayBlockingQueue",
            fit: "有界 FIFO 的生产者—消费者交接。",
            tradeoff: "生产默认选择；公平模式可能降低吞吐量。"
          },
          {
            api: "LinkedBlockingQueue",
            fit: "可选有界队列，put/take 协调相对独立。",
            tradeoff: "有节点分配成本，容量仍必须显式配置。"
          }
        ],
        distributed:
          "消息通知同样不等于所有权。消费者必须通过 Broker 或持久状态转移认领工作，处理重新投递，并在协议规定的时点确认；否则两个消费者可能处理同一个逻辑元素。"
      },
      {
        prompt: "哪个操作会把“非空”从 false 变为 true？",
        answer: [
          "一次成功的 put 若把 size 从零变为一，就让非空谓词成立，因此消费者可能需要信号。类似地，一次成功的 take 若把 size 从 capacity 变为 capacity - 1，就让非满谓词对生产者成立。",
          "每次变更后都发信号可能正确但嘈杂；只在边界转移时发信号更高效，却必须证明不会遗留等待者。学习用的、生产者和消费者共享一个等待集合的监视器中，notifyAll 往往更安全。"
        ],
        codeLabel: "先改变受保护状态，再发信号",
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
          "先改变状态，才能让被唤醒线程观察到谓词。",
          "变更与通知期间都要持有监视器。",
          "收到通知的线程不会立刻运行；它仍要重新获得监视器。"
        ],
        distributed:
          "在 Broker 中，追加第一条消息可能让分区从空闲变为可运行，但通知会丢失或重复。消费者还必须轮询或从持久偏移量恢复；正确性不能依赖一枚尽力而为的唤醒数据包。"
      },
      {
        prompt: "为什么 sleep 与 wait 不一样？",
        answer: [
          "sleep 暂停当前线程，但保留它持有的每一把监视器。wait 要求先拥有特定监视器，随后原子地释放该监视器、挂起，并在返回前重新获得它。正是这次释放，让另一个线程能进入临界区并使受保护谓词成立。",
          "持有队列锁时 sleep 会阻塞本该添加元素的生产者，造成可避免的停顿或类似死锁的活性故障。锁外 sleep 虽避免了阻塞，却变成轮询：增加延迟并浪费调度机会或 CPU。"
        ],
        codeLabel: "持锁睡眠会阻止进展",
        code: `synchronized (lock) {
    while (queue.isEmpty()) {
        Thread.sleep(100); // 锁仍被持有。
        // 生产者无法获得锁来添加元素。
    }
}

// wait() 会释放锁，直到收到通知或被唤醒：
synchronized (lock) {
    while (queue.isEmpty()) {
        lock.wait();
    }
}`,
        alternatives: [
          {
            api: "Thread.sleep",
            fit: "临界区外的刻意延迟、节流或简单退避。",
            tradeoff: "仅基于时间；没有条件或发布保证。"
          },
          {
            api: "Object.wait",
            fit: "等待受监视器保护的谓词。",
            tradeoff: "释放该监视器；必须循环并处理中断。"
          },
          {
            api: "LockSupport.park",
            fit: "底层同步器实现。",
            tradeoff: "许可语义微妙；不是应用级队列 API。"
          },
          {
            api: "BlockingQueue.take",
            fit: "应用代码等待队列数据。",
            tradeoff: "封装条件协议，通常应优先使用。"
          }
        ],
        distributed:
          "固定轮询 sleep 会制造同步的请求脉冲，并减慢过载恢复。应使用服务端给出的 Retry-After、带抖动的指数退避、队列通知加持久轮询，或流式流量控制；无论哪种方式都要限制总截止时间。"
      },
      {
        prompt: "中断应当如何影响一个阻塞操作？",
        answer: [
          "中断必须遵循方法契约。阻塞队列方法可以声明 InterruptedException，并在变更前被中断时保持队列不变。若方法不能抛出它，应通过 Thread.currentThread().interrupt() 恢复中断标志，再返回或转换为领域取消异常。",
          "绝不要吞掉中断后静默继续：关闭代码会一直等待一个已经丢弃取消信号的工作线程。还要定义提交点；若元素已经插入后才收到中断，却报告“什么都没发生”，调用者重试就会造成重复元素。"
        ],
        codeLabel: "传播中断，同时不破坏队列",
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
          "声明在变更点之前还是之后接受取消。",
          "每一条异常退出路径都必须保持不变量。",
          "调用方需要截止时间时，使用定时操作而非无限阻塞。"
        ],
        distributed:
          "调用方中断不会回滚响应丢失的 Broker 发布或远程入队。为元素赋予稳定 ID，并让接收结果可查询或可去重。超时请求的结果常常是未知，而不是已拒绝。"
      },
      {
        prompt: "什么样的过载策略会传递给生产者？",
        answer: [
          "有界队列只创建了决策点。API 必须告诉生产者它是被阻塞、超时、拒绝，还是替换/丢弃了别的元素。把拒绝藏在调用方忽略的 boolean 里，只是把过载变成静默数据丢失。",
          "只有背压可以安全向上传播、且调用方没有持有锁或稀缺请求线程时，阻塞才合适。定时 offer 限制延迟；立即拒绝保护服务并让调用方削减或重试。丢弃或合并可用于明确允许丢失的遥测，不适用于资金或唯一任务提交。"
        ],
        codeLabel: "显式表达准入结果",
        code: `boolean accepted = queue.offer(
        task, 50, TimeUnit.MILLISECONDS);

if (!accepted) {
    throw new OverloadedException(
            "队列已满；仅当任务幂等时才可重试");
}`,
        alternatives: [
          {
            api: "put",
            fit: "背压可让生产者无限期阻塞。",
            tradeoff: "不丢失；可能耗尽请求线程或形成死锁环。"
          },
          {
            api: "offer(timeout)",
            fit: "在调用方延迟预算内短暂等待。",
            tradeoff: "超时结果明确；等待时仍占用线程。"
          },
          {
            api: "offer",
            fit: "立即准入决策，由调用方处理拒绝。",
            tradeoff: "保护快速；调用方必须处理 false。"
          },
          {
            api: "Flow / 响应式需求",
            fit: "消费者按上限请求需求的异步流水线。",
            tradeoff: "需要端到端参与；不会消除其他位置的缓冲。"
          }
        ],
        distributed:
          "应返回明确的过载信号，例如带重试指引的 HTTP 429 或 503，并暴露队列饱和度。自动重试前要求幂等；没有抖动和重试预算时，所有客户端会同时重试，把单点过载放大为集群级重试风暴。"
      }
    ]
  },
  {
    slug: "locks-conditions-permits",
    week: 5,
    title: "锁、条件变量与租户许可",
    dek: "分离等待集合，保护释放路径，并把租户并发度建模为稀缺容量。",
    readTime: "8 分钟",
    status: "upcoming",
    tags: ["ReentrantLock", "Condition", "Semaphore"],
    keyIdea: "信号量表示容量；它不是状态不变量的替代品。",
    sections: [],
    questions: []
  },
  {
    slug: "bounded-executors",
    week: 6,
    title: "正视过载的执行器",
    dek: "显式配置工作线程数、队列容量、拒绝策略与异常可见性。",
    readTime: "9 分钟",
    status: "upcoming",
    tags: ["执行器", "线程池", "拒绝"],
    keyIdea: "每个执行器都有容量策略，包括那些把策略藏起来的执行器。",
    sections: [],
    questions: []
  },
  {
    slug: "cancellation-shutdown",
    week: 7,
    title: "取消是一份协作协议",
    dek: "处理中断、截止时间、异步失败与优雅关闭，而不是假装线程可以被安全强杀。",
    readTime: "10 分钟",
    status: "upcoming",
    tags: ["中断", "超时", "关闭"],
    keyIdea: "取消一次等待，并不自动等于底层工作已经停止。",
    sections: [],
    questions: []
  },
  {
    slug: "liveness-and-measurement",
    week: 8,
    title: "活性、竞争与诚实的度量",
    dek: "诊断死锁与饥饿，再度量延迟与吞吐量，避免把速度误当作正确性。",
    readTime: "12 分钟",
    status: "upcoming",
    tags: ["死锁", "竞争", "测试"],
    keyIdea: "正确性证据与性能证据回答的是不同问题。",
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
    weeks: "第 1–8 周",
    title: "并发执行基础",
    question:
      "我能证明并发 Java 代码是安全的、有活性的、有界的，并且可以停止吗？",
    outcome:
      "一个具有任务状态、租户上限、取消、过载行为与压力测试的有界执行器。",
    topics: [
      "共享状态与 Java 内存模型",
      "锁、原子类、条件变量与许可",
      "有界执行器与背压",
      "取消、关闭与活性"
    ]
  },
  {
    id: "02",
    weeks: "第 9–16 周",
    title: "运行时与数据系统执行",
    question:
      "我能解释并度量执行器如何与 JVM、操作系统、远程调用、查询流水线和 CDC 交互吗？",
    outcome:
      "可观测的查询与 CDC 工作负载、公平调度、运行时证据，以及明确的重试/去重规则。",
    topics: [
      "线程、调度、JVM 内存与 GC",
      "截止时间与远程失败",
      "查询流水线与租户公平性",
      "CDC 延迟、投递语义与幂等性"
    ]
  },
  {
    id: "03",
    weeks: "第 17–24 周",
    title: "可靠的面向 AI 数据毕业项目",
    question:
      "在 AI 推理开始前，我能让上下文交付具有确定性、可观测性与可信性吗？",
    outcome:
      "具备权限意识的上下文任务、新鲜度与溯源、故障演练、容量报告和技术答辩。",
    topics: [
      "检索前先做权限校验",
      "新鲜度、模式与溯源",
      "指标、追踪与故障注入",
      "正确性审计与容量答辩"
    ]
  }
];
