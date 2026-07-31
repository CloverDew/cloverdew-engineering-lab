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

export type LessonLearningBlockKind =
  | "orientation"
  | "misconception"
  | "experiment"
  | "mechanism"
  | "api-decision"
  | "implementation"
  | "distributed-boundary"
  | "checkpoint";

/**
 * 按学习者应当进行的推理顺序渲染的渐进式学习单元：
 * 定位、预测、观察、解释、实现，再检查边界。
 *
 * 尚未迁移到该格式的课程仍使用兼容的 `sections` 与 `questions` 模型。
 */
export type LessonLearningBlock = {
  kind: LessonLearningBlockKind;
  eyebrow: string;
  title: string;
  body: string[];
  bullets?: string[];
  goal?: string;
  prediction?: string;
  observation?: string;
  prerequisites?: string[];
  conceptMap?: {
    label: string;
    relation: string;
  }[];
  invariant?: string;
  code?: string;
  codeLabel?: string;
  codeKind?: "runnable" | "broken-runnable" | "excerpt" | "pseudocode";
  /**
   * 代码块实际依赖的运行时。未设置时沿用 Java 课程的 `javaVersion`。
   * Flink、SQL、YAML 与命令行实验不应被错误标成普通 Java 示例。
   */
  runtime?: string;
  javaVersion?: string;
  runCommand?: string;
  expectedOutput?: string[];
  trace?: {
    thread: string;
    action: string;
    state: string;
  }[];
  apiOptions?: {
    api: string;
    useWhen: string;
    guarantees: string;
    doesNotGuarantee: string;
  }[];
  task?: string;
  constraints?: string[];
  hints?: string[];
  solution?: string;
  adversarialTest?: string;
  localGuarantee?: string;
  breaksWith?: string;
  alternatives?: string[];
  checkpoint?: {
    prompt: string;
    hint?: string;
    answer?: string[];
    successCriteria: string[];
  };
};

export type LessonReference = {
  title: string;
  href: string;
  note: string;
};

export type Lesson = {
  slug: string;
  week: number;
  /**
   * 旧课程默认属于 Java 并发路径；新增路径必须显式声明，避免课次导航串线。
   */
  track?: "java-concurrency" | "flink-mastery";
  title: string;
  dek: string;
  readTime: string;
  status: "published" | "upcoming";
  tags: string[];
  searchTerms?: string[];
  keyIdea: string;
  /**
   * 为 true 时，动手题的参考实现默认折叠，先让学习者独立推导。
   */
  codeFirst?: boolean;
  sections: LessonSection[];
  questions: LessonQuestion[];
  learningBlocks?: LessonLearningBlock[];
  references?: LessonReference[];
};

