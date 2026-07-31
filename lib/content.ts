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
  learningBlocks?: LessonLearningBlock[];
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
    title: "先行发生：JIT 为什么能让停止循环停不下来",
    dek: "从编译器缓存一个值、到 CPU 上的每核缓存，解释为什么“本地能停”的普通 boolean 在生产中仍可能永远循环。",
    readTime: "24 分钟",
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
      "不要把普通字段读成每次都会重新去取的消息：没有同步边，JIT 可以复用旧值，CPU 也没有必须立刻让另一核看见写入的发布协议。",
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