export const lessons: Lesson[] = [
  {
    slug: "java-reading-and-runtime-bridge",
    week: 0,
    title: "Java 阅读与运行桥接",
    dek: "先把一段 Java 代码真正读成一次可执行的过程：类如何组织代码、JVM 为什么从 main 开始、局部变量与对象字段分别住在哪里，以及如何用异常和 JUnit 把行为写成可检查的契约。",
    readTime: "42 分钟",
    status: "published",
    tags: ["Java 基础", "main", "对象引用", "异常", "JUnit 5"],
    searchTerms: [
      "class",
      "main",
      "局部变量",
      "实例字段",
      "对象引用",
      "异常",
      "assertEquals",
      "assertThrows"
    ],
    keyIdea:
      "读 Java 时先问三件事：谁调用这段代码、每个变量保存的是值还是引用、失败时调用方能观察到什么。",
    sections: [],
    questions: [],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "第 0 步 · 建立阅读坐标",
        title: "一段 Java 不是从第一行开始，而是从 main 的约定开始",
        goal:
          "能够从一个最小 Java 程序中指出类、main 方法、局部变量和一次方法调用，并知道命令行实际运行了哪个类。",
        prerequisites: [
          "已安装 JDK 21；在终端执行 java --version 能看到 21。",
          "先把下面代码保存为与 public 类同名的 MainMethodDemo.java。"
        ],
        conceptMap: [
          {
            label: "class",
            relation: "定义一组状态和行为；源文件可包含一个同名 public 类"
          },
          {
            label: "main",
            relation: "JVM 启动应用时寻找的入口约定"
          },
          {
            label: "local variable",
            relation: "只在当前方法执行期间可见的名字"
          },
          {
            label: "method call",
            relation: "把控制权交给另一个方法，返回后继续下一行"
          }
        ],
        body: [
          "`.java` 文件只是源码文本，还没有在运行。`javac` 将它编译成 JVM 能加载的 class 文件；`java MainMethodDemo` 启动 JVM，JVM 再调用约定签名为 `public static void main(String[] args)` 的方法。你不必一开始理解 JVM 的全部细节，但必须知道：main 不是魔法，它是启动器与类之间的一份约定。",
          "类像一张蓝图：它把数据（字段）和能操作数据的方法放在一起。`public final class MainMethodDemo` 表示这个文件公开定义了一个不能被继承的类；本课不要求你背下每个修饰符，只要求你能分清“类的定义”与“某次方法调用时临时出现的变量”。",
          "执行代码时，不要从术语开始背。先沿着控制流朗读：JVM 调用 main，main 创建 `learner` 和 `studyDate`，然后调用 `System.out.println` 输出一行文字。"
        ],
        codeLabel: "Java 21 · MainMethodDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.time.LocalDate;

public final class MainMethodDemo {
    private MainMethodDemo() {
    }

    public static void main(String[] args) {
        String learner = "小林";
        LocalDate studyDate = LocalDate.of(2026, 7, 30);

        System.out.println("你好，" + learner + "。今天是 " + studyDate + "。");
    }
}`,
        runCommand:
          "javac --release 21 MainMethodDemo.java && java MainMethodDemo",
        expectedOutput: ["你好，小林。今天是 2026-07-30。"]
      },
      {
        kind: "misconception",
        eyebrow: "第 1 步 · 先修正一个直觉",
        title: "复制引用，不等于复制对象；局部变量也不等于局部对象",
        goal:
          "区分“变量这个名字”与“变量指向的对象”，并能解释为什么一个方法里的局部引用仍可能指向可被别处观察到的对象。",
        prediction:
          "运行前先判断：second.addNote 会不会改变 first 看到的 notes？changeLocalName 会不会改变 main 中的 localName？",
        observation:
          "first 输出新增的笔记，而 localName 仍是小林：前者通过两个引用修改同一对象字段，后者只重新赋值了被调方法自己的参数变量。",
        body: [
          "初学者最容易把 `Notebook second = first` 读成“创建第二本笔记本”。实际上，这一行只复制了一个引用值：`first` 与 `second` 是 main 方法中的两个局部变量，但它们指向同一个 `Notebook` 对象。对象中的 `notes` 字段属于那一个对象，而不属于某一个局部变量名。",
          "反过来，`changeLocalName(localName)` 没有改变调用者里的 `localName`。Java 传递的是值；这里传递的是 String 引用的副本。被调用方法把自己的参数变量重新指向另一个 String，并不会回写调用者的局部变量。String 本身又是不可变的，这让这个例子更容易看清“改变量名”与“改对象状态”的区别。",
          "这个区别会直接通向并发：线程各有自己的方法调用和局部变量，但它们的局部引用可以指向同一个堆对象。下一课的共享状态问题，正是从这里开始的。"
        ],
        trace: [
          {
            thread: "main",
            action: "执行 Notebook second = first",
            state: "栈帧中出现 second；堆中仍只有一个 Notebook 对象"
          },
          {
            thread: "main",
            action: "调用 second.addNote(...)",
            state: "同一个 Notebook 的 notes 字段新增一项"
          },
          {
            thread: "main",
            action: "调用 changeLocalName(localName)",
            state: "被调方法得到自己的参数变量；调用者的 localName 保持不变"
          }
        ],
        codeLabel: "Java 21 · ReferenceAndFieldDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.ArrayList;
import java.util.List;

public final class ReferenceAndFieldDemo {
    private ReferenceAndFieldDemo() {
    }

    public static void main(String[] args) {
        Notebook first = new Notebook("并发");
        Notebook second = first;

        second.addNote("先写不变量");
        System.out.println(first.title() + ":" + first.notes());

        String localName = "小林";
        changeLocalName(localName);
        System.out.println(localName);
    }

    private static void changeLocalName(String name) {
        name = "已改变";
    }

    private static final class Notebook {
        private final String title;
        private final List<String> notes = new ArrayList<>();

        private Notebook(String title) {
            this.title = title;
        }

        private void addNote(String note) {
            notes.add(note);
        }

        private String title() {
            return title;
        }

        private List<String> notes() {
            return List.copyOf(notes);
        }
    }
}`,
        runCommand:
          "javac --release 21 ReferenceAndFieldDemo.java && java ReferenceAndFieldDemo",
        expectedOutput: ["并发:[先写不变量]", "小林"]
      },
      {
        kind: "mechanism",
        eyebrow: "第 2 步 · 用位置解释行为",
        title: "先问数据住在哪里，再问谁能改到它",
        invariant:
          "一个方法想要保持的条件，必须由它拥有或明确保护的状态来支撑；不能只凭变量名看起来“局部”就假定安全。",
        body: [
          "阅读一个方法时，可以画两层图：调用这个方法的栈帧里有参数和局部变量；对象里有实例字段。局部变量的生命周期通常随方法返回结束，而对象只要仍被引用就可以继续存在。这个模型足以解释绝大多数入门级的引用问题，无须先钻进虚拟机实现细节。",
          "字段前面的 `private` 只限制其他类能否直接写出字段名，并不自动让对象不可变或线程安全。真正的封装是：只暴露能维持对象规则的方法，并在方法内验证输入、更新字段和暴露安全的结果。",
          "因此，读代码时请同时圈出两类东西：每次调用独有的局部变量，以及可能被多次调用共同访问的对象字段。后者才是以后需要同步、复制或不可变设计的候选对象。"
        ],
        bullets: [
          "局部变量是一次调用的临时名字，不是“深复制出的对象”。",
          "实例字段属于对象；两个引用指向同一对象时，看见的是同一份字段。",
          "方法参数也是局部变量；Java 把参数值复制给被调方法。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "第 3 步 · 让失败成为正常结果",
        title: "异常不是崩溃按钮，而是方法契约的失败通道",
        goal:
          "能把“输入不符合方法要求”转换成一个带信息的异常，并知道 catch 应该处理自己能够恢复或转换的失败。",
        prediction:
          "预测三个输入会各自走正常返回还是异常分支：\" 18 \"、\"-1\" 与 null。",
        observation:
          "第一个输入得到正常结果；负数与 null 都被转换成带有明确原因的异常输出，而程序没有把无效值伪装为正常年龄。",
        body: [
          "`parseAge` 的正常结果是一个非负整数；null、空白或负数不满足这个契约。与其返回含糊的 -1 或吞掉错误，不如抛出能够说明原因的异常。调用者再在自己的边界决定：显示提示、记录日志、改用默认值，还是让失败继续向上交给框架。",
          "这个例子刻意在 main 中捕获异常，只是为了让你看见输出。生产代码不要写 `catch (Exception ignored)`；那会把真正的失败伪装成成功。也不要为了避免异常而让无效数据静默进入对象状态。"
        ],
        codeLabel: "Java 21 · AgeParserDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.Objects;

public final class AgeParserDemo {
    private AgeParserDemo() {
    }

    public static void main(String[] args) {
        printResult(" 18 ");
        printResult("-1");
        printResult(null);
    }

    private static void printResult(String rawAge) {
        try {
            System.out.println("年龄 = " + parseAge(rawAge));
        } catch (IllegalArgumentException | NullPointerException exception) {
            System.out.println(
                    exception.getClass().getSimpleName() + ": " + exception.getMessage());
        }
    }

    private static int parseAge(String rawAge) {
        String normalized = Objects.requireNonNull(
                rawAge,
                "rawAge 不能为 null").trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("rawAge 不能为空白");
        }

        int age = Integer.parseInt(normalized);
        if (age < 0) {
            throw new IllegalArgumentException("age 不能小于 0");
        }
        return age;
    }
}`,
        runCommand:
          "javac --release 21 AgeParserDemo.java && java AgeParserDemo",
        expectedOutput: [
          "年龄 = 18",
          "IllegalArgumentException: age 不能小于 0",
          "NullPointerException: rawAge 不能为 null"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "第 4 步 · 把判断交给测试",
        title: "JUnit 断言：把“应该正确”写成可执行的句子",
        body: [
          "手动运行只能覆盖你恰好输入的几个值。JUnit 中的 `assertEquals` 写出预期结果，`assertThrows` 写出预期失败；测试通过只说明这些明确的契约仍成立，测试失败会把偏差定位到一个可复现的例子。",
          "下面的测试将被测类放在测试文件的嵌套类中，便于复制运行。真实项目通常把 `RetryLimitParser` 放在 `src/main/java`，把 `RetryLimitParserTest` 放在 `src/test/java`；确认 Maven 项目已经配置 Java 21 和 JUnit 5 后，再运行下方命令。断言的阅读方式不变：先读期望，再读输入，最后读被调用的方法。"
        ],
        codeLabel: "Java 21 · JUnit 5 · RetryLimitParserTest.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

final class RetryLimitParserTest {
    @Test
    void parsesNonNegativeRetryLimit() {
        assertEquals(3, RetryLimitParser.parse("3"));
    }

    @Test
    void rejectsNegativeRetryLimit() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> RetryLimitParser.parse("-1"));

        assertEquals("retryLimit 不能为负数", exception.getMessage());
    }

    private static final class RetryLimitParser {
        private RetryLimitParser() {
        }

        private static int parse(String rawRetryLimit) {
            int retryLimit = Integer.parseInt(rawRetryLimit);
            if (retryLimit < 0) {
                throw new IllegalArgumentException("retryLimit 不能为负数");
            }
            return retryLimit;
        }
    }
}`,
        runCommand: "mvn -Dtest=RetryLimitParserTest test",
        expectedOutput: ["Tests run: 2, Failures: 0, Errors: 0"],
        checkpoint: {
          prompt:
            "不看答案，解释第二个测试为什么既检查了异常类型，又检查了异常消息。若只写 assertThrows，还漏掉了什么？",
          hint:
            "先把“发生了失败”与“失败是否符合调用方需要的契约”分开。",
          answer: [
            "assertThrows 确认无效输入没有被静默接受，并取得异常对象；随后 assertEquals 确认失败原因仍是调用方约定的那一种。",
            "只检查异常类型仍可能让错误信息、校验位置或业务原因悄悄退化；但也不要为了测试文案而把每个实现细节都冻结。"
          ],
          successCriteria: [
            "能指出 class、main、局部变量、字段和引用各自扮演的角色。",
            "能解释为什么 second.addNote 会影响 first，而重新给参数 name 赋值不会影响 localName。",
            "能读懂一个 assertEquals 与一个 assertThrows 分别在声明什么契约。"
          ]
        }
      }
    ]
  },
  {
    slug: "threads-and-shared-state",
    week: 1,
    title: "进程、线程与第一个共享状态错误",
    dek: "先画清进程、JVM、线程、栈和堆的边界，再亲手复现 count++ 的丢失更新，用 synchronized 写出第一个可证明的单 JVM 修复。",
    readTime: "48 分钟",
    status: "published",
    tags: ["进程", "线程", "共享状态", "竞态条件", "synchronized"],
    searchTerms: [
      "进程",
      "JVM",
      "线程",
      "栈",
      "堆",
      "count++",
      "竞态条件",
      "synchronized",
      "Thread.join",
      "JUnit 5"
    ],
    keyIdea:
      "线程安全要保护的是共享业务状态的不变量；先让读—改—写成为一个原子转移，再讨论更高层的并发工具。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "第 1 步 · 先画边界",
        title: "进程、JVM 与线程不是同一个东西",
        goal:
          "能够说明一段 Java 服务代码属于哪个进程、哪个 JVM，以及为什么两个线程既能各自执行方法，又能看到同一个对象。",
        prerequisites: [
          "已完成第 0 周，能区分局部变量、对象字段与引用。",
          "先运行下面程序，观察同一进程 ID 下的两个线程名。"
        ],
        conceptMap: [
          {
            label: "进程",
            relation: "由操作系统创建；有自己的地址空间、进程 ID 与资源边界"
          },
          {
            label: "JVM",
            relation: "运行在一个 Java 进程内；加载类并管理 Java 对象"
          },
          {
            label: "线程",
            relation: "JVM 内的一条执行路径；每条线程有自己的调用栈"
          },
          {
            label: "堆对象",
            relation: "同一 JVM 的线程可以通过引用共同访问"
          }
        ],
        body: [
          "程序文件不是进程。你在终端或容器中启动 Java 应用时，操作系统先创建一个进程；JVM 在这个进程内启动并调用 main。一个部署实例通常对应一个进程，但这是一种部署约定，不是 Java 语法本身。",
          "main 在初始线程上运行。调用 `Thread.start()` 后，JVM 调度另一条线程执行任务；它不是第二个 JVM，也不是第二个独立服务。线程之间共享同一个进程的资源与 JVM 堆，却各自拥有方法调用所需的栈帧。",
          "“高并发”只说明同时抵达或执行的工作很多，不保证结果正确。我们本课只研究最小问题：两个或多个线程怎样错误地更新同一个 int 字段。"
        ],
        codeLabel: "Java 21 · RuntimeBoundaryDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.CountDownLatch;

public final class RuntimeBoundaryDemo {
    private RuntimeBoundaryDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        long processId = ProcessHandle.current().pid();
        System.out.println("process=" + processId
                + ", thread=" + Thread.currentThread().getName());

        CountDownLatch workerFinished = new CountDownLatch(1);
        Thread worker = new Thread(() -> {
            System.out.println("process=" + ProcessHandle.current().pid()
                    + ", thread=" + Thread.currentThread().getName());
            workerFinished.countDown();
        }, "counter-worker");

        worker.start();
        workerFinished.await();
        worker.join();
    }
}`,
        runCommand:
          "javac --release 21 RuntimeBoundaryDemo.java && java RuntimeBoundaryDemo",
        expectedOutput: [
          "输出两行；两行 process 的数字相同。",
          "第一行 thread=main，第二行 thread=counter-worker。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "第 2 步 · 先预测，再运行",
        title: "四个线程各做 100,000 次 value++，结果一定是 400,000 吗？",
        goal:
          "在运行前写下预测，并理解一次恰好得到正确数字不能证明代码线程安全。",
        prediction:
          "很多人会预测 actual 总是 400000，因为四个线程“都已经执行了加一”。请先写下你的理由，再运行至少五次。",
        observation:
          "你可能看到小于 400000 的 actual，也可能偶尔恰好等于 400000。前者足以证明存在竞态；后者只说明这一次的调度没有把问题暴露出来。",
        body: [
          "`value++` 在源码中很短，却不是一个不可分割的业务转移。它需要读出旧值、计算新值、写回字段。若不同线程在这三步之间交错，就可能做了两次工作，最后却只留下了一次增长。",
          "下面程序用起跑闸门尽量让工作线程同时开始，并用 `join` 确保 main 在读取前等待它们结束。它仍不保证每次都复现错误；真实并发错误恰恰常常如此：偶发，却可以造成已经完成的业务动作被少记。",
          "把这个例子看成规格问题，而不是“机器太慢”。规格是：所有工作线程结束后，计数必须等于成功调用 increment 的次数。任何小于期望值的结果都是非法状态。"
        ],
        invariant:
          "所有工作线程 join 返回后，value 必须等于所有成功 increment 调用的总次数。",
        codeLabel: "Java 21 · UnsafeCounterDemo.java",
        codeKind: "broken-runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.CountDownLatch;

public final class UnsafeCounterDemo {
    private static final int WORKER_COUNT = 4;
    private static final int INCREMENTS_PER_WORKER = 100_000;

    private UnsafeCounterDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        UnsafeCounter counter = new UnsafeCounter();
        CountDownLatch start = new CountDownLatch(1);
        Thread[] workers = new Thread[WORKER_COUNT];

        for (int workerIndex = 0; workerIndex < WORKER_COUNT; workerIndex++) {
            workers[workerIndex] = new Thread(() -> {
                await(start);
                for (int increment = 0;
                        increment < INCREMENTS_PER_WORKER;
                        increment++) {
                    counter.increment();
                }
            }, "unsafe-worker-" + workerIndex);
        }

        for (Thread worker : workers) {
            worker.start();
        }
        start.countDown();
        for (Thread worker : workers) {
            worker.join();
        }

        int expected = WORKER_COUNT * INCREMENTS_PER_WORKER;
        System.out.println("expected=" + expected + ", actual=" + counter.get());
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AssertionError("启动闸门被中断", exception);
        }
    }

    private static final class UnsafeCounter {
        private int value;

        private void increment() {
            value++;
        }

        private int get() {
            return value;
        }
    }
}`,
        runCommand:
          "javac --release 21 UnsafeCounterDemo.java && java UnsafeCounterDemo",
        expectedOutput: [
          "每次都输出 expected=400000。",
          "actual 可能小于 400000；即使偶尔等于 400000，也不能作为安全性证明。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "第 3 步 · 构造最坏交错",
        title: "对抗性 JUnit 5 测试：让两个线程都先读到 0",
        goal:
          "不依赖运气复现丢失更新，并理解“这个测试通过”表示我们成功证明了坏实现会到达错误状态。",
        prediction:
          "如果两个线程都在写回前读取 value=0，它们最后各自写入的会是什么值？先不要看断言。",
        observation:
          "测试稳定通过，且最终值是 1。它不是在证明实现正确，而是在稳定构造一个违反“两个加一后应为 2”的执行交错。",
        body: [
          "压力测试有价值，但它把是否失败交给调度器。学习机制时，我们可以在读取与写回之间放一个 `CyclicBarrier`：两个任务都读完旧值才允许继续。这样测试的目标不是测性能，而是把本来偶发的竞态压缩成可重复的反例。将文件放进已配置 Java 21 和 JUnit 5 的 Maven 项目的 `src/test/java` 后，再运行下方命令。",
          "请特别留意断言是 `assertEquals(1, counter.get())`。在这份“失败证明”里，1 是预期观察值；它说明两个加一已经被安排成一次丢失更新。修复后，我们会换成测试安全实现且断言为 2。"
        ],
        codeLabel: "Java 21 · JUnit 5 · CoordinatedCounterTest.java",
        codeKind: "broken-runnable",
        javaVersion: "Java 21",
        code: `import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;

final class CoordinatedCounterTest {
    @Test
    void losesOneUpdateWhenBothThreadsReadBeforeEitherWrites() throws Exception {
        CoordinatedUnsafeCounter counter = new CoordinatedUnsafeCounter();

        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            Future<?> first = executor.submit(counter::increment);
            Future<?> second = executor.submit(counter::increment);

            first.get();
            second.get();
        }

        assertEquals(1, counter.get());
    }

    private static final class CoordinatedUnsafeCounter {
        private final CyclicBarrier bothThreadsRead = new CyclicBarrier(2);
        private int value;

        private void increment() {
            int observed = value;
            awaitBothReaders();
            value = observed + 1;
        }

        private int get() {
            return value;
        }

        private void awaitBothReaders() {
            try {
                bothThreadsRead.await();
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new AssertionError("测试线程被中断", exception);
            } catch (BrokenBarrierException exception) {
                throw new AssertionError("起跑屏障损坏", exception);
            }
        }
    }
}`,
        runCommand: "mvn -Dtest=CoordinatedCounterTest test",
        expectedOutput: [
          "Tests run: 1, Failures: 0, Errors: 0。",
          "通过表示反例被稳定复现：两个 increment 的最终值仍是 1。"
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "第 4 步 · 解释刚才看见的现象",
        title: "私有栈保存各自读到的旧值，共享堆字段被最后一次写回覆盖",
        invariant:
          "两个已完成的 increment 必须让 value 从 0 变为 2；若最终为 1，说明一次状态转移被覆盖。",
        body: [
          "线程 A 与线程 B 各有自己的调用栈，因此各自可以保存局部变量 `observed`。但 `value` 是同一个 Counter 对象的字段；只要两个线程持有这个对象的引用，它们修改的就是同一份状态。",
          "把 `value++` 展开后，问题就不神秘了：A 读 0，B 也读 0；A 写 1，B 也写 1。没有任何线程做错加法，错误在于“从旧值到新值”的完整转移没有被作为一个整体保护。",
          "这里先只谈原子性。后续课程会分别讨论可见性、有序性和其他并发 API；不要把还没学的工具当作魔法答案。当前最小目标只是让一次读—改—写不能与另一条同类转移交错。"
        ],
        trace: [
          {
            thread: "线程 A",
            action: "读取共享字段 value",
            state: "堆：value=0；A 栈：observed=0"
          },
          {
            thread: "线程 B",
            action: "读取同一个共享字段 value",
            state: "堆：value=0；B 栈：observed=0"
          },
          {
            thread: "线程 A",
            action: "计算并写回 observed + 1",
            state: "堆：value=1"
          },
          {
            thread: "线程 B",
            action: "计算并写回 observed + 1",
            state: "堆：value=1，而不是 2"
          }
        ],
        bullets: [
          "局部变量 `observed` 私有，不代表它所读的字段 `value` 私有。",
          "一次运行没有失败，不代表所有可能交错都安全。",
          "正确性证明要覆盖允许的交错，而不是只看一次输出。"
        ]
      },
      {
        kind: "api-decision",
        eyebrow: "第 5 步 · 先选最小而明确的工具",
        title: "synchronized：让同一对象上的完整状态转移互斥进行",
        goal:
          "知道为什么第一个修复选择 synchronized，而不是先堆叠更复杂的并发 API。",
        invariant:
          "对同一个 SynchronizedCounter 对象，任意时刻最多一个线程可以执行 increment 的读—改—写临界区。",
        body: [
          "`synchronized` 不是给一个 int 加上“线程安全”标签。它使用一个监视器：同一时刻，只有拿到同一把监视器的线程能进入临界区。把整个 `value++` 放进同一个受保护区域，第二个线程就必须等第一个线程写回后再读取。",
          "实例同步方法使用当前对象作为监视器。因此所有工作线程必须调用同一个 Counter 实例；如果各自 new 了一个 Counter，它们拿到的是不同监视器，彼此不会协调。临界区应短小，只放维持不变量所需的内存操作，不要把慢速网络或磁盘 I/O 塞进去。",
          "本课刻意不把 `ConcurrentHashMap`、`AtomicInteger` 或单例模式混进来。ConcurrentHashMap 解决的是映射操作的并发契约，不是任意 int 字段；AtomicInteger 要建立在 CAS 与失败重试的理解上；懒汉、饿汉和 enum 单例回答的是“对象是否只创建一次、如何安全发布”，并不能修复两个线程对同一个计数器的读—改—写。先掌握这一把最小的锁，后面才能准确判断何时该换工具。"
        ],
        apiOptions: [
          {
            api: "synchronized",
            useWhen: "同一个 JVM 内，多个线程需要把同一对象的多个读写动作合成一个不可分割的状态转移。",
            guarantees: "使用同一监视器的临界区互斥；一个线程退出临界区后，后来取得同一监视器的线程可以观察到此前的写入。",
            doesNotGuarantee: "不同对象、不同 JVM、数据库或网络请求之间的原子性；也不让长时间阻塞操作变得便宜。"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "第 6 步 · 先独立实现，再对照",
        title: "用 synchronized 写出第一个可验证的安全计数器",
        task:
          "先自己写一个 SynchronizedCounter：私有 int 字段、同步 increment、同步 get；再让四个线程对同一个实例各加 100,000 次，并在 join 后检查结果。",
        constraints: [
          "不要用 Thread.sleep 猜测线程是否结束；必须使用 join。",
          "所有工作线程必须共享同一个 SynchronizedCounter 实例。",
          "同步边界必须覆盖完整的读—改—写，而不是只锁 get 或只锁 set。"
        ],
        hints: [
          "第一层：把 value 声明为私有字段，让外部只能通过方法改变它。",
          "第二层：给 increment 与 get 加 synchronized；它们会使用同一个 this 监视器。",
          "第三层：先 start 所有线程，再逐个 join，最后才读取并断言结果。"
        ],
        body: [
          "先暂停，在不看完整实现的情况下写十分钟。你要证明的不是“代码看起来加了锁”，而是：所有线程都使用同一个对象，所有 increment 都必须经过同一监视器，并且 main 在检查前已经等待所有工作完成。",
          "下面实现保持了与坏例子相同的负载，因此输出差异只来自同步边界。`get` 也同步，使这个对象的读取协议完整；本例中 join 已保证 main 等到写入结束，但统一协议会让以后复用该类时更不容易误用。"
        ],
        codeLabel: "Java 21 · SynchronizedCounterDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.ArrayList;
import java.util.List;

public final class SynchronizedCounterDemo {
    private static final int WORKER_COUNT = 4;
    private static final int INCREMENTS_PER_WORKER = 100_000;

    private SynchronizedCounterDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        SynchronizedCounter counter = new SynchronizedCounter();
        List<Thread> workers = new ArrayList<>();

        for (int workerIndex = 0; workerIndex < WORKER_COUNT; workerIndex++) {
            Thread worker = new Thread(() -> {
                for (int increment = 0;
                        increment < INCREMENTS_PER_WORKER;
                        increment++) {
                    counter.increment();
                }
            }, "safe-worker-" + workerIndex);
            workers.add(worker);
        }

        for (Thread worker : workers) {
            worker.start();
        }
        for (Thread worker : workers) {
            worker.join();
        }

        int expected = WORKER_COUNT * INCREMENTS_PER_WORKER;
        int actual = counter.get();
        if (actual != expected) {
            throw new AssertionError("expected=" + expected + ", actual=" + actual);
        }
        System.out.println("expected=" + expected + ", actual=" + actual);
    }

    private static final class SynchronizedCounter {
        private int value;

        private synchronized void increment() {
            value++;
        }

        private synchronized int get() {
            return value;
        }
    }
}`,
        runCommand:
          "javac --release 21 SynchronizedCounterDemo.java && java SynchronizedCounterDemo",
        expectedOutput: ["expected=400000, actual=400000"]
      },
      {
        kind: "distributed-boundary",
        eyebrow: "第 7 步 · 不要把 JVM 内的保证误当成集群保证",
        title: "三个实例各自同步，为什么全局计数仍可能错？",
        localGuarantee:
          "同一个 JVM 中，所有线程通过同一个 SynchronizedCounter 对象调用方法时，计数不会因本地线程交错而丢失更新。",
        breaksWith:
          "部署三个服务实例后会有三个进程、三个 JVM、三个堆和三个 Counter 对象。每个实例都可以安全地从 0 计到 10，但集群实际上已经处理了 30 次；它们没有共享同一把 Java 监视器。",
        alternatives: [
          "若需要全局硬性上限，让一个权威存储执行带条件的更新，并把成功或失败作为唯一结果。",
          "若状态天然可按业务键划分，让同一键始终交给一个明确的单写者或分区所有者。",
          "先写清需要的是强一致的准入、最终汇总的指标，还是允许短暂超额的近似计数；三者的协议和成本不同。"
        ],
        body: [
          "本地同步与分布式一致性解决的不是同一层问题。`synchronized` 的协调对象是内存中的一个监视器，而内存不会跨越进程边界复制成同一份。容器重启、扩容、负载均衡和网络分区都会让“某一个本地对象”不再是全局权威。",
          "这不是说本地锁没有价值。每个实例仍必须先保证自己的内存状态不被本地线程损坏；然后再根据业务不变量选择跨实例协议。先分清边界，才能避免把一把 JVM 锁误用成集群锁。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "第 8 步 · 不看代码复述",
        title: "用自己的话证明：哪里共享、哪里私有、哪里失效",
        body: [
          "先口头回答，再展开提示。若你能不用“因为 synchronized 很安全”这种空泛说法，而是指出对象、监视器、读—改—写与进程边界，你就已经在建立工程上的因果模型。",
          "最后把 SafeCounter 中的 synchronized 暂时删掉，重新运行；再加回来。这个小破坏实验比背定义更能让你记住：修复保护的是一个不变量，不是一行语法。"
        ],
        checkpoint: {
          prompt:
            "请画出线程 A、线程 B 的两份栈帧和一个 Counter 堆对象，解释 value++ 为什么能从 0 变成 1；随后说明 synchronized 改变了哪一步。最后回答：部署三个实例时，这个保证为什么失效？",
          hint:
            "按“局部 observed 在哪里、字段 value 在哪里、谁拿的是同一把监视器、哪个边界不再共享内存”的顺序回答。",
          answer: [
            "A 与 B 各自的栈帧可同时保存 observed=0，而两者都写同一个 Counter.value。没有互斥时，两次写回都可能是 1。",
            "synchronized 要求使用同一 Counter 实例的线程轮流完成读—改—写，因此后进入的线程会读到前一个线程写好的新值。",
            "多实例拥有不同 JVM 堆和不同监视器；本地同步不能决定另一个进程何时读取或写入其本地计数。"
          ],
          successCriteria: [
            "能区分进程、JVM、线程、线程栈和共享堆对象。",
            "能给出一个具体交错，而不是只说“多线程会乱”。",
            "能说明 synchronized 的原子边界是同一对象监视器保护的完整临界区。",
            "能明确说出该保证止于单 JVM，并提出至少一种跨实例的权威状态方案。"
          ]
        }
      }
    ],
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
    title: "happens-before：另一个线程凭什么看见这次写入",
    dek: "main 明明写了 true，工作线程为什么还能继续转？从这段反直觉代码出发，沿着 volatile、锁、start 与 join 画出一条真正可证明的可见性链。",
    readTime: "38 分钟",
    status: "published",
    tags: ["JMM", "volatile", "可见性"],
    searchTerms: [
      "happens-before",
      "先行发生",
      "内存可见性",
      "安全发布",
      "中断",
      "Thread.start",
      "Thread.join",
      "CountDownLatch"
    ],
    keyIdea:
      "执行得更早，不等于另一个线程一定看得见；只有建立 happens-before 关系，前一个操作的结果才被保证对后一个操作可见。",
    references: [
      {
        title: "JLS 17.4.5 · Happens-before Order",
        href: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4.5",
        note: "happens-before 的正式定义、传递性，以及数据竞争的判定依据。"
      },
      {
        title: "JLS 17.4.4 · Synchronization Order",
        href: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4.4",
        note: "volatile、监视器、start、终止检测与中断等 synchronizes-with 规则。"
      },
      {
        title: "Java 21 · java.util.concurrent 包规范",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html",
        note: "Executor、Future、并发集合和同步器所提供的内存一致性效果。"
      },
      {
        title: "Java 21 · Thread API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html",
        note: "start、join、中断及线程生命周期方法的精确契约。"
      }
    ],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "第 1 步 · 从一个具体问题开始",
        title: "main 已经写了 true，工作线程为什么还可能继续转？",
        goal:
          "看到跨线程读写时，先指出“谁写、谁读”，再检查两者之间有没有明确的同步关系。",
        prerequisites: [
          "已完成共享状态课程，知道两个线程可以访问同一个对象字段。",
          "先只判断这段代码有没有可靠的停止保证，不要求它每次都复现死循环。"
        ],
        conceptMap: [
          {
            label: "main 线程",
            relation: "执行 stopped = true，发出停止请求"
          },
          {
            label: "普通 boolean",
            relation: "有共享读写，但没有建立同步关系"
          },
          {
            label: "worker 线程",
            relation: "反复读取 stopped，却不保证看见这次写入"
          }
        ],
        body: [
          "先把问题说简单：main 线程把 `stopped` 改成了 `true`，工作线程还在 `while (!stopped)` 里检查它。按日常时间顺序看，写入明明已经发生；但 Java 需要回答的是另一件事：工作线程是否被保证看见这次写入。",
          "这里的 `stopped` 是普通字段。一个线程写，另一个线程读，中间没有 `volatile`、锁或其他同步动作，因此存在数据竞争。程序偶尔能停，只能说明这一次运行看见了新值，不能说明每次运行都必须看见。",
          "所以以后看到跨线程状态，先别问“它大概多久能看见”，先问“代码里哪条规则保证它能看见”。这正是 happens-before 要解决的问题。"
        ],
        codeLabel: "Java 21 · PlainStopFlag.java",
        codeKind: "excerpt",
        javaVersion: "Java 21",
        code: `final class PlainStopFlag {
    private boolean stopped;

    void runLoop() {
        while (!stopped) {
            Thread.onSpinWait();
        }
    }

    void requestStop() {
        stopped = true;
    }
}`
      },
      {
        kind: "misconception",
        eyebrow: "第 2 步 · 先拆掉时间直觉",
        title: "“写在前、读在后”，还不是并发正确性的证明",
        goal:
          "区分墙上时钟看到的先后顺序，与 Java 内存模型提供的可见性保证。",
        prediction:
          "假设日志显示 requestStop() 在 10:00:00 执行，工作线程在 10:00:01 仍在循环。这条时间线能否单独证明工作线程必须读到 true？",
        observation:
          "不能。时间线只记录两个动作何时发生，没有为这次普通字段的写与读建立 Java 内存模型中的顺序关系。",
        body: [
          "在同一线程里，我们可以按程序顺序阅读代码；跨到另一个线程后，仅凭“它后来才执行”还不够。没有同步时，编译器、运行时和处理器可以采用不会破坏单线程语义的优化，另一个线程也就可能继续使用旧值。",
          "JIT 可能把循环中的重复读取当成不变值来处理；硬件也不需要把普通读写表现成一条即时通知。具体机器这次做了哪种优化并不是证明重点，重点是 Java 没有给这段代码可依赖的跨线程保证。",
          "打印日志、打断点或 `Thread.sleep` 常常会改变编译与调度时机，让问题暂时消失。它们可以帮助观察，却不能补上缺失的同步关系。"
        ],
        bullets: [
          "时间上先发生，不等于 happens-before。",
          "多跑几次都成功，不等于所有合法执行都安全。",
          "`Thread.onSpinWait()` 是性能提示，不是可见性保证。",
          "`Thread.sleep()` 只让当前线程暂停，不负责发布数据。"
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "第 3 步 · 把定义说成人话",
        title: "A happens-before B：在 B 看来，A 的结果保证可见",
        invariant:
          "若 A happens-before B，A 的效果必须对 B 可见，并且 A 的顺序排在 B 之前；若读取目标还可能被其他线程竞争写入，仍要把那些写入一起纳入证明。",
        conceptMap: [
          {
            label: "A：准备数据",
            relation: "先完成普通字段写入"
          },
          {
            label: "同步动作",
            relation: "用同一把锁、同一 volatile 字段或线程生命周期建立边"
          },
          {
            label: "B：使用数据",
            relation: "在边的另一端读取，获得可见性保证"
          }
        ],
        body: [
          "Java 语言规范的核心意思很短：如果 A happens-before B，那么 A 的效果对 B 可见，而且 A 排在 B 之前。中文常译为“先行发生”，但学习时可以先把它读成一句问题：B 凭什么看得见 A 做过的事？这不是说 B 无条件读取到 A 写入的那个具体值；若中间还有别的合法写入，读取仍要结合完整顺序判断。",
          "它描述的是程序允许出现哪些结果，不是在预测操作系统先调度谁。JVM 仍然可以重排真正执行的指令，只要任何线程最终观察到的结果都符合 happens-before 规则。",
          "这条关系还能传递：若“写数据”在“发布标志”之前，而“发布标志”又 happens-before “读到标志”，那么前面的数据写入也 happens-before 读取方后续的动作。安全发布就是利用这条传递链。"
        ],
        bullets: [
          "同一线程中，前面的动作 happens-before 后面的动作。",
          "同一监视器上的 unlock happens-before 后续 lock。",
          "同一 volatile 字段的写 happens-before 后续读。",
          "`Thread.start()` 之前的动作 happens-before 新线程中的动作。",
          "工作线程中的动作 happens-before 另一个线程确认它已终止，例如从无超时 `join()` 返回。",
          "同一变量上的冲突访问若没有按 happens-before 排序，就构成数据竞争；至少有一个访问必须是写。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "第 4 步 · 跑一条完整的可见性链",
        title: "读到 ready=true 时，为什么 result 也必须是 42？",
        goal:
          "沿着程序顺序、volatile 写与 volatile 读，完整说出一条 happens-before 传递链。",
        prediction:
          "生产者先写 result=42，再写 ready=true。消费者读到 ready=true 后打印 result；它还能打印 0 吗？先画箭头，再运行。",
        observation:
          "不能。消费者一旦读到这次 volatile 写入的 true，生产者此前对 result 的写入也被发布给了消费者，因此输出必须是 result=42。",
        invariant:
          "消费者观察到 ready=true 后，必须同时观察到发布该标志之前完成的 result=42。",
        body: [
          "`volatile` 的重点不是一句含糊的“每次都去主内存读”，而是同一个字段上的写与后续读建立了 happens-before。生产者先写普通字段 `result`，再写 `ready`；消费者先读到 `ready`，再读 `result`，两边由程序顺序和 volatile 规则连成一条链。",
          "顺序不能反过来。如果生产者先写 `ready=true`，再计算 `result`，volatile 只会发布它之前已经完成的动作，不会替未来的写入补保证。",
          "下面程序使用 `join` 只是让 main 等待两个线程结束；真正让消费者看见 `result=42` 的，是同一 `ready` 字段上的 volatile 写与读。"
        ],
        trace: [
          {
            thread: "producer",
            action: "普通写：result = 42",
            state: "结果已经准备好"
          },
          {
            thread: "producer",
            action: "volatile 写：ready = true",
            state: "发布此前的 result 写入"
          },
          {
            thread: "consumer",
            action: "volatile 读：观察到 ready == true",
            state: "与发布动作建立 happens-before"
          },
          {
            thread: "consumer",
            action: "普通读：读取 result",
            state: "保证得到 42"
          }
        ],
        codeLabel: "Java 21 · VolatilePublicationDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `public final class VolatilePublicationDemo {
    private static int result;
    private static volatile boolean ready;

    private VolatilePublicationDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        Thread consumer = new Thread(() -> {
            while (!ready) {
                Thread.onSpinWait();
            }
            System.out.println("result=" + result);
        }, "consumer");

        Thread producer = new Thread(() -> {
            result = 42;
            ready = true;
        }, "producer");

        consumer.start();
        producer.start();
        producer.join();
        consumer.join();
    }
}`,
        runCommand:
          "javac --release 21 VolatilePublicationDemo.java && java VolatilePublicationDemo",
        expectedOutput: ["result=42"]
      },
      {
        kind: "api-decision",
        eyebrow: "第 5 步 · 按正在等待的事件选工具",
        title: "要发布标志、保护状态，还是等待任务完成？",
        goal:
          "不靠背诵 API 名称，而是根据需要建立的 happens-before 边选择工具。",
        body: [
          "常见规则不必背成一张孤立清单。先说清两个动作：谁产生结果，谁需要看到结果；再选能把这两个动作连起来的 API。",
          "`volatile` 适合发布一个独立标志或不可变快照；锁适合同时保护多个字段或复合操作；`start` 负责把启动前的数据交给新线程；`join` 或 `Future.get()` 负责在任务完成后安全读取结果。",
          "可见性也不等于原子性。即使 `count` 是 volatile，`count++` 仍包含读取、计算和写回，两个线程依然可能覆盖彼此的更新。"
        ],
        apiOptions: [
          {
            api: "volatile",
            useWhen: "一个线程发布标志，或替换一个已经构造完成的不可变快照。",
            guarantees: "同一 volatile 字段的写 happens-before 后续读，并带上写入前已经完成的普通字段更新。",
            doesNotGuarantee: "复合操作原子性、多个字段的不变量，也不会唤醒卡在阻塞调用里的线程。"
          },
          {
            api: "synchronized / Lock",
            useWhen: "多个读写动作必须作为一个整体完成，或多个字段共同维护一个不变量。",
            guarantees: "同一把锁的释放 happens-before 后续获取；同时提供临界区互斥。",
            doesNotGuarantee: "不同锁、不同对象或不同 JVM 之间的协调。"
          },
          {
            api: "Thread.start",
            useWhen: "创建者已经准备好任务和配置，现在要把它们交给新线程。",
            guarantees: "调用 start 之前的动作 happens-before 新线程中的动作。",
            doesNotGuarantee: "start 之后的新修改，也不表示新线程已经完成。"
          },
          {
            api: "Thread.join / Future.get",
            useWhen: "调用方要等待工作完成，然后读取工作线程产生的结果。",
            guarantees: "`join()` 确认线程终止或 `Future.get()` 取得结果后，工作中的动作 happens-before 调用方随后读取结果。",
            doesNotGuarantee: "带超时的等待一返回就表示工作已经完成，也不代表远端任务已经完成或取消。"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "第 6 步 · 自己补全停止协议",
        title: "把“请停止”写成可见的请求，再给等待设上限",
        task:
          "先自己实现一个 StoppableWorker：用 volatile 保存停止请求，用 CountDownLatch 证明线程已经开始运行，并让 main 在发出请求后进行有上限的 join。",
        constraints: [
          "不要用 `Thread.sleep()` 猜工作线程是否已经启动。",
          "写入方和读取方必须访问同一个 volatile 字段。",
          "`join` 必须有时间上限；超时后要明确报告线程仍未结束。",
          "这个版本只处理不会长期阻塞的循环；阻塞任务还要配合中断或操作级截止时间。"
        ],
        hints: [
          "第一层：把 `stopRequested` 声明为 volatile。",
          "第二层：run 开始时调用 `started.countDown()`，main 使用有超时的 `await`。",
          "第三层：main 调用 `requestStop()` 后执行 `worker.join(1_000)`，再检查 `isAlive()`。"
        ],
        body: [
          "这里需要两个不同的事实：`started` 证明工作线程已经进入 `run`，`stopRequested` 负责把停止请求交给工作线程。不要把它们混成“等一会儿应该就好了”。",
          "停止请求可见，也不代表线程一定能及时回到检查点。如果循环里会执行 `queue.take()`、I/O 或长时间等待，还需要 `interrupt`、关闭资源或操作级截止时间解除阻塞。",
          "先独立写十分钟，再对照下方完整实现。检查时请逐条指出：哪次写与哪次读建立了关系，main 又凭什么知道线程已经结束。"
        ],
        codeLabel: "Java 21 · StoppableWorkerDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public final class StoppableWorkerDemo {
    private StoppableWorkerDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        StoppableWorker task = new StoppableWorker();
        Thread worker = new Thread(task, "worker");

        worker.start();
        task.awaitStarted();
        task.requestStop();

        worker.join(1_000);
        if (worker.isAlive()) {
            throw new IllegalStateException("worker 未在 1 秒内停止");
        }
        System.out.println("worker stopped");
    }

    private static final class StoppableWorker implements Runnable {
        private final CountDownLatch started = new CountDownLatch(1);
        private volatile boolean stopRequested;

        @Override
        public void run() {
            started.countDown();
            while (!stopRequested) {
                Thread.onSpinWait();
            }
        }

        private void awaitStarted() throws InterruptedException {
            if (!started.await(1, TimeUnit.SECONDS)) {
                throw new IllegalStateException("worker 未在 1 秒内启动");
            }
        }

        private void requestStop() {
            stopRequested = true;
        }
    }
}`,
        runCommand:
          "javac --release 21 StoppableWorkerDemo.java && java StoppableWorkerDemo",
        expectedOutput: ["worker stopped"]
      },
      {
        kind: "distributed-boundary",
        eyebrow: "第 7 步 · 别把本地保证带过网络",
        title: "happens-before 只管一个 JVM，跨服务要靠协议留下证据",
        localGuarantee:
          "在同一个 JVM 中，Java 的 volatile、锁、线程启动与终止规则可以建立可证明的内存可见性关系。",
        breaksWith:
          "另一个服务进程有自己的 JVM 和内存。即使本地代码完全正确，消息仍可能延迟、重复或丢失，数据库副本也可能暂时落后；本地 happens-before 不会跨网络延伸。",
        alternatives: [
          "把数据与“已可见”状态放在同一个数据库事务或原子记录中提交。",
          "为配置和任务结果携带版本，让接收方回报已经持久化或已经应用的版本。",
          "用日志偏移量、幂等键和明确的确认语义表示进度，不用固定 sleep 猜远端已经完成。"
        ],
        body: [
          "线程间通信和服务间通信的提问方式相同：谁产生事实，谁消费事实，中间凭什么保证可见？不同之处在于，跨进程后答案不再是 `volatile` 或 Java 监视器，而是数据库、日志、消息协议和一致性级别。",
          "例如，发送配置更新只证明“发送动作发生了”；收到网络响应也未必表示配置已经落盘并生效。协议必须说清确认点代表什么，调用方才能像检查 happens-before 一样检查跨服务的因果链。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "第 8 步 · 用四句话完成判断",
        title: "别只说“加 volatile 就好了”，把边的两端说出来",
        body: [
          "真正掌握 happens-before，不是能背出五条规则，而是看到代码就能指出 A、B 和中间那条边。",
          "先合上正文回答下面的问题。若答案里出现“应该、一般、过一会儿”，请继续追问：这是规范保证，还是一次运行经验？"
        ],
        checkpoint: {
          prompt:
            "请依次解释：普通 boolean 为什么不能承诺停机；消费者读到 volatile ready=true 后为什么能看见 result=42；volatile count++ 为什么仍会丢更新；main 从 worker.join() 成功返回后为什么可以读取最终结果。",
          hint:
            "每一问都按“A 做了什么 → 哪条规则建立边 → B 因此能观察什么 → 这条规则还没有保证什么”来回答。",
          answer: [
            "普通 boolean 的跨线程写与读没有 happens-before，因此时间上先写入也不能推出读取方必须看见新值。",
            "result=42 在生产者线程中先于 volatile ready=true；该 volatile 写又 happens-before 消费者后续对同一字段的读，所以这条关系传递到消费者之后读取 result。",
            "volatile 保证单次读写的可见性与顺序，不会把读取、加一、写回合成一个不可分割的操作。",
            "工作线程中的所有动作 happens-before 另一个线程从针对它的 join 成功返回，因此 main 可以在返回后读取工作线程发布的最终结果。"
          ],
          successCriteria: [
            "能用“前一个操作的结果对后一个操作保证可见”解释 happens-before。",
            "能分别指出 volatile、同一把锁、start 与 join 建立的边。",
            "能说明可见性为什么不等于复合操作原子性。",
            "能明确说出这些规则止于单 JVM，并为跨进程场景提出一种可验证的协议证据。"
          ]
        }
      }
    ],
    sections: [
      {
        eyebrow: "先预测，再运行",
        title: "为什么它在你的电脑上能停，却不能作为生产承诺？",
        body: [
          "先别急着背术语。想象值班线程每隔一会儿问一次白板：\"该下班了吗？\" 另一个线程把白板从 false 改成 true。源码看起来像每一圈都回白板前再看一次，所以直觉会说它一定会停。",
          "但机器并不按源码逐行搬运。刚启动时，JVM 往往先解释执行；运行一段时间后，JIT 才把热点循环编成更快的机器码。本地短测试可能刚好在前一种阶段结束，或恰好因为打印日志、断点、慢机器调度而反复看到了新值。生产上的长时间热点循环则更有机会运行优化后的版本。",
          "因此“我跑了十次都能停”只是十次碰巧的观察，不是线程间通信的证据。要让停止可依赖，必须明确工作线程凭什么重新获得调用方写入的事实。"
        ],
        codeLabel: "Java 21 · 错误示例 · PlainStopFlag.java",
        code: `public final class PlainStopFlag {
    private boolean stopped;

    private void runLoop() {
        while (!stopped) {
            Thread.onSpinWait();
        }
    }

    private void stop() {
        stopped = true;
    }
}`,
        note:
          "这不是一个可靠的“复现器”：它也可能很容易停。它是一个错误的通信设计，因为 stop 的写入和循环中的读取之间没有被建立为可见的交接。"
      },
      {
        eyebrow: "JIT 先出场",
        title: "编译器会把“反复问白板”改成“记住上一次答案”",
        body: [
          "JIT 的工作是删掉对单线程结果没有影响的重复劳动。对一个没有同步、没有可见副作用的紧凑循环，它可能发现：当前线程自己从未写过 stopped；既然如此，一次读取的结果可以留在寄存器里，后续循环继续使用。",
          "下面右侧不是某台特定 JVM 必然生成的汇编，而是等价的思考方式：把一次字段读取提升到循环外。它保留了该线程自己的源码语义，却抹掉了你暗中期待的“每一圈都和另一个线程交换消息”。",
          "`Thread.onSpinWait()` 只是告诉 CPU 这是自旋等待的性能提示；它不是一次读取屏障，也不会要求 JIT 重新加载 stopped。日志、同步调用、调试器有时会破坏这种优化，所以它们还能让 bug 看似消失。"
        ],
        comparison: [
          {
            label: "源码的直觉",
            title: "每一圈重新读取字段",
            body: "你看到的是一次字段读夹在每一次循环判断中。",
            bullets: [
              "while (!stopped) { ... }",
              "直觉：stop() 一写 true，下一圈就会读到 true。",
              "遗漏：源码没有规定这是一次线程间的消息交接。"
            ]
          },
          {
            label: "JIT 可采用的思路",
            title: "读取一次，把结果留在寄存器",
            body: "这是说明性伪代码，不是逐字的 JVM 输出。",
            bullets: [
              "boolean cached = stopped;",
              "while (!cached) { Thread.onSpinWait(); }",
              "若 cached 为 false，另一个线程之后的写入再也不会被这条循环检查。"
            ]
          }
        ]
      },
      {
        eyebrow: "CPU 接着出场",
        title: "寄存器不是全部：每个核心也可能暂时使用自己的缓存副本",
        body: [
          "即使没有把值长期留在寄存器，处理器也不会把普通写入自动当作一封必须马上送达的跨核信件。每个核心为了快，会从自己的缓存层级取数据；缓存一致性硬件负责维持一致的规则，但这不等于 Java 的普通读写给你一条可依赖的“现在必须看见对方刚写的值”的通信通道。",
          "可以把它想成两位员工各自桌上的白板副本。办公室会逐步协调副本，但你没有按下“发布”按钮，也没有规定另一位员工何时必须刷新。所以问题不是“所有数据都只在某个神秘的主内存里”；问题是缺少一份双方都遵守的发布与观察协议。",
          "JIT 重用值和 CPU 缓存观察旧值是两层不同的优化。任意一层都足以击穿“源码每圈读一次，所以一定能停”的推理。Java 提供的同步工具正是把这种硬件与编译器细节封装为可证明的边。"
        ],
        bullets: [
          "寄存器：编译器可能把一个已读值保留在当前核心的寄存器中，根本不再发起新的字段读取。",
          "缓存：即使发起了读取，普通跨线程读写也没有你能依赖的发布/观察时机。",
          "不要把“volatile 等于直接读主内存”当作模型；它表达的是一套禁止相关重排、建立可见性的同步语义。"
        ]
      },
      {
        eyebrow: "把通信补回来",
        title: "volatile：写入是发布，之后读取是接收",
        body: [
          "把 stopped 声明为 volatile 后，JIT 不能再把这次读取随意变成循环外的旧副本；运行时会在这个字段的写与后续读之间执行所需的内存排序与可见性处理。你不需要手写 CPU 指令，但可以依赖 Java 为 volatile 定义的通信契约。",
          "更重要的是方向：调用方先做的普通写入，再写 volatile 标志；工作线程读到该标志后，才读取那些普通数据。这个顺序形成一条发布链。反过来先把 ready 写成 true 再填 result，就等于把\"货物已到\"的通知发在装货之前。",
          "这仍不是锁。若两个线程都做 count++，它们会各自读取、计算、写回，volatile 不能把这三步合成一次独占的业务转移。多个字段共同维护不变量时，使用同一把锁或发布一个不可变整体。"
        ],
        codeLabel: "Java 21 · 具有停止通信契约的版本",
        code: `final class StoppableWorker implements Runnable {
    private volatile boolean stopped;

    @Override
    public void run() {
        while (!stopped) {
            doOneUnit();
        }
    }

    void stop() {
        stopped = true; // 发布停止请求。
    }

    private void doOneUnit() {
        // 一小段不阻塞的工作。
    }
}`,
        note:
          "这里的承诺是：工作线程下一次执行 volatile 读取时能观察到 stop 的写入。若 doOneUnit 卡在 queue.take、I/O 或 sleep 中，还需要 interrupt、截止时间或关闭资源来让它回到检查点。"
      },
      {
        eyebrow: "给它名字",
        title: "happens-before 不是套话，而是“这次交接真的发生了”的收据",
        body: [
          "现在再回来看 happens-before：它只是在给上面的交接起一个精确名字。A 先行发生于 B，意思是 A 的效果必须能被 B 观察到，而且 A 在 B 之前；它不是墙上时钟的先后，也不是让两个线程轮流执行。",
          "日常 Java 中最常用的收据有四种：同一线程的程序顺序；同一把锁的 unlock 到后续 lock；同一 volatile 字段的写到后续读；在 start 前完成构造，或从 join 成功返回后读取结果。选工具前先问：我到底要把哪一次写入交给谁？",
          "Source Reader 停止、查询取消、配置刷新和算子初始化都依赖这种交接。框架 API 可能替你建立边，但重构时若把唯一的 volatile 写、锁或线程安全队列删掉，业务流程看起来没变，通信契约却已经消失。"
        ],
        bullets: [
          "停止标志：volatile 写 → volatile 读。",
          "完整初始配置：构造/绑定任务 → Thread.start → 新线程执行。",
          "多个关联字段：持同一把锁写完 → 后续持同一把锁读取，或发布一个不可变快照。",
          "等待线程终止：工作线程动作 → join 成功返回 → 调用方检查结果。"
        ]
      }
    ],
    questions: [
      {
        prompt: "普通 boolean 停止标志为什么会出现“测试能停，线上死循环”？",
        answer: [
          "线上循环更容易变成热点代码。JIT 为了减少重复读，可能让工作线程复用之前读到的 false；即使它仍在读取，CPU 缓存层级也不是一个由普通字段写入触发的可靠通知系统。于是调用方早已执行 stop()，工作线程却没有一条必须重新观察该写入的通道。",
          "本地成功很常见：解释执行尚未被 JIT 优化、循环时间不够长、日志和断点改变了优化与时序，或刚好看到缓存更新。这些都是环境事实，不能组成程序承诺。工程上的修复是为通信选择明确边，例如同一 volatile 字段的写—读，或同一把锁的解锁—加锁。"
        ],
        codeLabel: "性能提示不等于通信",
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
          "Thread.onSpinWait 是性能提示，不会让普通字段成为跨线程信号。",
          "日志会扰动时序或阻止部分优化，可能隐藏症状，却不会修复通信缺口。",
          "要证明停机可靠，应测试有界 join，并能指出具体的发布/观察边。"
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
          "对同一 volatile 字段的写入，会把写入前的动作发布给之后读取该字段的线程；读取方一旦观察到该写入，随后读取的动作就能看到那次发布之前的数据。JIT 和 CPU 都必须尊重这一交接，不能再把相关访问自由搬到边的另一侧。",
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
    title: "完成、取消、超时同时到达：谁有资格写下终态？",
    dek: "从一次确定复现的双赢家竞态出发，用状态图、不可变 Outcome 与 compare-and-set 把任务终态收敛为一个权威决定，再划清本地 CAS、线程停止和外部副作用之间的边界。",
    readTime: "42 分钟",
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
      "先定义 RUNNING 到各个终态的合法边，再让一次成功的 CAS 成为提交决定的原子时刻；状态、结果与失败原因必须作为一个不可变 Outcome 一起发布。",
    references: [
      {
        title: "Java 21 · AtomicReference API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/AtomicReference.html",
        note: "compareAndSet 的引用身份比较、返回值、内存效果，以及更新函数可能被重复应用的约束。"
      },
      {
        title: "Java 21 · VarHandle API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/VarHandle.html",
        note: "AtomicReference 所引用的 volatile 读写与 compare-and-set 内存语义。"
      },
      {
        title: "Java 21 · CompletableFuture API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html",
        note: "正常完成、异常完成与取消发生竞争时只有一个完成动作成功，以及取消的边界。"
      },
      {
        title: "Java 21 · AtomicStampedReference API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/AtomicStampedReference.html",
        note: "引用与版本戳成对原子更新，适用于需要识别 ABA 的状态复用场景。"
      }
    ],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "第 1 步 · 先让错误稳定出现",
        title: "两个线程都看见 RUNNING，就可能同时宣布自己赢了",
        goal:
          "亲眼看到“先检查、后写入”为什么不是一次原子状态转移，并能指出竞争窗口位于哪两行之间。",
        prerequisites: [
          "已完成 happens-before 课程，知道 volatile 能提供可见性，但不会把多个动作合成一个动作。",
          "先运行程序，再阅读解释；本例用两个 CountDownLatch 固定竞态位置，不靠随机 sleep 碰运气。"
        ],
        prediction:
          "完成线程与取消线程都在读取 RUNNING 后暂停，等两者检查完再同时写终态。最后会有几个线程认为自己的转移成功？",
        observation:
          "输出稳定显示 claimed winners=2。最终字段只能留下其中一个值，但两个调用方都已经把自己当成赢家，业务上的“只能有一个终态”已经被破坏。",
        invariant:
          "从 RUNNING 出发的所有终态转移中，最多只能有一个调用方获得成功；终态一旦确定，后续转移必须失败。",
        codeLabel: "Java 21 · CheckThenSetRaceDemo.java",
        codeKind: "broken-runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.CountDownLatch;

public final class CheckThenSetRaceDemo {
    private static volatile State state = State.RUNNING;

    private CheckThenSetRaceDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch bothChecked = new CountDownLatch(2);
        CountDownLatch allowWrites = new CountDownLatch(1);
        boolean[] claimed = new boolean[2];

        Thread completer = new Thread(
                () -> compete(State.SUCCEEDED, 0, claimed, bothChecked, allowWrites),
                "completer");
        Thread canceller = new Thread(
                () -> compete(State.CANCELLED, 1, claimed, bothChecked, allowWrites),
                "canceller");

        completer.start();
        canceller.start();
        bothChecked.await();
        allowWrites.countDown();
        completer.join();
        canceller.join();

        int winners = (claimed[0] ? 1 : 0) + (claimed[1] ? 1 : 0);
        System.out.println("claimed winners=" + winners);
        System.out.println("one-terminal invariant violated=" + (winners != 1));
    }

    private static void compete(
            State target,
            int index,
            boolean[] claimed,
            CountDownLatch bothChecked,
            CountDownLatch allowWrites) {
        if (state != State.RUNNING) {
            return;
        }

        bothChecked.countDown();
        await(allowWrites);
        state = target;
        claimed[index] = true;
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("竞争线程被中断", interrupted);
        }
    }

    private enum State {
        RUNNING,
        SUCCEEDED,
        CANCELLED
    }
}`,
        runCommand:
          "javac --release 21 CheckThenSetRaceDemo.java && java CheckThenSetRaceDemo",
        expectedOutput: [
          "claimed winners=2",
          "one-terminal invariant violated=true"
        ],
        body: [
          "`state` 已经是 volatile，所以两个线程都能进行有可见性保证的单次读写；错误仍然存在，因为“确认仍在运行”和“提交终态”之间留着一个可以被另一线程进入的窗口。volatile 没有承诺把这两行合并。",
          "最终内存里只保留 SUCCEEDED 或 CANCELLED，并不能挽回问题。两个线程可能已经分别发送成功通知和取消通知、释放同一份配额或更新相互矛盾的指标。并发正确性必须约束谁获得转移权，而不只是最后字段看起来像一个值。",
          "CountDownLatch 只用于把交错固定下来。删除闩锁后程序可能连续运行很多次都只暴露一个赢家，但那只说明本次调度没有撞上窗口，不能把错误实现变成正确实现。"
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "第 2 步 · 先写状态图",
        title: "AtomicReference 不是设计起点，合法状态转移才是",
        invariant:
          "RUNNING 可以转到 SUCCEEDED、FAILED、CANCELLED 或 TIMED_OUT；任何终态都没有出边，并且终态携带兑现该状态承诺所需的数据。",
        conceptMap: [
          {
            label: "RUNNING",
            relation: "唯一允许发生终态竞争的源状态"
          },
          {
            label: "一次原子决定",
            relation: "完成、失败、取消与超时竞争同一个提交位置"
          },
          {
            label: "一个权威 Outcome",
            relation: "终态与对应结果或原因一起对读者可见"
          }
        ],
        body: [
          "先不考虑 CAS，直接写业务规则：运行中的任务可能正常完成、失败、被取消或达到调用方定义的截止时间；一旦进入其中一个终态，任何后来者都只能读取已经发生的决定，不能把 CANCELLED 改成 SUCCEEDED，也不能把一个失败原因覆盖成另一个原因。",
          "状态图还要规定每个节点携带什么。SUCCEEDED 没有结果就不是完整终态，FAILED 没有稳定的失败信息也无法诊断。若这些信息散落在不同字段，读者就可能看到状态承诺已经成立，而承诺对应的数据还没准备好。",
          "这个不变量比 API 更重要。AtomicReference 只会原子更新一个引用；它不知道哪些边合法，也不知道某个回调是否属于终态的一部分。我们要把状态图编码进数据类型和转移方法，再让原子操作负责守住入口。"
        ],
        bullets: [
          "源状态必须明确：本课所有终态转移都只接受 RUNNING。",
          "目标状态必须完整：结果、失败原因、取消原因或截止时间随终态一起构造。",
          "失败的转移不是另一个终态：它表示已有竞争者先提交了决定。",
          "终态无出边，因此失败者不能盲目循环重试并覆盖赢家。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "第 3 步 · 让三个终态竞争一个位置",
        title: "成功 CAS 是提交决定的时刻，而且最终只能有一个赢家",
        goal:
          "运行完成、取消、超时三方竞争，并从布尔返回值解释为什么成功计数只能是 1。",
        prediction:
          "三个线程同时执行 compareAndSet(RUNNING, terminalOutcome)。最终 Outcome 每次可能不同，但 winners 能否出现 0、2 或 3？",
        observation:
          "程序每次都输出 winners=1 和 terminal=true。哪个终态获胜取决于调度，但成功 CAS 的数量以及终态不再变化是确定的契约。",
        codeLabel: "Java 21 · TerminalOutcomeRaceDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

public final class TerminalOutcomeRaceDemo {
    private TerminalOutcomeRaceDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        AtomicReference<Outcome> outcome =
                new AtomicReference<>(Running.INSTANCE);
        AtomicInteger winners = new AtomicInteger();
        CountDownLatch ready = new CountDownLatch(3);
        CountDownLatch start = new CountDownLatch(1);

        Thread completer = competitor(
                "completer",
                new Succeeded("rows=42"),
                outcome,
                winners,
                ready,
                start);
        Thread canceller = competitor(
                "canceller",
                new Cancelled("client disconnected"),
                outcome,
                winners,
                ready,
                start);
        Thread timer = competitor(
                "timer",
                new TimedOut(Duration.ofSeconds(2)),
                outcome,
                winners,
                ready,
                start);

        completer.start();
        canceller.start();
        timer.start();
        ready.await();
        start.countDown();
        completer.join();
        canceller.join();
        timer.join();

        Outcome decided = outcome.get();
        if (winners.get() != 1 || decided == Running.INSTANCE) {
            throw new AssertionError("终态竞争没有收敛: " + decided);
        }

        System.out.println("winners=" + winners.get());
        System.out.println("terminal=" + (decided != Running.INSTANCE));
    }

    private static Thread competitor(
            String name,
            Outcome next,
            AtomicReference<Outcome> outcome,
            AtomicInteger winners,
            CountDownLatch ready,
            CountDownLatch start) {
        return new Thread(() -> {
            ready.countDown();
            await(start);
            if (outcome.compareAndSet(Running.INSTANCE, next)) {
                winners.incrementAndGet();
            }
        }, name);
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("竞争线程被中断", interrupted);
        }
    }

    private sealed interface Outcome
            permits Running, Succeeded, Cancelled, TimedOut {
    }

    private enum Running implements Outcome {
        INSTANCE
    }

    private record Succeeded(String result) implements Outcome {
        private Succeeded {
            Objects.requireNonNull(result, "result");
        }
    }

    private record Cancelled(String reason) implements Outcome {
        private Cancelled {
            Objects.requireNonNull(reason, "reason");
        }
    }

    private record TimedOut(Duration limit) implements Outcome {
        private TimedOut {
            Objects.requireNonNull(limit, "limit");
        }
    }
}`,
        runCommand:
          "javac --release 21 TerminalOutcomeRaceDemo.java && java TerminalOutcomeRaceDemo",
        expectedOutput: ["winners=1", "terminal=true"],
        body: [
          "三个调用都把同一个 `Running.INSTANCE` 作为 expected。AtomicReference 会原子地读取当前引用、用引用身份比较它与 expected，并且只在仍是同一个对象时写入 next。第一个成功者替换掉 RUNNING；后来者再比较时看到的已经是某个终态，因此返回 false。",
          "成功 CAS 是这个状态转移最自然的线性化点：虽然方法调用在时间上重叠，我们仍可以把获胜操作解释成在这次原子更新处生效。线性化的一般定义是“操作可被解释为在调用与返回之间的某一点生效”，不是所有并发算法都天然拥有一个由业务定义的“唯一物理瞬间”。",
          "CAS 的 volatile 内存语义还负责发布已经构造完成的 Outcome。随后通过 `outcome.get()` 读取的线程能获得同一份终态快照；但这份保证只覆盖这个引用及其发布链，不会把数据库、消息系统或另一个 AtomicReference 一起纳入原子更新。"
        ],
        trace: [
          {
            thread: "completer / canceller / timer",
            action: "分别构造完整的终态 Outcome",
            state: "共享引用仍为 Running.INSTANCE"
          },
          {
            thread: "唯一赢家",
            action: "compareAndSet(Running.INSTANCE, next) 返回 true",
            state: "终态决定在原子更新处提交"
          },
          {
            thread: "另外两个竞争者",
            action: "同一 compareAndSet 返回 false",
            state: "读取并接受已经存在的权威终态"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "第 4 步 · 读懂 CAS 的两个参数",
        title: "expected 比较的是引用身份，false 也不是“请一直重试”",
        invariant:
          "只有仍持有合法源状态的调用才能提交目标状态；CAS 失败后必须重新检查状态图，而不是无条件覆盖当前值。",
        body: [
          "`AtomicReference.compareAndSet(expected, update)` 对引用使用 `==`，不会调用 `equals()`。因此示例用枚举单例 `Running.INSTANCE` 表示唯一初态；如果每次临时 `new Running()`，即使两个对象业务上都叫 RUNNING，它们也不是同一个 expected 引用。",
          "强 CAS 的 false 表示当前引用与 expected 不同。对“RUNNING 只能转一次终态”的状态机来说，这已经足够得出结论：另一个终态先赢了，当前调用返回失败。只有状态图仍允许从新状态继续某条边时，才应该读取当前快照并有界重试。",
          "`weakCompareAndSet` 还可能在值匹配时偶发失败，通常用于调用方已经设计好重试循环的低层算法；这节课没有理由用它。`updateAndGet` 一类高阶方法内部也可能重复应用函数，所以更新函数不能发送通知、释放配额或做其他副作用。"
        ],
        bullets: [
          "比较依据是引用 `==`，不是 record 自动生成的 `equals()`。",
          "成功 CAS 才是状态转移；失败 CAS 没有提交任何新终态。",
          "是否重试由状态图决定，不能由“CAS 失败了”这件事单独决定。",
          "需要返回实际见证值时，可了解 compareAndExchange；主课程使用布尔 CAS 更直接。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "第 5 步 · 拆掉“两个原子就更安全”的直觉",
        title: "state 和 result 各自原子，合起来仍可能是一条撕裂的承诺",
        goal:
          "解释为什么多个 AtomicReference 只分别线性化自己的更新，并把相关字段收进一个不可变 Outcome。",
        prediction:
          "发布线程先把 state 设为 SUCCEEDED，暂停后才写 result；观察线程在暂停点读取两个原子字段，会得到什么组合？",
        observation:
          "程序确定输出 state=SUCCEEDED, result=null。两个读取都具有原子类的可见性保证，但它们观察到的是两个更新之间真实存在的中间状态。",
        codeLabel: "Java 21 · TornOutcomeDemo.java",
        codeKind: "broken-runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;

public final class TornOutcomeDemo {
    private static final AtomicReference<State> STATE =
            new AtomicReference<>(State.RUNNING);
    private static final AtomicReference<String> RESULT =
            new AtomicReference<>();

    private TornOutcomeDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch statePublished = new CountDownLatch(1);
        CountDownLatch allowResult = new CountDownLatch(1);

        Thread publisher = new Thread(() -> {
            STATE.set(State.SUCCEEDED);
            statePublished.countDown();
            await(allowResult);
            RESULT.set("rows=42");
        }, "publisher");

        publisher.start();
        statePublished.await();
        System.out.println(
                "state=" + STATE.get() + ", result=" + RESULT.get());
        allowResult.countDown();
        publisher.join();
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("发布线程被中断", interrupted);
        }
    }

    private enum State {
        RUNNING,
        SUCCEEDED
    }
}`,
        runCommand:
          "javac --release 21 TornOutcomeDemo.java && java TornOutcomeDemo",
        expectedOutput: ["state=SUCCEEDED, result=null"],
        body: [
          "AtomicReference 保证的是“这个引用的一次操作”原子。更新 STATE 与更新 RESULT 之间仍有一个任何线程都可以进入的窗口；调换两行只会把非法组合变成 RUNNING 配上一个已经出现的结果。",
          "正确形状是先构造 `new Succeeded(\"rows=42\")`，再用一个 `AtomicReference<Outcome>` 从 RUNNING CAS 到这个整体。读者只读取一次 Outcome 快照，并根据其具体类型访问对应负载，不再把两次可能来自不同时刻的读取拼成业务状态。",
          "record 的字段是 final，但 record 只提供浅不可变。如果其中保存可变 List、数组或业务对象，发布后继续修改负载仍会让读者看到变化。终态负载应本身不可变，或在构造 Outcome 时进行防御性复制。"
        ]
      },
      {
        kind: "api-decision",
        eyebrow: "第 6 步 · 别把 CAS 当成并发万能钥匙",
        title: "一个不可变值适合 CAS，复合协议往往更适合一把锁",
        goal:
          "根据不变量范围选择 AtomicReference、锁或现成完成抽象，而不是按“无锁看起来更快”做决定。",
        body: [
          "当状态机很小、所有相关数据都能放进一个不可变值，并且每条转移没有阻塞步骤时，AtomicReference 很合适。证明只需检查合法源状态、目标快照和失败路径。",
          "若一次转移要同时维护多个集合、条件队列、资源所有权和复杂清理，一把锁通常更容易证明。锁并不天然慢，CAS 在高竞争下也可能不断失败；优先选择能清楚包住整个不变量的工具。",
          "如果需求本来就是“一个异步结果只能完成一次”，先考虑 CompletableFuture。Java 21 API 明确规定多个线程竞争 complete、completeExceptionally 与 cancel 时只有一个成功；但 CompletableFuture.cancel 不会中断它无法控制的底层计算。"
        ],
        apiOptions: [
          {
            api: "AtomicReference<Outcome>",
            useWhen: "一个不可变值即可表达完整状态机，转移短小且不阻塞。",
            guarantees: "对单个引用进行原子更新，并以 volatile 语义发布成功写入的 Outcome。",
            doesNotGuarantee: "多个原子字段共同提交、公平性、底层任务停止或外部副作用恰好一次。"
          },
          {
            api: "synchronized / ReentrantLock",
            useWhen: "多个字段、集合、条件等待或清理动作共同维护一个不变量。",
            guarantees: "同一把锁下的互斥与内存可见性；临界区能包含完整的复合检查和更新。",
            doesNotGuarantee: "跨进程互斥；ReentrantLock 还要求所有路径在 finally 中释放。"
          },
          {
            api: "CompletableFuture",
            useWhen: "调用方需要一个只完成一次、可等待并可组合的异步结果。",
            guarantees: "正常完成、异常完成与取消竞争时只有一个完成动作成功。",
            doesNotGuarantee: "cancel 一定终止底层工作，也不为远端副作用提供事务原子性。"
          },
          {
            api: "AtomicStampedReference",
            useWhen: "状态允许 A→B→A，算法必须发现引用恢复成 A 之前发生过中间更新。",
            guarantees: "把引用与版本 stamp 作为一对进行原子比较和更新。",
            doesNotGuarantee: "自动设计正确版本规则；本课终态无出边，因此主流程不需要它。"
          }
        ]
      },
      {
        kind: "distributed-boundary",
        eyebrow: "第 7 步 · 把决定与效果分开",
        title: "本地只有一个 CAS 赢家，不等于远端副作用恰好发生一次",
        codeLabel: "赢家只能获得本地后续动作的执行权",
        codeKind: "excerpt",
        javaVersion: "Java 21",
        code: `Succeeded succeeded = new Succeeded(result);
if (outcome.compareAndSet(Running.INSTANCE, succeeded)) {
    completion.complete(succeeded);
    metrics.incrementSucceeded();
    publishCompletionEvent(succeeded);
}`,
        localGuarantee:
          "成功 CAS 可以确保同一个 JVM 中只有赢家进入这段后续逻辑，并让失败者接受已经存在的终态。",
        breaksWith:
          "CAS 与发送消息之间仍有崩溃窗口；网络超时后无法仅凭本地状态判断远端究竟未执行、已执行还是仍在执行。",
        alternatives: [
          "若终态与事件必须一起持久化，在同一个数据库事务中更新任务记录并插入 outbox 事件。",
          "为外部操作携带稳定幂等键，由接收方记录并拒绝重复效果。",
          "若终态意味着所有本地清理都已结束，引入 FINALIZING 等中间态，或把清理纳入同一受锁协议。"
        ],
        body: [
          "这段代码保证只有 CAS 赢家尝试三个本地后续动作，却没有把它们与终态变成一个不可分割事务。线程可能在更新 completion 前抛异常，进程可能在发消息前崩溃，观察者也可能先读到 SUCCEEDED，再发现事件尚未送达。",
          "因此必须写清终态的承诺边界。若 SUCCEEDED 只表示“计算结果已经决定”，后续通知可以幂等重试；若它表示“结果和通知都已持久化”，就要让状态更新与 outbox 写入共享事务，而不是寄希望于本地 CAS。",
          "取消和超时也只是一种权威结果，不是物理停机证明。工作线程可能仍在 I/O 中，远端请求也可能继续产生效果；停止执行需要独立的中断、截止时间、取消令牌和服务端幂等协议。"
        ]
      },
      {
        kind: "implementation",
        eyebrow: "第 8 步 · 自己实现一个终态门",
        title: "让 complete、fail 与 cancel 共用同一个提交入口",
        task:
          "先独立实现 TerminalTask：用一个 AtomicReference<Outcome> 保存完整快照，为完成、失败和取消分别提供返回 boolean 的方法，再写三个同时起跑的线程证明恰好一个转移成功。",
        constraints: [
          "RUNNING 使用唯一对象，所有终态转移只能以它为 expected。",
          "Outcome 必须同时携带终态类型与结果或原因，不能另设 result 字段。",
          "每个方法必须返回 CAS 结果；失败者不能执行一次性后续动作。",
          "测试必须用 CountDownLatch 协调起跑，并在 join 后断言 winners == 1。",
          "终态负载使用不可变值，不在发布后继续修改。"
        ],
        hints: [
          "第一层：用 sealed interface Outcome 和 enum Running.INSTANCE 表示状态空间。",
          "第二层：三个方法都构造完整 next，再执行 outcome.compareAndSet(Running.INSTANCE, next)。",
          "第三层：把布尔返回值累加到 AtomicInteger；线程结束后检查快照已经不是 RUNNING。"
        ],
        body: [
          "先不要看完整实现。请从空文件写出状态类型、合法边和三条转移方法，再补竞争测试。真正要练习的不是记住 AtomicReference 的方法名，而是让每条代码路径都对应状态图中的一条边。",
          "完整实现刻意让三个线程竞争同一个 RUNNING 引用。最终具体终态是不确定的，这是允许的；确定的是只有一个方法返回 true，快照完整，并且任何对终态发起的后来转移都会返回 false。",
          "生产代码还应决定失败后返回 boolean、现有 Outcome，还是抛出领域异常。无论选择哪种接口，都不要把“我尝试过”伪装成“我的终态已经生效”。"
        ],
        codeLabel: "Java 21 · TerminalTaskDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

public final class TerminalTaskDemo {
    private TerminalTaskDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        TerminalTask task = new TerminalTask();
        CountDownLatch ready = new CountDownLatch(3);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger winners = new AtomicInteger();

        Thread complete = contender(
                "complete", ready, start, winners,
                () -> task.complete("rows=42"));
        Thread fail = contender(
                "fail", ready, start, winners,
                () -> task.fail("database unavailable"));
        Thread cancel = contender(
                "cancel", ready, start, winners,
                () -> task.cancel("client disconnected"));

        complete.start();
        fail.start();
        cancel.start();
        ready.await();
        start.countDown();
        complete.join();
        fail.join();
        cancel.join();

        if (winners.get() != 1 || task.snapshot() == Running.INSTANCE) {
            throw new AssertionError("终态门失效: " + task.snapshot());
        }
        if (task.cancel("late cancellation")) {
            throw new AssertionError("终态被后来者覆盖");
        }

        System.out.println("winners=" + winners.get());
        System.out.println("late transition accepted=false");
    }

    private static Thread contender(
            String name,
            CountDownLatch ready,
            CountDownLatch start,
            AtomicInteger winners,
            Transition transition) {
        return new Thread(() -> {
            ready.countDown();
            await(start);
            if (transition.tryApply()) {
                winners.incrementAndGet();
            }
        }, name);
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("竞争线程被中断", interrupted);
        }
    }

    @FunctionalInterface
    private interface Transition {
        boolean tryApply();
    }

    private static final class TerminalTask {
        private final AtomicReference<Outcome> outcome =
                new AtomicReference<>(Running.INSTANCE);

        private boolean complete(String result) {
            return decide(new Succeeded(result));
        }

        private boolean fail(String message) {
            return decide(new Failed(message));
        }

        private boolean cancel(String reason) {
            return decide(new Cancelled(reason));
        }

        private boolean decide(Outcome next) {
            return outcome.compareAndSet(Running.INSTANCE, next);
        }

        private Outcome snapshot() {
            return outcome.get();
        }
    }

    private sealed interface Outcome
            permits Running, Succeeded, Failed, Cancelled {
    }

    private enum Running implements Outcome {
        INSTANCE
    }

    private record Succeeded(String result) implements Outcome {
        private Succeeded {
            Objects.requireNonNull(result, "result");
        }
    }

    private record Failed(String message) implements Outcome {
        private Failed {
            Objects.requireNonNull(message, "message");
        }
    }

    private record Cancelled(String reason) implements Outcome {
        private Cancelled {
            Objects.requireNonNull(reason, "reason");
        }
    }
}`,
        runCommand:
          "javac --release 21 TerminalTaskDemo.java && java TerminalTaskDemo",
        expectedOutput: [
          "winners=1",
          "late transition accepted=false"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "第 9 步 · 用一条完整证明收尾",
        title: "不要只说“用了原子类”，说清不变量、提交点和边界",
        body: [
          "掌握这节课的标准不是会写 compareAndSet，而是能证明为什么只有一个终态、为什么终态负载不会撕裂，以及这份证明在哪里停止。",
          "请先合上正文回答。若答案里出现“AtomicReference 是线程安全的，所以都安全”，继续拆分：它原子保护了哪个引用，业务还有哪些状态和副作用没有被包含进去？"
        ],
        checkpoint: {
          prompt:
            "依次解释：volatile 检查后写为什么会有双赢家；成功 CAS 为什么能作为本状态转移的线性化点；为什么两个 AtomicReference 不能共同发布 SUCCEEDED 与 result；为什么 CAS 赢家仍不能宣称远端通知恰好一次；什么情况下应改用一把锁。",
          hint:
            "按“共享状态 → 业务不变量 → 合法源状态 → 原子提交点 → 发布的数据 → 未被提交点覆盖的副作用”组织答案。",
          answer: [
            "volatile 只保证每次 state 读写的可见性，检查 RUNNING 与写终态之间仍有窗口，所以两个线程都可能通过检查并各自宣称成功。",
            "三个转移都以唯一 Running.INSTANCE 为 expected。第一个成功 CAS 原子替换该引用，后来者观察到终态后失败，因此成功 CAS 是本状态机转移自然的线性化点。",
            "两个 AtomicReference 分别线性化自己的更新，中间状态对读者可见。把状态与负载构造成一个不可变 Outcome，再用一个 CAS 发布，才能消除这条缝。",
            "CAS 与远端调用不是同一个事务；进程可能在两者之间崩溃，超时也不能区分远端未执行与已执行。需要事务 outbox、幂等键或明确的多步协议。",
            "当一个转移涉及多个可变集合、条件等待、复杂清理或无法装进一个不可变快照的不变量时，一把锁通常更容易完整保护并证明。"
          ],
          successCriteria: [
            "能画出 RUNNING 到各终态的合法边，并说明终态无出边。",
            "能准确说出 AtomicReference CAS 比较引用身份，而不是 equals。",
            "能用一个不可变 Outcome 同时发布状态和对应负载。",
            "能区分唯一终态、底层工作停止与外部副作用恰好一次。",
            "能为 CAS 与锁给出基于不变量范围的选择理由。"
          ]
        }
      }
    ],
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
    title: "队列满了怎么办：把过载从内存事故变成明确决定",
    dek: "从一格 ArrayBlockingQueue 的饱和实验出发，读懂 BlockingQueue 四组方法、线程间发布语义与关闭边界，再把容量翻译成等待、拒绝和重试协议。",
    readTime: "42 分钟",
    status: "published",
    tags: ["BlockingQueue", "ArrayBlockingQueue", "容量", "背压", "过载"],
    searchTerms: [
      "BlockingQueue",
      "ArrayBlockingQueue",
      "put",
      "offer",
      "take",
      "poll",
      "remainingCapacity",
      "wait",
      "notifyAll",
      "Condition",
      "生产者消费者",
      "poison pill"
    ],
    keyIdea:
      "队列不会消除过载；它只决定多余需求在哪里等待、失败或被丢弃。",
    references: [
      {
        title: "Java 21 · BlockingQueue API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/BlockingQueue.html",
        note: "抛异常、特殊值、阻塞、限时四组方法，以及元素交接的内存一致性保证。"
      },
      {
        title: "Java 21 · ArrayBlockingQueue API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ArrayBlockingQueue.html",
        note: "固定容量、FIFO 元素顺序与可选公平策略的精确边界。"
      },
      {
        title: "Java 21 · java.util.concurrent 包规范",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html",
        note: "并发集合、同步器与执行器在交接前后提供的通用 happens-before 保证。"
      },
      {
        title: "Java 21 · Flow API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Flow.html",
        note: "异步发布—订阅中的需求管理入口；它需要上下游共同遵守，不能替其他缓冲区自动限容。"
      }
    ],
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
    ],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先看系统边界",
        title: "队列装下的不是吞吐量，而是暂时处理不完的工作",
        goal:
          "能够区分正在执行、正在排队和已经被拒绝的工作，并为一个有界队列选择阻塞、限时等待或立即拒绝的准入语义。",
        conceptMap: [
          {
            label: "生产速率",
            relation: "单位时间内到达队列的工作量"
          },
          {
            label: "消费速率",
            relation: "消费者真正完成工作的速度"
          },
          {
            label: "容量",
            relation: "允许暂时等待的元素上限，不是处理能力"
          },
          {
            label: "过载策略",
            relation: "容量耗尽后，调用方阻塞、超时、拒绝或丢弃"
          }
        ],
        invariant:
          "任何时刻都必须满足 0 <= size <= capacity；容量已满时，系统必须给生产者一个明确且可观察的结果。",
        body: [
          "当生产者只是短暂地快于消费者，队列可以吸收抖动；当生产速度长期高于消费速度，任何有限队列最终都会满。区别只在于：有界队列会在一个可预期的位置暴露问题，无界队列则把问题推迟成越来越长的延迟和越来越高的内存占用。",
          "因此，容量不是“越大越安全”的缓存参数，而是一项业务决定。它表示系统愿意让多少工作在尚未开始执行时占用内存、等待延迟预算并承担进程崩溃后丢失的风险。队列满以后怎么做，也必须成为调用方能处理的 API 契约。",
          "这一课先使用 JDK 已经实现好的 BlockingQueue 观察准入语义，再回到其内存可见性、关闭协议和公平性边界。下一课才会为了理解机制，使用 Lock 与 Condition 实现一个小型有界缓冲区。"
        ],
        checkpoint: {
          prompt: "一个容量为 100 的工作队列，是否意味着系统里最多只有 100 个任务？",
          answer: [
            "不是。队列容量通常只计算等待执行的元素，不包括消费者已经取走、正在执行的工作，也不包括客户端重试、网络缓冲区和其他进程中的副本。",
            "描述系统上限时，要分别统计运行中、排队中和边界之外的工作，不能把一个局部队列容量当成端到端容量。"
          ],
          successCriteria: [
            "能说出队列容量限制的是等待者而非消费吞吐量",
            "能指出持续过载时有限队列最终一定会满"
          ]
        }
      },
      {
        kind: "experiment",
        eyebrow: "先运行，再解释",
        title: "同一个满队列，可以立即拒绝，也可以在截止时间内等待",
        prediction:
          "容量为 2 的队列已经放入两个任务。第一次立即 offer 第三个任务会返回什么？消费者 200 毫秒后取走一个任务时，第二次限时 offer 又会发生什么？",
        codeLabel: "Java 21 · BoundedQueueAdmissionDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac BoundedQueueAdmissionDemo.java\njava BoundedQueueAdmissionDemo",
        code: `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

public final class BoundedQueueAdmissionDemo {
    private record Job(int id, String payload) {}

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Job> queue = new ArrayBlockingQueue<>(2);

        queue.put(new Job(1, "alpha"));
        queue.put(new Job(2, "beta"));

        boolean acceptedImmediately =
                queue.offer(new Job(3, "gamma"));
        System.out.println(
                "立即提交第三个任务：" + acceptedImmediately);

        Thread consumer = Thread.ofPlatform()
                .name("consumer")
                .start(() -> {
                    try {
                        Thread.sleep(200);
                        System.out.println("消费者取出：" + queue.take());
                    } catch (InterruptedException exception) {
                        Thread.currentThread().interrupt();
                    }
                });

        long startedAt = System.nanoTime();
        boolean acceptedAfterWaiting = queue.offer(
                new Job(3, "gamma"),
                1,
                TimeUnit.SECONDS);
        long waitedMillis = TimeUnit.NANOSECONDS.toMillis(
                System.nanoTime() - startedAt);

        System.out.printf(
                "限时提交第三个任务：%s，等待约 %d ms%n",
                acceptedAfterWaiting,
                waitedMillis);

        consumer.join();
    }
}`,
        expectedOutput: [
          "立即提交第三个任务：false",
          "下面两行都会出现；它们的打印先后可能受线程调度影响：",
          "消费者取出：Job[id=1, payload=alpha]",
          "限时提交第三个任务：true，等待约 200 ms"
        ],
        observation:
          "第一次 offer 不等待，看到队列已满便返回 false。第二次 offer 最多等待一秒；消费者腾出一个位置后，它成功入队并返回 true。实际毫秒数会受调度影响，但两个 boolean 结果由这个实验的同步顺序确定。",
        body: [
          "两次提交面对的是同一个容量边界，区别来自方法契约。无参数 offer 把“现在能否接收”直接交给调用方；带超时的 offer 愿意占用当前线程等待一小段时间，但不会无限期突破调用方的延迟预算。",
          "这里没有自动重试，也没有隐藏丢弃。生产代码必须检查 false，并把它转换为领域可理解的结果，例如过载异常、HTTP 429/503、稍后重试提示或明确允许丢失的采样策略。忽略返回值，就等于选择了静默丢失。",
          "put 和限时 offer 都是可中断等待。若上层已经取消请求，阻塞线程应让 InterruptedException 继续向上传播，或者在无法声明该异常的边界恢复中断标志，而不是吞掉取消后继续等待。"
        ],
        trace: [
          {
            thread: "main",
            action: "put Job 1、Job 2",
            state: "size=2，队列达到容量"
          },
          {
            thread: "main",
            action: "offer Job 3",
            state: "不等待，返回 false"
          },
          {
            thread: "consumer",
            action: "take Job 1",
            state: "size 从 2 变为 1"
          },
          {
            thread: "main",
            action: "限时 offer Job 3",
            state: "获得空位，返回 true"
          }
        ],
        checkpoint: {
          prompt: "为什么不能把限时 offer 的 false 当成“任务一定没有在别处执行”？",
          answer: [
            "这个 false 只描述这一次对当前本地队列的插入没有成功。若调用方在到达这里之前已经把同一逻辑任务发给其他节点，或超时后进行了重试，系统中仍可能存在副本。",
            "跨边界提交需要稳定任务 ID、幂等处理和可查询的提交结果；本地 boolean 不能证明全局唯一性。"
          ],
          successCriteria: [
            "能说明立即 offer 与限时 offer 的延迟差异",
            "能说明 false 必须被调用方显式处理"
          ]
        }
      },
      {
        kind: "mechanism",
        eyebrow: "把方法名读成失败语义",
        title: "BlockingQueue 的四组方法，其实是四种过载协议",
        prediction:
          "下面程序依次触发满队列、空队列、阻塞交接和限时等待。先预测哪些操作抛异常，哪些返回特殊值，哪些会让当前线程等待。",
        codeLabel: "Java 21 · QueueMethodContractsDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac QueueMethodContractsDemo.java\njava QueueMethodContractsDemo",
        code: `import java.util.NoSuchElementException;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

public final class QueueMethodContractsDemo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(1);

        System.out.println("add A: " + queue.add("A"));
        try {
            queue.add("B");
        } catch (IllegalStateException exception) {
            System.out.println("add B: " + exception.getClass().getSimpleName());
        }
        System.out.println("offer B: " + queue.offer("B"));

        System.out.println("remove: " + queue.remove());
        try {
            queue.remove();
        } catch (NoSuchElementException exception) {
            System.out.println(
                    "remove empty: " + exception.getClass().getSimpleName());
        }
        System.out.println("poll empty: " + queue.poll());

        queue.put("C");
        Thread consumer = Thread.ofPlatform().start(() -> {
            try {
                Thread.sleep(150);
                System.out.println("take in consumer: " + queue.take());
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
            }
        });

        boolean offered = queue.offer("D", 1, TimeUnit.SECONDS);
        System.out.println("timed offer D: " + offered);
        consumer.join();

        System.out.println("take D: " + queue.take());
        System.out.println(
                "timed poll empty: "
                        + queue.poll(50, TimeUnit.MILLISECONDS));
    }
}`,
        expectedOutput: [
          "add A: true",
          "add B: IllegalStateException",
          "offer B: false",
          "remove: A",
          "remove empty: NoSuchElementException",
          "poll empty: null",
          "下面两行都会出现；它们的打印先后可能受线程调度影响：",
          "take in consumer: C",
          "timed offer D: true",
          "take D: D",
          "timed poll empty: null"
        ],
        observation:
          "add/remove 用异常表达立即失败，offer/poll 用 false 或 null 表达立即失败，put/take 一直等到可以完成，带时间参数的 offer/poll 只在预算内等待。peek/element 只查看队头，不存在阻塞版本。",
        body: [
          "选择方法时先问调用方需要什么失败信息，而不是先背 API。容量受限的队列通常优先使用 offer，因为“现在已满”是正常运行状态，不一定值得用异常表达；若业务要求可靠背压，可以选择 put，但必须同时证明无限等待不会占满请求线程或形成锁依赖环。",
          "BlockingQueue 禁止 null 元素，因为 poll 使用 null 表示当前没有元素或限时等待已到期。若业务数据本身允许“空值”，应使用明确的领域对象表示，而不是试图把 null 放入队列。",
          "接口的单元素队列操作是线程安全且原子的，但不要把这个结论扩展到所有 Collection 批量方法。BlockingQueue 明确说明 addAll、containsAll、retainAll、removeAll 等批量操作不一定作为一个整体原子执行。"
        ],
        apiOptions: [
          {
            api: "add / remove / element",
            useWhen: "容量不足或队列为空代表调用方违反前置条件",
            guarantees: "立即完成；失败时抛异常",
            doesNotGuarantee: "不会等待状态变化"
          },
          {
            api: "offer / poll / peek",
            useWhen: "立即准入或立即读取，并让调用方处理正常失败",
            guarantees: "立即返回 false 或 null",
            doesNotGuarantee: "返回后状态仍保持不变"
          },
          {
            api: "put / take",
            useWhen: "上游可以安全地无限等待，并且需要真正的阻塞背压",
            guarantees: "除非中断，否则等待到操作成功",
            doesNotGuarantee: "完成时间上界"
          },
          {
            api: "offer(timeout) / poll(timeout)",
            useWhen: "等待必须服从调用方的延迟预算",
            guarantees: "成功、超时和中断三种结果可区分",
            doesNotGuarantee: "超时后远端或其他副本一定不存在"
          }
        ],
        checkpoint: {
          prompt: "为什么有界队列上通常更适合 offer，而不是 add？",
          answer: [
            "队列暂时已满通常是预期的容量状态。offer 用 false 表达这一状态，调用方可以选择重试、降级或拒绝；add 只能通过 IllegalStateException 表达。",
            "若“已满”确实代表编程错误，add 仍然合理。关键是让方法语义匹配领域契约。"
          ],
          successCriteria: [
            "能完整说出插入与取出操作的四类失败方式",
            "能解释 null 为什么被禁止"
          ]
        }
      },
      {
        kind: "mechanism",
        eyebrow: "元素传递也是一次发布",
        title: "入队不仅搬运引用，还建立生产者到消费者的 happens-before 边",
        prediction:
          "消费者线程先启动并阻塞在 take。主线程随后修改一个普通可变对象，再把它放入队列。消费者是否被保证看到入队前写入的 value 和 note？",
        codeLabel: "Java 21 · QueuePublicationDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac QueuePublicationDemo.java\njava QueuePublicationDemo",
        code: `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public final class QueuePublicationDemo {
    private static final class Envelope {
        private int value;
        private String note;
    }

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Envelope> queue = new ArrayBlockingQueue<>(1);
        Envelope envelope = new Envelope();

        Thread consumer = Thread.ofPlatform()
                .name("consumer")
                .start(() -> {
                    try {
                        Envelope received = queue.take();
                        System.out.printf(
                                "value=%d, note=%s%n",
                                received.value,
                                received.note);
                    } catch (InterruptedException exception) {
                        Thread.currentThread().interrupt();
                    }
                });

        envelope.value = 42;
        envelope.note = "written before put";
        queue.put(envelope);

        consumer.join();
    }
}`,
        expectedOutput: [
          "value=42, note=written before put"
        ],
        observation:
          "BlockingQueue 与其他并发集合一样，保证一个线程在放入对象之前的动作，happen-before 另一个线程随后访问或移除该元素之后的动作。消费者看到的不是碰巧刷新过的字段，而是由队列交接建立的可见性。",
        body: [
          "可以把这条边读成：先构造和填写消息，再入队；消费者成功取得同一个元素后，可以依赖这些先前写入。它让应用不必为了发布每个不可变任务，再额外增加一个 volatile 标志。",
          "保证有明确边界。若生产者在 put 返回后继续无同步地修改 envelope，后续修改不在这条发布边之内，消费者与生产者之间重新出现数据竞争。最稳妥的任务消息通常是不可变 record，或在入队后由单一所有者独占。",
          "队列保证可见性，不保证业务上的恰好一次。消费者可能在副作用之后、确认之前崩溃；进程外队列也可能重新投递。同一个逻辑任务仍需稳定 ID、幂等副作用或事务化提交协议。"
        ],
        trace: [
          {
            thread: "main",
            action: "写 value 与 note",
            state: "普通字段写入发生在 put 之前"
          },
          {
            thread: "main",
            action: "put envelope",
            state: "建立并发集合发布边"
          },
          {
            thread: "consumer",
            action: "take envelope 后读取字段",
            state: "保证观察到入队前的写入"
          }
        ],
        checkpoint: {
          prompt: "把对象放入 BlockingQueue 后，生产者还能否随意修改它？",
          answer: [
            "不能据此认为安全。队列的 happens-before 边覆盖放入动作之前的写入；放入之后的新写入需要另一条同步边，或者对象必须由消费者独占。",
            "优先发布不可变值。若必须共享可变对象，要为后续每次访问设计独立同步协议。"
          ],
          successCriteria: [
            "能画出 put 前写入到 take 后读取的 happens-before 边",
            "能指出入队后的突变不受这条边保护"
          ]
        }
      },
      {
        kind: "api-decision",
        eyebrow: "容量是延迟预算",
        title: "队列多大，不应从一个好看的整数开始",
        body: [
          "容量首先限制排队等待，而不是限制消费者正在执行的任务。选择容量时，应同时观察到达速率、任务耗时分布、允许的排队时延、单个元素的内存成本，以及下游真正能承受的并发量。把容量从 1,000 调到 100,000 可能只是在让请求更晚失败。",
          "大队列适合吸收可证明会很快消退的短暂突发，但会增加尾延迟、取消后的陈旧工作和进程崩溃时的损失窗口。小队列能更快把过载传回生产者，但调用方必须具备可靠的拒绝、退避或降级路径。",
          "remainingCapacity 和 size 是某个瞬间的观测。另一个线程可能在检查后立刻插入或取出，所以不能写成“remainingCapacity 大于零，然后 add”的准入协议；直接调用 offer 才是原子决策。"
        ],
        apiOptions: [
          {
            api: "put",
            useWhen: "生产者是可安全阻塞的后台线程，且停顿能够真正向上游传播",
            guarantees: "不因队列暂时已满而丢失元素",
            doesNotGuarantee: "调用延迟上界，也不避免线程耗尽"
          },
          {
            api: "offer(timeout)",
            useWhen: "允许短暂排队，但提交必须服从总截止时间",
            guarantees: "在给定时间内完成准入决定",
            doesNotGuarantee: "自动重试安全"
          },
          {
            api: "offer",
            useWhen: "请求线程或事件循环需要快速得到过载结果",
            guarantees: "立即、原子地决定当前是否接收",
            doesNotGuarantee: "调用方会正确处理 false"
          },
          {
            api: "丢弃或合并",
            useWhen: "遥测等业务明确允许损失，并定义了优先级或合并规则",
            guarantees: "保护有限资源不被低价值工作占满",
            doesNotGuarantee: "可靠处理或恰好一次"
          }
        ],
        task:
          "为一个接口写出准入结果类型，至少区分 ACCEPTED、TIMED_OUT、INTERRUPTED 和 CLOSED；不要只返回一个含义模糊的 boolean。",
        constraints: [
          "所有等待都必须服从调用方传入的总截止时间",
          "不得通过 remainingCapacity 做 check-then-act",
          "只有幂等任务才能由通用层自动重试",
          "过载结果必须进入指标和日志，但日志本身也要限速"
        ],
        hints: [
          "先定义谁拥有重试决策：队列包装器还是调用方。",
          "把“本地未入队”和“全局一定未执行”分成两个不同陈述。",
          "考虑调用方已经被中断时，方法是否还应开始等待。"
        ],
        checkpoint: {
          prompt: "队列容量翻十倍，为什么可能让用户体验更差？",
          answer: [
            "若消费能力没有增加，更多任务只会在队列中等待更久。请求可能在已经失去业务价值后才开始执行，最终仍然超时。",
            "更大的积压还会扩大取消、部署关闭和进程故障时需要处理的陈旧工作。"
          ],
          successCriteria: [
            "能把容量与排队时延联系起来",
            "能解释为什么 size 和 remainingCapacity 只能用于观测"
          ]
        }
      },
      {
        kind: "mechanism",
        eyebrow: "队列没有通用关闭按钮",
        title: "BlockingQueue 不知道业务何时结束，停止必须由协议表达",
        prediction:
          "下面的 STOP 只服务一个消费者。若把消费者数量改成三个，却仍只放入一个 STOP，会发生什么？",
        codeLabel: "Java 21 · QueueShutdownProtocolDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac QueueShutdownProtocolDemo.java\njava QueueShutdownProtocolDemo",
        code: `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public final class QueueShutdownProtocolDemo {
    private record Work(int id) {}

    private static final Work STOP = new Work(-1);

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Work> queue = new ArrayBlockingQueue<>(4);

        Thread consumer = Thread.ofPlatform()
                .name("consumer")
                .start(() -> {
                    try {
                        while (true) {
                            Work work = queue.take();
                            if (work == STOP) {
                                System.out.println("consumer stopped");
                                return;
                            }
                            System.out.println("processed " + work.id());
                        }
                    } catch (InterruptedException exception) {
                        Thread.currentThread().interrupt();
                    }
                });

        queue.put(new Work(1));
        queue.put(new Work(2));
        queue.put(STOP);
        consumer.join();
    }
}`,
        expectedOutput: [
          "processed 1",
          "processed 2",
          "consumer stopped"
        ],
        observation:
          "BlockingQueue 接口没有 close 或 shutdown。JDK 文档把毒丸列为一种常见策略，但停止元素的含义、数量、顺序和失败恢复都由应用定义。",
        body: [
          "一个 STOP 只能可靠地结束这个示例中的一个消费者。多个消费者需要每个消费者都能观察终止，例如投放足够多的停止元素、让收到者再次传播停止信号，或由外部生命周期状态配合中断。每种方案都要证明不会有消费者永久阻塞。",
          "毒丸还必须与正常数据不可混淆。这里用对象身份比较一个私有哨兵；真实系统可以使用密封消息类型，把 Work 与 Stop 建模为不同分支。不要用 null，因为 BlockingQueue 明确禁止 null。",
          "若生产者在写入 STOP 之前崩溃，消费者仍会无限等待，所以可靠关闭不能只靠一条尽力而为的消息。执行器、服务容器或连接生命周期通常还要保留外部取消路径，并为阻塞等待设置明确的中断行为。"
        ],
        checkpoint: {
          prompt: "为什么 BlockingQueue 无法提供一个适用于所有业务的 close？",
          answer: [
            "关闭后是否允许取完剩余元素、是否拒绝新生产者、阻塞中的 put/take 如何返回、多个消费者如何得知结束，这些语义因应用而异。",
            "队列只实现元素交接；生命周期需要由拥有队列的更高层协议定义。"
          ],
          successCriteria: [
            "能明确说出 BlockingQueue 没有内建 close",
            "能指出多个消费者下单个毒丸的活性问题"
          ]
        }
      },
      {
        kind: "misconception",
        eyebrow: "别把两种 FIFO 混在一起",
        title: "元素先进先出，不代表等待线程和完成结果都严格排队",
        prediction:
          "ArrayBlockingQueue 声明按 FIFO 保存元素。由此能否推出最早调用 put 的生产者一定最早返回，或者最早入队的任务一定最早完成？",
        body: [
          "不能。元素 FIFO 只说明取出操作按元素进入队列的先后返回队头。多个生产者争抢空位、多个消费者争抢元素，以及任务取出后的实际执行时间，属于不同层次的调度问题。",
          "ArrayBlockingQueue 构造器可选择公平访问。fair=true 时，阻塞在插入或移除上的线程按 FIFO 获得访问机会；默认模式不承诺等待者顺序。官方同时提醒，公平通常会降低吞吐量，但能减少等待时间波动并避免饥饿。",
          "即使启用公平，操作系统也不承诺每个线程获得相同 CPU 时间；消费者取出任务后，慢任务仍可能晚于后入队的快任务完成。不要把队列顺序当成业务完成顺序或全局顺序。"
        ],
        invariant:
          "分别陈述元素顺序、等待者准入顺序和业务完成顺序；任何一个层次的 FIFO 都不能自动推出另外两个层次。",
        checkpoint: {
          prompt: "什么时候值得为 ArrayBlockingQueue 开启公平模式？",
          answer: [
            "当长尾等待或线程饥饿比最高吞吐量更不可接受，并且已经通过度量确认默认竞争策略造成了实际问题时。",
            "公平不是默认的正确性开关。若业务要求严格任务顺序，应由单一消费者、序列号或更高层协议保证，而不是只依赖公平参数。"
          ],
          successCriteria: [
            "能区分元素 FIFO 与等待线程公平",
            "能说出公平模式的吞吐量权衡"
          ]
        }
      },
      {
        kind: "implementation",
        eyebrow: "把准入契约写进类型",
        title: "实现一个有截止时间、可观测且不吞中断的任务邮箱",
        task:
          "实现 AdmissionMailbox.submit：它使用 ArrayBlockingQueue，成功时返回 ACCEPTED，等待超时返回 TIMED_OUT；收到中断时不得伪装成超时，也不得继续提交。",
        constraints: [
          "JDK 21，容量必须在构造时验证为正数",
          "使用 offer(timeout)，不能先读 remainingCapacity",
          "InterruptedException 必须继续抛给调用方",
          "提供 size 与 remainingCapacity 仅用于指标，不让调用方据此决定提交",
          "测试应覆盖立即成功、等待后成功、超时和中断"
        ],
        hints: [
          "邮箱包装的是准入策略，不要泄露可让调用方绕开策略的底层 queue。",
          "超时参数为零时，offer(timeout) 仍可作为一次立即尝试。",
          "中断发生时 offer 会抛出 InterruptedException；不要捕获后返回 TIMED_OUT。"
        ],
        codeLabel: "Java 21 · AdmissionMailbox.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac AdmissionMailbox.java\njava AdmissionMailbox",
        code: `import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;

public final class AdmissionMailbox<T> {
    public enum Result {
        ACCEPTED,
        TIMED_OUT
    }

    private final ArrayBlockingQueue<T> queue;

    public AdmissionMailbox(int capacity) {
        if (capacity < 1) {
            throw new IllegalArgumentException(
                    "capacity must be positive");
        }
        this.queue = new ArrayBlockingQueue<>(capacity);
    }

    public Result submit(T item, Duration timeout)
            throws InterruptedException {
        Objects.requireNonNull(item, "item");
        Objects.requireNonNull(timeout, "timeout");
        if (timeout.isNegative()) {
            throw new IllegalArgumentException(
                    "timeout must not be negative");
        }

        boolean accepted = queue.offer(
                item,
                timeout.toNanos(),
                TimeUnit.NANOSECONDS);
        return accepted ? Result.ACCEPTED : Result.TIMED_OUT;
    }

    public T take() throws InterruptedException {
        return queue.take();
    }

    public int sizeForMetrics() {
        return queue.size();
    }

    public int remainingCapacityForMetrics() {
        return queue.remainingCapacity();
    }

    public static void main(String[] args) throws InterruptedException {
        AdmissionMailbox<String> mailbox = new AdmissionMailbox<>(1);

        System.out.println(
                mailbox.submit("first", Duration.ZERO));
        System.out.println(
                mailbox.submit("second", Duration.ofMillis(20)));
        System.out.println("received " + mailbox.take());
    }
}`,
        expectedOutput: [
          "ACCEPTED",
          "TIMED_OUT",
          "received first"
        ],
        body: [
          "这个包装器没有让队列变得更快，它只是缩小了调用方可以选择的语义：所有提交都必须带等待预算，结果不会被忽略，指标方法的名字也明确提醒调用方不要把瞬时观测用于同步控制。",
          "示例保留 InterruptedException，因为中断与超时不是同一件事。超时表示本次等待预算耗尽；中断表示上层请求取消当前操作。把两者合并会让关闭流程失去判断依据。",
          "完整生产协议还需要 CLOSED 或 NOT_RUNNING 状态，但 BlockingQueue 本身没有关闭能力。该状态应由邮箱拥有者以锁、原子状态或执行器生命周期实现，而不是伪造一个 queue.close()。"
        ],
        adversarialTest:
          "容量为 1 时先放入 first，启动另一个线程用 10 秒超时提交 second；确认它已开始等待后中断该线程。断言它观察到 InterruptedException，队列仍只包含 first，且没有 second 被悄悄插入。",
        checkpoint: {
          prompt: "为什么指标方法要明确标注 ForMetrics？",
          answer: [
            "size 与 remainingCapacity 在并发环境中只是瞬时近似。命名不能提供同步保证，但能减少调用方把它们误用成“先检查再提交”的诱惑。",
            "真正的准入决定必须由单次 offer 原子完成。"
          ],
          successCriteria: [
            "实现不会吞中断",
            "实现不会用瞬时容量做 check-then-act",
            "调用方无法忽略成功与超时的区别"
          ]
        }
      },
      {
        kind: "distributed-boundary",
        eyebrow: "把背压传到队列之外",
        title: "本地有界，不等于端到端有界",
        body: [
          "一个 JVM 中的 ArrayBlockingQueue 只能限制这个进程、这个队列里的等待元素。反向代理、HTTP 客户端、消息 Broker、数据库连接池和调用方重试都可能拥有自己的缓冲。若每一层都先收下再等待，整体仍可能积压巨大。",
          "可靠背压需要把拒绝结果传给真正能减速的生产者。同步 API 可以返回带重试提示的 429 或 503；异步协议可以暂停拉取、减少 demand 或拒绝发布。任何自动重试都必须有总预算、指数退避与抖动，并以幂等为前提。",
          "远程提交超时时，真实结果经常是未知：请求可能未到达，也可能已经入队但响应丢失。本地 offer 的 false 是明确未插入当前队列；网络超时不是同一种证据。跨节点系统需要稳定请求 ID、结果查询或去重记录。"
        ],
        localGuarantee:
          "在单 JVM 内，BlockingQueue 原子管理自己的容量、阻塞交接和入队前写入到出队后读取的可见性。",
        breaksWith:
          "进程崩溃、网络超时、Broker 重投、多个隐藏缓冲和客户端同步重试都会越过这个本地边界。",
        alternatives: [
          "HTTP 429/503 + Retry-After + 有抖动的重试预算",
          "消息 Broker 的有界生产缓冲与显式发布确认",
          "Flow demand 或其他端到端流量控制",
          "幂等键、去重表或事务发件箱处理未知提交结果"
        ],
        checkpoint: {
          prompt: "学完本课，你应如何定义一个队列的完整容量契约？",
          answer: [
            "说明容量计算哪些工作，满时调用方是立即失败、限时等待、无限阻塞还是丢弃；说明中断和关闭如何返回；说明指标、告警和重试责任由谁承担。",
            "还要写明本地 happens-before 保证与分布式投递保证的边界，不能把线程安全等同于恰好一次。"
          ],
          successCriteria: [
            "能选择 BlockingQueue 的正确方法族",
            "能解释容量、延迟和过载的关系",
            "能说明队列发布边和无内建 close",
            "能把本地准入失败与远程未知结果区分开"
          ]
        }
      }
    ]
  },
  {
    slug: "locks-conditions-permits",
    week: 5,
    title: "锁、条件变量与许可：三种工具解决三种问题",
    dek: "用锁保护复合不变量，用条件变量等待状态变化，再用信号量限制稀缺资源的并发访问。",
    readTime: "40 分钟",
    status: "published",
    tags: ["ReentrantLock", "Condition", "Semaphore", "虚拟线程", "并发准入"],
    searchTerms: [
      "Lock",
      "ReentrantLock",
      "lockInterruptibly",
      "tryLock",
      "Condition",
      "await",
      "signal",
      "signalAll",
      "Semaphore",
      "acquire",
      "release",
      "许可",
      "公平锁",
      "虚拟线程"
    ],
    keyIdea:
      "Lock 决定谁能修改共享状态，Condition 让线程等待受保护谓词，Semaphore 只计算还能放行多少个并发操作。",
    references: [
      {
        title: "Java 21 · Lock API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/Lock.html",
        note: "显式锁的获取、可中断与限时形式，以及 unlock 到后续 lock 的内存语义。"
      },
      {
        title: "Java 21 · Condition API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/Condition.html",
        note: "多个等待集合、await 原子释放并重获锁、伪唤醒与循环检查谓词。"
      },
      {
        title: "Java 21 · ReentrantLock API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html",
        note: "公平模式、tryLock 插队、lockInterruptibly 与诊断方法的契约。"
      },
      {
        title: "Java 21 · Semaphore API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Semaphore.html",
        note: "许可计数、无所有权释放、公平性限制以及 release 到 acquire 的发布保证。"
      },
      {
        title: "Java 21 · Virtual Threads",
        href: "https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html",
        note: "虚拟线程适合大量阻塞任务；稀缺服务容量应由 Semaphore 等独立机制约束。"
      }
    ],
    sections: [],
    questions: [],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先把工具和问题对齐",
        title: "互斥、等待和限流看起来都在阻塞线程，但它们不是同一件事",
        goal:
          "面对一段并发代码时，能够指出哪一组状态需要互斥、线程在等待哪个谓词，以及哪个外部资源需要独立的并发上限。",
        conceptMap: [
          {
            label: "Lock",
            relation: "保护一组共享状态及其复合不变量"
          },
          {
            label: "Condition",
            relation: "让持锁线程在谓词不成立时释放锁并等待"
          },
          {
            label: "Semaphore",
            relation: "维护可用许可计数，限制同时通过的操作数量"
          },
          {
            label: "业务容量",
            relation: "数据库连接、租户配额或下游并发，不等同于线程数量"
          }
        ],
        invariant:
          "先写出被保护的状态和合法谓词，再选择同步工具；不能因为三个 API 都会让线程等待，就用其中一个替代另外两个。",
        body: [
          "锁回答的是“此刻谁可以检查并修改这组状态”。条件变量回答的是“状态还不允许继续时，线程如何在不占着锁的前提下等待”。信号量回答的是“还有多少个等价的容量单位可以分配”。把三者混在一起，是许多活性故障的起点。",
          "例如，有界缓冲区需要锁保证队列结构与 size 一致，需要 notEmpty 和 notFull 表达两个等待谓词；若消费者处理时还要调用只允许 20 个并发请求的下游服务，这个外部上限才适合由 Semaphore 表达。一个许可并不会自动保护队列内部结构。",
          "ReentrantLock 和 synchronized 具有同类的互斥与内存同步语义。选择显式锁的理由应是可中断获取、限时获取、非阻塞尝试或多个 Condition，而不是笼统宣称它“总是更快”。"
        ],
        checkpoint: {
          prompt: "一个 Semaphore(1) 能否完全替代 ReentrantLock？",
          answer: [
            "它可以限制同时只有一个线程通过，但信号量没有线程所有权，任何线程都能 release，错误的重复 release 还会增加许可数。",
            "ReentrantLock 记录所有者和重入次数，非所有者 unlock 会失败。保护复合状态时应优先表达真实所有权，不要只看并发数恰好都是一。"
          ],
          successCriteria: [
            "能用一句话区分 Lock、Condition 和 Semaphore",
            "能说明信号量不是状态不变量的替代品"
          ]
        }
      },
      {
        kind: "experiment",
        eyebrow: "先看完整协议",
        title: "一把锁、两个条件队列，组成一个可中断的有界缓冲区",
        prediction:
          "缓冲区容量为 1，first 已经占满它。主线程再 put second 时会在哪里等待？消费者取走 first 后，为什么只需唤醒等待 notFull 的生产者？",
        codeLabel: "Java 21 · ConditionBufferDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac ConditionBufferDemo.java\njava ConditionBufferDemo",
        code: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Objects;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public final class ConditionBufferDemo {
    private static final class BoundedBuffer<E> {
        private final int capacity;
        private final Deque<E> elements = new ArrayDeque<>();
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notEmpty = lock.newCondition();
        private final Condition notFull = lock.newCondition();

        private BoundedBuffer(int capacity) {
            if (capacity < 1) {
                throw new IllegalArgumentException(
                        "capacity must be positive");
            }
            this.capacity = capacity;
        }

        void put(E element) throws InterruptedException {
            Objects.requireNonNull(element, "element");
            lock.lockInterruptibly();
            try {
                while (elements.size() == capacity) {
                    notFull.await();
                }

                elements.addLast(element);
                notEmpty.signal();
            } finally {
                lock.unlock();
            }
        }

        E take() throws InterruptedException {
            lock.lockInterruptibly();
            try {
                while (elements.isEmpty()) {
                    notEmpty.await();
                }

                E element = elements.removeFirst();
                notFull.signal();
                return element;
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        BoundedBuffer<String> buffer = new BoundedBuffer<>(1);
        buffer.put("first");

        Thread consumer = Thread.ofPlatform()
                .name("consumer")
                .start(() -> {
                    try {
                        Thread.sleep(200);
                        System.out.println("取出：" + buffer.take());
                        System.out.println("取出：" + buffer.take());
                    } catch (InterruptedException exception) {
                        Thread.currentThread().interrupt();
                    }
                });

        buffer.put("second");
        System.out.println("second 已获得空位");
        consumer.join();
    }
}`,
        expectedOutput: [
          "以下三行都会出现；主线程与消费者日志的交错可能受调度影响：",
          "取出：first",
          "second 已获得空位",
          "取出：second"
        ],
        observation:
          "主线程发现 elements.size()==capacity 后，在 notFull 上 await。await 原子释放 lock 并挂起主线程，所以消费者能够获得同一把锁、移除 first，再用 notFull.signal 唤醒一个生产者。",
        body: [
          "锁保护的不只是 ArrayDeque 单个方法，而是“检查谓词、改变队列、发出对应信号”这一整段复合动作。若把 size 检查移到锁外，另一个线程可能在检查后改变状态；若 await 不释放锁，消费者永远无法让 notFull 成立。",
          "notEmpty 和 notFull 是绑定到同一把 ReentrantLock 的两个等待集合。生产者只在 notFull 上等待，消费者只在 notEmpty 上等待。状态改变后可以向真正可能继续的那组线程发信号，避免把一批仍不满足条件的线程全部唤醒。",
          "lockInterruptibly 让线程在等待获得锁时也能响应取消；await 本身同样可中断。finally 中的 unlock 则保证正常返回、InterruptedException 和其他运行时异常都不会把锁永久遗留给当前线程。"
        ],
        trace: [
          {
            thread: "main",
            action: "检查 notFull",
            state: "size=1，capacity=1，谓词不成立"
          },
          {
            thread: "main",
            action: "notFull.await",
            state: "原子释放 lock 并进入 notFull 等待集合"
          },
          {
            thread: "consumer",
            action: "removeFirst + notFull.signal",
            state: "size=0，通知一个生产者状态可能可用"
          },
          {
            thread: "main",
            action: "重新获得 lock 并复查谓词",
            state: "size=0，允许插入 second"
          }
        ],
        checkpoint: {
          prompt: "为什么 put 和 take 使用同一把锁，却需要两个 Condition？",
          answer: [
            "同一把锁保证所有队列状态由一个互斥协议保护；两个 Condition 则把等待不同谓词的线程分到不同等待集合。",
            "插入元素只可能让 notEmpty 成立，移除元素只可能让 notFull 成立，因此可以有针对性地 signal。"
          ],
          successCriteria: [
            "能指出 await 释放和重新获取的是哪一把锁",
            "能解释 notEmpty 与 notFull 为什么属于不同等待集合"
          ]
        }
      },
      {
        kind: "mechanism",
        eyebrow: "通知不是通行证",
        title: "await 必须放在 while 中，因为线程等待的是当前谓词，不是一声 signal",
        body: [
          "Condition 允许伪唤醒。即使每次唤醒都来自真实 signal，被唤醒线程也不会立刻拥有锁：它必须先重新竞争关联锁。在此期间，另一个线程可能已经取走唯一元素或占用唯一空位。",
          "因此 signal 的准确含义是“受保护状态已经改变，你等待的谓词可能成立”。只有线程重新获得锁并再次读取当前状态，才能判断自己是否可以行动。把 while 改成 if，就是把过去的一次提示误当成现在仍有效的许可。",
          "await、signal 和 signalAll 都必须在持有关联锁时调用。ReentrantLock 提供的 Condition 在违规时会抛 IllegalMonitorStateException。对 Condition 对象本身执行 synchronized(condition) 或 condition.wait() 与关联 Lock 没有规定关系，应避免混用两套机制。",
          "signal 唤醒一个等待者，适合一次状态变化最多只允许一个同类线程继续；signalAll 让整组等待者重新检查，协议更容易推理但可能产生惊群。先证明一个 signal 不会遗留本可继续的等待者，再把它当成优化。"
        ],
        invariant:
          "所有谓词读取、await、状态改变和 signal 都在保护该状态的同一把锁内；每次 await 返回后都从 while 顶部重新验证谓词。",
        apiOptions: [
          {
            api: "await",
            useWhen: "等待受关联锁保护的状态谓词，并允许中断取消",
            guarantees: "等待时原子释放锁，返回前重新获得锁",
            doesNotGuarantee: "返回时谓词仍然成立"
          },
          {
            api: "awaitNanos / await(timeout)",
            useWhen: "等待必须服从剩余截止时间",
            guarantees: "可区分条件满足、时间耗尽和中断",
            doesNotGuarantee: "系统调度会精确在截止时刻返回"
          },
          {
            api: "signal",
            useWhen: "一次状态变化最多允许一个同类等待者继续",
            guarantees: "唤醒该 Condition 上的一个等待线程",
            doesNotGuarantee: "该线程立即获得锁或一定能继续"
          },
          {
            api: "signalAll",
            useWhen: "多个谓词共享等待集合，或难以证明单次 signal 足够",
            guarantees: "所有该 Condition 等待者都有机会重新检查",
            doesNotGuarantee: "避免惊群与无效竞争"
          }
        ],
        checkpoint: {
          prompt: "已经使用独立的 notEmpty Condition，为什么 await 仍不能改成 if？",
          answer: [
            "独立等待集合减少了唤醒错误类型线程的机会，但不能消除伪唤醒，也不能阻止另一个消费者先重新获得锁并取走元素。",
            "Condition 永远提供状态可能变化的通知，谓词循环才提供行动许可。"
          ],
          successCriteria: [
            "能列出伪唤醒和竞争重获锁两个 while 理由",
            "能说明 signal 后等待线程仍需重新获得锁"
          ]
        }
      },
      {
        kind: "experiment",
        eyebrow: "不要无限期等锁",
        title: "tryLock 把“拿不到锁”变成调用方可以处理的结果",
        prediction:
          "主线程持锁 250 毫秒，另一个线程只愿意等待 150 毫秒。tryLock 会抛异常、无限阻塞，还是返回一个值？",
        codeLabel: "Java 21 · TimedLockDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac TimedLockDemo.java\njava TimedLockDemo",
        code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public final class TimedLockDemo {
    public static void main(String[] args) throws InterruptedException {
        ReentrantLock lock = new ReentrantLock(true);
        CountDownLatch contenderStarted = new CountDownLatch(1);

        lock.lock();
        try {
            Thread contender = Thread.ofPlatform()
                    .name("contender")
                    .start(() -> {
                        boolean acquired = false;
                        try {
                            contenderStarted.countDown();
                            acquired = lock.tryLock(
                                    150,
                                    TimeUnit.MILLISECONDS);
                            System.out.println(
                                    "contender acquired: " + acquired);
                        } catch (InterruptedException exception) {
                            Thread.currentThread().interrupt();
                        } finally {
                            if (acquired) {
                                lock.unlock();
                            }
                        }
                    });

            contenderStarted.await();
            Thread.sleep(250);
            contender.join();
        } finally {
            lock.unlock();
        }
    }
}`,
        expectedOutput: [
          "contender acquired: false"
        ],
        observation:
          "限时 tryLock 在预算内没有获得锁，因此返回 false。只有 acquired 为 true 时才能 unlock；否则 finally 中无条件释放会以非所有者身份操作锁，并抛出 IllegalMonitorStateException。",
        body: [
          "显式锁的价值之一是让获取本身拥有 API 级结果。无参数 tryLock 立即返回，限时 tryLock 在截止时间内等待，lockInterruptibly 则无限等待但可被中断。调用方可以把锁竞争纳入总延迟预算，而不是让请求永久卡在 lock。",
          "任何成功 lock 都必须紧接 try/finally。ReentrantLock 是可重入锁：同一线程再次获取会增加持有计数，只有相同次数的 unlock 才真正释放。可重入能支持同一对象内受锁方法互相调用，但也可能掩盖意外递归，不能省略释放配对。",
          "失败的 tryLock 没有成功获取动作，因此也不能借它推导内存同步。只有成功获取与成功释放具有和监视器 lock/unlock 对应的内存效果。"
        ],
        checkpoint: {
          prompt: "为什么示例需要 acquired boolean？",
          answer: [
            "tryLock 可能返回 false，或在等待时抛 InterruptedException。只有成功获得锁的路径才有权 unlock。",
            "把释放放进 finally 仍然正确，但 finally 必须由是否获得所有权来守卫。"
          ],
          successCriteria: [
            "能正确书写 tryLock 的条件释放结构",
            "能区分 lock、lockInterruptibly 与两种 tryLock"
          ]
        }
      },
      {
        kind: "misconception",
        eyebrow: "公平不是调度承诺",
        title: "公平锁减少插队，却不保证每个线程轮流运行",
        body: [
          "ReentrantLock 默认不保证竞争线程的获取顺序。fair=true 时，竞争状态下会偏向等待最久的线程，通常减少等待时间波动并避免锁饥饿；代价是整体吞吐量可能降低，而且在高竞争下可能明显降低。",
          "公平锁只约束锁内部的授予策略，无法控制操作系统何时调度线程。一个线程释放锁后仍可能继续运行并再次发起获取，而其他活跃线程暂时没有获得 CPU。因此，不要把公平锁描述为严格轮转。",
          "无超时 tryLock 即使在公平锁上也允许插队：锁当下可用便立即成功，不关心是否已有等待者。若一次零等待尝试也必须尊重公平设置，可以使用 tryLock(0, TimeUnit.SECONDS)，同时接受它是中断点。",
          "ReentrantLock 创建的 Condition 会按 FIFO 选择被 signal 的等待者；但等待者返回前仍要重新获取锁，重获顺序由锁的公平策略决定。条件等待顺序、锁授予顺序和线程调度顺序必须分开描述。"
        ],
        checkpoint: {
          prompt: "fair=true 后，能否断言线程 A、B、C 会严格轮流进入临界区？",
          answer: [
            "不能。公平锁偏向等待最久的竞争者，但不保证线程调度公平，也不阻止未进入等待队列的运行时差异。",
            "若业务要求确定顺序，应显式排队或按序列号交给单一所有者处理，而不是把锁公平性当作业务调度器。"
          ],
          successCriteria: [
            "能解释公平策略与线程调度的区别",
            "能指出无超时 tryLock 的插队例外"
          ]
        }
      },
      {
        kind: "experiment",
        eyebrow: "许可表达稀缺容量",
        title: "虚拟线程可以很多，下游并发仍然只能有两个",
        prediction:
          "程序为六个任务各创建一个虚拟线程，但 Semaphore 只有两个许可。peakActive 最终会是多少？线程数量无界是否会绕开许可上限？",
        codeLabel: "Java 21 · SemaphorePermitDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac SemaphorePermitDemo.java\njava SemaphorePermitDemo",
        code: `import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

public final class SemaphorePermitDemo {
    private static final Semaphore SLOTS = new Semaphore(2, true);
    private static final AtomicInteger ACTIVE = new AtomicInteger();
    private static final AtomicInteger PEAK_ACTIVE = new AtomicInteger();

    private static int callLimitedService(int requestId)
            throws InterruptedException {
        SLOTS.acquire();
        try {
            int active = ACTIVE.incrementAndGet();
            PEAK_ACTIVE.accumulateAndGet(active, Math::max);
            System.out.printf(
                    "request %d started; active=%d%n",
                    requestId,
                    active);
            Thread.sleep(150);
            return requestId;
        } finally {
            ACTIVE.decrementAndGet();
            SLOTS.release();
        }
    }

    public static void main(String[] args) throws Exception {
        try (var executor =
                     Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Integer>> results =
                    IntStream.rangeClosed(1, 6)
                            .mapToObj(id -> executor.submit(
                                    () -> callLimitedService(id)))
                            .toList();

            for (Future<Integer> result : results) {
                result.get();
            }
        }

        System.out.println("peak active: " + PEAK_ACTIVE.get());
    }
}`,
        expectedOutput: [
          "六条 started 输出的顺序不固定，但每一行 active 都不会大于 2",
          "peak active: 2"
        ],
        observation:
          "newVirtualThreadPerTaskExecutor 为每个任务创建虚拟线程，线程数量本身不受这个执行器限制；Semaphore 把真正稀缺的下游调用槽限制为两个。其余虚拟线程阻塞在 acquire，而不是占用一个专门的线程池工作槽。",
        body: [
          "信号量内部维护的是许可计数，不存在六个任务分别拥有的实体许可对象。成功 acquire 将可用计数减一；release 加一，并可能让等待者继续。许可要包住真正消耗稀缺资源的最小代码段，过早释放会突破并发上限，过晚释放会无谓降低吞吐量。",
          "release 必须位于成功 acquire 之后的 finally。若 acquire 在得到许可前被中断，它会抛 InterruptedException，代码根本不会进入 try，因此不会错误归还一个从未取得的许可。若先声明 acquired 标志再使用 tryAcquire，也必须只在 acquired=true 时释放。",
          "Semaphore 的内存一致性保证是：一个线程在 release 之前的动作，happen-before 另一个线程成功 acquire 之后的动作。这适合资源移交，但并不自动保护一个可变资源池的集合结构；资源池内部仍需要锁或线程安全集合维护对象与许可的一致性。"
        ],
        trace: [
          {
            thread: "virtual request 1",
            action: "acquire",
            state: "取得许可，available 从 2 变为 1"
          },
          {
            thread: "virtual request 2",
            action: "acquire",
            state: "取得许可，available 从 1 变为 0"
          },
          {
            thread: "其他虚拟线程",
            action: "acquire",
            state: "没有许可，进入等待"
          },
          {
            thread: "完成者",
            action: "release",
            state: "归还许可，让一个等待者继续"
          }
        ],
        checkpoint: {
          prompt: "为什么不直接把虚拟线程执行器换成固定大小为 2 的线程池？",
          answer: [
            "线程池限制的是执行任务的平台线程资源，而业务真正想保护的是某个下游调用。把容量建模为 Semaphore，限制位置与业务资源一致，也允许任务在调用前后执行其他工作。",
            "Oracle 的 Java 21 指南建议不要池化虚拟线程；每个任务使用虚拟线程，对数据库或下游服务等稀缺资源使用 Semaphore。"
          ],
          successCriteria: [
            "能说明虚拟线程数量与外部资源并发是两个维度",
            "能正确放置 acquire、try 和 finally release"
          ]
        }
      },
      {
        kind: "mechanism",
        eyebrow: "许可不是锁所有权",
        title: "Semaphore 可以由别的线程释放，也可能被错误地释放太多次",
        body: [
          "ReentrantLock 由最后成功获取且尚未完全释放的线程拥有，非所有者 unlock 会抛 IllegalMonitorStateException。Semaphore 没有所有者概念：一个线程 acquire 后，另一个线程可以 release。这适合资源归还、信号传递和某些故障恢复，但也意味着 API 不会替你发现所有错误释放。",
          "重复 release 会把可用许可增加到初始值以上，从而悄悄突破并发上限。availablePermits 适合指标和诊断，不能通过“当前许可数小于上限”来决定是否 release；正确性必须来自每次成功获取与恰好一次释放的控制流配对。",
          "公平信号量在竞争时按 acquire 请求到达内部排序点的先后授予许可，但方法调用的墙钟先后不一定等于这个内部顺序。无超时 tryAcquire 即使在公平模式也允许抢占当前可用许可；零超时的定时版本才尊重公平队列。",
          "多许可 acquire 必须一次拿齐所需数量才成功。若混合请求一个许可和多个许可，非公平模式更容易让大请求长期等不到足够许可；公平模式改善饥饿风险，但仍应度量延迟与吞吐量，而不是凭参数名称推断系统表现。"
        ],
        apiOptions: [
          {
            api: "acquire",
            useWhen: "容量必须等待到可用，且调用方允许中断",
            guarantees: "成功后取得指定许可数",
            doesNotGuarantee: "等待时长上界"
          },
          {
            api: "tryAcquire",
            useWhen: "需要立即准入结果，吞吐量优先",
            guarantees: "许可当前足够才原子取得",
            doesNotGuarantee: "遵守公平设置"
          },
          {
            api: "tryAcquire(timeout)",
            useWhen: "资源等待必须服从截止时间",
            guarantees: "区分成功、超时和中断，并遵守公平队列",
            doesNotGuarantee: "远程调用本身在同一截止时间内完成"
          },
          {
            api: "acquireUninterruptibly",
            useWhen: "极少数不能取消且明确承担无限等待的内部协议",
            guarantees: "等待期间不因中断退出，返回时恢复中断状态",
            doesNotGuarantee: "关闭流程及时完成"
          }
        ],
        checkpoint: {
          prompt: "为什么 finally 中无条件 release 有时正确，有时会制造许可？",
          answer: [
            "若 try 块只在 acquire 成功返回后才进入，无条件 release 正确；若使用 tryAcquire，或 acquire 本身位于 try 内并可能在成功前抛异常，就必须记录是否真正取得许可。",
            "判断标准不是有没有 finally，而是每次 release 是否都能对应一次已成功的 acquire。"
          ],
          successCriteria: [
            "能说明 Semaphore 没有线程所有权",
            "能识别重复 release 和未获取先 release 的容量泄漏"
          ]
        }
      },
      {
        kind: "api-decision",
        eyebrow: "按不变量选择工具",
        title: "锁状态、等谓词和限容量，可以组合但不能互相伪装",
        body: [
          "只需要一个很小的词法临界区时，synchronized 往往最清楚；需要可中断、限时或多个等待集合时，再使用 ReentrantLock 与 Condition。不要为了风格统一，把所有监视器机械替换成显式锁。",
          "Condition 适合等待由同一把锁保护的状态，例如队列非空、缓存加载完成或组件不再暂停。Semaphore 适合等价容量，例如租户最多五个查询、下游最多二十个请求。若许可背后对应具体对象，仍需保证对象池状态与许可数同步变化。",
          "锁和许可都应尽量缩小持有范围，但不能缩到破坏原子性。尤其不要持有保护本地集合的锁去执行未知回调或远程 I/O；这会把外部延迟带入所有竞争线程，甚至形成跨组件死锁。先在锁内认领状态，锁外执行慢操作，再以明确提交协议写回结果。"
        ],
        apiOptions: [
          {
            api: "synchronized",
            useWhen: "短小、结构化的互斥区，只需一个监视器等待集合或完全不等待",
            guarantees: "自动按词法作用域释放监视器",
            doesNotGuarantee: "限时或可中断地获取监视器"
          },
          {
            api: "ReentrantLock",
            useWhen: "需要 tryLock、lockInterruptibly、限时获取或多个 Condition",
            guarantees: "显式所有权、重入与监视器等价的内存同步",
            doesNotGuarantee: "自动释放或天然更高性能"
          },
          {
            api: "Condition",
            useWhen: "线程等待一个由关联 Lock 保护的谓词",
            guarantees: "等待时释放锁，返回前重新获得锁",
            doesNotGuarantee: "signal 后谓词仍成立"
          },
          {
            api: "Semaphore",
            useWhen: "限制若干可互换的并发槽位",
            guarantees: "原子分配与归还许可，并建立 release-acquire 发布边",
            doesNotGuarantee: "共享状态一致性或所有者配对检查"
          }
        ],
        task:
          "为一个多租户查询网关画出同步边界：每租户最多两个查询，全局最多十个下游请求；查询注册表需要原子检查并写入，远程调用不能在注册表锁内执行。",
        constraints: [
          "分别标注租户许可、全局许可和注册表锁",
          "规定两种许可的固定获取顺序，避免不同路径交叉等待",
          "任一许可获取失败或中断时，只释放已经成功取得的许可",
          "远程调用使用总截止时间，而不是每层重新获得完整超时",
          "指标读取不能参与同步决策"
        ],
        hints: [
          "先用锁在注册表中把查询从 NEW 变为 ADMITTED，再离开临界区。",
          "按固定顺序获取全局与租户许可，失败时按相反顺序释放。",
          "把 permit guard 写成小型 AutoCloseable 可以减少遗漏，但 close 仍需保证只执行一次。"
        ],
        checkpoint: {
          prompt: "同一段代码同时使用 ReentrantLock 和 Semaphore 是否说明设计过度？",
          answer: [
            "不一定。若锁保护注册表复合不变量，而信号量限制注册表之外的下游并发，它们表达的是两个真实且独立的约束。",
            "问题出现在边界不清：用许可数推断集合状态，或持有注册表锁等待远程许可，都会把两个协议错误耦合。"
          ],
          successCriteria: [
            "能根据不变量而非 API 熟悉度选择工具",
            "能设计固定许可获取顺序和异常释放路径"
          ]
        }
      },
      {
        kind: "implementation",
        eyebrow: "把许可生命周期封装起来",
        title: "实现一个带截止时间的租户准入门",
        task:
          "实现 TenantGate：每个实例限制一个租户的并发操作数，调用者在等待预算内取得许可后执行 Callable；超时抛 RejectedExecutionException，中断继续传播，业务异常保持原始类型。",
        constraints: [
          "使用公平 Semaphore，但不要声称它保证线程调度公平",
          "使用 tryAcquire(timeout)，不能先读 availablePermits",
          "只有成功取得许可后才进入 try/finally",
          "业务调用发生在取得许可后，release 必须覆盖正常与异常路径",
          "示例使用虚拟线程证明线程数不等于租户并发额度"
        ],
        hints: [
          "Callable.call 已经允许抛 Exception，可以让 InterruptedException 与业务异常自然传播。",
          "Duration 必须拒绝负数；转换为纳秒时保留调用方总预算。",
          "不要捕获 Exception 后统一包装，否则调用方无法区分取消、过载和业务失败。"
        ],
        codeLabel: "Java 21 · TenantGate.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        runCommand:
          "javac TenantGate.java\njava TenantGate",
        code: `import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

public final class TenantGate {
    private final Semaphore permits;

    public TenantGate(int maxConcurrent) {
        if (maxConcurrent < 1) {
            throw new IllegalArgumentException(
                    "maxConcurrent must be positive");
        }
        this.permits = new Semaphore(maxConcurrent, true);
    }

    public <T> T call(Duration waitBudget, Callable<T> action)
            throws Exception {
        Objects.requireNonNull(waitBudget, "waitBudget");
        Objects.requireNonNull(action, "action");
        if (waitBudget.isNegative()) {
            throw new IllegalArgumentException(
                    "waitBudget must not be negative");
        }

        boolean acquired = permits.tryAcquire(
                waitBudget.toNanos(),
                TimeUnit.NANOSECONDS);
        if (!acquired) {
            throw new RejectedExecutionException(
                    "tenant concurrency limit reached");
        }

        try {
            return action.call();
        } finally {
            permits.release();
        }
    }

    public static void main(String[] args) throws Exception {
        TenantGate gate = new TenantGate(1);

        try (var executor =
                     Executors.newVirtualThreadPerTaskExecutor()) {
            var first = executor.submit(() -> gate.call(
                    Duration.ofSeconds(1),
                    () -> {
                        Thread.sleep(200);
                        return "first completed";
                    }));

            Thread.sleep(50);
            var second = executor.submit(() -> {
                try {
                    return gate.call(
                            Duration.ofMillis(50),
                            () -> "second completed");
                } catch (RejectedExecutionException exception) {
                    return "second rejected";
                }
            });

            System.out.println(first.get());
            System.out.println(second.get());
        }
    }
}`,
        expectedOutput: [
          "first completed",
          "second rejected"
        ],
        body: [
          "TenantGate 把等待预算与业务操作放在同一个调用边界。成功获取后，action 无论正常返回还是抛异常，finally 都归还许可；tryAcquire 超时时从未取得许可，因此直接拒绝，不执行 release。",
          "这个类型没有暴露 availablePermits，因为调用方不需要先观察再行动。若生产监控需要该值，可以提供明确命名的近似指标方法，但准入仍必须由一次 tryAcquire 决定。",
          "示例用短暂 sleep 协调演示，正式并发测试应使用 CountDownLatch 控制 first 已经取得许可，再启动 second。时间睡眠适合模拟业务耗时，不适合证明线程先后关系。"
        ],
        adversarialTest:
          "让 action 抛出自定义业务异常，随后再次调用 gate，并断言第二次调用仍能取得许可。再启动一个阻塞在 tryAcquire 的线程并中断它，断言中断路径没有增加 availablePermits，也没有执行 action。",
        checkpoint: {
          prompt: "TenantGate 为什么不使用固定线程池来实现每租户并发限制？",
          answer: [
            "固定线程池把线程资源和租户业务容量绑定在一起，而且每个租户都建池会增加生命周期、队列和异常处理复杂度。",
            "Semaphore 直接表达许可上限，既适用于平台线程，也适用于 Java 21 的每任务虚拟线程。"
          ],
          successCriteria: [
            "所有成功获取都有且只有一次 release",
            "超时、中断和业务异常保持可区分",
            "实现没有依赖 availablePermits 做准入"
          ]
        }
      },
      {
        kind: "distributed-boundary",
        eyebrow: "单 JVM 许可不是全局配额",
        title: "虚拟线程解决线程稀缺，不会扩容数据库、租户预算或远程服务",
        body: [
          "Java 21 的 newVirtualThreadPerTaskExecutor 为每个任务创建一个虚拟线程，创建数量不设线程池上限。虚拟线程让大量阻塞 I/O 任务不再需要靠共享平台线程池复用昂贵线程，但任务对象、请求负载、数据库连接和下游服务容量仍然有限。",
          "Oracle 的 Java 21 指南明确建议不要池化虚拟线程；若某个操作只能有十个并发，应在该操作周围使用 Semaphore。数据库连接池本身已经承担类似许可的作用时，不应无理由再叠加一个相同上限，否则会制造两层等待队列和更难解释的超时。",
          "本地 Semaphore 只限制当前 JVM。服务有五个副本且每个副本允许十个许可时，集群理论上可以同时放行五十个调用。若配额必须全局精确，需要数据库事务、中心化配额服务、分区所有者或租约协议；这些方案还必须处理节点崩溃、租约过期和 fencing。",
          "远程调用超时后，归还本地许可只表示当前线程不再占用本地槽位，不证明服务器已经停止工作。截止时间和取消需要向下游传播，副作用需要幂等；否则客户端释放许可并重试时，旧请求和新请求可能同时生效。"
        ],
        localGuarantee:
          "ReentrantLock 与 Condition 在单 JVM 内保护共享状态和等待谓词；Semaphore 在单 JVM 内原子管理许可，并建立 release 到成功 acquire 的可见性边。",
        breaksWith:
          "进程副本扩容、节点崩溃、网络超时、远端继续执行和租约过期都不受本地锁或本地许可控制。",
        alternatives: [
          "数据库连接池直接作为连接许可边界",
          "按分区或租户选择单一所有者，串行决定准入",
          "数据库事务维护全局配额和幂等请求记录",
          "带 fencing token 的租约服务处理跨节点所有权"
        ],
        checkpoint: {
          prompt: "学完本课，如何判断代码应该使用 Lock、Condition 还是 Semaphore？",
          answer: [
            "先写不变量：若要原子保护一组共享状态，使用锁；若持锁线程要等这组状态满足谓词，使用绑定到该锁的 Condition；若要分配若干可互换的并发容量，使用 Semaphore。",
            "再写边界：它们都只提供单 JVM 协调。跨节点容量、未知远程结果和故障恢复需要独立协议。"
          ],
          successCriteria: [
            "能正确实现 await while 与定向 signal",
            "能正确配对 acquire 和 release",
            "能解释公平设置的保证与例外",
            "能说明虚拟线程为何仍需稀缺资源许可",
            "能区分本地许可与全局配额"
          ]
        }
      }
    ]
  },
  {
    slug: "bounded-executors",
    week: 6,
    title: "线程池满了以后：排队、扩容、拒绝与失败可见性",
    dek: "从一个可重复的饱和实验出发，读懂 ThreadPoolExecutor 的准入顺序，显式选择工作线程、等待队列与拒绝策略，并确保每个异步失败都有人观察。",
    readTime: "44 分钟",
    status: "published",
    tags: [
      "ThreadPoolExecutor",
      "有界队列",
      "拒绝策略",
      "Future",
      "过载保护"
    ],
    searchTerms: [
      "ThreadPoolExecutor",
      "corePoolSize",
      "maximumPoolSize",
      "workQueue",
      "RejectedExecutionException",
      "CallerRunsPolicy",
      "Future",
      "ExecutionException",
      "Executors.newFixedThreadPool",
      "虚拟线程"
    ],
    keyIdea:
      "线程池不是一组线程，而是一套准入协议：先决定能同时运行多少、能排队多少，再明确容量耗尽时由谁承担拒绝、等待或降级。",
    sections: [],
    questions: [],
    references: [
      {
        title: "Java 21 · ThreadPoolExecutor API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html",
        note: "核心线程、队列、最大线程、拒绝顺序、hook 与动态统计的正式契约。"
      },
      {
        title: "Java 21 · RejectedExecutionHandler API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/RejectedExecutionHandler.html",
        note: "任务无法被 ThreadPoolExecutor 接受时的处理边界。"
      },
      {
        title: "Java 21 · Executors API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Executors.html",
        note: "便捷工厂实际隐藏的队列或线程增长策略，以及虚拟线程逐任务执行器。"
      },
      {
        title: "Java 21 · Future API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html",
        note: "异步完成、失败、取消与 get 所提供的结果和内存一致性保证。"
      },
      {
        title: "Java 21 · Virtual Threads",
        href: "https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html",
        note: "虚拟线程适合高吞吐阻塞任务，但不应拿线程池大小充当稀缺资源上限。"
      }
    ],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先看那个最熟悉的工厂方法",
        title: "四个工作线程背后，可能藏着一条几乎没有边界的等待队列",
        goal:
          "看到 Executor 工厂方法时，不只数线程，还能追问等待队列、最大积压和容量耗尽后的行为。",
        codeLabel: "Java 21 · 这段配置隐藏了什么",
        codeKind: "excerpt",
        javaVersion: "Java 21",
        code: `ExecutorService executor =
        Executors.newFixedThreadPool(4);

for (Request request : incomingRequests) {
    executor.submit(() -> handle(request));
}`,
        body: [
          "`newFixedThreadPool(4)` 确实只让四个任务同时在线程中执行，但它使用共享的无界队列保存其余任务。生产速度长期高于消费速度时，提交动作仍然很顺滑，真正的过载却被转成越来越长的排队时间、越来越多的任务对象和越来越晚才发生的内存压力。",
          "这类配置最危险的地方不是 API 本身，而是它让容量决策变得不可见。调用方看不到明确拒绝，监控若只盯活跃线程也会一直看到 4；与此同时，队列里的请求可能早已超过自己的业务截止时间。",
          "所以线程池评审至少要写出三个数字：可同时执行多少个任务、最多等待多少个任务、一个任务无法准入时发生什么。若其中一个答案是“默认值”，就继续追到实现或 API 文档。"
        ],
        bullets: [
          "工作线程上限保护 CPU 或某类并发执行资源。",
          "队列容量决定系统愿意用多少内存和等待时间吸收短时突发。",
          "拒绝策略决定超出总容量的请求在哪里得到明确结果。",
          "这三个数字不能只按机器核心数拍脑袋，要与任务类型、下游容量和延迟预算一起验证。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "把准入顺序跑出来",
        title: "一个核心线程、一格队列、最多两个线程：第四个任务会去哪里？",
        goal:
          "用稳定实验观察“先建核心线程、再入队、队列满后才扩到 maximum、最后拒绝”的顺序。",
        prediction:
          "前三个任务都被闩锁挡住：第一个占核心线程，第二个进入唯一队列格，第三个触发第二条线程。此时提交第四个任务，会创建第三条线程、继续排队，还是立即拒绝？",
        codeLabel: "Java 21 · PoolAdmissionDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public final class PoolAdmissionDemo {
    private PoolAdmissionDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch releaseTasks = new CountDownLatch(1);
        CountDownLatch coreStarted = new CountDownLatch(1);
        CountDownLatch maximumStarted = new CountDownLatch(1);

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                1,
                2,
                30,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(1),
                new ThreadPoolExecutor.AbortPolicy());

        executor.execute(blockingTask(coreStarted, releaseTasks));
        coreStarted.await();

        executor.execute(() -> await(releaseTasks));
        executor.execute(blockingTask(maximumStarted, releaseTasks));
        maximumStarted.await();

        boolean fourthRejected = false;
        try {
            executor.execute(() -> System.out.println("unreachable"));
        } catch (RejectedExecutionException expected) {
            fourthRejected = true;
        }

        System.out.println("pool size=" + executor.getPoolSize());
        System.out.println("queued=" + executor.getQueue().size());
        System.out.println("fourth rejected=" + fourthRejected);

        releaseTasks.countDown();
        executor.shutdown();
        if (!executor.awaitTermination(1, TimeUnit.SECONDS)) {
            throw new IllegalStateException("executor did not terminate");
        }
    }

    private static Runnable blockingTask(
            CountDownLatch started,
            CountDownLatch releaseTasks) {
        return () -> {
            started.countDown();
            await(releaseTasks);
        };
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }
}`,
        runCommand:
          "javac --release 21 PoolAdmissionDemo.java && java PoolAdmissionDemo",
        expectedOutput: [
          "pool size=2",
          "queued=1",
          "fourth rejected=true"
        ],
        observation:
          "池中恰好两条活动工作线程，队列占满一格，第四个任务由 AbortPolicy 以 RejectedExecutionException 明确拒绝。",
        body: [
          "关键反直觉在第三个任务：ThreadPoolExecutor 不会在核心线程忙碌时立刻扩到 maximum。只要工作队列还能接受任务，它就先排队；只有队列拒绝入队，而且当前工作线程数仍小于 maximumPoolSize，才创建额外线程。",
          "这意味着 `maximumPoolSize` 不是一个孤立的并发旋钮。若 workQueue 是无界队列，入队几乎不会因容量失败，池也就通常不会增长到 corePoolSize 以上。把 maximum 从 8 改成 800，可能完全不改变系统行为。",
          "示例用 CountDownLatch 固定三个任务的位置，而不是依赖 sleep。这样输出验证的是线程池准入协议，不是某次机器调度恰好足够慢。"
        ],
        trace: [
          {
            thread: "任务 1",
            action: "当前 worker < core，创建第一条工作线程",
            state: "pool=1, queue=0"
          },
          {
            thread: "任务 2",
            action: "核心线程已满，队列 offer 成功",
            state: "pool=1, queue=1"
          },
          {
            thread: "任务 3",
            action: "队列已满且 worker < maximum，创建第二条线程",
            state: "pool=2, queue=1"
          },
          {
            thread: "任务 4",
            action: "队列满且 worker == maximum，执行拒绝策略",
            state: "容量耗尽，调用方得到明确失败"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "把 execute 读成一棵决策树",
        title: "core、queue 和 maximum 的判断顺序，比三个参数的名字更重要",
        codeLabel: "ThreadPoolExecutor.execute 的概念决策树",
        codeKind: "pseudocode",
        code: `execute(task):
    if currentWorkers < corePoolSize:
        startWorker(task)
    else if running and workQueue.offer(task):
        keepTaskQueued()
    else if currentWorkers < maximumPoolSize:
        startWorker(task)
    else:
        reject(task)`,
        body: [
          "这段伪代码不是 JDK 源码逐行翻写，而是理解公开契约所需的最小决策树。真实实现还要处理执行器在检查过程中关闭、工作线程同时退出等竞态，因此入队后会重新检查运行状态，必要时移除任务或补建工作线程。",
          "`corePoolSize` 也不等于“进程启动就已经存在的线程数”。默认情况下，核心线程通常在新任务到来时按需创建；确实需要提前建立，可显式调用 `prestartCoreThread()` 或 `prestartAllCoreThreads()`，但这样做仍不会增加总容量。",
          "一个任务被接受，只表示它进入了执行器负责的运行或排队集合，不表示它已经开始、会在调用方截止时间内完成，也不表示任务内部不会失败。准入、执行、完成与结果观察必须分别留下证据。"
        ],
        invariant:
          "任何时刻，已接受但尚未完成的任务只能位于工作线程或等待队列；两处容量都耗尽时，新任务必须走一条显式拒绝路径。"
      },
      {
        kind: "api-decision",
        eyebrow: "先选择交接方式，再调线程数",
        title: "无队列、无界队列和有界队列，塑造的是三种不同系统",
        goal:
          "根据任务依赖、突发规模和等待预算选择工作队列，而不是只比较集合实现。",
        body: [
          "`SynchronousQueue` 没有存放元素的容量，每次提交都要直接交给一个工作线程；它适合任务之间没有内部依赖、希望快速扩线程或拒绝的直接交接。若 maximum 也没有可信上限，突发会转成线程爆炸。",
          "无界 `LinkedBlockingQueue` 会在核心线程都忙时持续排队，使 maximumPoolSize 基本失去作用。它能平滑有限突发，却会把长期过载隐藏成内存与尾延迟问题。",
          "有界 `ArrayBlockingQueue` 把总积压写成一个明确数字，迫使系统在满载时执行策略。队列太小会频繁扩线程或拒绝，太大则增加排队延迟；没有脱离负载与 SLO 的“最佳容量公式”，只有可测量、可调整的容量假设。"
        ],
        apiOptions: [
          {
            api: "SynchronousQueue",
            useWhen: "任务必须直接交给空闲或新建工作线程，不希望在池内排队。",
            guarantees: "一次插入必须与一次移除配对，没有内部元素容量。",
            doesNotGuarantee: "工作线程有界；maximumPoolSize 仍必须可信。"
          },
          {
            api: "LinkedBlockingQueue（无界）",
            useWhen: "任务到达率有严格上游约束，且积压上限在别处已经被证明。",
            guarantees: "核心线程忙时可继续保存大量等待任务。",
            doesNotGuarantee: "内存、队列等待或业务截止时间有界。"
          },
          {
            api: "ArrayBlockingQueue",
            useWhen: "需要固定积压上限和明确饱和点。",
            guarantees: "队列元素数量不超过构造容量。",
            doesNotGuarantee: "自动选择正确拒绝策略，也不保证任务在截止时间内开始。"
          },
          {
            api: "虚拟线程逐任务执行器",
            useWhen: "大量相互独立、主要等待 I/O 的任务需要简单的 thread-per-task 风格。",
            guarantees: "每个提交任务启动一条新虚拟线程，不使用线程池复用来限制并发。",
            doesNotGuarantee: "数据库连接、下游 QPS、内存或任务提交数量有界；这些资源要单独准入。"
          }
        ]
      },
      {
        kind: "misconception",
        eyebrow: "拒绝策略不是异常处理装饰",
        title: "CallerRuns 能减慢提交者，但不能被写成“天然背压”",
        goal:
          "准确说明四种内置拒绝策略把损失转移给谁，并识别 CallerRuns 在事件循环、持锁调用和关闭期间的边界。",
        codeLabel: "Java 21 · 看似温和的 CallerRunsPolicy",
        codeKind: "excerpt",
        javaVersion: "Java 21",
        code: `ThreadPoolExecutor executor = new ThreadPoolExecutor(
        8,
        8,
        0,
        TimeUnit.MILLISECONDS,
        new ArrayBlockingQueue<>(256),
        new ThreadPoolExecutor.CallerRunsPolicy());

// 饱和时，这一行可能直接在当前请求线程里执行 task。
executor.execute(task);`,
        body: [
          "`AbortPolicy` 抛出 RejectedExecutionException，最容易让调用方把过载映射成 HTTP 429/503、重试建议或明确失败。`DiscardPolicy` 静默丢掉任务；除非业务明确定义了可丢语义和指标，否则它会把数据损失伪装成成功提交。",
          "`CallerRunsPolicy` 在执行器尚未关闭时，让调用 `execute` 的线程亲自运行任务。若提交者就是上游工作线程，它确实会降低继续提交的速度；若提交者是 Netty 事件循环、持有业务锁的线程或延迟敏感请求线程，任务就可能阻塞整个入口，甚至形成锁依赖环。",
          "更容易被忽略的是关闭语义：执行器已经 shutdown 时，CallerRunsPolicy 不会在调用方执行任务，而是丢弃它。`DiscardOldestPolicy` 会移除队首等待任务再重试提交，既可能丢掉最接近执行的工作，也可能破坏优先级队列的业务含义。",
          "所以策略名称不是系统契约。你必须写明：拒绝能否丢任务、调用方收到什么、能否重试、任务是否幂等、哪个指标记录尝试与接受，以及关闭竞态如何返回。"
        ],
        bullets: [
          "Abort：失败显式，调用方必须处理异常。",
          "CallerRuns：把执行时间转移给提交线程；shutdown 后仍可能直接丢弃。",
          "Discard：静默丢弃，只有明确允许采样/丢数据的协议才可能适用。",
          "DiscardOldest：丢弃队首再重试，不适合不能重排或不能丢失的任务。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "让两种提交方式都失败一次",
        title: "execute 的异常会逃出任务；submit 的异常通常藏在 Future 里",
        goal:
          "观察 execute 与 submit 的失败通道，并保证每一个 Future 最终都有代码读取其终态。",
        prediction:
          "同一个单线程池先 execute 一个抛异常的 Runnable，再 submit 另一个抛异常的 Callable。哪个失败会到达 UncaughtExceptionHandler，哪个失败要靠 Future.get 才能看见？",
        codeLabel: "Java 21 · TaskFailureVisibilityDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public final class TaskFailureVisibilityDemo {
    private TaskFailureVisibilityDemo() {
    }

    public static void main(String[] args) throws Exception {
        CountDownLatch executeFailureObserved = new CountDownLatch(1);

        ThreadFactory factory = task -> {
            Thread thread = new Thread(task, "observed-worker");
            thread.setUncaughtExceptionHandler((ignored, failure) -> {
                System.out.println(
                        "execute failure: " + failure.getMessage());
                executeFailureObserved.countDown();
            });
            return thread;
        };

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                1,
                1,
                0,
                TimeUnit.MILLISECONDS,
                new ArrayBlockingQueue<>(4),
                factory,
                new ThreadPoolExecutor.AbortPolicy());

        executor.execute(() -> {
            throw new IllegalStateException("execute escaped");
        });
        executeFailureObserved.await();

        Future<Integer> failed = executor.submit(() -> {
            throw new IllegalStateException("submit captured");
        });

        try {
            failed.get();
        } catch (ExecutionException expected) {
            System.out.println(
                    "submit failure: "
                            + expected.getCause().getMessage());
        }

        executor.shutdown();
        if (!executor.awaitTermination(1, TimeUnit.SECONDS)) {
            throw new IllegalStateException("executor did not terminate");
        }
    }
}`,
        runCommand:
          "javac --release 21 TaskFailureVisibilityDemo.java && java TaskFailureVisibilityDemo",
        expectedOutput: [
          "execute failure: execute escaped",
          "submit failure: submit captured"
        ],
        observation:
          "execute 的 RuntimeException 从任务逃出并到达工作线程的 UncaughtExceptionHandler；submit 返回的 Future 保存失败，只有 get 展开 ExecutionException 后才出现真实 cause。",
        body: [
          "ThreadPoolExecutor 用 `execute` 接收的普通 Runnable 若抛出未捕获异常，本次工作线程会异常结束，线程工厂或全局配置的 UncaughtExceptionHandler 有机会观察它；池通常会补建工作线程继续服务。",
          "`submit` 会先把任务包装成 FutureTask。FutureTask 的 run 把异常记录为完成结果，因此异常通常不会从工作线程逃逸。若调用方提交后丢掉 Future，任务已经失败，线程池却仍然看起来健康。",
          "同一个差异还会影响 `afterExecute`：对于 submit 创建的 FutureTask，hook 收到的 Throwable 可能是 null。需要统一观测时，应在任务已完成的前提下识别 Future，并调用 get 展开 ExecutionException，同时正确处理取消和当前线程中断。",
          "工程规则很简单：每个异步句柄必须有所有者。有人调用 get，有人注册完成回调，或有统一的执行器包装收集终态；不能用“池还在运行”替代任务结果。"
        ]
      },
      {
        kind: "implementation",
        eyebrow: "自己封装一条有界准入边界",
        title: "让提交动作返回一个必须处理的容量决定",
        goal:
          "实现一个固定工作线程、固定队列容量的执行器门面，并让调用方显式处理无法准入的任务。",
        task:
          "先实现 BoundedTaskExecutor：构造时接收 workerCount 和 queueCapacity，tryExecute 返回任务是否被接受；用五个阻塞任务验证“两条运行、两条排队、第五条拒绝”。",
        constraints: [
          "workerCount 与 queueCapacity 必须是正数。",
          "核心线程数和最大线程数相同，等待队列必须有界。",
          "不能使用会静默丢任务的拒绝策略。",
          "tryExecute 的 false 必须被调用方转换成明确的过载结果。",
          "测试用 CountDownLatch 固定容量，不能靠 sleep 猜任务仍在运行。"
        ],
        hints: [
          "第一层：选择 ArrayBlockingQueue 和 AbortPolicy。",
          "第二层：在 tryExecute 中捕获 RejectedExecutionException 并返回 false。",
          "第三层：前四个任务都等待同一个 releaseTasks，第五次提交后再释放闩锁。"
        ],
        codeLabel: "Java 21 · BoundedExecutorDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public final class BoundedExecutorDemo {
    private BoundedExecutorDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        BoundedTaskExecutor executor =
                new BoundedTaskExecutor(2, 2);
        CountDownLatch releaseTasks = new CountDownLatch(1);
        List<Boolean> admitted = new ArrayList<>();

        for (int index = 0; index < 5; index++) {
            admitted.add(
                    executor.tryExecute(() -> await(releaseTasks)));
        }

        System.out.println("admitted=" + admitted);

        releaseTasks.countDown();
        executor.shutdown();
        if (!executor.awaitTermination(1, TimeUnit.SECONDS)) {
            throw new IllegalStateException("executor did not terminate");
        }
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }

    private static final class BoundedTaskExecutor {
        private final ThreadPoolExecutor delegate;

        private BoundedTaskExecutor(
                int workerCount,
                int queueCapacity) {
            if (workerCount <= 0 || queueCapacity <= 0) {
                throw new IllegalArgumentException(
                        "workerCount and queueCapacity must be positive");
            }

            delegate = new ThreadPoolExecutor(
                    workerCount,
                    workerCount,
                    0,
                    TimeUnit.MILLISECONDS,
                    new ArrayBlockingQueue<>(queueCapacity),
                    new ThreadPoolExecutor.AbortPolicy());
        }

        private boolean tryExecute(Runnable task) {
            Objects.requireNonNull(task, "task");
            try {
                delegate.execute(task);
                return true;
            } catch (RejectedExecutionException rejected) {
                return false;
            }
        }

        private void shutdown() {
            delegate.shutdown();
        }

        private boolean awaitTermination(
                long timeout,
                TimeUnit unit) throws InterruptedException {
            return delegate.awaitTermination(timeout, unit);
        }
    }
}`,
        runCommand:
          "javac --release 21 BoundedExecutorDemo.java && java BoundedExecutorDemo",
        expectedOutput: [
          "admitted=[true, true, true, true, false]"
        ],
        body: [
          "这个门面把原本藏在执行器内部的容量决策提升为调用方必须处理的布尔结果。两条任务占用固定工作线程，两条进入固定队列，第五条触发 AbortPolicy；门面捕获拒绝并返回 false，入口层便可以映射成明确的过载响应。",
          "布尔值没有区分“容量已满”和“执行器已关闭”。若业务需要不同响应，生命周期与提交要由同一协议保护，并返回更丰富的领域结果；不能在捕获异常后仅凭一次 `isShutdown()` 快照声称精确知道拒绝原因，因为关闭可能并发发生。",
          "示例只完成准入边界。生产封装还要统一线程命名、异常观察、队列等待时间、拒绝指标、任务截止时间和两阶段关闭。下一课会把“已经拒绝新任务”和“旧任务已经真正停止”分开。",
          "容量仍需通过负载验证。队列的正确上限来自允许的等待预算、任务服务时间分布、短时突发规模和内存成本，而不是复制某篇文章里的数字。"
        ],
        adversarialTest:
          "并发启动多个提交线程，在任务闩锁未释放时统计 accepted 与 rejected；断言 accepted 永远不超过 workerCount + queueCapacity。随后与 shutdown 竞争，确认每个提交都得到明确结果，且没有任务被静默认为成功。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "把边界放到整条调用链",
        title: "每个实例都很有界，集群仍可能把下游压垮",
        localGuarantee:
          "一个 ThreadPoolExecutor 只能约束当前 JVM 中由它接收的运行任务和排队任务。",
        breaksWith:
          "服务有 N 个实例时，本地上限通常会放大为 N 倍；负载均衡、客户端连接池、消息 Broker 和下游服务还各自拥有独立缓冲区。扩容当前服务甚至可能瞬间提高对数据库的总并发。",
        alternatives: [
          "用数据库连接池、Semaphore 或下游配额单独约束真正稀缺资源，而不是把线程数当成代理。",
          "把过载映射成明确的 429/503、Retry-After 或消息 nack，并为自动重试设置幂等键、抖动与总预算。",
          "对全局租户配额使用共享准入服务、分区所有者或带 fencing 的租约；本地计数器只适合本实例额度。",
          "贯通记录入口等待、池内排队、执行时间、下游等待、拒绝和超时，定位容量究竟堆在哪一层。"
        ],
        body: [
          "有界线程池是一个局部保险丝，不是端到端背压。HTTP 服务器可能在请求进入线程池前已经排队，线程池中的任务又可能阻塞在连接池，下游还可能在自己的队列中积压；只看其中一处 queue.size，无法解释用户端延迟。",
          "拒绝也不是失败协议的终点。调用方重试若没有总截止时间和抖动，所有实例会在恢复瞬间同时放大流量；任务不是幂等时，超时重试还可能产生重复副作用。真正的过载设计要把容量信号沿调用链传回有决策权的一层。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "用一棵决策树审查线程池",
        title: "别再只问“开多少线程”，先把每条容量路径说完整",
        body: [
          "评审执行器时，先把一次 execute 从入口走到底：什么时候创建核心线程，什么时候排队，什么时候扩到 maximum，什么时候拒绝；再检查任务失败和关闭如何被观察。",
          "最后把局部上限乘上实例数，并沿网络向前后各走一层。若某处仍是无界队列、无限重试或无人读取的 Future，系统就还没有真正有界。"
        ],
        checkpoint: {
          prompt:
            "请解释：为什么无界队列会让 maximumPoolSize 基本失效；CallerRunsPolicy 为什么不总是安全背压；submit 的异常为什么可能静默；一个可上线的有界执行器至少要暴露哪些证据？",
          hint:
            "按“运行容量 → 排队容量 → 拒绝路径 → 失败终态 → 关闭状态 → 跨实例总量”回答。",
          answer: [
            "核心线程忙时，ThreadPoolExecutor 先尝试入队。无界队列通常不会因容量拒绝，因而不会走到队列失败后再扩到 maximum 的分支。",
            "CallerRuns 把任务放到提交线程执行。提交线程若是事件循环、持锁线程或延迟敏感请求线程，就可能阻塞入口或形成依赖环；执行器关闭后该策略还会丢弃任务。",
            "submit 用 FutureTask 捕获任务异常。若没有人调用 Future.get、注册回调或统一检查 Future，工作线程仍可继续运行，失败却没有观察者。",
            "至少暴露活跃线程、池大小、队列深度和最长等待、接受/拒绝、成功/失败/取消、执行与排队时间、shutdown/terminated 状态，并把指标与业务截止时间和实例数联系起来。"
          ],
          successCriteria: [
            "能完整复述 core → queue → maximum → reject 的顺序。",
            "能根据系统语义选择有界队列和拒绝策略。",
            "能保证每个异步任务的失败都有观察者。",
            "能区分本地执行器容量与端到端、跨实例容量。"
          ]
        }
      }
    ]
  },
  {
    slug: "cancellation-shutdown",
    week: 7,
    title: "超时了，工作为什么还在继续？",
    dek: "把调用方超时、Future 取消、中断请求、任务退出与资源清理拆开，再为执行器写出有界、可验证的关闭协议。",
    readTime: "28 分钟",
    status: "published",
    tags: ["interrupt", "Future", "截止时间", "优雅关闭", "异步失败"],
    searchTerms: [
      "Thread.interrupt",
      "InterruptedException",
      "Future.cancel",
      "Future.get timeout",
      "shutdownNow",
      "awaitTermination",
      "deadline",
      "ExecutionException"
    ],
    keyIdea:
      "调用方不再等待、Future 进入取消态、工作线程真正退出、资源完成清理，是四个必须分别证明的事件。",
    sections: [],
    questions: [],
    references: [
      {
        title: "Java 21 · Thread API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html",
        note:
          "interrupt 对等待、InterruptibleChannel、Selector 和普通运行线程的精确语义。"
      },
      {
        title: "Java 21 · Future API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html",
        note:
          "cancel、get(timeout)、isDone、isCancelled 与内存一致性保证。"
      },
      {
        title: "Java 21 · ExecutorService API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html",
        note:
          "shutdown、shutdownNow、awaitTermination、close 以及官方两阶段关闭示例。"
      },
      {
        title: "Java 21 · CompletableFuture API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html",
        note:
          "cancel 的中断边界，以及 orTimeout 只改变完成状态的契约。"
      },
      {
        title: "Java 21 · System.nanoTime",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html#nanoTime()",
        note:
          "用单调时间源计算经过时间、分辨率边界与防溢出的差值比较。"
      }
    ],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先拆开五个时刻",
        title: "用户看到“超时”，后台可能才刚开始做事",
        goal:
          "面对一次超时或取消，能够分别指出等待结束、取消被请求、线程观察到中断、任务退出和清理完成发生在何时。",
        conceptMap: [
          {
            label: "timeout",
            relation: "调用方的等待预算耗尽"
          },
          {
            label: "cancel",
            relation: "请求异步任务不要继续"
          },
          {
            label: "interrupt",
            relation: "向执行线程发送协作式取消信号"
          },
          {
            label: "task exit",
            relation: "任务代码真的离开 run 或 call"
          },
          {
            label: "cleanup receipt",
            relation: "finally 已释放资源，并留下可观察证据"
          }
        ],
        invariant:
          "当服务对外宣称“已经停止”时，不再接受新任务，没有任务仍在使用受管资源，而且每个资源只被清理一次。",
        body: [
          "想象一个接口在 500 毫秒后返回超时。调用方停止等待，并不说明执行 SQL 的线程也在同一时刻停止；SQL 可能稍后提交，临时文件可能仍被占用，连接许可也可能尚未归还。把这些时刻压成一个“取消成功”，正是重复扣款、幽灵任务和关机卡死的来源。",
          "Java 没有提供可以安全地在任意指令处强杀线程的通用操作。取消是一份协议：请求方发出信号，任务在自己能够保持不变量的位置观察信号，离开阻塞或循环，通过 finally 清理，最后再让管理方观察到完成。",
          "本课延续 happens-before 的思路：不要问“它大概会不会停”，而要问“哪一个 API 只结束等待，哪一个 API 只发信号，哪一个事件证明资源已经无人使用”。"
        ],
        checkpoint: {
          prompt:
            "一次查询的 Future.get(200ms) 抛出 TimeoutException。此刻你最多能确定什么？",
          hint: "只看 get(timeout) 的调用方发生了什么。",
          answer: [
            "只能确定调用线程等待结果的时间已经达到上限。任务可能尚未开始、正在执行、即将完成，甚至已经完成但结果竞争发生在超时边界。",
            "若业务要求停止底层工作，还要显式发起取消，并等待任务或底层系统提供的完成/清理证据。"
          ],
          successCriteria: [
            "不把等待超时说成任务已取消。",
            "能说出仍需检查 Future 状态和任务退出证据。"
          ]
        }
      },
      {
        kind: "experiment",
        eyebrow: "先观察一次真实分离",
        title: "get 超时以后，工作线程仍然阻塞在队列上",
        goal:
          "亲眼观察 TimeoutException 只结束调用方等待，并能解释为什么随后还要单独调用 cancel。",
        prediction:
          "运行前先预测：get 超时后 isDone 是 true 还是 false？如果不调用 cancel，单线程执行器能否正常终止？",
        codeLabel: "TimeoutDoesNotCancelDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public final class TimeoutDoesNotCancelDemo {
    private TimeoutDoesNotCancelDemo() {
    }

    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        BlockingQueue<String> queue = new LinkedBlockingQueue<>();
        CountDownLatch started = new CountDownLatch(1);
        CountDownLatch cleanupFinished = new CountDownLatch(1);

        Future<String> future = executor.submit(() -> {
            started.countDown();
            try {
                System.out.println("worker: waiting for input");
                return queue.take();
            } finally {
                System.out.println("worker: cleanup finished");
                cleanupFinished.countDown();
            }
        });

        started.await();

        try {
            future.get(100, TimeUnit.MILLISECONDS);
        } catch (TimeoutException exception) {
            System.out.println("caller: stopped waiting");
        }

        System.out.println("done after timeout: " + future.isDone());

        boolean cancelReturned = future.cancel(true);
        boolean cleanupObserved =
                cleanupFinished.await(1, TimeUnit.SECONDS);

        System.out.println("cancel returned: " + cancelReturned);
        System.out.println("future cancelled: " + future.isCancelled());
        System.out.println("cleanup observed: " + cleanupObserved);

        executor.shutdown();
        if (!executor.awaitTermination(1, TimeUnit.SECONDS)) {
            throw new IllegalStateException("executor did not terminate");
        }
    }
}`,
        runCommand:
          "javac --release 21 TimeoutDoesNotCancelDemo.java && java TimeoutDoesNotCancelDemo",
        expectedOutput: [
          "worker: waiting for input",
          "caller: stopped waiting",
          "done after timeout: false",
          "worker: cleanup finished",
          "cancel returned: true",
          "future cancelled: true",
          "cleanup observed: true"
        ],
        observation:
          "超时发生后 Future 仍未完成，工作线程仍在 take 中；显式 cancel(true) 才尝试中断执行线程，finally 随后留下清理完成的证据。",
        body: [
          "`Future.get(timeout, unit)` 限制的是当前调用线程最多等待多久。它抛出 `TimeoutException` 时不会顺便调用 `cancel`。如果这里直接丢掉 Future，任务仍会占用线程、连接或文件，执行器也可能因为非守护工作线程而阻止 JVM 正常结束。",
          "`cancel(true)` 的 `true` 表示：如果任务已经运行，而且实现知道执行它的线程，就尝试中断该线程。它不是 join，也不会替调用方等待 finally 执行完。Future 可以先进入取消终态，工作线程再花时间回滚和释放资源。",
          "因此示例没有用 `isDone()` 充当清理证明，而是让任务在 finally 中倒数 `cleanupFinished`。真实系统里的收据可以是任务完成 Future、生命周期状态机、租约归还计数或可查询的作业终态。"
        ],
        trace: [
          {
            thread: "main",
            action: "future.get(100ms) 超时",
            state: "main 停止等待；worker 状态没有因此改变"
          },
          {
            thread: "main",
            action: "future.cancel(true)",
            state: "Future 尝试进入取消态，并尝试中断 worker"
          },
          {
            thread: "worker",
            action: "queue.take 响应中断",
            state: "离开阻塞，执行 finally"
          },
          {
            thread: "main",
            action: "cleanupFinished.await 返回",
            state: "调用方拿到资源已清理的明确收据"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "理解中断的真实语义",
        title: "interrupt 是一个有规则的请求，不是一枚强杀按钮",
        goal:
          "解释中断状态如何被设置、检查和清除，并为阻塞任务与 CPU 循环选择正确响应方式。",
        codeLabel: "InterruptibleWorkerDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public final class InterruptibleWorkerDemo {
    private InterruptibleWorkerDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch started = new CountDownLatch(1);

        Thread worker = Thread.ofPlatform()
                .name("report-worker")
                .start(() -> {
                    started.countDown();
                    try {
                        while (!Thread.currentThread().isInterrupted()) {
                            TimeUnit.SECONDS.sleep(10);
                        }
                    } catch (InterruptedException exception) {
                        System.out.println(
                                "status in catch: "
                                        + Thread.currentThread().isInterrupted());

                        Thread.currentThread().interrupt();
                    } finally {
                        System.out.println(
                                "status during cleanup: "
                                        + Thread.currentThread().isInterrupted());
                        System.out.println("temporary file closed");
                    }
                });

        started.await();
        worker.interrupt();
        worker.join();

        System.out.println("worker alive: " + worker.isAlive());
    }
}`,
        runCommand:
          "javac --release 21 InterruptibleWorkerDemo.java && java InterruptibleWorkerDemo",
        expectedOutput: [
          "status in catch: false",
          "status during cleanup: true",
          "temporary file closed",
          "worker alive: false"
        ],
        body: [
          "每个线程都有中断状态。普通运行中的线程被 `interrupt()` 时，状态会被设置；CPU 循环必须主动调用 `isInterrupted()` 或到达其他检查点。`isInterrupted()` 不清除状态，而静态方法 `Thread.interrupted()` 检查当前线程并清除状态，二者不能当成同一个 API。",
          "`sleep`、`wait`、`join` 以及许多并发阻塞方法检测到中断后，会在抛出 `InterruptedException` 前清除状态，所以 catch 中第一次打印是 false。当前 Runnable 不能向调用方声明抛出该受检异常，于是示例先完成本层决策，再用 `Thread.currentThread().interrupt()` 保存信号。",
          "若方法能够声明 `throws InterruptedException`，通常直接传播更清楚；若当前层就是任务生命周期的最终所有者，它也可以把中断解释为取消、完成清理后返回。最危险的做法是 catch 后静默继续原循环：关闭方已经发出的信号从此消失。",
          "中断对不同阻塞原语的效果由各自契约决定。等待进入普通 `synchronized` 监视器不可中断；需要可取消锁等待时使用 `lockInterruptibly()`。`InterruptibleChannel`、`Selector` 与普通 I/O 的反应也不同，不能笼统声称“interrupt 能打断所有 I/O”。"
        ],
        invariant:
          "任务只在能保持共享状态一致的位置退出；无论正常、失败或取消，finally 都必须释放它已经拥有的资源。",
        checkpoint: {
          prompt:
            "一个库方法捕获 InterruptedException 后无法向上抛出。它是否只要记录日志就可以继续？",
          hint: "上层是否还能够知道取消曾经发生？",
          answer: [
            "通常不可以。若继续正常执行，应恢复中断状态，让更高层仍能观察取消；也可以转换成保留 cause 的领域异常。",
            "如果该方法本身拥有完整生命周期策略，也可以清理后结束，但必须明确这是消费取消信号，而不是意外吞掉它。"
          ],
          successCriteria: [
            "能区分传播、恢复状态和本层消费三种选择。",
            "不会写出 catch 后无条件继续的无限循环。"
          ]
        }
      },
      {
        kind: "api-decision",
        eyebrow: "按保证选择 API",
        title: "先问你要停止谁，再选择 timeout、cancel 或 shutdown",
        goal:
          "根据要控制的是一次等待、一个任务还是整个执行器，选择语义匹配的 API。",
        body: [
          "`isDone()` 表示 Future 已完成，完成原因可以是正常返回、异常或取消；它不是成功标志。`isCancelled()` 只描述 Future 的取消状态，也不自动证明任务代码已经离开 finally。",
          "`cancel(false)` 可以阻止尚未开始的任务运行，但允许已经开始的任务继续；`cancel(true)` 才会尝试中断已运行任务。接口还明确提醒：cancel 的返回值不能替代 `isCancelled()` 查询，实现可以提供更强保证，但调用方不能凭想象扩大接口契约。",
          "`CompletableFuture` 更容易制造误解：它的 `cancel(true)` 参数在该实现中没有效果，因为它不用中断控制处理过程；`orTimeout` 让 CompletableFuture 以 TimeoutException 异常完成，也不等于供应者或远程请求已经停止。"
        ],
        apiOptions: [
          {
            api: "Future.get(timeout)",
            useWhen: "调用方只能等待有限时间。",
            guarantees: "等待在结果、失败、取消、超时或当前线程中断时结束。",
            doesNotGuarantee: "超时不会自动取消底层任务。"
          },
          {
            api: "Future.cancel(true)",
            useWhen: "希望阻止未开始任务，并请求运行中的任务停止。",
            guarantees: "按 Future 契约尝试取消，并在可能时尝试中断执行线程。",
            doesNotGuarantee: "任务立即退出、finally 已完成或远程副作用已回滚。"
          },
          {
            api: "ExecutorService.shutdown()",
            useWhen: "停止接收新任务，但允许已提交任务跑完。",
            guarantees: "后续提交被拒绝，执行器进入有序关闭。",
            doesNotGuarantee: "调用本身不会等待终止。"
          },
          {
            api: "ExecutorService.shutdownNow()",
            useWhen: "宽限期结束，需要阻止排队任务并催促运行任务退出。",
            guarantees: "返回尚未开始的任务，并尽力停止活动任务。",
            doesNotGuarantee: "不响应中断的任务会退出，也不会等待退出。"
          },
          {
            api: "ExecutorService.close()",
            useWhen: "短生命周期作用域允许一直等待所有任务结束。",
            guarantees: "有序关闭并等待终止；等待线程中断时升级停止并最终恢复中断状态。",
            doesNotGuarantee: "调用具有业务要求的固定关闭上限。"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "实现两阶段关机",
        title: "先停止接单并给宽限期，再中断剩余任务",
        goal:
          "实现一个保留调用线程中断状态、具有两段等待上限并报告未启动任务的关闭方法。",
        task:
          "先独立写出 shutdownAndAwaitTermination：第一阶段只调用 shutdown 并等待；超时后调用 shutdownNow，再等待一次；若关闭线程本身被中断，要催停任务并恢复中断状态。",
        constraints: [
          "不能把 shutdownNow 描述成强制终止。",
          "每次 awaitTermination 都必须有上限。",
          "必须保留关闭调用线程的中断状态。",
          "必须处理 shutdownNow 返回的未开始任务。"
        ],
        hints: [
          "shutdown 与 awaitTermination 是两个动作，前者不等待。",
          "catch InterruptedException 时，当前线程的中断状态已经被清除。",
          "第二次等待仍失败时，要留下运维可见的错误，而不是谎报关闭完成。"
        ],
        codeLabel: "GracefulShutdownDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public final class GracefulShutdownDemo {
    private GracefulShutdownDemo() {
    }

    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        executor.submit(() -> System.out.println("task completed"));

        boolean terminated = shutdownAndAwaitTermination(
                executor,
                Duration.ofSeconds(1));

        System.out.println("terminated: " + terminated);
    }

    private static boolean shutdownAndAwaitTermination(
            ExecutorService executor,
            Duration gracePeriod) {

        long waitNanos = gracePeriod.toNanos();
        executor.shutdown();

        try {
            if (executor.awaitTermination(
                    waitNanos,
                    TimeUnit.NANOSECONDS)) {
                return true;
            }

            List<Runnable> neverStarted = executor.shutdownNow();
            System.err.println(
                    "tasks that never started: " + neverStarted.size());

            return executor.awaitTermination(
                    waitNanos,
                    TimeUnit.NANOSECONDS);
        } catch (InterruptedException exception) {
            List<Runnable> neverStarted = executor.shutdownNow();
            System.err.println(
                    "shutdown interrupted; tasks that never started: "
                            + neverStarted.size());

            Thread.currentThread().interrupt();
            return false;
        }
    }
}`,
        runCommand:
          "javac --release 21 GracefulShutdownDemo.java && java GracefulShutdownDemo",
        expectedOutput: ["task completed", "terminated: true"],
        body: [
          "第一阶段的目标是停止接单，让已经接受的工作有机会完成。只有宽限期耗尽，第二阶段才调用 `shutdownNow()`；典型实现会中断活动线程，并返回仍在队列中、从未开始执行的 Runnable。",
          "第二阶段仍然只是协作请求。任务若吞掉中断、在不可中断 I/O 中永久阻塞，或执行从不检查状态的无限 CPU 循环，执行器就可能无法终止。因此方法返回 boolean，让上层决定报警、隔离资源还是继续进程退出流程。",
          "当执行关机的线程自身被中断，catch 会调用 `shutdownNow()`，再恢复自己的中断状态。这里没有继续无界等待，是因为本示例把“关闭调用也必须有界”作为业务契约；若使用 `ExecutorService.close()`，Java 21 的默认语义会继续等到所有活动任务结束。"
        ],
        adversarialTest:
          "增加一个忽略中断的任务，验证方法在两段等待后返回 false；再增加一个阻塞在 BlockingQueue.take 的任务，验证 shutdownNow 能使它进入 finally。测试本身也必须有总时间上限。"
      },
      {
        kind: "mechanism",
        eyebrow: "把相对超时变成总预算",
        title: "每一层都给两秒，会把一次两秒请求拖成六秒",
        goal:
          "使用单调时间源计算剩余预算，并把同一个截止时间传给锁、队列、Future 和远程调用。",
        codeLabel: "DeadlineBudgetDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public final class DeadlineBudgetDemo {
    private final long startedAtNanos;
    private final long timeoutNanos;

    private DeadlineBudgetDemo(Duration timeout) {
        this.startedAtNanos = System.nanoTime();
        this.timeoutNanos = timeout.toNanos();
    }

    public static void main(String[] args) throws Exception {
        DeadlineBudgetDemo deadline =
                new DeadlineBudgetDemo(Duration.ofMillis(300));

        TimeUnit.MILLISECONDS.sleep(80);
        firstStage(deadline);

        TimeUnit.MILLISECONDS.sleep(80);
        secondStage(deadline);

        System.out.println(
                "remaining ms: "
                        + TimeUnit.NANOSECONDS.toMillis(
                                deadline.remainingNanos()));
    }

    private static void firstStage(DeadlineBudgetDemo deadline)
            throws TimeoutException {
        deadline.throwIfExpired();
    }

    private static void secondStage(DeadlineBudgetDemo deadline)
            throws TimeoutException {
        deadline.throwIfExpired();
    }

    private long remainingNanos() {
        long elapsedNanos = System.nanoTime() - startedAtNanos;
        return timeoutNanos - elapsedNanos;
    }

    private void throwIfExpired() throws TimeoutException {
        if (remainingNanos() <= 0) {
            throw new TimeoutException("request deadline exceeded");
        }
    }
}`,
        runCommand:
          "javac --release 21 DeadlineBudgetDemo.java && java DeadlineBudgetDemo",
        expectedOutput: ["remaining ms: 1xx"],
        body: [
          "相对超时描述“从现在最多再等多久”。若入口、数据库和下游 HTTP 各自重新获得两秒预算，一次标称两秒的请求可能等待更久。截止时间描述整个操作的终点；每一层只能消费剩余预算。",
          "`System.nanoTime()` 专门用于计算经过时间，与墙上日期无关。它提供纳秒精度，但不承诺纳秒分辨率；返回值本身没有跨 JVM 或现实时间意义，只有同一 JVM 中两次调用的差值有意义。",
          "官方还建议用 `System.nanoTime() - startedAtNanos >= timeoutNanos` 这类差值比较，避免直接计算绝对终点带来的 long 溢出问题。真实实现应把 `remainingNanos()` 传给定时锁、队列操作、Future.get 和支持超时的客户端。",
          "截止时间耗尽仍只是一项控制决策：上层要继续明确是否取消本地任务、是否关闭远程连接，以及如何处理已经产生但响应未知的外部副作用。"
        ],
        localGuarantee:
          "同一 JVM 内，所有阶段共享一个单调递减的等待预算。",
        breaksWith:
          "跨服务只传本机 nanoTime 数值；不同进程的起点无关。跨网络应传剩余预算或约定格式的墙上截止时间，并处理时钟偏差。"
      },
      {
        kind: "mechanism",
        eyebrow: "别让失败藏进 Future",
        title: "submit 会保存异常；从不观察 Future，就等于把报警器拔掉",
        goal:
          "解释 execute 与 submit 的异常传播差异，并保证每个异步任务的成功或失败都有观察者。",
        codeLabel: "AsyncFailureVisibilityDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public final class AsyncFailureVisibilityDemo {
    private AsyncFailureVisibilityDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        Future<Integer> future = executor.submit(() -> {
            throw new IllegalStateException("database unavailable");
        });

        try {
            future.get();
        } catch (ExecutionException exception) {
            System.out.println(
                    "observed cause: " + exception.getCause().getMessage());
        }

        executor.shutdown();
    }
}`,
        runCommand:
          "javac --release 21 AsyncFailureVisibilityDemo.java && java AsyncFailureVisibilityDemo",
        expectedOutput: ["observed cause: database unavailable"],
        body: [
          "`execute(Runnable)` 中逃逸的 RuntimeException 或 Error 会导致本次工作线程异常终止，并可能到达线程的 `UncaughtExceptionHandler`。`submit` 则通常把任务包装成 `FutureTask`，把计算异常保存起来，让 `get()` 以 `ExecutionException` 报告 cause。",
          "这也解释了一个常见监控漏洞：`ThreadPoolExecutor.afterExecute(r, throwable)` 对 submit 创建的 FutureTask，`throwable` 可能仍是 null，因为内部异常没有从 `run()` 逃逸。统一 hook 若要观察两种失败，必须在确认 Future 已完成后读取其结果并展开 ExecutionException。",
          "生产规则应是：每个 Future 都有所有者。同步边界调用 get，异步流水线注册完成回调，批量任务汇总失败；绝不能只提交后丢弃句柄，再用“线程池还活着”推断任务成功。"
        ],
        invariant:
          "每一个被接受的异步任务最终都有且只有一个可观察终态：成功、失败或取消；任何终态都触发必要的记账和资源释放。"
      },
      {
        kind: "checkpoint",
        eyebrow: "完成取消协议审计",
        title: "能停下来，不靠运气；敢说已停止，必须拿出证据",
        goal:
          "用一张固定检查表审查任务、Future、执行器和远程副作用的取消语义。",
        body: [
          "完整取消协议要同时回答四类问题。第一，谁有权发起取消，重复取消是否幂等；第二，任务可能阻塞在哪里，每个阻塞点是否响应中断或截止时间；第三，状态变更的提交点在哪里，取消与成功竞争时谁拥有副作用；第四，调用方观察什么事件后才能释放上层资源或报告停止完成。",
          "本地中断不会回滚已经提交的数据库事务，也不会撤回已被服务端接受的网络请求。响应超时常意味着结果未知，而不是操作失败。跨服务要使用稳定操作 ID、幂等键、可查询状态和明确的确认点，把不确定结果变成可恢复协议。",
          "测试时至少覆盖：任务尚未开始就取消、阻塞等待时取消、CPU 循环响应中断、取消与正常完成竞争、finally 抛异常、关闭线程自身被中断，以及不响应取消的负面任务。每个测试都要有外层超时，避免失败实现挂死测试进程。"
        ],
        checkpoint: {
          prompt:
            "现在解释：Future 已取消、执行器已 shutdown、执行器已 terminated、资源已清理，分别证明了什么？",
          hint: "把任务控制状态与业务资源状态分开。",
          answer: [
            "Future 已取消说明它以取消语义进入终态，不证明工作线程已完成 finally。shutdown 说明执行器停止接受新任务，不说明旧任务已结束。",
            "terminated 说明执行器在关闭请求之后已经没有活动或排队任务。资源已清理还要由任务 finally、资源所有者状态或专门完成收据证明；若资源属于远程系统，本地 terminated 也不能替代远程确认。"
          ],
          successCriteria: [
            "能准确区分 timeout、cancel、interrupt、task exit 与 cleanup receipt。",
            "能写出保留中断的两阶段关闭。",
            "能说明截止时间为何要传递剩余预算。",
            "能保证 submit 的异常不会静默丢失。"
          ]
        }
      }
    ]
  },
  {
    slug: "liveness-and-measurement",
    week: 8,
    title: "程序没有报错，为什么就是不往前走？",
    dek: "先区分安全性、活性与性能，再用等待环、线程诊断、进展指标和 JMH 回答不同层次的问题。",
    readTime: "30 分钟",
    status: "published",
    tags: ["活性", "死锁", "饥饿", "ThreadMXBean", "JMH"],
    searchTerms: [
      "deadlock",
      "starvation",
      "livelock",
      "ReentrantLock fairness",
      "ThreadMXBean",
      "findDeadlockedThreads",
      "queue latency",
      "JMH"
    ],
    keyIdea:
      "没有产生错误结果，不等于系统还能前进；系统还能前进，也不等于它在可接受的时间内完成。",
    sections: [],
    questions: [],
    references: [
      {
        title: "Java 21 · ThreadMXBean API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.management/java/lang/management/ThreadMXBean.html",
        note:
          "平台线程监控、死锁检测、CPU/竞争计量及诊断快照的支持边界。"
      },
      {
        title: "Java 21 · ThreadPoolExecutor API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html",
        note:
          "hook、近似统计、队列监控和 submit 任务异常捕获的官方说明。"
      },
      {
        title: "Java 21 · ReentrantLock API",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html",
        note:
          "公平锁、调度公平边界、tryLock 插队与可中断锁获取。"
      },
      {
        title: "OpenJDK · Java Microbenchmark Harness",
        href: "https://openjdk.org/projects/code-tools/jmh/",
        note:
          "JMH 项目定位与一手入口。"
      },
      {
        title: "OpenJDK JMH · 官方使用说明与样例",
        href: "https://github.com/openjdk/jmh",
        note:
          "独立 Maven 工程、命令行运行、fork、样例与 benchmark 评审建议。"
      }
    ],
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先把三个问题分开",
        title: "线程安全、持续前进和完成得快，是三份不同的证明",
        goal:
          "能够把一个并发故障归类为 safety、liveness 或 performance，并为每一类选择匹配的证据。",
        conceptMap: [
          {
            label: "safety",
            relation: "不允许的结果永远不会发生"
          },
          {
            label: "liveness",
            relation: "系统不会永远卡住，工作最终能取得进展"
          },
          {
            label: "performance",
            relation: "在给定负载与环境下，进展速度满足目标"
          }
        ],
        invariant:
          "正确性指标不能由速度替代：余额不变式、任务唯一终态等 safety 约束，在任何吞吐量下都必须成立。",
        body: [
          "两个线程各拿一把锁、再永久等待对方时，它们可能从未写出错误数据，因此 safety 暂时完好；但系统不再完成任何转账，liveness 已经失败。反过来，一个错误地重复扣款的实现可能吞吐量极高，却根本不正确。",
          "活性也不是“线程还在 RUNNABLE”。活锁中的线程不断运行、不断礼让，业务完成数却不增长；饥饿中的系统整体仍有吞吐量，但某个租户或任务可能永远得不到机会。真正的问题是：哪个主体应该完成什么，以及我们如何证明它在有界条件下持续前进。",
          "性能证据必须带场景：机器、JDK、线程数、负载、数据分布、预热和统计窗口。一个平均值或一次本地秒表不能回答生产容量，更不能证明并发算法没有竞态。"
        ],
        checkpoint: {
          prompt:
            "队列中的任务都没有丢失，但其中一个租户等待了十分钟。三类问题分别如何判断？",
          hint: "系统整体正确，不代表每个主体都能及时前进。",
          answer: [
            "若任务最终仍恰好执行一次，数据 safety 可能没有被破坏；但该租户可能遭遇饥饿，因此存在 liveness 或公平性问题。",
            "十分钟是否还构成性能违约，要对照明确的等待时间目标。即使最终完成，只要超过 SLO，也仍是性能故障。"
          ],
          successCriteria: [
            "不会用“没有异常”证明活性。",
            "不会用“吞吐量更高”证明正确性。"
          ]
        }
      },
      {
        kind: "experiment",
        eyebrow: "制造一个可重复等待环",
        title: "两个线程都很安静，因为它们各自握着对方需要的锁",
        goal:
          "从线程与锁的等待关系中画出死锁环，并用 ThreadMXBean 找到拥有者和等待者。",
        prediction:
          "两个线程都通过屏障、各自持有第一把锁以后，还会不会有任何一个线程打印 reached？ThreadMXBean 应该返回哪些线程？",
        codeLabel: "DeadlockDiagnosisDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public final class DeadlockDiagnosisDemo {
    private DeadlockDiagnosisDemo() {
    }

    public static void main(String[] args) throws InterruptedException {
        ReentrantLock firstLock = new ReentrantLock();
        ReentrantLock secondLock = new ReentrantLock();
        CyclicBarrier bothHoldingOneLock = new CyclicBarrier(2);

        Thread.ofPlatform()
                .daemon(true)
                .name("transfer-a-to-b")
                .start(() -> acquireInOrder(
                        firstLock,
                        secondLock,
                        bothHoldingOneLock));

        Thread.ofPlatform()
                .daemon(true)
                .name("transfer-b-to-a")
                .start(() -> acquireInOrder(
                        secondLock,
                        firstLock,
                        bothHoldingOneLock));

        ThreadMXBean threadMXBean =
                ManagementFactory.getThreadMXBean();

        long startedAt = System.nanoTime();
        long timeoutNanos = TimeUnit.SECONDS.toNanos(2);
        long[] deadlockedThreadIds = null;

        while (deadlockedThreadIds == null
                && System.nanoTime() - startedAt < timeoutNanos) {
            deadlockedThreadIds =
                    threadMXBean.findDeadlockedThreads();
            Thread.sleep(10);
        }

        if (deadlockedThreadIds == null) {
            throw new IllegalStateException(
                    "deadlock was not detected");
        }

        ThreadInfo[] threadInfos = threadMXBean.getThreadInfo(
                deadlockedThreadIds,
                true,
                true);

        for (ThreadInfo threadInfo : threadInfos) {
            System.out.printf(
                    "%s waits for %s, owned by %s%n",
                    threadInfo.getThreadName(),
                    threadInfo.getLockInfo(),
                    threadInfo.getLockOwnerName());
        }
    }

    private static void acquireInOrder(
            ReentrantLock firstLock,
            ReentrantLock secondLock,
            CyclicBarrier barrier) {

        firstLock.lock();
        try {
            await(barrier);

            secondLock.lock();
            try {
                System.out.println("reached");
            } finally {
                secondLock.unlock();
            }
        } finally {
            firstLock.unlock();
        }
    }

    private static void await(CyclicBarrier barrier) {
        try {
            barrier.await();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "interrupted at barrier",
                    exception);
        } catch (BrokenBarrierException exception) {
            throw new IllegalStateException(
                    "barrier was broken",
                    exception);
        }
    }
}`,
        runCommand:
          "javac --release 21 DeadlockDiagnosisDemo.java && java DeadlockDiagnosisDemo",
        expectedOutput: [
          "transfer-a-to-b waits for ... owned by transfer-b-to-a",
          "transfer-b-to-a waits for ... owned by transfer-a-to-b"
        ],
        observation:
          "两个线程都通过屏障后，各自持有一把 ReentrantLock，再等待另一把；findDeadlockedThreads 找到等待环并给出锁拥有者。",
        body: [
          "屏障不是死锁原因，它只是让实验稳定复现“双方都已经拿到第一把锁”。随后形成两条边：A 等 B 拥有的锁，B 等 A 拥有的锁；等待关系出现环，任何一方都不会主动释放第一把锁。",
          "`findMonitorDeadlockedThreads()` 只查对象监视器形成的环；`findDeadlockedThreads()` 还覆盖 `ReentrantLock` 等 ownable synchronizer。`getThreadInfo(ids, true, true)` 再把栈、等待的锁和已拥有的同步器组织成诊断快照。",
          "示例故意使用 daemon 平台线程，让 main 打印证据后 JVM 能退出。不要把 daemon 当成生产修复：它只改变进程退出条件，不会恢复一项卡死的业务。",
          "Java 语言规范不要求自动检测死锁。ThreadMXBean 是排障工具，不是同步控制原语，而且检测可能昂贵；生产中通常按需触发或低频采样，而不是每个请求都调用。"
        ],
        trace: [
          {
            thread: "transfer-a-to-b",
            action: "持有 firstLock，等待 secondLock",
            state: "等待边 A → B"
          },
          {
            thread: "transfer-b-to-a",
            action: "持有 secondLock，等待 firstLock",
            state: "等待边 B → A"
          },
          {
            thread: "ThreadMXBean",
            action: "查找等待环并读取 ThreadInfo",
            state: "生成诊断证据，不会解除死锁"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "读懂诊断边界",
        title: "没有检测到死锁，不代表系统有活性",
        goal:
          "准确说明 ThreadMXBean 能看到和看不到什么，避免把一次 null 结果当成健康证明。",
        body: [
          "Java 21 标准 `ThreadMXBean` 监控平台线程，不支持虚拟线程。`findDeadlockedThreads()` 返回 null，只能说明这次快照没有发现由受支持平台线程、对象监视器和 ownable synchronizer 构成的等待环；涉及虚拟线程的环不在它的覆盖范围内。",
          "死锁检测也不覆盖饥饿、活锁、永久等待外部服务、遗漏 signal、线程池依赖环或任务仍运行但业务完成数为零。线程转储必须与业务进展信号一起解释：线程在等什么、谁拥有资源、队列最老任务等待多久、完成计数是否仍增长。",
          "CPU 时间具有纳秒精度但不保证纳秒准确度，某些 JVM 还可能默认关闭线程 CPU 计量；竞争监控也通常默认关闭。使用前检查 `isThreadCpuTimeSupported()`、`isThreadCpuTimeEnabled()` 和 contention monitoring 的支持/启用状态，并评估采集成本。",
          "`dumpAllThreads(true, true)` 与完整锁信息适合诊断快照。它们描述调用时附近的状态，线程可能在方法返回前已经终止或改变状态；不要把监控快照用于同步控制。"
        ],
        apiOptions: [
          {
            api: "findMonitorDeadlockedThreads",
            useWhen: "只需要查 synchronized/Object.wait 监视器环。",
            guarantees: "返回被监视器死锁的平台线程 ID，未发现时返回 null。",
            doesNotGuarantee: "发现 ReentrantLock 环、虚拟线程环、饥饿或活锁。"
          },
          {
            api: "findDeadlockedThreads",
            useWhen: "需要同时检查监视器和 ownable synchronizer。",
            guarantees: "在实现支持时找出这两类锁构成的平台线程等待环。",
            doesNotGuarantee: "证明整个应用仍有业务进展。"
          },
          {
            api: "dumpAllThreads(true, true)",
            useWhen: "需要所有存活平台线程的栈与锁快照。",
            guarantees: "返回采样时可获得的平台线程和同步信息。",
            doesNotGuarantee: "冻结世界、包含虚拟线程或给出故障根因。"
          }
        ],
        checkpoint: {
          prompt:
            "监控连续十次得到 findDeadlockedThreads() == null，可以把服务标记为健康吗？",
          hint: "列出没有等待环但仍无进展的情形。",
          answer: [
            "不能。任务可能饥饿、活锁、永久等待网络、遗漏条件信号，或运行在 ThreadMXBean 不支持的虚拟线程上。",
            "健康判断还要结合完成速率、最长队列等待、超时/拒绝、依赖延迟与针对性线程转储。"
          ],
          successCriteria: [
            "能说出 Java 21 平台线程边界。",
            "不会把诊断 API 当作活性证明。"
          ]
        }
      },
      {
        kind: "api-decision",
        eyebrow: "从等待环转向设计约束",
        title: "修复死锁的首选方案，是让环在设计上无法形成",
        goal:
          "为多锁操作建立全局获取顺序，并在需要时选择可中断或带超时的锁获取。",
        body: [
          "最容易证明的规则是全局锁顺序。例如账户转账总是先锁较小账户 ID，再锁较大 ID；不论资金方向如何，等待边只沿一个方向出现，因此无法首尾相接形成环。排序键必须稳定、全局一致，不能在操作中途变化。",
          "第二条规则是不要持锁调用未知代码、远程服务或无界 I/O。你无法证明回调会不会尝试反向拿锁，也无法控制网络等待多久。先在锁内验证和更新最小共享状态，再释放锁执行外部动作；若必须协调外部效果，设计显式状态机和补偿。",
          "`ReentrantLock.lockInterruptibly()` 允许关机或取消解除锁等待；`tryLock(timeout, unit)` 给等待加上上限。它们降低永久等待风险，却不会自动恢复已经拿到的第一把锁，失败路径仍必须在 finally 中按实际拥有情况释放。",
          "超时重试也可能制造活锁：双方同时拿第一把锁、第二把失败、同时释放、同时重试。加入稳定顺序通常比随机退避更容易证明；退避只能降低碰撞概率，不能建立 safety。"
        ],
        apiOptions: [
          {
            api: "synchronized",
            useWhen: "单锁、词法作用域清晰且不需要可中断获取。",
            guarantees: "异常离开块时自动释放监视器。",
            doesNotGuarantee: "等待获取监视器可被 interrupt 取消。"
          },
          {
            api: "lockInterruptibly()",
            useWhen: "锁等待必须响应任务取消或服务关机。",
            guarantees: "ReentrantLock 等实现按契约在获取期间响应中断。",
            doesNotGuarantee: "已修改状态自动回滚，或其他锁自动释放。"
          },
          {
            api: "tryLock(timeout)",
            useWhen: "锁等待必须有业务上限。",
            guarantees: "在获得锁、中断或等待上限之间结束。",
            doesNotGuarantee: "重试不会活锁，也不自动保证公平。"
          },
          {
            api: "全局锁顺序",
            useWhen: "一项操作必须持有多个锁。",
            guarantees: "所有路径真正遵守同一严格顺序时，消除这组锁的等待环。",
            doesNotGuarantee: "外部资源、遗漏信号或线程池依赖不会造成其他活性故障。"
          }
        ],
        invariant:
          "任何执行路径都不能在持有较高顺序锁时，再等待较低顺序锁；每把成功获得的显式锁都由同一路径的 finally 释放。"
      },
      {
        kind: "mechanism",
        eyebrow: "识别没有等待环的停滞",
        title: "饥饿是有人永远拿不到机会，活锁是大家都在忙着礼让",
        goal:
          "从业务完成记录区分死锁、饥饿与活锁，并理解公平锁的保证边界。",
        body: [
          "饥饿时，系统整体可能持续完成任务，但某个线程、租户或低优先级队列长期得不到资源。只看总吞吐量会掩盖它；需要按租户或优先级记录最长等待时间、完成率和拒绝率。",
          "活锁时，线程没有阻塞，栈和 CPU 甚至很活跃，却不断撤销、重试或相互礼让，没有提交业务结果。诊断时要比较“尝试次数”与“提交完成数”：重试快速增长而完成数停滞，是比线程状态更有用的线索。",
          "`new ReentrantLock(true)` 在竞争时倾向于把锁交给等待最久的线程，官方文档说明它能避免锁层面的饥饿并减小等待差异，但通常降低整体吞吐量。锁公平并不保证操作系统调度公平，一个线程仍可能连续运行。",
          "无参数 `tryLock()` 不遵守公平设置：锁可用时它可以插队。若设计依赖公平顺序，不能一边配置公平锁，一边用无参数 tryLock 绕过等待队列。公平策略也只覆盖这一把锁，不自动带来租户级端到端公平。"
        ],
        trace: [
          {
            thread: "死锁",
            action: "线程等待关系形成环",
            state: "相关主体都无法继续"
          },
          {
            thread: "饥饿",
            action: "其他主体反复获得资源",
            state: "系统有吞吐，但某个主体长期零进展"
          },
          {
            thread: "活锁",
            action: "主体持续重试、回退或礼让",
            state: "CPU 与尝试数增长，提交完成数不增长"
          }
        ],
        checkpoint: {
          prompt:
            "一个公平 ReentrantLock 是否足以证明多租户查询服务没有饥饿？",
          hint: "查询在拿这把锁之前和之后还经过哪些队列与调度器？",
          answer: [
            "不足。公平设置只约束这把锁竞争时的授予倾向，不保证线程调度公平，也不覆盖线程池队列、连接池、远程服务或租户准入。",
            "要证明租户级进展，需要定义调度策略，并按租户观察排队年龄、完成率和资源份额。"
          ],
          successCriteria: [
            "能用业务进展而不是线程是否 RUNNABLE 区分活锁。",
            "能准确说明公平锁的局部边界。"
          ]
        }
      },
      {
        kind: "experiment",
        eyebrow: "把延迟拆成两段",
        title: "任务慢，可能是在队列里等，也可能是真的执行得慢",
        goal:
          "使用 System.nanoTime 记录提交、开始和完成时刻，分别计算队列等待与执行时间。",
        prediction:
          "单线程池先提交一个 200ms 任务，再提交一个短任务。短任务的执行时间和端到端延迟分别会接近多少？",
        codeLabel: "PoolTimingDemo.java",
        codeKind: "runnable",
        javaVersion: "Java 21",
        code: `import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

public final class PoolTimingDemo {
    private PoolTimingDemo() {
    }

    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        executor.submit(() -> {
            try {
                TimeUnit.MILLISECONDS.sleep(200);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
            }
        });

        Future<Timing> measured = submitMeasured(
                executor,
                () -> TimeUnit.MILLISECONDS.sleep(20));

        Timing timing = measured.get();
        System.out.println("queue ms: " + timing.queueMillis());
        System.out.println("execution ms: " + timing.executionMillis());
        System.out.println("end-to-end ms: " + timing.totalMillis());

        executor.shutdown();
    }

    private static Future<Timing> submitMeasured(
            ExecutorService executor,
            InterruptibleTask task) {

        long submittedAt = System.nanoTime();

        return executor.submit(() -> {
            long startedAt = System.nanoTime();
            task.run();
            long finishedAt = System.nanoTime();

            return new Timing(
                    submittedAt,
                    startedAt,
                    finishedAt);
        });
    }

    @FunctionalInterface
    private interface InterruptibleTask {
        void run() throws InterruptedException;
    }

    private record Timing(
            long submittedAt,
            long startedAt,
            long finishedAt) {

        private long queueMillis() {
            return TimeUnit.NANOSECONDS.toMillis(
                    startedAt - submittedAt);
        }

        private long executionMillis() {
            return TimeUnit.NANOSECONDS.toMillis(
                    finishedAt - startedAt);
        }

        private long totalMillis() {
            return TimeUnit.NANOSECONDS.toMillis(
                    finishedAt - submittedAt);
        }
    }
}`,
        runCommand:
          "javac --release 21 PoolTimingDemo.java && java PoolTimingDemo",
        expectedOutput: [
          "queue ms: 1xx 或 2xx",
          "execution ms: 2x",
          "end-to-end ms: 2xx"
        ],
        observation:
          "短任务自身只运行约 20ms，但它先在单线程池队列中等待前一个任务，因此端到端延迟主要来自排队。",
        body: [
          "端到端时间是从提交到完成；执行时间只覆盖任务真正占有工作线程的区间；二者之差是队列等待。只测任务方法会漏掉过载，只有端到端平均值又无法区分线程池容量不足与依赖变慢。",
          "`ThreadPoolExecutor.getActiveCount()` 返回近似活动线程数，`getTaskCount()` 与 `getCompletedTaskCount()` 也是动态状态下的近似统计。`getQueue()` 主要用于监控和调试，读取队列大小不会冻结队列。这些值适合趋势与告警，不应充当并发控制条件。",
          "生产监控至少应包括：队列长度与最老任务年龄、队列等待和执行时间分布、完成/失败/取消/拒绝率，以及按租户拆分的完成数。平均值会把少量极慢请求摊平，因此还要观察 p95、p99 和最大值，并保留足够样本量。",
          "`beforeExecute`、`afterExecute` 和 `terminated` 可用于统一环境清理、统计和日志。hook 抛异常可能使工作线程异常终止；另外 submit 的异常被 FutureTask 保存，afterExecute 的 Throwable 可能为 null，需要检查已完成 Future。"
        ],
        invariant:
          "测量代码不能改变任务的业务语义；无论统计成功或失败，任务异常都必须继续被正确观察，清理也必须执行。"
      },
      {
        kind: "api-decision",
        eyebrow: "选择匹配问题的证据",
        title: "线程转储、运行指标、压测与微基准，不是谁替代谁",
        goal:
          "根据待回答的问题选择诊断快照、持续指标、端到端负载测试或 JMH。",
        body: [
          "线程转储回答“这一刻线程在哪里等待、谁持有锁”；持续指标回答“系统是否持续完成工作、延迟和排队如何变化”；负载测试回答“完整服务在给定流量、数据和依赖下是否满足容量目标”；JMH 回答“一个受控 JVM 微观操作在明确实验设置下的吞吐或耗时”。",
          "正确性测试要验证余额、任务唯一终态、资源不泄漏等不变量，并用屏障、重复运行和对抗调度放大竞态。它不能由 JMH 的高吞吐结果替代。反过来，一个测试全部通过，也不能证明容量和尾延迟满足生产要求。",
          "从问题开始，而不是从工具开始。若完成数停止，先取线程与锁证据；若队列年龄增长，检查准入和服务时间；若怀疑两个本地实现的微小开销，再设计 JMH；若关心真实请求 p99，就使用端到端负载与生产观测。"
        ],
        apiOptions: [
          {
            api: "ThreadMXBean / thread dump",
            useWhen: "定位线程等待、锁拥有者和死锁环。",
            guarantees: "提供某一时刻附近的运行时结构证据。",
            doesNotGuarantee: "长期趋势、业务吞吐或完整虚拟线程覆盖。"
          },
          {
            api: "运行指标",
            useWhen: "持续观察排队、完成、失败和延迟分布。",
            guarantees: "在埋点定义正确时呈现时间趋势。",
            doesNotGuarantee: "单独指出代码根因或证明不变量。"
          },
          {
            api: "端到端负载测试",
            useWhen: "验证完整系统在目标流量与依赖下的 SLO。",
            guarantees: "在该环境与负载模型下产生容量证据。",
            doesNotGuarantee: "自动隔离某个 Java 操作的纳秒级成本。"
          },
          {
            api: "JMH",
            useWhen: "比较 JVM 上一个边界清楚、可重复的微观操作。",
            guarantees: "提供预热、测量、fork 和防止部分优化陷阱的框架。",
            doesNotGuarantee: "实验问题正确、生产可推广或代码并发正确。"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "建立诚实的 JMH 实验",
        title: "先限定问题，再让独立 JVM 反复测量",
        goal:
          "在独立 Maven 工程中运行一个有预热、有 fork、返回结果且共享状态明确的 JMH benchmark。",
        task:
          "使用 OpenJDK JMH archetype 创建独立工程，把生成的 benchmark 替换为下面的 CounterBenchmark，然后从命令行构建和运行。运行前先写下它能回答和不能回答的问题。",
        constraints: [
          "不要在 IDE 的一次 main 运行里用 nanoTime 手搓微基准。",
          "benchmark 必须返回计算结果或交给 Blackhole，避免死代码消除。",
          "共享状态的 Scope 与线程数必须匹配要模拟的竞争。",
          "保留预热和 fork；不要只挑一次最快数字。",
          "两个被比较操作必须提供相同语义。"
        ],
        hints: [
          "OpenJDK 推荐 Maven archetype，因为只加入 jmh-core 依赖并不够，还需要注解处理器生成测试代码。",
          "JMH 默认 fork；不同 benchmark 共用同一 JVM profile 会污染优化结果。",
          "常量输入可能被 JIT 折叠，应从非 final 的 @State 字段或 @Param 读取。"
        ],
        codeLabel: "CounterBenchmark.java",
        codeKind: "runnable",
        javaVersion: "Java 21 + JMH",
        code: `package org.sample;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.BenchmarkMode;
import org.openjdk.jmh.annotations.Fork;
import org.openjdk.jmh.annotations.Measurement;
import org.openjdk.jmh.annotations.Mode;
import org.openjdk.jmh.annotations.OutputTimeUnit;
import org.openjdk.jmh.annotations.Scope;
import org.openjdk.jmh.annotations.Setup;
import org.openjdk.jmh.annotations.State;
import org.openjdk.jmh.annotations.Threads;
import org.openjdk.jmh.annotations.Warmup;

@State(Scope.Benchmark)
@BenchmarkMode(Mode.Throughput)
@OutputTimeUnit(TimeUnit.SECONDS)
@Warmup(iterations = 5, time = 1)
@Measurement(iterations = 5, time = 1)
@Fork(2)
@Threads(4)
public class CounterBenchmark {
    private AtomicLong atomicCounter;
    private SynchronizedCounter synchronizedCounter;

    @Setup
    public void setUp() {
        atomicCounter = new AtomicLong();
        synchronizedCounter = new SynchronizedCounter();
    }

    @Benchmark
    public long atomicIncrement() {
        return atomicCounter.incrementAndGet();
    }

    @Benchmark
    public long synchronizedIncrement() {
        return synchronizedCounter.incrementAndGet();
    }

    private static final class SynchronizedCounter {
        private long value;

        private synchronized long incrementAndGet() {
            return ++value;
        }
    }
}`,
        runCommand:
          "mvn clean verify && java -jar target/benchmarks.jar CounterBenchmark",
        expectedOutput: [
          "JMH 输出两个 fork、各自的预热与测量迭代。",
          "最终 Score 单位为 ops/s；具体数字取决于机器、JDK 与运行环境。"
        ],
        body: [
          "这项实验只回答一个窄问题：在当前 JDK、机器、四个 JMH 工作线程和两个相同“递增并返回新值”语义下，两种实现的吞吐量如何。它不证明实现无竞态，不代表生产请求 p99，也没有模拟数据库、队列和真实数据分布。",
          "预热让 JIT 有机会依据稳定 profile 编译热点；测量迭代提供重复样本；fork 把 benchmark 放进独立 JVM，减少不同测试 profile 相互污染。返回值由 JMH 消费，降低整个计算被当作无用代码删除的风险。",
          "JMH 仍无法替你判断实验是否公平。常量折叠、死代码消除、错误 State scope、手写大循环、不同语义的对比和不受控后台负载仍会制造漂亮但错误的数字。OpenJDK 官方明确建议 benchmark 接受同伴评审。",
          "OpenJDK 推荐把 JMH 放在独立 Maven 子工程，通过 archetype 生成正确构建，再以 `java -jar target/benchmarks.jar` 从命令行运行。IDE 环境通常有调试代理、后台索引和不受控 JVM 参数，适合开发，不适合形成最终性能结论。"
        ],
        adversarialTest:
          "把 benchmark 返回类型改成 void 并丢弃计算结果，再把输入改成编译期常量，观察结果是否出现不合理跃升；随后对照 OpenJDK 的 DeadCode、ConstantFold 与 Forking 官方样例解释原因。"
      },
      {
        kind: "checkpoint",
        eyebrow: "完成活性与测量审计",
        title: "先证明能前进，再证明前进得够快",
        goal:
          "为一个并发服务组合 safety 不变量、活性信号、诊断快照与性能实验，而不是用单一数字代替全部证据。",
        body: [
          "一份可信报告应先列 safety：任务不丢不重、状态转移合法、配额和资源不泄漏；再列 liveness：在依赖可用与负载受限的前提下，完成计数持续增长，任何租户的等待有上限，取消和关机能解除阻塞；最后列 performance：目标负载下的吞吐、队列等待、执行时间和端到端分位数。",
          "故障演练要主动制造证据：反向获取两把锁，确认诊断能指出等待环；让高优先级流量持续到达，检查低优先级是否饥饿；让双方同步退避，观察重试数增长而完成数停滞；让队列饱和，确认拒绝和最长等待被暴露。",
          "跨服务时，本地 ThreadMXBean 看不到远程等待图，JMH 也不会模拟网络排队。需要把请求 ID、截止时间、队列时间、依赖 span 和业务完成点连接起来；否则每个 JVM 都可能看似健康，整个调用链却形成资源依赖环。"
        ],
        checkpoint: {
          prompt:
            "一个版本 JMH 吞吐提高 30%，线程池 completedTaskCount 也增长。能否据此发布？还缺哪些证据？",
          hint: "分别检查正确性、活性、公平性和真实负载。",
          answer: [
            "不能。JMH 只支持它所测的微观问题，completedTaskCount 也是近似总量；二者都不能证明任务结果正确、异常被观察、某个租户不饥饿或生产 p99 达标。",
            "还需要不变量测试与并发对抗测试、按租户进展和排队年龄、失败/取消/拒绝指标、目标负载下端到端分位数，以及必要的线程与锁诊断。"
          ],
          successCriteria: [
            "能区分 safety、liveness 与 performance 的证据。",
            "能说明 ThreadMXBean 的平台线程与等待环边界。",
            "能把队列等待和执行时间分开。",
            "能限定 JMH 的问题、环境与可推广范围。"
          ]
        }
      }
    ]
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
