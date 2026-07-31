import type {
  Lesson,
  LessonLearningBlock,
  LessonReference
} from "./content";

export type FlinkModule = {
  id: string;
  title: string;
  question: string;
  outcome: string;
  lessonSlug: string;
  topics: string[];
};

const FLINK_RUNTIME = "Apache Flink 2.3.0 · Java 17 · Maven";
const FLINK_DOCS =
  "https://nightlies.apache.org/flink/flink-docs-release-2.3";
const FLINK_LAB_PROTOCOL =
  "实验协议：先按本课“独立实现”任务创建对应 fixture、脚本与测试 JAR，再运行下列命令；这些命令是验收合同，不代表仓库预置了完成版 Lab 或答案工程。";

type FlinkLessonDefinition = Omit<
  Lesson,
  | "track"
  | "status"
  | "readTime"
  | "sections"
  | "questions"
  | "learningBlocks"
> & {
  readTime?: string;
  learningBlocks: FlinkLearningBlockDefinition[];
};

type FlinkLearningBlockDefinition = Omit<
  LessonLearningBlock,
  "body"
> & {
  body?: string[];
};

function defineFlinkLesson(definition: FlinkLessonDefinition): Lesson {
  return {
    ...definition,
    track: "flink-mastery",
    status: "published",
    readTime: definition.readTime ?? "4–6 小时（含实验）",
    sections: [],
    questions: [],
    learningBlocks: definition.learningBlocks.map((block) => ({
      ...block,
      body:
        block.kind === "experiment"
          ? [FLINK_LAB_PROTOCOL, ...(block.body ?? [])]
          : (block.body ?? [])
    }))
  };
}

function flinkDoc(
  title: string,
  path: string,
  note: string
): LessonReference {
  return {
    title,
    href: `${FLINK_DOCS}/${path}`,
    note
  };
}

export const flinkLessons: Lesson[] = [
  defineFlinkLesson({
    slug: "flink-dataflow-runtime",
    week: 1,
    title: "从 JAR 到分布式 Dataflow：一条记录究竟在哪里执行",
    dek: "不从 map、keyBy 的 API 清单开始，而是追踪 main 如何生成执行计划，计划如何成为并行 subtask，以及 operator chain、task slot、mailbox 与数据交换怎样共同决定真实执行边界。",
    tags: ["Flink 2.3", "Dataflow", "JobGraph", "Operator Chain", "Mailbox"],
    searchTerms: [
      "StreamGraph",
      "JobGraph",
      "ExecutionGraph",
      "TaskManager",
      "JobManager",
      "operator chaining",
      "task slot",
      "mailbox",
      "partitioning"
    ],
    keyIdea:
      "DataStream 是对未来计算的描述，不是装着记录的 Java 集合；main 的运行位置取决于部署模式，但真实业务记录始终由 TaskManager runtime operator 处理。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先画执行边界",
        title: "main 负责构图，运行在 Client 还是 JobManager 取决于部署模式",
        goal:
          "能够从一段 DataStream 程序画出 Client、Dispatcher、JobMaster、TaskManager、task、subtask、operator chain 与 slot 的关系，并指出每段用户代码在哪个进程、哪条线程上运行。",
        prerequisites: [
          "理解 JVM 进程、线程、对象引用与 Java 序列化边界",
          "能够使用 Maven 构建 Java 17 项目",
          "有提交 Flink JAR 或阅读 Web UI 执行图的经验"
        ],
        conceptMap: [
          {
            label: "Client 或 JobManager application main",
            relation: "按部署模式执行 main，构造 Transformation 并提交 Pipeline"
          },
          {
            label: "JobManager process",
            relation: "承载 Dispatcher、ResourceManager 与一个或多个 JobMaster"
          },
          {
            label: "JobMaster",
            relation: "每个作业一个，管理该 JobGraph 的调度、checkpoint 与恢复"
          },
          {
            label: "TaskManager",
            relation: "在 task 线程中执行并行 subtask"
          },
          {
            label: "operator chain",
            relation: "把可链接算子放进同一个 task 线程，避免不必要的数据交换"
          }
        ],
        invariant:
          "任何正确解释都必须保持：提交端对象不是 TaskManager 运行时对象；并行度 p 表示 p 个 subtask 实例；slot 是调度与托管内存份额，不提供 CPU 隔离；跨进程共享不能依靠 static 字段。",
        body: [
          "Session 模式下，main 通常在提交 Client 进程执行；Application Mode 与相应 run-application 流程可由 JobManager 侧的 application entrypoint 执行 main。fromSource、map、keyBy、sinkTo 等调用逐步构造逻辑数据流，execute 触发计划生成与提交。无论 main 在哪，真实业务记录都在 TaskManager runtime operator 之间流动。",
          "StreamGraph、JobGraph 与 ExecutionGraph 不是三个同义词。它们分别更接近流式算子语义、可调度 JobVertex 与一次具体运行的 execution attempt。JobManager 进程内的 Dispatcher 接收作业、ResourceManager 协调 slot，每个作业对应的 JobMaster 管理该 JobGraph；学习时要追踪信息如何逐层具体化，而不是背类名。",
          "本路线以 Flink 2.3.0、Java 17 和经典 org.apache.flink.streaming.api DataStream API 为生产主线。DataStream API V2、State V2 与 ForSt 在 2.3 仍为 Experimental，只在边界卡中观察，不能混写成当前生产默认。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先预测，再打开 Web UI",
        title: "三个 map 就一定对应三个线程、三个 slot 吗",
        prediction:
          "source → map → filter → map → sink 全部并行度为 2，默认开启 chaining。请先写下 JobManager 数量、task 数量、subtask 数量、slot 需求和可能出现的 task 线程数量，再运行实验。",
        invariant:
          "API 算子数、运行时 operator 数、operator chain 数、task 数与 slot 数是五个不同计数。",
        body: [
          "兼容的相邻算子可以链接为一条 operator chain，因此多个逻辑 operator 可能在一个 task 线程中依次调用。keyBy、rebalance 等数据交换通常切断 forward 链；显式 disableChaining 或 startNewChain 也会改变物理边界。",
          "默认 slot sharing 允许同一作业不同 task 的 subtask 共享一个 slot。作业通常需要的 slot 数接近各阶段最大并行度，而不是所有 operator 并行度之和；但这不表示同一 slot 中只有一条线程。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "实验协议",
        title: "用 PID、线程名、subtask index 与 JSON 计划还原运行位置",
        prediction:
          "关闭 chaining 后，输出中的线程边界与执行计划会怎样变化？把 map 的并行度从 2 改成 3，又会在哪条边新增数据交换？",
        codeLabel: "DataflowBoundaryJob.java · 关键片段",
        codeKind: "excerpt",
        runtime: FLINK_RUNTIME,
        runCommand:
          "mvn -DskipTests package\n./bin/flink run -d -p 2 target/flink-mastery-lab.jar\ncurl http://localhost:8081/jobs/<job-id>/plan",
        code: `StreamExecutionEnvironment env =
        StreamExecutionEnvironment.getExecutionEnvironment();
env.disableOperatorChaining(); // 第二轮删除本行再比较

DataStream<Long> source = env
        .fromSequence(1, 20)
        .name("number-source")
        .uid("number-source");

source.map(value -> {
            RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
            String thread = Thread.currentThread().getName();
            System.out.printf(
                    "pid=%s thread=%s value=%d%n",
                    runtime.getName(), thread, value);
            return value;
        })
        .name("trace-map")
        .uid("trace-map")
        .setParallelism(2)
        .keyBy(value -> value % 2)
        .map(value -> value)
        .name("keyed-map")
        .uid("keyed-map")
        .setParallelism(2)
        .print()
        .name("trace-sink")
        .uid("trace-sink");

System.out.println(env.getExecutionPlan());
env.execute("dataflow-boundary");`,
        expectedOutput: [
          "计划 JSON 中能区分 source、trace-map、keyed-map 与 sink，并显示 chaining/parallelism",
          "同一 operator 的不同 subtask 可能运行在不同 task 线程；输出不存在全局顺序承诺",
          "删除 disableOperatorChaining 后，兼容的 forward 算子数量减少为更少的 task/chain"
        ],
        observation:
          "先保存两次执行计划，再对照 Web UI 的 Vertices、Subtasks 与 TaskManagers；不要只凭日志线程名推断完整拓扑。",
        trace: [
          {
            thread: "Client 或 JobManager application main",
            action: "调用 API 并执行 getExecutionPlan/execute",
            state: "Transformation 被翻译为可提交 Pipeline"
          },
          {
            thread: "JobMaster control plane",
            action: "创建 execution attempts 并向 TaskManager 部署",
            state: "逻辑并行度具体化为 subtask"
          },
          {
            thread: "Task thread",
            action: "从输入取记录并依次调用 chain 中的 operator",
            state: "记录只在此处进入用户 map/filter"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "沿一条记录走源码",
        title: "operator chain 是调用栈优化，网络边是分布式语义边界",
        body: [
          "同一 chain 中，上游 Collector 可以直接调用下游 operator，省去序列化、网络缓冲和线程切换。跨 task 的边则通过 ResultPartition、subpartition、InputGate 与 channel 传递序列化后的记录。forward、keyBy、rebalance、rescale、broadcast 决定的是不同路由合同。",
          "StreamTask 的 mailbox loop 把输入处理、定时器与提交到 mailbox 的控制动作串行化到 task 线程。这个模型简化了 operator 内部状态访问，但一个阻塞 UDF 会同时阻塞记录、timer、watermark 和某些 checkpoint 进展；它绝不是“Flink 自动把每个回调放到线程池”。",
          "源码阅读锚点：StreamExecutionEnvironment、StreamGraphGenerator、StreamingJobGraphGenerator、DefaultScheduler、StreamTask、MailboxProcessor、OperatorChain。每次只追一个字段，例如 uid、parallelism 或 partitioner 如何从 API 走到运行时。"
        ],
        trace: [
          {
            thread: "StreamGraphGenerator",
            action: "把 Transformation 递归翻译为 StreamNode/StreamEdge",
            state: "保留 operator、parallelism、partitioner 与 chaining 条件"
          },
          {
            thread: "StreamingJobGraphGenerator",
            action: "把可链接节点聚合为 JobVertex",
            state: "形成调度与部署单元"
          },
          {
            thread: "MailboxProcessor",
            action: "驱动默认 action 与 mailbox mail",
            state: "task 线程上的回调获得串行执行边界"
          }
        ],
        invariant:
          "同一 task 线程内的串行执行只保护该 subtask 的本地状态；不同 subtask、异步回调、外部系统与失败重放仍需独立协议。"
      },
      {
        kind: "api-decision",
        eyebrow: "不要凭感觉改物理图",
        title: "chaining、slot sharing 与 partitioner 各自改变什么",
        body: [
          "先写出要改变的边界：是函数调用边界、数据路由、资源隔离，还是故障影响面。三个问题使用不同 API，混用会得到难以解释的性能结果。"
        ],
        apiOptions: [
          {
            api: "name + uid",
            useWhen: "所有可能带状态、参与升级或需要稳定观测的 operator",
            guarantees: "稳定的人类可读名称与状态映射标识",
            doesNotGuarantee: "算子一定独占 task、slot 或 JVM"
          },
          {
            api: "disableChaining / startNewChain",
            useWhen: "需要定位链内阻塞、隔离线程栈或验证序列化边界",
            guarantees: "改变 operator chain 边界",
            doesNotGuarantee: "CPU、内存或容器资源隔离"
          },
          {
            api: "slotSharingGroup",
            useWhen: "需要调整不同 task 是否可共享 slot 资源",
            guarantees: "改变 slot 共享约束",
            doesNotGuarantee: "操作系统级 CPU 隔离"
          },
          {
            api: "keyBy / rebalance / rescale / broadcast",
            useWhen: "业务键归属或负载分配需要明确路由",
            guarantees: "各自定义的下游选择规则",
            doesNotGuarantee: "跨所有 channel 的全局顺序"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "实现一个执行图审计器，而不是再写一个 WordCount",
        task:
          "编写 DataflowAuditJob：订单流依次经过解析、按 customerId 分区、风控、审计 sink。为每个 operator 设置稳定 uid/name，输出执行计划，并在记录中附带 sourcePartition、sourceSequence、subtaskIndex 与 attemptNumber，生成一份“预期边界—实际证据”报告。",
        constraints: [
          "经典 DataStream API；Flink 2.3.0；Java 17",
          "至少比较 chaining 开启/关闭和 parallelism 2→3 两组计划",
          "不得使用 static 集合作为跨 subtask 汇总通道",
          "报告必须区分 operator、chain、task、subtask、slot 和 JVM",
          "故意在风控 map 中阻塞 5 秒，记录 timer/checkpoint 指标的连带变化"
        ],
        hints: [
          "RichFunction 的 RuntimeContext 可取得 subtask index 与 attempt number。",
          "先把 source sequence 作为输入事实保留下来，再判断每个 channel 内是否保序。",
          "用 REST plan 与 Web UI 验证，不要让程序自己的日志成为唯一证据。"
        ],
        adversarialTest:
          "令两个 source subtask 同时产生递增 sequence，并让其中一条路径随机 sleep。若实现或报告声称 sink 输出全局有序，测试必须稳定击穿该结论；若 static counter 被用来统计总量，则在多 TaskManager 运行时应暴露分裂计数。",
        body: [
          "先独立完成计划与预测，再打开提示。最终交付不是一段能运行的 JAR，而是一份可以回答“这条记录为什么在这里执行”的证据链。"
        ]
      },
      {
        kind: "distributed-boundary",
        eyebrow: "边界与版本纪律",
        title: "单 task 串行、单 JVM static 与集群一致性是三件事",
        localGuarantee:
          "经典 DataStream operator 在其 task 线程中按运行时合同处理输入、watermark 与 timer；同一 key 经 keyBy 归属一个下游 subtask。",
        breaksWith:
          "多个 TaskManager JVM、异步线程、失败后的新 attempt、rescaling、非确定性分区与外部副作用都会越过本地串行边界。",
        alternatives: [
          "需要共享业务状态时使用 Flink managed state，而不是 static 单例",
          "需要跨进程唯一提交时使用外部事务、幂等键或 checkpoint 协同协议",
          "需要生产稳定性时继续使用经典 DataStream API；V2 只做 Experimental 观察"
        ],
        body: [
          "构造函数可能在提交端执行，RichFunction.open 则在运行时实例上调用。连接、线程池与客户端应在 open 中按 subtask 生命周期创建并在 close 中尽力释放；但进程强杀时 close 不一定获得执行机会，因此外部租约还要有超时与服务端回收。",
          "SourceFunction、SinkFunction 与旧 Sink V1 已不在 Flink 2.x 公共 API 主线中。后续 Source 课程使用 FLIP-27 @Public Source，Sink 课程使用 sink2 的 @Public Sink。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "不看图，把一条记录从 main 讲到 sink",
        body: [
          "合上资料后，画出控制面和数据面；然后解释改变 chaining、parallelism、partitioner 与 slot sharing 时，图上的哪条边发生变化。"
        ],
        checkpoint: {
          prompt:
            "为什么“程序里有 6 个算子、并行度 4”既不能推出需要 24 个 slot，也不能推出只有 4 条线程？请从图生成、operator chain、slot sharing 和 TaskManager 执行四层作答。",
          hint:
            "先分别数 logical operator、chain、task/subtask 与 slot，再说明 slot 不做 CPU 隔离。",
          answer: [
            "逻辑算子先经 chaining 形成较少的 JobVertex/task；每个 task 再按自己的 parallelism 产生 subtask。",
            "同一作业不同 task 的 subtask 默认可共享 slot，所以所需 slot 通常由最高并行度阶段决定，而不是求和。",
            "一个 slot 可以容纳多个 task 线程；slot 主要是调度和托管内存份额，不是 CPU 核或线程的同义词。",
            "记录只在 TaskManager 的运行时 operator 中处理；main 和 Client 负责构图与提交。"
          ],
          successCriteria: [
            "能区分 StreamGraph、JobGraph 与一次 Execution attempt",
            "能准确陈述 operator、chain、task、subtask、slot、线程与 JVM",
            "能说明 keyBy 的局部归属保证与不存在的全局顺序保证",
            "能解释阻塞 UDF 为什么影响 mailbox、timer 与 checkpoint"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Flink Architecture",
        "docs/concepts/flink-architecture/",
        "JobManager、TaskManager、operator chain、task slot 与部署模式的官方边界。"
      ),
      flinkDoc(
        "DataStream API Overview",
        "docs/dev/datastream/overview/",
        "经典 DataStream API 的程序结构与 transformation 语义。"
      ),
      flinkDoc(
        "Parallel Execution",
        "docs/dev/datastream/execution/parallel/",
        "parallelism、max parallelism 与 operator 级配置。"
      ),
      flinkDoc(
        "Java Compatibility",
        "docs/deployment/java_compatibility/",
        "Flink 2.x 推荐 Java 17，Java 21 仍有未验证边界。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-source-code-capstone",
    week: 12,
    title: "源码阅读与毕业审计：从 API 合同追到故障切点",
    dek: "用三个纵向 trace 阅读 Flink 2.3 源码：Transformation 如何成为 execution attempt、record/barrier 如何穿过 mailbox 与 network、split/committable/SQL plan 如何恢复；最终对一条真实作业提交可证伪的架构与生产审计。",
    tags: ["Source Code", "Runtime", "Checkpoint", "Connector", "Capstone"],
    searchTerms: [
      "StreamGraphGenerator",
      "StreamingJobGraphGenerator",
      "ExecutionGraph",
      "StreamTask",
      "MailboxProcessor",
      "CheckpointBarrierHandler",
      "SourceCoordinator",
      "SinkWriterOperator",
      "FlinkPlannerImpl",
      "architecture audit"
    ],
    keyIdea:
      "源码不是从包树第一页读到最后一页；以一个可观察现象为起点，沿 public contract、state/线程所有权、happy path、failure path 和测试反向建立最短证据链。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先写阅读问题",
        title: "每次只追一个事实：谁调用、在哪条线程、状态归谁、失败后怎样",
        goal:
          "能够在 Flink release-2.3 源码中完成 graph、record/barrier、source/sink/SQL 三条纵向 trace，并把实现细节区分为 public contract、当前实现与实验性方向。",
        prerequisites: [
          "完成前 11 个 Flink 深度模块",
          "能使用 IntelliJ 调试、Maven 定向测试、git blame/log",
          "理解 @Public、@PublicEvolving、@Internal、@Experimental 的不同承诺"
        ],
        conceptMap: [
          {
            label: "contract",
            relation: "官方文档、注解、接口/Javadoc 定义可依赖语义"
          },
          {
            label: "implementation path",
            relation: "当前 release-2.3 完成合同的类与调用链"
          },
          {
            label: "failure path",
            relation: "异常、cancel、timeout、attempt/epoch 与 restore"
          },
          {
            label: "executable evidence",
            relation: "已有测试、断点、日志、故障注入与最小复现"
          }
        ],
        invariant:
          "任何源码结论必须注明版本、API stability、调用线程、state owner、完成条件和失败路径；只读 happy path 或凭类名推断，不构成可复用结论。",
        body: [
          "先固定 `release-2.3` tag/commit，避免在 master 看到尚未发布行为。阅读顺序是：用户可见现象 → 官方合同 → 入口接口 → 最小调用链 → 状态与线程 → failure/cancel → tests → 自己的断点/变异实验。",
          "经典 DataStream API、FLIP-27 Source 与 sink2 Sink 是本路线生产合同；DataStream V2、State V2、ForSt 标为 Experimental。源码里同时存在旧实现、兼容层和新方向，不能因为类仍在仓库就断言它属于 2.3 公共 API。",
          "每条 trace 最终产出一张 sequence、一个不变量、一个 adversarial test 与一个“实现细节不可依赖”清单。源码阅读的价值是缩小错误假设，不是积累类名。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先审一条错误结论",
        title: "sendEvent future 完成，能否证明 sink 已 flush 或 commit",
        prediction:
          "源码中某 gateway.sendEvent 返回的 future 成功完成。请列出它最多证明到哪一层；要证明 operator 已处理、writer 已 flush、外部 DDL/事务已完成，还缺哪些状态与回执？",
        invariant:
          "transport delivery、mailbox enqueue、operator handling、writer flush、precommit 与 external commit 是独立完成点；源码中的 future 必须按其具体 completion contract 解读。",
        body: [
          "一个 future 可能只在 RPC/event 成功送达时完成，operator 的业务回调可能稍后才执行；即使业务回调返回，异步外部操作也可能未完成。必须继续追 receiver、mailbox、异常传播与显式 response event。",
          "跨 attempt 协议还需 epoch、subtask attempt、timeout、checkpoint ordering 与 coordinator state。旧 attempt 的 late response 若没有 fencing，会误导 coordinator 释放依赖记录或提交外部结果。",
          "这类误读是源码审计的核心训练：不要把方法名里的 send、ack、flush、prepare 或 complete 自动升级成业务最终性。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "三条纵向 trace",
        title: "用断点与最小测试追 graph、barrier 和 committable",
        prediction:
          "分别在 StreamGraphGenerator、StreamTask checkpoint 路径和 CommitterOperator 打断点。哪些代码运行在 Client、JobMaster、task/mailbox 或异步 I/O 线程？",
        codeLabel: "源码实验清单 · release-2.3",
        codeKind: "pseudocode",
        runtime: "Apache Flink source tag release-2.3 · Java 17 · Maven/IntelliJ",
        runCommand:
          "./mvnw -pl flink-streaming-java -DskipITs -Dfast -Dtest=<FocusedTest> test\n./mvnw -pl flink-runtime -DskipITs -Dfast -Dtest=<FocusedTest> test",
        code: `trace("graph")
  .from(StreamExecutionEnvironment)
  .through(StreamGraphGenerator, StreamingJobGraphGenerator)
  .to(JobGraph, ExecutionGraph);

trace("record-and-barrier")
  .through(StreamTask, MailboxProcessor, OperatorChain)
  .through(CheckpointBarrierHandler, SubtaskCheckpointCoordinatorImpl)
  .to(CheckpointCoordinator);

trace("connector-and-sql")
  .through(SourceCoordinator, SourceOperator)
  .through(SinkWriterOperator, CommitterOperator)
  .through(FlinkPlannerImpl, ExecNode, Transformation);

forEachTrace(recordThreadOwnerStateFailureTests());`,
        expectedOutput: [
          "graph translation 主要发生在提交/JobMaster 控制路径，record 处理发生在 TaskManager task thread",
          "barrier 处理、同步 snapshot 与异步 state persistence 的线程/完成条件被分开",
          "SourceCoordinator 与 Reader、SinkWriter 与 Committer 的 state owner/attempt 被标出",
          "SQL logical/physical node 最终翻译为与 DataStream 共用的 runtime transformations"
        ],
        observation:
          "调试笔记必须保存完整 commit、测试名、断点条件与调用栈。若为了触发路径修改源码，保留最小 diff；不把一次本机时序当成所有调度下的保证。"
      },
      {
        kind: "mechanism",
        eyebrow: "源码导航方法",
        title: "从状态 owner 与线程边界切开大型调用链",
        body: [
          "graph trace 关注 uid、parallelism、partitioner、chaining 与 slot sharing 如何从 Transformation 进入 JobVertex/ExecutionVertex；不要同时阅读 scheduler 的所有策略。",
          "record/barrier trace 关注 task thread 默认 action、mailbox mail、input processor、barrier handler、sync/async snapshot 与 ACK。对每个 callback 标注是否能访问 keyed state、是否允许阻塞、异常如何让 task 失败。",
          "connector/SQL trace 关注 coordinator/operator 分离、serializer snapshot、committable 重交付、DynamicTable ability 与 ChangelogMode 如何进入 runtime。Planner 类很多，应以一条 EXPLAIN 中出现的 node 为入口反向追 rule，而不是遍历 Calcite 包。"
        ],
        trace: [
          {
            thread: "owner lens",
            action: "为每个 field/state 标 owner 与 durability",
            state: "区分 JM coordinator、TM operator、external system"
          },
          {
            thread: "thread lens",
            action: "标调用线程、mailbox handoff 与 async boundary",
            state: "识别阻塞、数据竞争与完成条件"
          },
          {
            thread: "failure lens",
            action: "从 throw/cancel/timeout 追到 scheduler/restore",
            state: "验证异常是否可见、资源是否关闭、旧 attempt 是否 fencing"
          }
        ],
        invariant:
          "读完一个类却说不出 owner/thread/failure/completion，等于没有读完；读完一条 trace却没有写能击穿它的测试，等于没有证明。"
      },
      {
        kind: "api-decision",
        eyebrow: "决定能依赖什么",
        title: "文档、注解、测试和实现代码的证据权重不同",
        apiOptions: [
          {
            api: "@Public / 官方语义文档",
            useWhen: "生产用户代码需要跨 patch/minor 依赖合同",
            guarantees: "按 Flink compatibility policy 提供最强公共承诺",
            doesNotGuarantee: "内部类名、调用栈或性能实现不改变"
          },
          {
            api: "@PublicEvolving",
            useWhen: "接受较快演进并跟踪 release notes",
            guarantees: "公开使用但兼容承诺弱于 @Public",
            doesNotGuarantee: "长期签名/行为完全稳定"
          },
          {
            api: "@Experimental / @Internal",
            useWhen: "隔离原型、源码理解或 Flink 自身模块",
            guarantees: "说明当前方向/内部实现",
            doesNotGuarantee: "用户作业可安全依赖或平滑升级"
          },
          {
            api: "现有 test + 自建 adversarial test",
            useWhen: "验证当前 release 对具体故障/边界的实现",
            guarantees: "覆盖明确输入与调度下的可执行行为",
            doesNotGuarantee: "未断言的时序、外部系统或未来版本"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "毕业项目",
        title: "审计并加固一条真实订单 CDC/事件流作业",
        task:
          "选择一条真实或等价复杂度的 Flink JAR，提交 Architecture & Recovery Dossier：执行图、时间/水位线、state/schema、checkpoint cut、network/backpressure、rescale/failover、source/sink、SQL plan、SLO/runbook 与三条源码 trace。实现一项最小加固并用 chaos test 证明。",
        constraints: [
          "所有结论固定 Flink 2.3.0/Java 17/tag 或 commit；1.20 差异另表对照",
          "列出每个 operator uid/maxParallelism/state serializer 与 source/sink guarantee",
          "至少注入 reader failure、TM/JM failure、checkpoint storage slow、sink unknown commit、2→5 rescale",
          "结果用 immutable input + materialized oracle 验证，不以 RUNNING/行数作为唯一标准",
          "加固 change 必须窄小、可回滚，并附 before/after failure evidence"
        ],
        hints: [
          "从最昂贵的错误声明开始，例如 exactly-once、无界状态或恢复后重复副作用。",
          "优先修复一个可命名的不变量，而不是做大范围类重构。",
          "若源码证据与官方合同冲突，先复现并检查版本/路径，再把结论限定为当前实现。"
        ],
        adversarialTest:
          "评审者随机选择一个你声称安全的切点，在其前后杀进程或重放控制事件；你必须预测 source replay、managed state、pending committable、外部结果与告警。任何无法预测的切点都返回相应模块补课，不以“Flink 会处理”通过。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "源码边界",
        title: "实现细节能解释今天，公共合同才决定明天能否升级",
        localGuarantee:
          "固定 release-2.3 源码、配置与测试可解释当前实现路径，并帮助构造最小复现和窄修复。",
        breaksWith:
          "master 未发布改动、vendor patch、connector 独立版本、反射依赖内部类、未覆盖调度、不同外部系统语义和未来 optimizer/runtime 重构。",
        alternatives: [
          "用户作业只依赖 @Public/@PublicEvolving 合同，内部 trace 只用于诊断",
          "把关键行为固化为黑盒兼容/restore/chaos tests，而不是复制内部实现",
          "升级时对官方 release notes、plan diff 与 source anchors 重新核验"
        ],
        body: [
          "源码阅读不是授权使用 Internal API。能看到一个类并不表示用户 connector 可以导入它；依赖 internal operator/coordinator 往往在小版本升级时失去兼容。",
          "贡献 Flink 本身时可以修改 internal 实现，但评审仍从 public behavior、不变量、failover 与兼容性出发。精通不是背源码，而是能在代码变化后重新建立证明。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "毕业答辩",
        title: "90 分钟白板：不运行作业完成故障预测",
        body: [
          "给出 JAR、EXPLAIN、savepoint manifest、checkpoint 指标和一次 sink timeout；先独立画出执行/状态/提交时间线，再允许查看源码定位一个未知完成条件。"
        ],
        checkpoint: {
          prompt:
            "怎样证明一个源码结论既不是只读了 happy path，也没有把当前实现误写成公共合同？请给出完整证据链。",
          hint:
            "版本 + stability + owner/thread + failure/cancel + tests + observable behavior + upgrade boundary。",
          answer: [
            "固定 release tag/commit，先引用官方文档、Javadoc 和 API stability 注解界定可依赖合同。",
            "沿入口追 owner、thread、state durability、completion condition，并继续阅读异常、cancel、timeout、restore 与旧 attempt fencing。",
            "找到现有测试，再写 adversarial/变异测试从外部可观察行为验证结论；保留调用栈和精确配置。",
            "明确哪些只是 release-2.3 实现细节，用户代码不依赖；升级时用 plan/restore/chaos test 重新核验。"
          ],
          successCriteria: [
            "能独立完成 graph、barrier、connector/SQL 三条源码 trace",
            "能区分 public contract、current implementation 与 Experimental",
            "能从任意故障切点预测 state/replay/commit/attempt",
            "能交付一项窄加固及可重复 chaos 证据"
          ]
        }
      }
    ],
    references: [
      {
        title: "Apache Flink source · release-2.3",
        href: "https://github.com/apache/flink/tree/release-2.3",
        note: "本课所有源码 trace 的固定版本入口；不要改用 master 推断 2.3 行为。"
      },
      flinkDoc(
        "Flink Architecture",
        "docs/concepts/flink-architecture/",
        "源码阅读前的进程、task、slot 与执行边界合同。"
      ),
      flinkDoc(
        "API Compatibility Guidelines",
        "docs/ops/upgrading/",
        "API stability annotation 与升级兼容的官方说明。"
      ),
      flinkDoc(
        "Testing",
        "docs/dev/datastream/testing/",
        "operator/function 测试与 MiniCluster 集成验证入口。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-production-operations",
    week: 11,
    title: "生产运维：部署、HA、内存、升级与事故响应是一份合同",
    dek: "把 JAR、配置、connector、state path、HA metadata 与外部 retention 组成可重建发布单元；围绕 checkpoint age、lag、watermark、restart、transaction 和资源余量设计 SLO、告警、runbook 与 game day。",
    tags: ["Production", "Deployment", "HA", "Observability", "Upgrade"],
    searchTerms: [
      "Application Mode",
      "Session Mode",
      "classloading",
      "provided dependencies",
      "Kubernetes HA",
      "production readiness",
      "savepoint upgrade",
      "checkpoint age",
      "runbook"
    ],
    keyIdea:
      "生产可恢复性不是“集群会重启”：必须能用版本化 artifact、配置、state、HA 与外部系统合同重建同一作业，并在安全余量耗尽前被告警发现。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先定义发布单元",
        title: "一个 JAR 不能单独复原一条生产流水线",
        goal:
          "能够设计 Flink 2.3 作业的部署隔离、依赖打包、HA、内存、checkpoint/savepoint、SLO、升级/回滚与事故演练，并用自动化证据验证。",
        prerequisites: [
          "完成 checkpoint、failover、source/sink 与性能诊断课程",
          "理解 Kubernetes/YARN/Standalone 中至少一种部署",
          "理解外部 Broker、数据库与对象存储的 retention/transaction/ACL"
        ],
        conceptMap: [
          {
            label: "artifact",
            relation: "用户代码、connector/format 与受控第三方依赖"
          },
          {
            label: "runtime/deployment",
            relation: "Flink distribution、Java、cluster mode、slots 与 process memory"
          },
          {
            label: "durable recovery",
            relation: "checkpoint/savepoint、HA metadata 与可访问绝对路径"
          },
          {
            label: "external contract",
            relation: "source retention、sink transaction/idempotency、schema 与权限"
          }
        ],
        invariant:
          "任何生产版本都必须由不可变 artifact checksum、Flink/Java 版本、完整配置、operator manifest、state location、connector compatibility 与外部依赖合同唯一重建；回滚不能依赖现场手工记忆。",
        body: [
          "Application Mode/Cluster 把 main 放到集群并将集群生命周期绑定应用，隔离更强；Session Cluster 可共享长期集群、提交更轻，但多作业共享控制面与资源，依赖冲突和影响面更大。选择依据是隔离、启动成本、作业数量和运维模型。",
          "Flink runtime/API 通常由发行版提供，不应重复打进用户 uber JAR；connector、format 与业务第三方依赖按 2.3 项目配置打包。错误包含 flink-runtime/planner 或同类库，容易造成 classloader duplication、LinkageError 与序列化类型不一致。",
          "生产主线锁定 Flink 2.3.0 + Java 17 + 经典 DataStream API。迁移自 1.20 时保留差异清单；DataStream V2、State V2、ForSt 只在隔离实验环境观察 Experimental 行为。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先定义健康",
        title: "Job 状态 RUNNING，为什么仍可能离事故只剩十分钟",
        prediction:
          "作业 RUNNING，但 completed checkpoint age=25 分钟、Kafka retention 剩 40 分钟、transaction timeout=30 分钟、watermark lag 持续扩大。哪些安全余量已接近耗尽？",
        invariant:
          "健康必须包含最近可恢复点、可重放窗口、事务存活、处理进度与恢复时间；RUNNING 只说明当前状态机标签。",
        body: [
          "checkpoint age 过大意味着 RPO 与可恢复点陈旧；若随后失败，需从更老 offset 重放。重放起点必须仍在 Kafka retention 内，恢复时长还必须小于剩余保留窗口。",
          "pending transaction 生命周期若短于 checkpoint + failover + commit，exactly-once sink 会在恢复时面对已过期事务。watermark lag 增长表示 event-time freshness 恶化，即使 processing throughput 仍看似正常。",
          "告警应监控安全 margin：retention remaining - worst recovery、transaction timeout - checkpoint/restart、state growth - storage quota，而非仅在 FAILED 后通知。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "Production game day",
        title: "从健康作业开始，逐项撤掉一个生存条件",
        prediction:
          "先让 checkpoint storage 变慢，再杀 JobMaster、TaskManager、阻断 sink、缩短 source retention。哪些告警应先出现，runbook 何时应停止自动重启？",
        codeLabel: "runbooks/flink-game-day.yaml · 演练计划",
        codeKind: "pseudocode",
        runtime: "Flink 2.3.0 · Java 17 · Kubernetes/HA staging",
        runCommand:
          "./scripts/preflight.sh release-manifest.yaml\n./scripts/game-day.sh runbooks/flink-game-day.yaml\n./scripts/verify-recovery.sh <job-id> <input-range>",
        code: `release:
  flink: 2.3.0
  java: 17
  artifact_sha256: "<immutable>"
  operator_manifest: "uids-maxParallelism-serializers.json"
  restore: "canonical-savepoint-uri"
scenarios:
  - throttle_checkpoint_storage
  - kill_taskmanager
  - revoke_jobmanager_leadership
  - block_sink_and_expire_transaction
  - approach_source_retention_boundary
assert:
  - "alerts fire before safety margin reaches zero"
  - "latest completed checkpoint remains accessible"
  - "result converges to immutable-input oracle"
  - "rollback instructions use exact artifact/config/state tuple"`,
        expectedOutput: [
          "storage throttle 先拉高 async checkpoint duration/age，不应误报 CPU",
          "TaskManager/JobMaster 故障按 HA/restart 合同恢复，attempt/leader epoch 可见",
          "sink 阻断触发 backpressure、transaction margin 与 checkpoint 风险告警",
          "retention margin 不足时 runbook 停止盲目重启并升级为数据恢复决策"
        ],
        observation:
          "game day 的成功不是“最终又 RUNNING”，而是告警提前、runbook 决策正确、恢复时间在预算内、结果与 oracle 一致、无泄漏 transaction/资源，并能从记录复盘每个动作。"
      },
      {
        kind: "mechanism",
        eyebrow: "部署与类加载",
        title: "相同类名由不同 classloader 加载，就是不同类型",
        body: [
          "Flink 发行版 lib、plugins 与 user code classloader 有明确边界。父优先/子优先、plugin isolation 与 shaded dependencies 决定最终加载哪个字节码；同名类跨 classloader 不能安全强转。",
          "用户 JAR 应把 Flink API/runtime 设为 provided，并按官方项目配置包含 connector/format/业务依赖。冲突库可按需 relocate，但不要 shade Flink 自身来“解决”版本冲突。部署前输出 dependency tree、JAR contents 与实际 class code source。",
          "HA 恢复控制面需要 durable metadata 与 leader election；checkpoint/savepoint state path 必须由新集群以相同绝对路径和权限访问。对象存储 credential/插件缺失会让 HA 看似成功却无法恢复 state。"
        ],
        trace: [
          {
            thread: "submission/application main",
            action: "加载业务 artifact 并生成 JobGraph",
            state: "依赖与 connector factory 必须可发现"
          },
          {
            thread: "TaskManager user-code classloader",
            action: "反序列化 UDF、serializer 与 connector",
            state: "类 identity 由 loader + binary name 决定"
          },
          {
            thread: "HA recovery",
            action: "新 leader 读取作业/checkpoint metadata 并部署 attempts",
            state: "state path、plugin 与凭证必须仍可用"
          }
        ],
        invariant:
          "发布验证必须在目标 Flink distribution/container 中完成；本地 Maven test 能加载类，不证明生产 classloader、plugins、credentials 与 state filesystem 相同。"
      },
      {
        kind: "api-decision",
        eyebrow: "按隔离与恢复选部署",
        title: "Session、Application、stop 与 cancel 都有不同后果",
        apiOptions: [
          {
            api: "Application Mode/Cluster",
            useWhen: "作业需要独立生命周期、依赖与控制面隔离",
            guarantees: "应用 main 在集群执行，cluster 生命周期与 application 绑定",
            doesNotGuarantee: "外部依赖、state path 与 connector 自动可用"
          },
          {
            api: "Session Cluster",
            useWhen: "大量短/中等作业共享集群且能接受较大影响面",
            guarantees: "复用长生命周期 cluster 与资源",
            doesNotGuarantee: "作业间完整资源/依赖/故障隔离"
          },
          {
            api: "stop with savepoint",
            useWhen: "需要有状态、可恢复地停止并按选项处理输入结束",
            guarantees: "触发 savepoint 与受控停止流程",
            doesNotGuarantee: "外部 sink 已写结果自动回滚或所有 connector drain 相同"
          },
          {
            api: "cancel / externalized checkpoint",
            useWhen: "紧急停止或按 retention policy 保留恢复点",
            guarantees: "按配置终止并保留/清理 checkpoint",
            doesNotGuarantee: "最后一段输入完整处理或形成升级 savepoint"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "写可执行的生产就绪清单与事故 runbook",
        task:
          "为订单作业交付 release-manifest、preflight、SLO/alerts、upgrade/rollback 和五类 incident runbook。每条 runbook 必须含触发条件、只读证据、动作授权、停止条件、数据正确性验证与复盘产物。",
        constraints: [
          "manifest 固定 Flink 2.3.0/Java 17/artifact checksum/config/operator/state/external contracts",
          "告警覆盖 checkpoint age/failure、lag/watermark、backpressure、restart loop、state/storage、transaction/retention margin",
          "升级使用 stable uid/maxParallelism/canonical savepoint 与 isolated shadow target",
          "自动重启有次数/时间预算；数据源已越 retention 或 serializer 不兼容时停止",
          "所有 destructive/外部动作有明确目标、审批与可恢复性说明"
        ],
        hints: [
          "把“系统还能恢复吗”定义成一组 margin，而不是一个 boolean。",
          "runbook 第一段先收证据，避免重启抹掉最有价值的现场。",
          "rollback 也要跑 source/sink overlap 分析，不能只切回旧 JAR。"
        ],
        adversarialTest:
          "让作业保持 RUNNING，同时停止成功 checkpoint 并让 Kafka retention margin 逐步下降。若告警只盯 job status 则测试失败。再把 connector JAR 同时放 distribution lib 与 user JAR，preflight 必须通过 dependency/JAR/class-code-source 检查阻止发布。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "运维边界",
        title: "Flink HA 之外还有 DNS、IAM、Schema、Retention 与人",
        localGuarantee:
          "在已配置 HA、可访问 state、足够资源与兼容 artifact 下，Flink 能重新选主、重新调度并从 completed snapshot 恢复。",
        breaksWith:
          "对象存储权限/路径改变、Kafka retention 越界、schema registry 不兼容、DNS/证书过期、数据库事务失效、容器镜像漂移和错误人工回滚。",
        alternatives: [
          "把外部依赖探针和兼容检查纳入发布 preflight",
          "为不可恢复边界定义 halt/escalate，而不是无限重启",
          "定期从备份 state 与冷环境演练完整重建，而不只测同集群 restart"
        ],
        body: [
          "生产精通的标志是能说出系统何时不应自动恢复。若 source 数据已不可重放、目标 schema 不兼容或旧事务状态未知，继续重启可能扩大损失。",
          "runbook 也是并发协议：多人同时操作时需要 owner、fencing、时间线和变更记录。一个人触发 savepoint、另一个同时 cancel，会让恢复证据失去明确含义。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "在白板上重建一条生产作业",
        body: [
          "假设原集群完全消失，只给对象存储、镜像仓库和配置仓库；列出让同一作业安全恢复所需的每一份事实和验证顺序。"
        ],
        checkpoint: {
          prompt:
            "为什么 Job RUNNING 不能作为健康 SLO？为什么从旧 savepoint 回滚 JAR 前必须分析 sink 已提交区间和 source retention？",
          hint:
            "运行状态不包含最近恢复点、时间进度和外部世界；savepoint 不能回滚外部结果。",
          answer: [
            "RUNNING 不说明 checkpoint 是否新鲜、watermark/lag 是否推进、transaction/retention 是否还有恢复余量。",
            "旧 savepoint 会从更早 source position 重放；该位置必须仍在 retention 内。",
            "savepoint 之后已经提交的 sink 结果不会自动撤销，重放可能重复或覆盖。",
            "安全回滚需要精确 artifact/config/state、source 可重放、sink 幂等/事务/隔离和结果 oracle。"
          ],
          successCriteria: [
            "能选择部署模式并解释资源/类加载隔离",
            "能定义 release artifact + state + external contract",
            "能用安全 margin 设计 SLO/alerts",
            "能执行并审计升级、回滚与 game day"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Deployment Overview",
        "docs/deployment/overview/",
        "Application/Session 部署模式、Client、JobManager 与 TaskManager。"
      ),
      flinkDoc(
        "Debugging Classloading",
        "docs/ops/debugging/debugging_classloading/",
        "Flink user-code classloader、parent/child-first 与冲突排查。"
      ),
      flinkDoc(
        "Production Readiness Checklist",
        "docs/ops/production_ready/",
        "生产 checkpoint、HA、监控、资源、升级与外部系统检查。"
      ),
      flinkDoc(
        "Kubernetes High Availability",
        "docs/deployment/ha/kubernetes_ha/",
        "Kubernetes leader election、HA metadata 与恢复配置。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-performance-diagnostics",
    week: 10,
    title: "性能诊断：用吞吐、状态、Checkpoint 与恢复证据定位瓶颈",
    dek: "建立从业务 SLO 到 subtask、JVM、network、state backend 与外部依赖的证据树；用单变量负载、火焰图、内存分区和 checkpoint phase 区分 CPU、GC、native memory、RocksDB、I/O、skew 与重试放大。",
    tags: ["Performance", "Metrics", "Flame Graph", "Memory", "Capacity"],
    searchTerms: [
      "throughput",
      "end-to-end latency",
      "checkpoint start delay",
      "alignment duration",
      "async duration",
      "TaskManager memory",
      "RocksDB managed memory",
      "flame graph",
      "profiling",
      "capacity planning"
    ],
    keyIdea:
      "调优不是寻找神奇参数，而是建立能被下一次实验证伪的因果链：先守住正确性，再从第一处饱和资源推导吞吐、延迟、checkpoint 和恢复的变化。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先写 SLO 与预算",
        title: "吞吐、延迟、freshness、RPO 与 recovery 是五个不同目标",
        goal:
          "能够设计可重复 Flink benchmark，采集 subtask/JVM/native/backend/外部指标，分解 checkpoint 与 recovery，并给出带反证和回滚条件的优化结论。",
        prerequisites: [
          "完成网络反压、状态与 checkpoint 课程",
          "理解 JVM heap/GC、direct/native memory 与容器 limit",
          "能使用 Prometheus、REST、JFR/async-profiler 或 Flink flame graph"
        ],
        conceptMap: [
          {
            label: "业务 SLO",
            relation: "吞吐、p99 event-time latency、freshness 与允许丢失/恢复窗口"
          },
          {
            label: "runtime evidence",
            relation: "busy/idle/backpressure、records/bytes、watermark、checkpoint"
          },
          {
            label: "resource evidence",
            relation: "CPU、heap/GC、managed/network/native memory、disk/network I/O"
          },
          {
            label: "external evidence",
            relation: "Broker lag、数据库 QPS/latency、object storage 吞吐与错误"
          }
        ],
        invariant:
          "一次优化只能在固定输入分布、payload、并行度、checkpoint/retention 与正确性 oracle 下比较；结论必须说明改善哪个 SLO、消耗哪个资源、在哪个阈值失效。",
        body: [
          "吞吐是单位时间完成量；processing latency 是记录在算子中花费的时间；event-time latency/freshness 还受 source lag、watermark 和 late policy 影响。checkpoint RPO 与 restart recovery 则是故障维度，不能用平均 records/s 代替。",
          "先建立基线和容量曲线：逐级提升输入率，找出稳定区、排队区和崩溃区。每一级持续多个 checkpoint 周期并包含状态稳态；只跑几十秒会把 JIT、缓存预热和未增长状态误认为长期性能。",
          "所有调优都保留业务 oracle。吞吐提升若来自丢弃 late data、错误 filter pushdown、TTL 清理状态或 at-least-once 重复抵消，属于语义回归。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先拆 checkpoint",
        title: "checkpoint duration 高，不等于 RocksDB snapshot 慢",
        prediction:
          "作业 checkpoint end-to-end 120s，其中 start delay 80s、alignment 30s、async duration 8s。第一瓶颈最可能在哪？若 async duration 100s、alignment 1s，又应查什么？",
        invariant:
          "checkpoint 时长必须拆为 barrier start delay、alignment、synchronous snapshot、asynchronous persistence 与 coordinator completion；不同 phase 不可用同一参数修复。",
        body: [
          "高 start delay/alignment 通常表明 barrier 被在途数据、backpressure 或慢 channel 拖住，应先定位下游容量、skew 与 buffer；直接增大 checkpoint timeout 只会更晚失败。",
          "高 async duration 才更像 backend/storage throughput、状态字节、增量共享、上传并发或远端抖动。此时 unaligned 添加 channel state 可能进一步加重 I/O。",
          "checkpoint size 也要正确解释：增量 checkpoint 的共享文件、reported size 与本次实际新增/上传字节不是一个数。比较配置前必须确认指标定义和 ownership mode。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "单变量容量曲线",
        title: "用同一作业分别制造 allocation、native、disk 与 storage bottleneck",
        prediction:
          "四种瓶颈都可能表现为吞吐下降或容器重启。heap GC、direct/network、RocksDB native 与 checkpoint storage slow 的证据分别是什么？",
        codeLabel: "performance-lab.yaml · 实验矩阵",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · Prometheus · JFR/async-profiler`,
        runCommand:
          "mvn -DskipTests package\n./scripts/run-load.sh --rate 20000 --duration 30m --scenario allocation\n./scripts/capture-evidence.sh <job-id> <vertex-id>",
        code: `matrix:
  fixed:
    input_distribution: fixtures/orders-v1.json
    checkpoint_interval: 30s
    parallelism: 4
    correctness_oracle: batch-ledger-v1
  vary_one:
    - allocation: "deserialize/map creates 20 short-lived objects"
    - hot_key: "90% records use one customer"
    - backend_io: "throttle local RocksDB disk"
    - checkpoint_io: "throttle object storage upload"
    - external_sink: "limit DB to 500 writes/s"
  capture:
    - "subtask busy/idle/backpressure and records/bytes"
    - "checkpoint phase metrics and bytes"
    - "CPU flame graph, allocation profile, GC, process/container memory"
    - "RocksDB/native/disk and external dependency metrics"`,
        expectedOutput: [
          "allocation 场景显示分配热点、GC/CPU 增长，不应先归咎网络",
          "hot key 显示 subtask 极端方差，即使总 CPU 尚有余量",
          "checkpoint storage 限速主要拉高 async persistence，而非先拉高 alignment",
          "外部 sink 限速从 sink 向上传播 backpressure，并伴随外部 latency/QPS 上限"
        ],
        observation:
          "每个场景保留原始时间序列、配置、artifact checksum、输入 seed 和环境资源。报告区分相关性与因果：只有单变量反转或对照实验支持的结论才升级为根因。"
      },
      {
        kind: "mechanism",
        eyebrow: "TaskManager 内存地图",
        title: "Java heap 没 OOM，容器仍可被 native memory 杀死",
        body: [
          "TaskManager process memory 由 framework/task heap、managed memory、network direct memory、metaspace、JVM overhead 和其他 native 组成。固定容器 limit 下增加 heap 会挤压其余分区，不是免费扩容。",
          "EmbeddedRocksDB 常使用 managed/native memory、block cache、write buffers 和本地磁盘。容器超限可能没有 Java heap OOM；要结合 cgroup/container kill、process RSS、direct/native、RocksDB 与磁盘指标判断。",
          "火焰图回答 CPU 在哪里，allocation profile 回答对象从哪里产生，heap dump 回答存活对象，thread dump 回答阻塞/锁，checkpoint metrics 回答快照阶段。工具之间是互补证据，不是一张火焰图解释所有问题。"
        ],
        trace: [
          {
            thread: "record hot path",
            action: "deserialize → UDF → state lookup/update → serialize",
            state: "CPU/alloc/back-end access 共同决定 busy time"
          },
          {
            thread: "checkpoint async I/O",
            action: "backend 生成/上传 state files",
            state: "与正常 state I/O 竞争 disk/network"
          },
          {
            thread: "container runtime",
            action: "统计整个 process RSS 对比 limit",
            state: "native 超额可直接 kill JVM"
          }
        ],
        invariant:
          "内存诊断必须以 total process/container limit 守恒，而不是只看 Xmx；任何 backend 切换或 buffer 调整都要重新核算 heap、managed、network 与 native。"
      },
      {
        kind: "api-decision",
        eyebrow: "按瓶颈选工具",
        title: "指标、profile、benchmark 与 chaos 各回答一类问题",
        apiOptions: [
          {
            api: "REST/Prometheus metrics",
            useWhen: "定位何时、哪个 subtask、哪个 phase 出现异常",
            guarantees: "提供运行时聚合时间序列",
            doesNotGuarantee: "单独给出代码级根因"
          },
          {
            api: "JFR / async-profiler / flame graph",
            useWhen: "busy/CPU/alloc 证据指向 task/JVM 热点",
            guarantees: "采样 CPU、allocation、lock 等执行热点",
            doesNotGuarantee: "解释远端服务或业务正确性"
          },
          {
            api: "MiniCluster micro-scenario",
            useWhen: "验证状态机、serializer、checkpoint cut 与确定性",
            guarantees: "快速、可控地复现实验变量",
            doesNotGuarantee: "代表生产网络、磁盘与大状态吞吐"
          },
          {
            api: "production-like load + chaos",
            useWhen: "验证容量拐点、恢复 SLO 与外部系统组合",
            guarantees: "覆盖真实拓扑和依赖交互",
            doesNotGuarantee: "没有输入/环境控制时结果可重复"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "写一份从 SLO 到根因的性能审计",
        task:
          "对订单作业建立 1x、1.5x、2x 峰值输入容量曲线，至少注入 hot key、allocation、RocksDB disk、checkpoint storage 和 DB sink 五种瓶颈。为每种场景生成证据包、根因/反证、修复、回滚阈值和恢复测试。",
        constraints: [
          "每轮至少跨越 20 个 checkpoint 且状态达到稳态",
          "保留固定 seed、payload、partition distribution 与 artifact/config checksum",
          "SLO 至少含 p99 event-time latency、lag、checkpoint age、restart recovery 与结果 oracle",
          "任何参数调整一次只能改一个变量，并写预期指标变化",
          "生产主线不切 Experimental ForSt；若观察 ForSt，必须独立报告且可完全回退"
        ],
        hints: [
          "先画 resource saturation order，再决定压测阶梯。",
          "对 checkpoint 慢分别注入 backpressure 与 object-store throttling，训练 phase 识别。",
          "把最坏恢复时长与 Kafka retention/transaction timeout 一起放入报告。"
        ],
        adversarialTest:
          "制造一个平均 busy=500ms/s、但某 subtask 在 0/1000 间交替的负载，并与所有 subtask 稳定 500 的负载比较；若报告用平均值声称二者等价则失败。再在固定 process memory 下增大 heap，观察 network/managed/native 预算被挤压。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "测量边界",
        title: "实验数字只对其输入、版本和资源模型有效",
        localGuarantee:
          "受控 benchmark 能比较指定 Flink 2.3.0 artifact、配置、输入分布和环境下的相对变化；runtime metrics 提供观测窗口内的证据。",
        breaksWith:
          "生产 key skew、payload、JIT/GC、云存储抖动、邻居干扰、connector 版本、下游限额与重试策略变化会让实验外推失效。",
        alternatives: [
          "用 canary/shadow traffic 验证生产分布，不直接全量套用实验参数",
          "记录版本化 performance envelope，而不是一个永恒最佳并行度",
          "对高风险参数设置自动回滚的 SLO 阈值与观察窗口"
        ],
        body: [
          "Flink 参数之间高度耦合：提高并行度增加连接和 checkpoint metadata，增大 batch 降低调用次数却增加延迟/恢复窗口，增大 buffer 提高带宽却扩大在途状态。结论必须写 trade-off。",
          "性能退化有时是 correctness 保护开始工作，例如 backpressure、transaction fencing 或 late data retention。不能为了好看的吞吐删除保护而不改业务合同。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "只给症状，搭建证据树",
        body: [
          "从“吞吐下降、checkpoint 变慢、容器偶发重启”开始，写出三条互斥假设、每条最小验证指标和一项能推翻它的单变量实验。"
        ],
        checkpoint: {
          prompt:
            "checkpoint start delay 80s、async duration 8s 与 start delay 2s、async duration 100s 分别优先查哪里？为什么只增加 Xmx 可能让容器更不稳定？",
          hint:
            "前者看 barrier/backpressure，后者看 state/storage；process memory 守恒。",
          answer: [
            "高 start delay/alignment 先查下游反压、hot channel 和在途 buffer；高 async duration 先查状态字节、backend/disk/object storage。",
            "timeout 只改变失败判定，不消除对应 phase 的瓶颈。",
            "固定容器 process memory 下，Xmx 增加会挤压 managed、network、metaspace/overhead 或 native 余量。",
            "RocksDB/direct/native 超限可能由容器直接 kill，不一定留下 Java heap OOM。"
          ],
          successCriteria: [
            "能把业务 SLO 映射到 runtime/resource/external metrics",
            "能分解 checkpoint 与 recovery phase",
            "能区分 heap、managed、network 与 native memory",
            "能设计可重复、可证伪且保留 correctness oracle 的容量实验"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Metrics",
        "docs/ops/metrics/",
        "Flink system/operator/checkpoint metrics 与 reporter 配置。"
      ),
      flinkDoc(
        "Monitoring Checkpointing",
        "docs/ops/monitoring/checkpoint_monitoring/",
        "checkpoint phase、subtask statistics 与 REST/Web UI 观测。"
      ),
      flinkDoc(
        "Memory Setup",
        "docs/deployment/memory/mem_setup/",
        "JobManager/TaskManager process、Flink、heap、managed、network 与 overhead 模型。"
      ),
      flinkDoc(
        "Flame Graphs",
        "docs/ops/debugging/flame_graphs/",
        "Flink Web UI flame graph 的启用、采样与解释边界。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-sql-optimizer",
    week: 9,
    title: "动态表、Changelog 与优化器：SQL 为什么会变成有状态 Dataflow",
    dek: "从动态表的物化含义推导 I/UB/UA/D，沿 parser、validated rel、optimized physical plan 到 Transformation 阅读 EXPLAIN；比较 regular/interval/temporal/lookup join、NDU、TTL 与 connector ability 对正确性和状态上界的影响。",
    tags: ["Flink SQL", "Dynamic Table", "Changelog", "Optimizer", "Determinism"],
    searchTerms: [
      "dynamic table",
      "RowKind",
      "changelog mode",
      "EXPLAIN",
      "Calcite",
      "regular join",
      "interval join",
      "temporal join",
      "non-deterministic update",
      "pushdown"
    ],
    keyIdea:
      "流式 SQL 的输出不是不断追加的静态表，而是维护结果表的 changelog；optimizer 的每个 exchange、stateful operator 和 changelog conversion 都必须保持这份动态关系的语义。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先物化，再看 SQL",
        title: "连续查询的每条输出都是对结果表的一次修改",
        goal:
          "能够手推 SQL 的 changelog mode、主键与状态需求，阅读 EXPLAIN 找到 shuffle/aggregate/join/materialize，并识别 processing time、lookup、TTL 与错误 pushdown 引入的非确定性。",
        prerequisites: [
          "理解 event time/watermark、keyed state 与 sink delivery",
          "熟悉 SQL aggregate、join、primary key 与 execution plan",
          "能使用 Flink SQL Client 和 TableEnvironment.explainSql"
        ],
        conceptMap: [
          {
            label: "dynamic table",
            relation: "随输入变化而更新的逻辑关系"
          },
          {
            label: "changelog",
            relation: "用 INSERT/UPDATE_BEFORE/UPDATE_AFTER/DELETE 维护关系"
          },
          {
            label: "optimizer",
            relation: "把关系语义转换为物理 exchange、state 与 runtime operator"
          },
          {
            label: "sink negotiation",
            relation: "目标 connector 声明可接受的 changelog mode"
          }
        ],
        invariant:
          "任意时刻把输入截至该时刻的事实物化后，连续查询结果应与同一确定性查询的批式结果等价；每个 changelog key、RowKind、state cleanup 与 sink ability 都必须保持这种等价。",
        body: [
          "append-only source 可视为不断 INSERT 的动态表；GROUP BY 结果会更新已有 key，因此产生更新 changelog。Primary key 声明为 NOT ENFORCED，Flink 依赖 connector/数据真的满足唯一非空合同，并用它推导 upsert key。",
          "RowKind 是语义，不是调试标签。UPDATE_BEFORE 撤销旧行，UPDATE_AFTER 写入新行；upsert sink 可能只需 key + after/delete，append sink 则无法正确接受任意更新流。",
          "Flink 2.3 增加 FROM_CHANGELOG/TO_CHANGELOG 等转换能力，但转换不是抹掉更新语义。把 update 包装成 append 事件后，下游必须显式按 op/version 物化，不能假装它们成为独立业务事实。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先手推 RowKind",
        title: "SELECT customer_id, COUNT(*) 为什么不是只输出 INSERT",
        prediction:
          "同一 customer 依次到达三笔订单，然后撤销一笔。请写出逻辑结果表每一步和可能的 I/UB/UA/D changelog；若 sink 只有 append 能力，会发生什么？",
        invariant:
          "只要新输入会改变已经存在的结果行，query 就不是 append-only；下游必须按推导 key 应用更新或接收显式 changelog 事件。",
        body: [
          "第一次可能 INSERT(customer,1)，随后更新成 2/3，需要撤销或覆盖旧值；撤销订单又把 count 改回 2。具体 changelog 是否含 UB 取决于 operator/sink mode，但不能丢失“同一结果 key 被修改”的事实。",
          "窗口聚合在 watermark 关闭且不再允许晚到更新时可能产生 append 结果；非窗口 group aggregate 通常长期更新。只看 SQL 语法都叫 GROUP BY，状态与 changelog 完全不同。",
          "planner 会在 source/sink ability 之间协商 changelog。若 connector 虚报只需 INSERT 或错误丢弃 DELETE，作业可能运行却静默留下错误物化结果。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "SQL 计划与真实 RowKind",
        title: "同一数据比较 append、upsert、retract 与 changelog conversion",
        prediction:
          "给 orders 表加/不加 5 分钟窗口、PRIMARY KEY、mini-batch 与不同 sink capability，EXPLAIN 中会出现哪些 exchange/state/changelog 差异？",
        codeLabel: "sql/changelog-lab.sql · SQL Client 实验",
        codeKind: "excerpt",
        runtime: "Apache Flink 2.3.0 · Java 17 · SQL Client",
        runCommand:
          "./bin/sql-client.sh -f sql/changelog-lab.sql\n./bin/sql-client.sh embedded",
        code: `CREATE TABLE orders (
  order_id STRING,
  customer_id STRING,
  amount DECIMAL(18, 2),
  event_time TIMESTAMP(3),
  WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND,
  PRIMARY KEY (order_id) NOT ENFORCED
) WITH (...);

EXPLAIN PLAN FOR
SELECT customer_id, COUNT(*) AS order_count, SUM(amount) AS total
FROM orders
GROUP BY customer_id;

-- 第二轮：按 event_time 做 TUMBLE window；
-- 第三轮：用 print/upsert-kafka/filesystem sink 比较可接受 changelog；
-- 记录真实 RowKind、upsert key、state estimate 与 physical JSON plan。`,
        expectedOutput: [
          "非窗口 GROUP BY 持续输出同一 customer 的更新 changelog",
          "事件时间窗口在 watermark 推进后输出，late policy 决定是否再更新",
          "EXPLAIN 显示 keyBy exchange、aggregate/state 与 sink changelog negotiation",
          "append-only sink 对更新查询被拒绝或需要显式 changelog 编码，而不是静默当 INSERT"
        ],
        observation:
          "保存 AST/validated/optimized/execution plan（能获取的层级）与实际 RowKind 序列。计划文本是当前版本/配置的证据，不是跨版本永久合同；升级必须重新生成 diff。",
        trace: [
          {
            thread: "planner",
            action: "parse/validate SQL 为 relational nodes",
            state: "解析类型、time attribute、key 与函数语义"
          },
          {
            thread: "optimizer",
            action: "规则/成本选择 physical nodes 与 exchange",
            state: "引入 aggregate/join/materialize/mini-batch"
          },
          {
            thread: "translation/runtime",
            action: "ExecNode 转为 Transformation/operator",
            state: "changelog 变成带 RowKind 的并行 dataflow"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "join 与确定性",
        title: "regular join 状态可无界，processing-time lookup 结果可不可重演",
        body: [
          "stream-stream regular join 要保留两侧所有仍可能匹配的记录，若没有时间/业务清理条件，状态随输入增长。interval/window join 用时间范围和 watermark 提供清理上界；temporal join 按事实行的时间查询 versioned table；lookup join 通常在处理时读取外部当前值。",
          "Non-Deterministic Update（NDU）发生在更新 changelog 需要撤销旧行时，却无法重现当初生成旧行的非确定性列/lookup 值/key。NOW、RAND、processing-time lookup、不可重复 source back-read 和 TTL 清理都可能使同一输入重放得到不同 update。",
          "TTL 是控制无界 SQL state 的必要折中，但它按 processing time 删除匹配历史，会改变后续 join/aggregate 结果。它不是免费的资源参数；开启后必须把近似/非确定性写入业务合同。"
        ],
        trace: [
          {
            thread: "regular join",
            action: "两侧按 join key 缓存并互相探测",
            state: "无清理谓词时 state 没有自然上界"
          },
          {
            thread: "interval/temporal",
            action: "利用 time bound/versioned key 查找",
            state: "watermark/time version 提供语义与清理边界"
          },
          {
            thread: "update retraction",
            action: "重新计算旧行 key/value 并发出 UB/D",
            state: "非确定性会让撤销命中错误记录"
          }
        ],
        invariant:
          "每个 stateful SQL operator 必须有可说明的 state key、保留条件、清理时刻、changelog key 和重放确定性；没有自然上界时必须明确业务接受的 TTL 近似。"
      },
      {
        kind: "api-decision",
        eyebrow: "计划选择也是语义选择",
        title: "join、mini-batch 与 pushdown 各自交换什么",
        apiOptions: [
          {
            api: "interval/window join",
            useWhen: "两侧事件可用 event time 和最大时间差定义匹配范围",
            guarantees: "由时间范围/watermark 提供状态清理边界",
            doesNotGuarantee: "超过 late policy 的记录仍被匹配"
          },
          {
            api: "temporal table join",
            useWhen: "事实需要按其时间关联版本化维表",
            guarantees: "按 primary key + time 选择相应版本",
            doesNotGuarantee: "普通外部 lookup 自动保存历史版本"
          },
          {
            api: "mini-batch / local-global aggregate",
            useWhen: "允许增加少量延迟以减少 state/network 更新",
            guarantees: "在适用规则下批量/两阶段聚合",
            doesNotGuarantee: "所有 UDAF 可结合，或计划跨版本不变"
          },
          {
            api: "projection/filter/limit/metadata pushdown",
            useWhen: "connector 能在 source 端等价执行并准确报告已接受条件",
            guarantees: "减少读取/传输，保留被接受表达式的关系语义",
            doesNotGuarantee: "connector 实现正确；错误 pushdown 会直接丢数据"
          }
        ],
        body: [
          "EXPLAIN 要在生产数据分布、统计信息和配置下解释。相同 SQL 因版本、stats、changelog requirement、mini-batch 与 connector ability 得到不同 physical plan；优化目标必须包含状态、延迟与正确性，而不只是 operator 数。"
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "为订单宽表做关系语义审计",
        task:
          "设计 orders、payments、customer_versions 三张表，分别实现 regular、interval、temporal 与 lookup join。为每个计划写 state/changelog/determinism 表，生成 EXPLAIN diff，并用同一 immutable input 两次重放验证结果。",
        constraints: [
          "每个 PRIMARY KEY 都说明数据源如何真实保证唯一非空",
          "记录实际 I/UB/UA/D 与 sink accepted ChangelogMode",
          "regular join 必须给 state 上界方案；TTL 必须写业务误差",
          "lookup 表在两次 replay 间改变，用来证明 processing-time 非确定性",
          "实现一个仅 projection/filter pushdown 的 DynamicTableSource contract test"
        ],
        hints: [
          "先用手工 materialized table 算 oracle，再看 planner 输出。",
          "对每个 update 问：旧行的 key/value 能否在恢复时完全重现。",
          "connector applyFilters 应返回 accepted 与 remaining filters，不能全部宣称已处理。"
        ],
        adversarialTest:
          "在 UPDATE_AFTER 中加入 NOW() 生成列，再让相同主键后续更新；检查 planner NDU 诊断或证明撤销为何不稳定。另让自定义 source 错误宣称接受一个未实现 filter，contract test 必须用被过滤掉/保留的边界行击穿数据丢失。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "关系边界",
        title: "Flink 只能优化 connector 声明的能力，不能验证外部真相",
        localGuarantee:
          "planner 根据 schema、keys、time attributes、changelog mode 与 connector abilities 生成保持声明关系语义的 Dataflow。",
        breaksWith:
          "虚假 primary key、source back-read 改变、processing-time lookup、错误 pushdown、TTL 清理、sink 不按 RowKind/版本物化和非确定性 UDF。",
        alternatives: [
          "对变化维表使用 versioned/temporal 数据而非当前值 lookup",
          "对 changelog sink 建立 key/RowKind contract tests 与 materialized oracle",
          "对近似 TTL 查询在输出中携带 completeness/version 并建立离线纠正"
        ],
        body: [
          "SQL 看似声明式，但 connector 是可信计算基。Planner 无法证明外部表真的满足 primary key、filter pushdown 真等价、lookup 可重读或 sink 正确应用 DELETE。",
          "FROM_CHANGELOG/TO_CHANGELOG 可显式跨越表与操作事件，但 op column 只是把语义暴露出来。消费方仍要按 key、version 与 operation 建模。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "从一条 SQL 推导状态与更新",
        body: [
          "拿到一条含 GROUP BY、lookup join 与 upsert sink 的 SQL，不运行，先写出 dynamic table、key、RowKind、state、watermark/TTL、NDU 与 sink contract；再用 EXPLAIN 验证。"
        ],
        checkpoint: {
          prompt:
            "为什么 non-windowed GROUP BY 和 regular join 可能长期增长状态？processing-time lookup 为什么会破坏一次 UPDATE 的撤销？",
          hint:
            "前者没有自然完成边界；后者在重算旧行时可能读到新维表值。",
          answer: [
            "非窗口聚合要为每个仍可能更新的 group 保存累积状态；regular join 要保留两侧未来仍可能匹配的记录。",
            "没有 event-time/业务清理谓词时，无界输入没有自然完成点，状态也无自然上界。",
            "更新 changelog 撤销旧行需要重现旧 key/value；processing-time lookup 在恢复或后续 update 时可能读取不同维表值。",
            "因此需 temporal/versioned data、内部 materialization、确定性设计，或明确 TTL/近似边界。"
          ],
          successCriteria: [
            "能手推 I/UB/UA/D 与 sink changelog mode",
            "能从 EXPLAIN 找到 exchange、state 与优化规则",
            "能比较 regular/interval/temporal/lookup join",
            "能识别 NDU、TTL 和 connector ability 的正确性风险"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Dynamic Tables",
        "docs/concepts/sql-table-concepts/dynamic_tables/",
        "dynamic table、continuous query 与 changelog 的关系模型。"
      ),
      flinkDoc(
        "Determinism in Continuous Queries",
        "docs/concepts/sql-table-concepts/determinism/",
        "NDU、processing time、lookup back-read 与 TTL 风险。"
      ),
      flinkDoc(
        "Joins",
        "docs/sql/reference/queries/joins/",
        "regular、interval、temporal 与 lookup join 的 SQL 语义。"
      ),
      flinkDoc(
        "User-defined Sources & Sinks",
        "docs/dev/table/sourcessinks/",
        "DynamicTableSource/Sink、ChangelogMode 与 ability pushdown。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-sink-connector",
    week: 8,
    title: "Sink 与 Connector 正确性：flush、precommit、commit 不能混为一谈",
    dek: "以 sink2 的 @Public Sink 为主线，拆开 writer buffering、writer state、committable、committer 与外部事务；在每个故障切点重复交付 committable，证明 at-least-once、idempotent upsert 和 exactly-once 各自成立的条件。",
    tags: ["Sink V2", "SinkWriter", "Committer", "Two Phase Commit", "Connector"],
    searchTerms: [
      "org.apache.flink.api.connector.sink2.Sink",
      "SinkWriter",
      "StatefulSinkWriter",
      "CommittingSinkWriter",
      "Committer",
      "committable",
      "flush",
      "idempotent commit",
      "delivery guarantee"
    ],
    keyIdea:
      "writer 把记录交给外部系统，committable 描述一个可恢复的提交意图，committer 才决定可见性；flush 或消息送达从来不等于最终提交。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先写外部可见性状态机",
        title: "一个 sink 至少有 buffering、prepared、committed、aborted 四类状态",
        goal:
          "能够使用 Flink 2.3 sink2 @Public API 设计可恢复 writer/committer，定义 committable identity、serializer、retry/fencing，并通过 read-after-failure 证明 delivery guarantee。",
        prerequisites: [
          "理解 checkpoint completion、source replay 与 attempt",
          "理解外部事务、幂等 upsert 或对象存储原子 rename",
          "完成 FLIP-27 Source ownership 课程"
        ],
        conceptMap: [
          {
            label: "SinkWriter",
            relation: "接收记录、管理本地 batch/buffer 并 flush"
          },
          {
            label: "writer state",
            relation: "恢复未完成 writer 进度或事务句柄"
          },
          {
            label: "committable",
            relation: "connector 定义、可序列化的外部准备结果标识"
          },
          {
            label: "Committer",
            relation: "幂等提交/重试，并决定外部结果最终可见"
          }
        ],
        invariant:
          "每个外部准备结果必须有稳定的 connector committable/external identity；Flink runtime 另行关联 checkpoint/subtask lineage。commit 可重试且幂等，旧 attempt 被 fencing，失败恢复能区分未提交、已提交但响应丢失与确认提交。",
        body: [
          "Flink 2.3 生产主线使用 org.apache.flink.api.connector.sink2.Sink，它是 @Public。旧 SinkFunction 与 Sink V1 已从 Flink 2.0 公共 API 移除，不应作为新 Connector 课程模板。",
          "基础 SinkWriter.write 接受记录，flush 把缓存向下游推进。需要恢复 writer 本地状态时实现 SupportsWriterState/StatefulSinkWriter；需要 exactly-once 提交时使用 SupportsCommitter。CommittingSinkWriter.prepareCommit() 公开签名没有 checkpointId：它产生 connector 自己定义的 committable，runtime 再为其关联 checkpoint/subtask lineage，最后由 Committer 提交。",
          "API 结构不自动创造 exactly-once。外部系统必须提供事务、原子发布或可证明的幂等写；committable serializer、transaction timeout、consumer isolation 和 commit retry 都是合同的一部分。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "按证据等级排序",
        title: "flush 返回成功，为什么记录仍可能在恢复后重复或丢失",
        prediction:
          "Writer 把 100 条记录 flush 到数据库连接，随后 checkpoint 尚未 completed 就进程崩溃。数据库 auto-commit=true、显式事务、幂等 upsert 三种情况下，恢复结果分别可能怎样？",
        invariant:
          "flush 只表示 writer 缓冲被处理到约定层；它不等于事务 durable commit，也不等于 checkpoint globally completed，更不等于下游只观察一次。",
        body: [
          "auto-commit 写可能已对外可见，但 Flink 仍从旧 checkpoint replay 这 100 条，形成至少一次与重复。显式事务若未提交可被 abort，但需要事务句柄与 checkpoint 正确关联。幂等 upsert 允许重复物理写收敛到同一业务键版本。",
          "prepareCommit/committable 也不是最终 commit。它表示事务或文件已达到可提交状态；只有 checkpoint completion 后的 committer 行为把它变为可见结果。",
          "commit 请求超时是未知结果：外部系统可能已 commit 但响应丢失。Committer 重试同一个稳定 identity 必须得到同一结果，而不是新建第二个事务。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "提交状态机实验",
        title: "在 write、flush、committable、commit 请求与响应之间失败",
        prediction:
          "commit 已在数据库成功但客户端响应前断网；恢复后 committable 再次交给 Committer。正确行为是报重复错误、创建新事务，还是查询/重复提交同一 identity？",
        codeLabel: "TransactionalLedgerSinkIT.java · chaos matrix",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · Testcontainers PostgreSQL/Kafka`,
        runCommand:
          "mvn -Dtest=TransactionalLedgerSinkIT verify\nmvn -Dtest=CommittableSerializerCompatibilityTest test",
        code: `failurePoints(
    "after-write-before-flush",
    "after-flush-before-prepare",
    "after-committable-emitted",
    "after-external-commit-before-response",
    "after-checkpoint-complete");

forEachFailurePoint(point -> {
    runAndFail(point);
    restoreLatestCheckpoint();
    retryRecoveredCommittables();
    assertMaterializedLedgerEquals(batchOracle());
    assertOneCommittedVersionPerEventId();
    assertNoOpenTransactionsAfterTimeout());
});`,
        expectedOutput: [
          "checkpoint 未完成的准备结果不可作为最终业务可见提交",
          "commit 响应丢失后重试同一 committable identity，结果仍只有一个",
          "旧 attempt 的事务被 abort/fence，不覆盖新 attempt",
          "恢复后 materialized ledger 与 immutable input oracle 一致"
        ],
        observation:
          "同时查询 sink 内部 transaction table、目标业务表和 Flink checkpoint/committable 指标。只看最终 count 不足以发现泄漏的 prepared transaction、重复版本或事务超时风险。",
        trace: [
          {
            thread: "SinkWriter task",
            action: "write/batch/flush 并在 checkpoint 边界产生 committable",
            state: "记录尚未必对外最终可见"
          },
          {
            thread: "committable operator",
            action: "checkpoint committable 与必要 writer state",
            state: "提交意图可在失败后重放"
          },
          {
            thread: "Committer",
            action: "checkpoint 完成后 commit/retry",
            state: "稳定 identity 与幂等协议决定最终可见性"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "恢复与 rescale",
        title: "committable 不是普通 DTO，而是一份可重试授权",
        body: [
          "connector 的 committable 至少应包含足以唯一识别外部准备结果的信息，例如 transactionId、writer identity/epoch、目标 partition 和校验信息。Serializer 必须能从旧 checkpoint/savepoint 读取，否则升级会丢失尚待提交的结果。checkpoint lineage 不必复制进 connector DTO。",
          "prepareCommit() 没有 checkpointId 参数。Flink 在 runtime 内部使用 CommittableWithLineage 等结构把 connector committable 与 checkpoint/subtask lineage 关联；这是运行时调度与恢复元数据，不是要求 connector 用“当前 checkpointId”生成外部事务 ID。",
          "Committer 必须把 already committed 视为成功收敛，把 retryable 与 fatal error 明确分类，并给未知结果查询路径。每次 retry 新建 transactionId 会把一次逻辑提交变成多次外部提交。",
          "rescaling 时 writer 数量和 subtask index 改变。不能只用 subtask index 生成永久 transaction id，也不能依赖公开 API 不提供的 checkpointId；应使用稳定的外部准备结果 identity，并让 writer epoch/外部 fencing 阻止旧 attempt 覆盖新 attempt。自定义 sink topology 中的聚合/全局提交也必须纳入 checkpoint 和 failover。"
        ],
        trace: [
          {
            thread: "writer attempt N",
            action: "创建 connector-defined external transaction/pending unit",
            state: "identity 可恢复、可重试，并与旧 attempt fencing 对齐"
          },
          {
            thread: "checkpoint/runtime",
            action: "调用无参 prepareCommit，并用 CommittableWithLineage 关联 lineage",
            state: "connector identity 与 checkpoint/subtask 元数据各司其职"
          },
          {
            thread: "committer retry",
            action: "查询/提交同一 external identity",
            state: "already committed 收敛为成功"
          }
        ],
        invariant:
          "任何能被恢复重放的 committable 都必须支持重复处理；exactly-once 不能依赖“Flink 应该只调用 commit 一次”。"
      },
      {
        kind: "api-decision",
        eyebrow: "选择真实 guarantee",
        title: "at-least-once、幂等与事务各自适合什么下游",
        apiOptions: [
          {
            api: "SinkWriter + flush（at-least-once）",
            useWhen: "下游可容忍重复，或写入本身是可证明幂等",
            guarantees: "按 connector 合同尽量在 checkpoint/结束时下推缓存",
            doesNotGuarantee: "失败重放后没有重复"
          },
          {
            api: "稳定 key/version 的 upsert",
            useWhen: "目标表支持条件覆盖，最终物化状态而非追加事实",
            guarantees: "重复写同一版本可收敛",
            doesNotGuarantee: "每次外部调用只发生一次或无中间版本可见"
          },
          {
            api: "SupportsCommitter + 外部事务",
            useWhen: "外部系统能 prepare/commit/abort，并可设置隔离与 fencing",
            guarantees: "可把最终可见性绑定 checkpoint completion",
            doesNotGuarantee: "事务 timeout、消费者 isolation 和 retry 自动正确"
          },
          {
            api: "原子文件发布",
            useWhen: "对象/文件系统支持 in-progress→pending→finished 的可靠发布模型",
            guarantees: "成功 checkpoint 对应的文件最终可见",
            doesNotGuarantee: "所有文件系统 rename/list 一致性完全相同"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "实现一个可恢复、可幂等提交的 LedgerSink",
        task:
          "基于 sink2 实现 LedgerSink：writer 把行写入按稳定 transactionId 隔离的 staging table，runtime 在 checkpoint/end-of-input 路径调用无参 prepareCommit() 时生成 committable，committer 以单个数据库事务把 staging 合并到主表并记录 commit ledger。支持 writer state、rescale、commit retry 与 serializer upgrade。",
        constraints: [
          "只使用 Flink 2.3 sink2 @Public API；禁止 SinkFunction/Sink V1",
          "transaction/committable identity 不得只由 subtask index 构成",
          "不得假设 prepareCommit() 能取得 checkpointId；外部 identity 与 runtime lineage 分开建模",
          "commit 必须 idempotent，already committed 返回成功",
          "abort/cleanup 有超时和后台扫描，覆盖进程强杀未执行 close",
          "测试覆盖 checkpoint abort、响应丢失、重试、rescale、升级和 read isolation"
        ],
        hints: [
          "先在数据库设计 commit_ledger 的唯一键和状态转移，再写 Java 接口。",
          "把 flush、prepare 和 commit 日志分别命名，禁止一个 success 指标涵盖全部。",
          "对 committable serializer 保存 golden bytes，做 V1→V2 compatibility test。"
        ],
        adversarialTest:
          "数据库完成 merge 并写 commit_ledger 后，在客户端收到响应前断开连接；恢复后同一 committable 再次提交，主表不得新增重复版本。再从并行度 2 调到 5，旧 writer 的 pending transactions 必须仍能由新拓扑提交或安全清理。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "外部系统边界",
        title: "Flink completion 只有外部系统接受同一协议才有意义",
        localGuarantee:
          "sink2 runtime 可 checkpoint writer/committable state，并在 checkpoint 生命周期中驱动 Committer；失败可能重新交付待提交对象。",
        breaksWith:
          "外部事务超时短于恢复窗口、commit 不幂等、消费者 read_uncommitted、旧 attempt 未 fencing、目标系统不支持原子提交、staging retention 过短。",
        alternatives: [
          "不能事务提交时明确提供 at-least-once，并要求业务幂等键",
          "对未知 commit 结果提供外部 ledger/status query，而不是盲目创建新事务",
          "用审计/补偿作业比较 immutable input 与 materialized target"
        ],
        body: [
          "两阶段提交会增加外部开放事务数量和锁/metadata 压力。checkpoint interval、最大重启时间、transaction timeout 与外部资源上限必须一起容量规划。",
          "发送 operator event 的 ACK 只说明事件交付；Writer.flush 返回只说明本地合同完成。需要等待所有 writer 的真实完成时，协议必须定义 completion event、attempt、timeout、checkpoint ordering 和 failover state。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "把五个“成功”逐一拆开",
        body: [
          "不看资料，分别定义 write success、flush success、committable emitted、checkpoint completed 与 external commit success，写出它们之间不能反推的方向。"
        ],
        checkpoint: {
          prompt:
            "为什么一个正确 Committer 必须容忍同一 committable 被多次提交？只用 subtaskIndex 生成 transactionId 在 failover/rescale 下会出什么问题？",
          hint:
            "checkpoint completion/响应可能丢失，旧和新 attempt 可拥有相同逻辑 subtask。",
          answer: [
            "Flink 可能在 commit 成功但确认状态未持久化、通知丢失或恢复后重新交付 committable。",
            "Committer 应查询/重试同一稳定 external identity，把 already committed 收敛为成功。",
            "subtaskIndex 在新 attempt 中复用，rescale 又会改变 writer 数量；仅靠它会让旧新事务碰撞或错误接管。",
            "identity 需结合逻辑 owner、checkpoint/committable id 与 attempt/epoch fencing，并由外部唯一约束验证。"
          ],
          successCriteria: [
            "能区分 writer state、committable 与 commit ledger",
            "能准确陈述 flush/precommit/completion/commit",
            "能证明 commit retry、rescale 与 serializer upgrade",
            "能按外部能力诚实声明 delivery guarantee"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Data Sinks",
        "docs/internals/sinks/",
        "sink2 SinkWriter、writer state、committable、Committer 与 custom topology。"
      ),
      flinkDoc(
        "Fault Tolerance Guarantees",
        "docs/connectors/datastream/guarantees/",
        "source/sink 组合后的 delivery guarantee 官方矩阵。"
      ),
      flinkDoc(
        "Kafka DataStream Connector",
        "docs/connectors/datastream/kafka/",
        "Kafka source/sink checkpoint、transactional id 与 exactly-once 配置。"
      ),
      flinkDoc(
        "Upgrading Applications",
        "docs/ops/upgrading/",
        "sink/operator uid、serializer 与 pending external writes 的升级边界。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-source-connector",
    week: 7,
    title: "FLIP-27 Source：split、offset 与恢复责任如何分工",
    dek: "实现并验证一个 @Public Source：Enumerator 负责发现和分配，Reader 负责异步读取与 split 进度，serializer 负责跨版本字节；用分配竞态、reader failure、rescaling 与 watermark alignment 证明没有 split 永久丢失。",
    tags: ["FLIP-27", "Source", "SplitEnumerator", "SourceReader", "Connector"],
    searchTerms: [
      "Source",
      "SplitEnumerator",
      "SourceReader",
      "SourceSplit",
      "addSplitsBack",
      "pollNext",
      "SplitReader",
      "pauseOrResumeSplits",
      "enumerator checkpoint"
    ],
    keyIdea:
      "Source 正确性的核心不是 poll 到记录，而是每个 split 在发现、分配、读取、checkpoint、失败归还与完成之间始终有唯一可恢复责任。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先定义 ownership protocol",
        title: "Enumerator 是分配大脑，Reader 是 split 进度所有者",
        goal:
          "能够从零设计 bounded/unbounded Source 的 split identity、discovery、assignment、reader threading、checkpoint、watermark、cancel 和 rescale 协议。",
        prerequisites: [
          "理解 operator/coordinator state、checkpoint 与 attempt fencing",
          "理解外部日志 partition/offset 或文件 range",
          "能够实现 Java serializer 与并发取消"
        ],
        conceptMap: [
          {
            label: "SourceSplit",
            relation: "可独立分配、恢复和并行读取的工作单元"
          },
          {
            label: "SplitEnumerator",
            relation: "在 JobMaster 侧发现 split、保存 pending assignment"
          },
          {
            label: "SourceReader",
            relation: "在 TaskManager source operator 内持有 assigned split 与进度"
          },
          {
            label: "serializer",
            relation: "持久化 split/enumerator checkpoint 并支持兼容恢复"
          }
        ],
        invariant:
          "每个未完成 split 必须处于 enumerator pending、某个当前 reader owned、或 completed 三态之一；失败与 leader 切换后可有受控 replay，但绝不能永久无主或被两个有效 attempt 同时提交进度。",
        body: [
          "Flink 2.3 的 FLIP-27 Source 是 @Public 生产接口。SourceFunction 等 legacy source 已从 Flink 2.0 公共 API 移除，本课不倒退到旧接口。",
          "SplitEnumerator 运行在 JobMaster 侧，发现/分配 split 并 checkpoint 自身的 pending/discovery state；SourceReader 运行在 TaskManager 的 SourceOperator 内，读取已分配 split 并在 snapshot 时返回每个 split 的当前位置。",
          "boundedness 是 Source 合同：当 enumerator 已确定某个 reader 今后不会再收到新 split 时，调用 signalNoMoreSplits(reader)；这不是“等该 reader 的所有已分配 split 都完成后才通知”。reader 收到通知后仍要排空当前 assigned splits，全部读完才返回 END_OF_INPUT。unbounded source 则可能持续发现和分配；标错 boundedness 或漏发通知会改变作业完成与 batch/streaming 执行行为。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先推演分配竞态",
        title: "assignSplits 后，为什么应从 enumerator pending state 移除 split",
        prediction:
          "Enumerator 把 split-7 交给 reader-1，并从 pending 集合移除；reader-1 随后在下一次 completed checkpoint 前崩溃。运行时靠哪一层找回这次尚未纳入 reader checkpoint 的 assignment？若 enumerator snapshot 仍把 split-7 当 pending owner，又会发生什么？",
        invariant:
          "assignSplits 将责任从 enumerator pending 集合转移出去；运行时 assignment tracking、reader snapshotState 与 addSplitsBack 共同跨过失败窗口。enumerator 与 reader 不能在 checkpoint state 中把同一 split 同时声明为可分配 owner。",
        body: [
          "调用 assignSplits 后，enumerator 应从自己的 pending set 和 snapshot 中移除已分配 split，不能为了“保险”继续把它保存成待分配项。SourceCoordinator 会跟踪 assignment；SourceReader.snapshotState() 保存当前 assigned split 的可恢复状态与进度。两份职责是衔接关系，不是 enumerator/reader 双重持有。",
          "reader/subtask 失败时，运行时根据 assignment 与恢复边界判断需重新交回的 split，并通过 addSplitsBack(...) 交给 enumerator 再分配；从 completed checkpoint 恢复时，reader checkpointed split state 提供已确认进度。连接器不能把控制事件发送成功误当成 offset 已 durable。",
          "受控重复读取是允许的：从较早 completed checkpoint 恢复会 replay。不可接受的是 split 永久丢失，或两个当前有效 readers 对同一非幂等外部游标并发推进并都宣称完成。",
          "dynamic discovery 还要保存“已经发现什么”的稳定证据。只在内存 Set 里去重文件名/partition，JobMaster failover 后会重新发现并可能重复分配。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "Source chaos harness",
        title: "在发现、分配、snapshot 与完成之间逐点失败",
        prediction:
          "split-3 读到 offset 49，但最近 completed checkpoint 只保存 39。reader failure 后应从哪里继续？rescale 2→4 时 pending 与 assigned splits 如何重新分配？",
        codeLabel: "NumberedLogSourceIT.java · 故障脚本",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · MiniCluster · custom FLIP-27 Source`,
        runCommand:
          "mvn -Dtest=NumberedLogSourceIT test\nmvn -Dtest=NumberedLogSourceRescaleIT test",
        code: `sourceFixture()
    .splits("s0:0-99", "s1:0-99", "s2:0-99", "s3:0-99")
    .checkpointEvery(20)
    .failReaderAfter("s3", offset(49))
    .expectResumeFrom("s3", offset(40))
    .rescaleAfterSavepoint(2, 4)
    .assertNoMissingRecordIds()
    .assertDuplicatesOnlyInsideReplayRange()
    .assertOneCurrentOwnerPerSplit();`,
        expectedOutput: [
          "reader 从 completed checkpoint 的 offset 40 恢复，40–49 可受控重放",
          "所有 400 个稳定 recordId 最终出现，没有永久丢失",
          "rescale 后 split 分配变化，但每个未完成 split 只有一个当前 owner",
          "旧 reader attempt 的完成/offset 事件不能覆盖新 owner"
        ],
        observation:
          "测试同时保存 enumerator events、reader attempt、split id、emitted offset、checkpointed offset 与 checkpoint completion。只在 sink 去重后数 400 条会隐藏 Source 重复范围是否越界。",
        trace: [
          {
            thread: "Enumerator / coordinator",
            action: "discover → pending → assign to registered reader",
            state: "checkpoint 发现与待分配状态"
          },
          {
            thread: "reader fetcher",
            action: "阻塞拉取外部数据并交给 reader queue",
            state: "不得直接跨线程调用 ReaderOutput"
          },
          {
            thread: "source task/mailbox",
            action: "pollNext 发记录、更新 split offset、snapshotState",
            state: "进度随 completed checkpoint 成为恢复事实"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "线程与时间",
        title: "pollNext 必须协作式，阻塞 I/O 要能 wake up",
        body: [
          "SourceReader.pollNext 运行在 source task 主线程，应尽快返回状态；Kafka/文件等阻塞 poll 通常放入 SplitReader/fetcher 线程，再通过有界 handover 交给 reader。发记录、更新运行时进度和 ReaderOutput 交互应留在受控主线程。",
          "cancel/close 必须能唤醒阻塞 fetch。只设置 volatile cancelled 而底层客户端永远阻塞，task 无法及时停止、failover 或释放连接。wakeup 还要区分正常关闭与真实读取异常，不能吞掉后者。",
          "FLIP-27 Source 可在 split 粒度生成 watermark，并通过 pauseOrResumeSplits 支持 watermark alignment。若 connector 未实现暂停/恢复，不能声称 alignment 生效；source 之后 assignTimestampsAndWatermarks 也无法回头暂停 split。"
        ],
        trace: [
          {
            thread: "fetcher thread",
            action: "blocking fetch / deserialize",
            state: "把批次放入有界 handover，响应 wakeup"
          },
          {
            thread: "source task thread",
            action: "pollNext 从 handover emit",
            state: "维护 split offset、watermark 与 availability"
          },
          {
            thread: "coordinator events",
            action: "add split / no-more-splits / pause-resume",
            state: "按当前 reader registration/attempt 处理"
          }
        ],
        invariant:
          "fetcher queue、prefetch 与客户端缓存都必须有界并被 checkpoint/offset 语义解释；“已经 fetch”不等于“已经 emit”，更不等于“已经 completed checkpoint”。"
      },
      {
        kind: "api-decision",
        eyebrow: "接口分工",
        title: "把发现、拉取和状态字节分别放回正确组件",
        apiOptions: [
          {
            api: "SplitEnumerator",
            useWhen: "集中发现、均衡分配、处理 reader 注册/失败",
            guarantees: "单 coordinator 视角管理 pending splits",
            doesNotGuarantee: "控制事件送达后 reader 进度已经 durable"
          },
          {
            api: "SourceReaderBase + SplitReader",
            useWhen: "外部客户端是常见 blocking poll 模型",
            guarantees: "提供 fetcher/handover/availability 等通用骨架",
            doesNotGuarantee: "业务 split/offset/serializer 自动正确"
          },
          {
            api: "pauseOrResumeSplits",
            useWhen: "connector 要支持 split-level watermark alignment",
            guarantees: "运行时可要求快 split 暂停/恢复",
            doesNotGuarantee: "外部客户端立即停止预取或没有缓存"
          },
          {
            api: "Boundedness + signalNoMoreSplits",
            useWhen: "数据集确有稳定结束边界",
            guarantees: "运行时可感知没有更多 split",
            doesNotGuarantee: "已分配 split 已经完成或所有输出已提交"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "实现一个可恢复的分片日志 Source",
        task:
          "实现 NumberedLogSource：目录中的每个 append-only 文件是 split，记录含 splitId/offset/eventTime。支持 bounded 与 periodic discovery 两种模式、reader failure、2→4 rescale、per-split watermark、idleness、alignment pause/resume 和 serializer 兼容测试。",
        constraints: [
          "使用 Flink 2.3 @Public FLIP-27 Source；禁止 SourceFunction",
          "split id 必须稳定且不依赖当前 subtask；offset 定义下一条待读位置",
          "fetcher handover 有界，pollNext 不做无限阻塞，wakeup 可终止客户端",
          "enumerator 与 split serializer 都有 round-trip、corruption、version compatibility 测试",
          "每个 chaos case 检查 missing、replay range、owner、resource leak 和 watermark"
        ],
        hints: [
          "先写 split ownership 状态机，再写 API 方法。",
          "把 emitted offset 与 fetched offset 分开；snapshot 通常保存可安全重放的位置。",
          "periodic discovery 要 checkpoint 已发现的稳定 identity，不能只记目录扫描时间。"
        ],
        adversarialTest:
          "Enumerator 在发现新文件并开始 assignment 时失去 leadership；旧 reader 随后上报 split finished。恢复后断言新 enumerator 不丢文件、不接受旧 epoch 完成。另让 fetch 客户端永久阻塞，cancel 必须在限定时间内 wakeup 并释放线程。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "Source 保证边界",
        title: "Flink 保存 offset，外部系统必须真的能按 offset 重读",
        localGuarantee:
          "FLIP-27 runtime 协调 enumerator/reader state、split failure return、checkpoint 与 rescale；正确 connector 可从 completed position 受控 replay。",
        breaksWith:
          "外部日志 retention 已删除位置、同一 offset 内容可变、文件被覆盖、split id 不稳定、客户端隐藏预取无上界、serializer 不兼容和旧 attempt 无 fencing。",
        alternatives: [
          "启动前比较最坏恢复时间与外部 retention，并对越界快速失败",
          "对可变外部集合保存 content/version identity，而不只保存 index",
          "无法可靠重读的 source 明确降级 guarantee，不虚标 exactly-once"
        ],
        body: [
          "Source 的 exactly-once 表格语义依赖外部可重放性。offset 40 在两次读取返回不同内容时，即使 Flink checkpoint 完美，重放也不能复现同一输入。",
          "资源生命周期同样是 correctness：reader/fetcher/clients 在 close/cancel 中释放，但还要有服务端租约超时，覆盖进程强杀时 close 未执行的情况。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "用三态 ownership 证明一个 split 没丢",
        body: [
          "从 split 首次发现开始，不看 API 文档，讲完 pending、assigned、checkpointed、failed-returned、finished 与 rescaled 的全部转移。"
        ],
        checkpoint: {
          prompt:
            "Reader 已经 emit 到 offset 49，为什么失败后仍可能从 40 重读？Enumerator 向 reader 发送 split 成功，为什么还不能把这理解为 durable completion？",
          hint:
            "恢复事实来自最近 completed checkpoint；delivery ACK 与进度 commit 分开。",
          answer: [
            "40 是最近 completed checkpoint 保存的下一待读位置；40–49 的运行时进度尚未进入 durable 一致切面。",
            "恢复必须回到 40 并受控 replay，sink/state 协议负责让最终结果收敛。",
            "split assignment event 只转移当前处理责任，不证明 reader 已读取、snapshot 或完成。",
            "reader failure 后 runtime 通过 addSplitsBack 把未完成 split 交回 enumerator，并按新 attempt 重新分配。"
          ],
          successCriteria: [
            "能证明 enumerator/reader/split state 的所有权",
            "能设计 nonblocking poll、bounded handover 与 wakeup",
            "能解释 per-split watermark/idleness/alignment",
            "能用 chaos/rescale/serializer 测试证明 Source guarantee"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Data Sources",
        "docs/internals/sources/",
        "FLIP-27 Source、Enumerator、Reader、SplitReader 与 watermark 支持。"
      ),
      flinkDoc(
        "Generating Watermarks",
        "docs/dev/datastream/event-time/generating_watermarks/",
        "source-level watermark、idleness 与 split-level alignment 约束。"
      ),
      flinkDoc(
        "Fault Tolerance Guarantees",
        "docs/connectors/datastream/guarantees/",
        "source replay 与 connector guarantee 的官方边界。"
      ),
      flinkDoc(
        "API Compatibility Guidelines",
        "docs/ops/upgrading/",
        "@Public、Experimental 等 API 稳定性注解的解释。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-rescaling-failover-upgrades",
    week: 6,
    title: "Rescaling、Failover 与升级：状态如何找到新的 execution attempt",
    dek: "区分 restart strategy 与 failover region，追踪 key-group、operator list/union state、source split 和 committable 在新并行度下的归属，再用 canonical savepoint、稳定 uid 和 attempt fencing 完成可回滚升级。",
    tags: ["Rescaling", "Failover", "Savepoint", "UID", "High Availability"],
    searchTerms: [
      "restart strategy",
      "pipelined region",
      "key group redistribution",
      "operator state redistribution",
      "canonical savepoint",
      "uid",
      "allowNonRestoredState",
      "OperatorCoordinator",
      "attempt number"
    ],
    keyIdea:
      "故障恢复不是重新 new 一个函数：运行时必须决定重启哪些 execution attempts、从哪个 completed snapshot 恢复、怎样重分配所有状态，并拒绝旧 attempt 的迟到消息与副作用。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先分三个问题",
        title: "whether、when 与 which tasks 不能混成“自动重启”",
        goal:
          "能够解释 restart/failover/HA 的不同职责，设计有状态 rescale 与版本升级，并用 attempt-aware chaos tests 证明状态、split、timer、committable 和外部结果都能收敛。",
        prerequisites: [
          "理解 key-group、operator state 与 checkpoint completion",
          "理解 source/sink 也拥有 managed/coordinator state",
          "有 savepoint 升级或集群故障处理经验"
        ],
        conceptMap: [
          {
            label: "restart strategy",
            relation: "决定失败后是否重启、何时重启、最多多少次"
          },
          {
            label: "failover strategy",
            relation: "决定为恢复一致性需要重启哪些 task/region"
          },
          {
            label: "HA services",
            relation: "保存 leader/JobGraph/checkpoint metadata 等控制面恢复信息"
          },
          {
            label: "state assignment",
            relation: "把 key-group、operator state、split 与 committable 交给新 attempt"
          }
        ],
        invariant:
          "恢复必须以最近 completed checkpoint/savepoint 为共同事实，并为每类 state 定义 redistribution；所有跨 attempt 消息、副作用和 coordinator 事件必须带 attempt/epoch fencing，旧 attempt 不得重新获得提交资格。",
        body: [
          "restart strategy 决定要不要重试以及延迟/频率；failover strategy 决定哪些受影响 task 要一起重启。pipelined region 会把通过 pipelined exchange 连接的 task 视为恢复单元，并根据不可用结果分区与下游一致性扩展重启范围。",
          "TaskManager 丢失属于数据面 execution failure；JobManager 进程/leader 丢失属于控制面故障。HA 可以恢复 JobMaster/作业元数据和 checkpoint 指针，但业务状态仍来自 durable checkpoint，外部副作用仍依赖 sink 协议。",
          "rescaling 不是只移动 keyed state。operator ListState、UnionListState、FLIP-27 split、source enumerator state、sink writer state 与 pending committables 都必须各自定义重新分配和去重规则。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先判断影响面",
        title: "一个 sink subtask 抛异常，为什么上游也可能重启",
        prediction:
          "全流式 source→map→keyed→sink 都使用 pipelined exchange。sink-2 失败后，region failover 是否只重启 sink-2？若中间是 batch blocking exchange，答案为何可能不同？",
        invariant:
          "恢复范围由结果分区能否重建和一致性决定，不由“异常在哪个类抛出”单独决定。",
        body: [
          "纯 streaming pipelined dataflow 常形成较大的 pipelined region。失败 task 需要的上游结果不能像已完成 blocking partition 那样任意重读，因此生产者和消费者可能共同重启。",
          "blocking exchange 可以形成 region 边界；已完成且仍可用的中间结果允许缩小重启范围。实际范围还受结果可用性和下游一致性传播规则影响，必须以 ExecutionGraph/Web UI attempts 为证。",
          "捕获所有异常并输出 null 并不是提高可用性，而是阻止 failover 纠正状态。如果数据不满足合同，应显式 side output/DLQ 并保留证据；无法安全继续的异常必须让 task 失败。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "attempt 时间线",
        title: "分别杀 TaskManager、JobMaster 与单个 UDF",
        prediction:
          "三种故障会让哪些 attempt number 变化？source offset、timer、pending transaction 与 coordinator epoch 各从哪里恢复？",
        codeLabel: "FailoverRescaleIT.java · chaos matrix",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · HA MiniCluster/Kubernetes test environment`,
        runCommand:
          "mvn -Dtest=FailoverRescaleIT test\n./bin/flink stop --savepointPath s3://lab/savepoints <job-id>\n./bin/flink run -d -s s3://lab/savepoints/<canonical> -p 6 target/job-v2.jar",
        code: `scenario("task-exception")
    .failAt(eventId("e-500"))
    .expectAttemptsChanged(affectedPipelinedRegion());

scenario("taskmanager-loss")
    .killTaskManagerHolding("risk-subtask-1")
    .expectRestoreFrom(latestCompletedCheckpoint());

scenario("jobmaster-leader-loss")
    .revokeLeadership()
    .expectNewJobMasterEpoch()
    .expectOldCoordinatorEventsRejected();

rescale(fromParallelism(2), toParallelism(6))
    .restoreFromCanonicalSavepoint()
    .assertKeyedStateAgainstOracle()
    .assertEverySplitHasExactlyOneOwner();`,
        expectedOutput: [
          "affected attempts 增加，状态恢复到同一 completed checkpoint",
          "重放可发生，但 keyed result 与 transactional sink 最终收敛",
          "旧 coordinator/reader/writer attempt 的迟到事件被 epoch/attempt fencing 拒绝",
          "2→6 后每个 key-group、split 与 pending committable 都有明确唯一处理责任"
        ],
        observation:
          "同时记录 logical subtask index 与 execution attempt number。subtask 1 是逻辑位置，attempt 3 是第三次执行；仅用 subtask id 做外部事务前缀会让旧 attempt 与新 attempt 相撞。",
        trace: [
          {
            thread: "failure detector / scheduler",
            action: "标记 execution failed 并计算 failover region",
            state: "restart strategy 决定重试节奏"
          },
          {
            thread: "state assignment",
            action: "从 completed checkpoint 重分配 operator/keyed/coordinator state",
            state: "新 attempts 获得恢复状态"
          },
          {
            thread: "new task attempts",
            action: "恢复 source/sink/timers 后重新处理",
            state: "旧 epoch 的消息和提交权必须失效"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "升级与状态匹配",
        title: "uid 是状态身份，canonical savepoint 是迁移边界",
        body: [
          "没有显式 uid 时，operator id 常由拓扑位置派生。插入一个 map、改变 chaining 或改写图都可能改变自动 id，使新作业无法匹配旧状态。所有可能含显式或内部状态的 operator 都应设置稳定且唯一的 uid。",
          "canonical savepoint 适合可移植升级；native savepoint 更接近 backend 原生格式，性能可能更好但可移植性较弱。升级前要锁定 uid、maxParallelism、state descriptor/serializer、connector compatibility、artifact 与绝对 state path。",
          "从旧 savepoint 启动不回滚外部系统。若旧作业在 savepoint 之后继续提交过数据，新作业可能重发这段区间。stop-with-savepoint、sink 幂等/upsert、事务边界和 shadow verification 必须共同设计。"
        ],
        trace: [
          {
            thread: "savepoint",
            action: "按 operator uid 保存 operator/keyed/coordinator state",
            state: "形成升级输入"
          },
          {
            thread: "new job graph",
            action: "按 uid 匹配旧 state，检查 serializer/maxParallelism",
            state: "匹配成功后分配给新 parallelism"
          },
          {
            thread: "restore attempts",
            action: "恢复并从 source positions 继续",
            state: "外部系统必须处理可能重叠的历史区间"
          }
        ],
        invariant:
          "allowNonRestoredState 是明确丢弃无法匹配状态的授权，不是修复升级的快捷开关；业务状态未完成逐项审计时不得使用。"
      },
      {
        kind: "api-decision",
        eyebrow: "把恢复策略写成业务决定",
        title: "restart、savepoint 与 rollback 各自回答什么",
        apiOptions: [
          {
            api: "exponential-delay / failure-rate restart",
            useWhen: "暂态故障可恢复，且需避免紧密重启压垮依赖",
            guarantees: "按策略控制重启时间与次数",
            doesNotGuarantee: "状态兼容、外部依赖已恢复或副作用未重复"
          },
          {
            api: "region failover",
            useWhen: "希望按 pipelined region 恢复最小一致范围",
            guarantees: "根据 execution topology 计算受影响区域",
            doesNotGuarantee: "只重启抛异常的单个 subtask"
          },
          {
            api: "canonical savepoint",
            useWhen: "版本升级、跨 backend/集群迁移与可回滚发布",
            guarantees: "稳定、可移植的应用状态快照语义",
            doesNotGuarantee: "回滚外部 sink 已提交结果"
          },
          {
            api: "stop-with-savepoint / drain policy",
            useWhen: "需要把停止语义与最后状态边界显式协调",
            guarantees: "按命令选项触发停止与 savepoint 流程",
            doesNotGuarantee: "所有 connector 对 bounded end、watermark 与事务有相同语义"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "设计一次 2→6 rescale 与 V1→V2 零猜测升级",
        task:
          "为订单作业写 UpgradeManifest 与自动化演练：列出每个 uid、parallelism/maxParallelism、state name/serializer、source split serializer、sink committable serializer、artifact checksum 和外部结果策略；执行 canonical savepoint、V2 shadow restore、2→6 rescale、故障回滚。",
        constraints: [
          "所有 operator 包括 source/sink/内部有状态算子均有稳定 uid",
          "V2 只允许 manifest 中声明的兼容变化；禁止临时 allowNonRestoredState",
          "ListState 元素必须可独立分配；UnionListState 必须证明复制成本和去重",
          "所有 coordinator↔task 事件包含 epoch/attempt，旧 attempt 不得提交",
          "回滚必须说明 savepoint 之后外部数据如何去重、覆盖或隔离"
        ],
        hints: [
          "先导出 V1 作业图和 savepoint metadata，再审 V2，而不是先运行看看。",
          "把 key-group、source split、writer transaction 三种 owner 分开验证。",
          "shadow job 输出到隔离目标，用 immutable input range 与 oracle 比较。"
        ],
        adversarialTest:
          "在 enumerator 分配 split 后、reader ACK 前切换 JobMaster leader；随后旧 reader 发回完成事件。断言新 epoch 不会重复丢失 split。再在 V2 中插入 stateless map 但保留所有 uid，restore 应成功；删除一个 uid 时发布门禁必须失败。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "控制面边界",
        title: "HA 保住调度事实，不替外部系统 fencing",
        localGuarantee:
          "Flink HA 与 checkpoint metadata 可让新的 JobMaster/attempt 恢复作业控制面和 managed state；scheduler 按 failover/restart 策略重新部署。",
        breaksWith:
          "旧 attempt 仍持有数据库锁/事务、无 epoch 的 coordinator 消息、过期 Kafka transaction、不可访问 savepoint path、connector serializer 不兼容和外部 retention 已越界。",
        alternatives: [
          "外部写入使用 attempt/epoch fencing token 或幂等 transaction id",
          "savepoint 与 artifact/checksum/配置作为不可分割发布单元",
          "根据最坏重启时长设置 Broker retention、事务 timeout 与租约超时"
        ],
        body: [
          "JobManager 进程内包含 Dispatcher、ResourceManager，以及每个作业对应的 JobMaster；HA leader 切换后新 JobMaster 接管作业。不要把 JobManager 进程、JobMaster 和整个集群当成同一个对象。",
          "控制事件送达 ACK 只证明 transport/delivery，不证明 task 已 flush、DDL 已完成或外部事务已提交。跨 attempt 完成协议需要明确完成事件、epoch、timeout 和恢复状态。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "拿掉所有缩写，解释一次恢复",
        body: [
          "从 task exception 开始，依次说清失败检测、region 计算、restart 决策、state assignment、新 attempt、source replay 与 sink convergence。"
        ],
        checkpoint: {
          prompt:
            "为什么稳定 uid 能让插入一个无状态 map 后继续恢复，却不能让不兼容 serializer、改变 maxParallelism 或回退外部 sink 自动安全？",
          hint:
            "uid 只解决“旧状态属于谁”，不解决“字节怎么读”和“外部世界怎么回滚”。",
          answer: [
            "uid 让新 JobGraph 中的 operator 与 savepoint 中的状态建立稳定匹配，不再依赖拓扑位置生成 id。",
            "serializer compatibility 决定旧字节能否读取；maxParallelism 决定 key-group 空间，这些合同独立于 uid。",
            "savepoint 只包含纳入 Flink 协议的状态与位置，不撤销其后已经提交的外部结果。",
            "安全升级还需要 source/sink connector compatibility、epoch fencing、外部幂等/事务和真实 restore 演练。"
          ],
          successCriteria: [
            "能区分 restart strategy、failover strategy 与 HA",
            "能说明 keyed/operator/source/sink/coordinator state 的重分配",
            "能设计 stable uid/maxParallelism/canonical savepoint 升级",
            "能识别旧 attempt 消息和外部副作用的 fencing 风险"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Task Failure Recovery",
        "docs/ops/state/task_failure_recovery/",
        "restart strategies、full/region failover 与 region 传播规则。"
      ),
      flinkDoc(
        "Upgrading Applications and Flink Versions",
        "docs/ops/upgrading/",
        "stable uid、savepoint restore、版本升级前提与外部写入提醒。"
      ),
      flinkDoc(
        "Savepoints",
        "docs/ops/state/savepoints/",
        "canonical/native savepoint、停止、恢复与 ownership mode。"
      ),
      flinkDoc(
        "High Availability",
        "docs/deployment/ha/overview/",
        "JobManager 组件、leader recovery 与 HA 元数据。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-network-backpressure",
    week: 5,
    title: "网络栈与反压：从一个满 buffer 找到真正的慢点",
    dek: "沿 RecordWriter、ResultPartition、subpartition、InputGate 与 credit-based flow control 追踪记录，把 busy/idle/backpressured、数据倾斜、buffer debloat、async I/O 和 checkpoint 指标连成一棵可证伪的诊断树。",
    tags: ["Network", "Backpressure", "Buffer", "Data Skew", "Async I/O"],
    searchTerms: [
      "ResultPartition",
      "InputGate",
      "network buffer",
      "credit based flow control",
      "buffer debloat",
      "backPressuredTimeMsPerSecond",
      "data skew",
      "AsyncDataStream"
    ],
    keyIdea:
      "反压是下游消费能力不足通过有限网络 buffer 向上游传播的结果；看到上游 backpressured 只是症状，根因要沿数据流向下寻找第一个持续 busy、倾斜或外部等待的 subtask。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先画字节路径",
        title: "记录跨 task 时会变成 buffer，buffer 满时才有可传播的压力",
        goal:
          "能够解释一条记录从 serializer 到下游 deserializer 的路径，用 subtask 级指标定位反压根因，并量化网络 buffer 对吞吐、延迟与 checkpoint 的共同影响。",
        prerequisites: [
          "理解 operator chain 与跨 task data exchange",
          "理解 aligned/unaligned checkpoint",
          "能查看 Flink Web UI、REST metrics 与外部 sink 指标"
        ],
        conceptMap: [
          {
            label: "RecordWriter / serializer",
            relation: "按 partitioner 选择 subpartition 并写入 network buffer"
          },
          {
            label: "ResultPartition",
            relation: "管理输出 subpartition 与可用 buffer"
          },
          {
            label: "InputGate / channel",
            relation: "合并上游 channel 并把 buffer 交给 task"
          },
          {
            label: "credit",
            relation: "下游以可用 buffer 数控制上游可发送的在途数据"
          }
        ],
        invariant:
          "跨 task 的在途数据必须受有限 buffer/credit 约束；任何吞吐优化都要同时检查 in-flight bytes、端到端延迟、alignment/channel-state 成本与下游真实容量。",
        body: [
          "同一 operator chain 中的记录可直接通过 Collector 调用下游；跨 task 后，记录序列化并装入固定内存 segment 的 network buffer，经 subpartition/channel 传输。buffer 是通信与流控单位，不是一条记录一个包。",
          "credit-based flow control 让下游把可接收 buffer 数告诉上游。下游处理慢、input buffer 不能归还时，上游逐步耗尽可用 output buffer，于是 task 被标记为 backpressured，压力沿图反向传播。",
          "buffer 越多并非越安全：它可提高带宽利用和吸收抖动，却增加排队延迟；aligned checkpoint 的 barrier 要穿过更多在途数据，unaligned 则要把更多在途数据写进 channel state。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先诊断，不先扩容",
        title: "Source 显示 HIGH backpressure，为什么不应该先扩 Source",
        prediction:
          "Source backpressured=900ms/s，Map backpressured=850ms/s，Sink busy=990ms/s；Sink 的 8 个 subtask 中只有一个满载，其余 idle。先写出最可能根因和第一项验证，再决定扩哪一层。",
        invariant:
          "busy、idle、backpressured 三类时间在观察窗口内近似合计 1000ms/s；必须看每个 subtask 的分布，operator 平均值会隐藏 hot key。",
        body: [
          "Source 与 Map backpressured 表示它们被下游堵住，不表示它们算得慢。Sink 单一 subtask busy 而其余 idle，首先怀疑 key/partition skew、外部分片热点或 partitioner，而不是 source parallelism。",
          "沿图从 sink 向上找第一个持续 busy 或等待外部资源的节点，并同时查看 records/bytes in-out、Kafka partition lag、请求延迟与错误率。根因也可能在链内某个 operator，被 chain 级指标聚合掩盖，此时临时拆链用于诊断。",
          "扩上游会生成更多压力；盲目扩所有并行度可能增加连接数、shuffle 与 checkpoint state，却不改变一个 hot key 只能归属一个 keyed subtask 的事实。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "制造三种慢",
        title: "分别制造 CPU 慢、外部 I/O 慢与 hot key，比较指标指纹",
        prediction:
          "三种场景吞吐都下降，但 busy/idle/backpressured、subtask 方差、CPU 与外部 latency 会如何不同？",
        codeLabel: "BackpressureLabJob.java · 场景开关",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · Prometheus/REST metrics`,
        runCommand:
          "mvn -DskipTests package\n./bin/flink run -d -c lab.BackpressureLabJob target/lab.jar --scenario hot-key\ncurl 'http://localhost:8081/jobs/<job-id>/vertices/<vertex-id>/subtasks/metrics?get=busyTimeMsPerSecond,backPressuredTimeMsPerSecond,idleTimeMsPerSecond'",
        code: `switch (scenario) {
    case CPU -> keyed.process(new FixedCpuCost(3_000_000));
    case IO -> keyed.sinkTo(new RateLimitedTestSink(100));
    case HOT_KEY -> source
            .map(i -> i % 10 == 0 ? "normal-" + i : "hot")
            .keyBy(key -> key)
            .process(new FixedCpuCost(300_000));
}

// 每轮固定输入速率、payload、parallelism 与运行时长；
// 保存每个 subtask 的三类时间、records/bytes、checkpoint 和外部指标。`,
        expectedOutput: [
          "CPU 慢：目标 operator 多数 subtask busy 高，CPU 利用率随之升高",
          "I/O 慢：sink/async 等待与外部 latency 对应，上游出现传播性 backpressure",
          "hot key：一个 subtask busy/records-in 极高，其余 subtask idle",
          "三种场景均可能让 source 显示 backpressure，但修复完全不同"
        ],
        observation:
          "每次只改变一个变量并保留原始 subtask 指标。平均吞吐相同不代表问题相同；诊断报告必须能用另一组指标证伪自己的首要假设。",
        trace: [
          {
            thread: "downstream task",
            action: "消费 input buffer 变慢",
            state: "buffer 归还/credit 更新变慢"
          },
          {
            thread: "upstream RecordWriter",
            action: "可用 output buffer 耗尽",
            state: "task 等待 buffer，被计入 backpressured time"
          },
          {
            thread: "source",
            action: "最上游也无法继续 emit",
            state: "端到端反压完成传播"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "吞吐—在途数据—恢复",
        title: "buffer debloat 缩短队伍，不会让慢算子变快",
        body: [
          "network buffer pool 包括按 channel 的 exclusive buffer 与 input gate 可共享的 floating buffer。足够在途数据可覆盖网络往返并维持吞吐；过量在途数据则增加延迟和 checkpoint 成本。",
          "buffer debloating 根据消费吞吐与目标消费时间动态调整 buffer 数，常能缩短 barrier 穿越时间并减小 unaligned channel state。它控制队伍长度，不增加 CPU、外部 QPS 或 hot key 的消费能力。",
          "AsyncDataStream 可以把阻塞 I/O 转为有界并发：capacity 限制 in-flight request，timeout 提供终止，ordered/unordered 决定输出顺序。但底层客户端线程池和连接池也必须有界，异步不是把压力藏进另一个无界队列。"
        ],
        trace: [
          {
            thread: "network",
            action: "buffer count × segment size 形成在途字节预算",
            state: "预算需覆盖带宽延迟积而不能无限增长"
          },
          {
            thread: "debloater",
            action: "按吞吐估计目标 buffer 数",
            state: "减少排队与 checkpoint 在途数据"
          },
          {
            thread: "async operator",
            action: "请求离开 task 线程，完成结果回到受控 operator",
            state: "capacity 满时仍会形成可传播反压"
          }
        ],
        invariant:
          "任何异步或缓冲设计都必须有一个真正受限的 in-flight 数；若 capacity 只限制 Flink operator，而客户端内部仍无界排队，端到端系统仍不有界。"
      },
      {
        kind: "api-decision",
        eyebrow: "按证据选择动作",
        title: "扩容、重分区、异步化与 debloat 解决四种不同问题",
        apiOptions: [
          {
            api: "提高 operator parallelism",
            useWhen: "工作可分割、分区均衡且 CPU/外部容量随实例扩展",
            guarantees: "增加并行 subtask",
            doesNotGuarantee: "拆分单个 hot key 或扩容数据库"
          },
          {
            api: "两阶段聚合 / 受控 salting",
            useWhen: "操作满足可结合性，hot key 可先局部聚合再还原",
            guarantees: "把可结合工作分摊到多个上游 key",
            doesNotGuarantee: "适用于非结合、严格顺序或逐事件副作用"
          },
          {
            api: "AsyncDataStream",
            useWhen: "瓶颈是有明确 timeout 的远程等待，外部系统允许有限并发",
            guarantees: "task 不必同步阻塞每个请求",
            doesNotGuarantee: "恰好一次副作用、自动取消远端或无限吞吐"
          },
          {
            api: "buffer debloat / unaligned",
            useWhen: "checkpoint 主要被在途数据与 barrier 传播拖慢",
            guarantees: "分别减少 buffer 或捕获 channel state",
            doesNotGuarantee: "修复 CPU、skew、I/O saturation 或业务延迟"
          }
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "构建可证伪的反压诊断器",
        task:
          "为订单风控作业实现 BackpressureEvidenceReport：从 REST 拉取每个 subtask 的 busy/idle/backpressured、records/bytes、watermark 与 checkpoint 指标，并合并 Kafka lag、数据库 latency。输出候选根因、支持证据、反证和下一次单变量实验。",
        constraints: [
          "保留 subtask 粒度与时间序列，禁止只输出 operator 平均值",
          "至少识别 CPU saturated、external I/O、hot key、网络 buffer 和 checkpoint storage 五类",
          "每个建议必须写预期指标变化；没有可证伪预测的建议不得输出",
          "Async I/O 必须暴露 in-flight、timeout、retry、client queue 与 external QPS",
          "比较 debloat 前后吞吐、p99 latency、alignment、checkpoint bytes 和 recovery"
        ],
        hints: [
          "从最下游向上寻找压力传播路径，再查第一个没有被下游压住却持续忙的节点。",
          "用变异系数或 max/median 暴露 subtask skew。",
          "把 retry traffic 计入真实到达率，避免把自激过载误判为 source 增长。"
        ],
        adversarialTest:
          "构造 99% 数据命中同一 key 的场景，把 parallelism 从 2 增到 16。报告若建议继续扩容而没有指出 max/median skew，测试失败；再让 AsyncFunction 的客户端内部使用无界 executor queue，证明 operator capacity 并未形成端到端上界。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "反压边界",
        title: "Flink 能暂停自己的 source，不一定能让业务生产者减速",
        localGuarantee:
          "Flink 网络栈通过有限 buffer/credit 在 task 之间传播消费压力；支持的 source 可把该压力反映为减少拉取或暂停 split。",
        breaksWith:
          "外部生产者继续无界写 Broker、客户端自动重试、source 预取、connector 内部无界队列、数据库限流和 side-effect 线程池都会形成隐藏缓冲。",
        alternatives: [
          "通过 Kafka lag/retention 明确允许的外部积压窗口",
          "向同步上游返回 429/503 与带抖动的总重试预算",
          "在 source/connector 内提供有界 fetch queue、pause/resume 与可观测 backlog"
        ],
        body: [
          "端到端有界必须统计 Broker、source fetcher、network buffer、operator state、async in-flight、sink batch 与客户端重试。只把 taskmanager network memory 调小，可能把积压推到更不可见的位置。",
          "反压也不是可靠性协议。暂停读取不会自动延长 Kafka retention，不会阻止外部事务超时，更不会保证事件不丢；运维必须把最坏恢复时间与外部保留策略一起预算。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "给出指标，不看拓扑名称定位慢点",
        body: [
          "拿一份匿名 subtask 指标表，从压力传播方向、busy/idle 分布与外部指标推导根因；同时写出最可能的反证。"
        ],
        checkpoint: {
          prompt:
            "为什么增加 network buffer 可能提高吞吐却同时恶化 aligned 与 unaligned checkpoint？如何区分一个 CPU 慢算子和一个 hot-key 算子？",
          hint:
            "在途数据既是带宽流水线也是 checkpoint 负担；看 subtask 分布而不是平均值。",
          answer: [
            "更多 buffer 可覆盖网络往返、减少发送空档，但 aligned barrier 要排在更多在途数据之后。",
            "unaligned 会把被 barrier 超越的在途 buffer 写成 channel state，因此 buffer 越多 snapshot/recovery 可能越大。",
            "CPU 慢且分区均衡时，多数 subtask busy/CPU 都高；hot key 时少数 subtask records-in/busy 极高，其余 idle。",
            "修复分别可能是优化/扩可分割 CPU，或改变可结合算法/分区；不能统一用扩 source。"
          ],
          successCriteria: [
            "能画出 ResultPartition 到 InputGate 的 buffer/credit 路径",
            "能从 sink 向上解释反压传播",
            "能区分 CPU、I/O、skew 与 buffer 指纹",
            "能说明 debloat、async 与 unaligned 的收益和边界"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Network Buffer Tuning",
        "docs/deployment/memory/network_mem_tuning/",
        "network buffer lifecycle、in-flight data、buffer count/size 与 debloat。"
      ),
      flinkDoc(
        "Monitoring Back Pressure",
        "docs/ops/monitoring/back_pressure/",
        "busy、idle、backpressured 指标与 Web UI 解释。"
      ),
      flinkDoc(
        "Async I/O",
        "docs/dev/datastream/operators/asyncio/",
        "AsyncDataStream、capacity、timeout 与 ordered/unordered 行为。"
      ),
      flinkDoc(
        "Checkpointing under backpressure",
        "docs/ops/state/checkpointing_under_backpressure/",
        "backpressure 下 debloat 与 unaligned 的组合和限制。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-checkpoint-exactly-once",
    week: 4,
    title: "Checkpoint 与 exactly-once：证明一个一致切面，而不是背配置",
    dek: "从双输入 barrier 时间线推导一致切面，拆开同步快照、异步持久化、ACK 与全局完成，再用故障注入证明 aligned、unaligned、source rewind 和 sink commit 如何组成端到端语义。",
    tags: ["Checkpoint", "Barrier", "Exactly Once", "Unaligned", "Recovery"],
    searchTerms: [
      "checkpoint barrier",
      "aligned checkpoint",
      "unaligned checkpoint",
      "channel state",
      "CheckpointCoordinator",
      "snapshotState",
      "notifyCheckpointComplete",
      "state changelog",
      "exactly once"
    ],
    keyIdea:
      "Flink 的 exactly-once 首先是状态在失败重放后等价于无故障执行；记录仍可能被再次处理，外部结果必须由 source 与 sink 一起完成证明。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先定义一致切面",
        title: "checkpoint 同时冻结 source 位置、operator 状态与必要的在途数据",
        goal:
          "能够手算 aligned/unaligned checkpoint 的一致切面，解释 checkpoint 生命周期每个回调的证据强度，并为端到端 exactly-once 写出 source—state—sink 证明。",
        prerequisites: [
          "理解多输入 Dataflow、watermark 与 managed state",
          "理解可重放日志 offset 和外部事务/幂等",
          "能够查看 Flink checkpoint REST/Web UI 指标"
        ],
        conceptMap: [
          {
            label: "barrier",
            relation: "在数据流中标记 checkpoint 边界"
          },
          {
            label: "operator snapshot",
            relation: "记录边界前的 managed state"
          },
          {
            label: "source position",
            relation: "恢复时重放的起点"
          },
          {
            label: "sink commit",
            relation: "把 checkpoint 完成与外部可见性绑定"
          }
        ],
        invariant:
          "一个 completed checkpoint 必须对应因果一致的 source positions、operator state 和所需 channel state；端到端 exactly-once 还必须有可回退 source 与 checkpoint 协同、可恢复且幂等的 sink commit。",
        body: [
          "barrier 随记录传播，把每个输入划分为 checkpoint 之前与之后。aligned checkpoint 在多输入算子看到第一条 barrier 后阻塞该输入，继续处理尚未到 barrier 的其他输入，直到所有 barrier 对齐再 snapshot。",
          "snapshot 通常包含 task 线程上的同步准备与后台异步持久化。subtask ACK 只说明自己的状态成功持久化；CheckpointCoordinator 收齐要求的 ACK 并完成元数据后，才是全局 completed checkpoint，随后才可能触发 notifyCheckpointComplete/committer 行为。",
          "恢复时 source 回退，记录会被重放。因此“每条 event 只执行一次 map”不是 Flink exactly-once 的含义。正确说法是 managed state 更新在恢复后与一次无故障执行等价；外部副作用要单独证明。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先画 barrier 时间线",
        title: "收到 barrier 不等于此前的所有外部动作都已完成",
        prediction:
          "双输入算子先从 A 收到 checkpoint 42 barrier，此时 B 仍有三条 pre-barrier 记录。算子应立即 snapshot 吗？若 map 在异步线程发 HTTP，请求已发送但响应未回，barrier 又能证明什么？",
        invariant:
          "barrier 约束 Flink 数据流和纳入协议的状态；它不会自动等待、回滚或提交用户在协议外启动的异步副作用。",
        body: [
          "aligned 模式要暂存/阻塞 A 的 post-barrier 数据，继续处理 B 的三条 pre-barrier 记录；当 B barrier 到来时，本地状态才代表同一个切面。若立即 snapshot，状态会缺少 B 的前置记录。",
          "异步 HTTP 若没有通过受支持的 operator 协议纳入状态与完成条件，barrier 只路过调用它的 operator。请求可能在 checkpoint 后成功，也可能恢复后重发；网络超时甚至不能说明远端未执行。",
          "snapshotState、prepareCommit、flush、subtask ACK、checkpoint completed 与外部事务 commit 是不同事件。课程要求每次都给动作起准确名字，禁止统称“checkpoint 成功所以已经写完”。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "故障切点实验",
        title: "在 pre-barrier、snapshot、ACK 与 commit 之间逐点杀进程",
        prediction:
          "把 TaskManager 分别杀在 checkpoint 之前、subtask ACK 之后但全局完成之前、全局完成之后。恢复结果中哪些输入会重放，managed count 和 transactional sink 各应出现什么？",
        codeLabel: "CheckpointCutIT.java · 故障脚本",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · MiniCluster/Testcontainers Kafka`,
        runCommand:
          "mvn -Dtest=CheckpointCutIT test\nmvn -Dtest=KafkaExactlyOnceChaosIT verify",
        code: `// 输入记录携带稳定 eventId 与 source offset。
// FailureLatch 在以下命名切点阻塞：
await("after-state-update-before-snapshot");
await("after-subtask-ack-before-global-complete");
await("after-precommit-before-commit");
await("after-global-complete");

killTaskManager();
restartFromLatestCompletedCheckpoint();

assertManagedStateEquals(batchOracle(inputLog));
assertReadCommittedSinkHasUniqueEventIds();
assertNoCommittedTransactionFromAbortedCheckpoint();`,
        expectedOutput: [
          "未进入 completed checkpoint 的 state 更新在恢复后由 source replay 重做",
          "managed count 最终与不可变输入日志的 batch oracle 一致",
          "read_committed sink 看不到 aborted checkpoint 的事务",
          "非事务 stdout/HTTP 探针可能重复，直接证明 state exactly-once 不等于外部 exactly-once"
        ],
        observation:
          "每个断言必须关联 checkpointId、source offset、attempt number、eventId 和 transaction/committable id。只比较最终行数会漏掉“丢一条、重复一条恰好抵消”的错误。",
        trace: [
          {
            thread: "source/task data plane",
            action: "注入 barrier 并记录 checkpoint 对应 source position",
            state: "建立可重放边界"
          },
          {
            thread: "task thread + async snapshot",
            action: "同步捕获一致状态，再异步写 durable storage",
            state: "成功后向 coordinator ACK state handle"
          },
          {
            thread: "CheckpointCoordinator",
            action: "收齐 ACK、完成 checkpoint、通知 operator/committer",
            state: "最近 completed checkpoint 成为恢复候选"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "aligned 与 unaligned",
        title: "让 barrier 超车，就必须把被超越的记录也保存",
        body: [
          "unaligned checkpoint 在第一个 barrier 到达时立即推进 barrier，并把它超越的 input/output channel buffers 作为 channel state 持久化。恢复时先重放这些在途数据，再继续上游输入，从而保持一致切面。",
          "它适合 barrier 因持续 backpressure 长时间无法传播的场景，但代价是更大的 checkpoint、更多存储 I/O 和更长 channel-state recovery。若瓶颈本来就是 checkpoint storage 或 state backend I/O，unaligned 可能更差；它不会降低业务处理延迟或修复慢 sink。",
          "Flink 2.3 中 unaligned 只适用于 EXACTLY_ONCE 且要求最大并发 checkpoint 为 1；savepoint 始终 aligned。state changelog 也不能简化成“实验功能”：它有明确能力与运维约束，例如最多一个并发 checkpoint、NO_CLAIM restore 不支持等，必须按 2.3 文档逐项验证。"
        ],
        trace: [
          {
            thread: "aligned",
            action: "阻塞已收到 barrier 的 channel，等待最慢 channel",
            state: "channel 中不额外保存被等待的 post-barrier 数据"
          },
          {
            thread: "unaligned",
            action: "第一个 barrier 到达即推进并标记 channel buffers",
            state: "被超越的 in-flight records 成为 checkpoint channel state"
          },
          {
            thread: "recovery",
            action: "恢复 operator state、source position 与 channel state",
            state: "重建同一一致切面后再继续处理"
          }
        ],
        invariant:
          "unaligned 改变 barrier 延迟与在途数据归属，不改变 exactly-once 语义，也不能作为掩盖永久 backpressure 的默认开关。"
      },
      {
        kind: "api-decision",
        eyebrow: "依据瓶颈选择快照策略",
        title: "checkpoint 参数是恢复预算，不是调优彩票",
        apiOptions: [
          {
            api: "aligned EXACTLY_ONCE",
            useWhen: "正常负载下 barrier 能及时传播，优先较小 snapshot 与直接恢复",
            guarantees: "多输入对齐后形成一致状态切面",
            doesNotGuarantee: "持续 backpressure 下 checkpoint 仍能按时完成"
          },
          {
            api: "unaligned EXACTLY_ONCE",
            useWhen: "高 alignment/start delay 由在途背压主导，storage I/O 尚有余量",
            guarantees: "把 channel state 纳入 snapshot，让 barrier 越过积压",
            doesNotGuarantee: "修复慢算子；不支持并发 checkpoint > 1 或 AT_LEAST_ONCE"
          },
          {
            api: "checkpoint interval / min pause / timeout",
            useWhen: "按 RPO、正常完成时长和存储负载设定周期",
            guarantees: "规定触发节奏与失败判定",
            doesNotGuarantee: "source/sink 具备端到端 exactly-once"
          },
          {
            api: "canonical savepoint",
            useWhen: "升级、迁移或需要可移植恢复边界",
            guarantees: "稳定格式的人工生命周期快照",
            doesNotGuarantee: "回滚 savepoint 之后已经发生的外部写入"
          }
        ],
        body: [
          "先分解 end-to-end duration：barrier start delay、alignment、synchronous snapshot、asynchronous persistence 与 completion。不同分量对应不同修复；单纯增大 timeout 只会让故障更晚暴露。"
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "写一份端到端 exactly-once 证明与 chaos matrix",
        task:
          "实现 Kafka orders → keyed ledger → Kafka audit 的实验作业。输入、状态和输出都携带稳定 eventId；开启 transactional Kafka sink。建立至少六个故障切点，并用 read_committed consumer 与 batch oracle 验证结果。",
        constraints: [
          "明确区分 state exactly-once、delivery guarantee 与业务 effect exactly-once",
          "checkpointId、source offset、attempt、transactional id 必须可观测",
          "只把 Kafka read_committed 结果用于 exactly-once 断言；stdout 只作诊断",
          "分别比较 aligned、buffer debloat、unaligned，记录 alignment/start delay/bytes/recovery",
          "验证 unaligned 配置满足 EXACTLY_ONCE、max concurrent checkpoints=1；savepoint 仍按 aligned 处理"
        ],
        hints: [
          "先用非事务 sink 故意观察重复，再开启事务，避免把正确结果当偶然。",
          "让故障 latch 绑定 checkpointId，避免 kill 落在错误切点。",
          "外部事务超时必须大于最坏 checkpoint + restart 时间，并通过测试验证。"
        ],
        adversarialTest:
          "让 sink precommit 成功后丢失 checkpoint completion 通知并重启；committable 在恢复/重试中可能再次出现，最终 commit 必须幂等。再把 checkpoint storage 人为限速：若 unaligned 比 aligned 更慢，报告必须解释 I/O 瓶颈，而不是继续增大 channel state。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "exactly-once 的边界",
        title: "处理可以重复，结果仍可等价；副作用却不会自动撤销",
        localGuarantee:
          "当 source 可回退且 managed state 纳入 completed checkpoint 时，Flink 恢复后提供 exactly-once state consistency。",
        breaksWith:
          "不可回放 source、checkpoint 协议外异步调用、非幂等 HTTP/数据库写、事务超时、下游 read_uncommitted、从旧 savepoint 回退后的既有外部结果。",
        alternatives: [
          "事务 sink：checkpoint-scoped precommit + completion 后 commit",
          "幂等 upsert：稳定业务 key/version，重复写收敛到同一结果",
          "outbox/去重表：把业务副作用与幂等证据放入同一外部事务"
        ],
        body: [
          "checkpoint completion 不是时间旅行。若从较旧 savepoint 恢复，savepoint 之后已提交到外部系统的数据不会被 Flink 自动删除。升级与回滚方案必须说明 sink 如何检测、覆盖或接受这些结果。",
          "transport ACK 只证明消息交付到某层；flush 只证明缓冲被下推；precommit 只证明事务准备；这些都不是最终可见 commit。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "用一次失败说明所有证据等级",
        body: [
          "闭卷画出 checkpoint 42 从 source barrier 到 sink commit 的完整时间线，并在每个故障切点写下恢复来源、会重放的记录与可见外部结果。"
        ],
        checkpoint: {
          prompt:
            "为什么 unaligned checkpoint 可以缩短 barrier 完成时间，却可能扩大 checkpoint 和恢复时间？为什么 completed checkpoint 仍不能证明 map 中的 HTTP 请求恰好执行一次？",
          hint:
            "被 barrier 超越的数据必须变成 channel state；HTTP 不在 Flink snapshot/commit 协议里。",
          answer: [
            "unaligned 不等待所有 channel 对齐，而是把被超越的 in-flight buffers 一同持久化，因此 barrier 更快但 snapshot 字节与恢复重放增加。",
            "storage I/O 已饱和时，新增 channel state 会让 checkpoint 更慢；它也不消除业务 backpressure。",
            "恢复会从 completed checkpoint 的 source position 重放，map/HTTP 调用可能再次执行。",
            "只有事务或幂等 sink 把外部可见性绑定到 checkpoint，才能补全端到端证明。"
          ],
          successCriteria: [
            "能手算双输入 aligned 一致切面",
            "能区分 snapshot、ACK、global completion、flush、precommit 与 commit",
            "能准确陈述 2.3 unaligned/savepoint/state-changelog 约束",
            "能给出 source—state—sink 的端到端 exactly-once 证明"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Stateful Stream Processing",
        "docs/concepts/stateful-stream-processing/",
        "distributed snapshot、aligned/unaligned 与恢复语义。"
      ),
      flinkDoc(
        "Checkpointing",
        "docs/dev/datastream/fault-tolerance/checkpointing/",
        "checkpoint 配置、模式、并发限制与 externalized checkpoint。"
      ),
      flinkDoc(
        "Checkpointing under backpressure",
        "docs/ops/state/checkpointing_under_backpressure/",
        "buffer debloat、unaligned 条件、限制与排障。"
      ),
      flinkDoc(
        "Checkpoints vs. Savepoints",
        "docs/ops/state/checkpoints_vs_savepoints/",
        "checkpoint 与 canonical/native savepoint 的用途和恢复差异。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-state-serialization",
    week: 3,
    title: "状态、key-group 与序列化：恢复的是字节，不是 Java 对象",
    dek: "从状态所有权和 key-group 映射出发，拆开 keyed/operator/broadcast state、state backend 与 checkpoint storage，再用 serializer snapshot 证明一次升级为什么能恢复或必须失败。",
    tags: ["Managed State", "Key Group", "Serialization", "TTL", "State Backend"],
    searchTerms: [
      "ValueState",
      "ListState",
      "BroadcastState",
      "key group",
      "max parallelism",
      "TypeSerializerSnapshot",
      "schema evolution",
      "State TTL",
      "RocksDB"
    ],
    keyIdea:
      "状态正确性由所有权、稳定标识、key-group 与 serializer snapshot 共同决定；类名仍能编译、字段看起来兼容，都不能替代真实 savepoint restore 证明。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先问谁拥有这些字节",
        title: "状态 API 的差别首先是分区与恢复合同",
        goal:
          "能够为去重、规则广播、source split 与 sink writer 选择正确 state scope，计算 key-group 归属，并设计可验证的 serializer/schema 升级。",
        prerequisites: [
          "理解 keyBy、subtask、uid 与 checkpoint 的基本角色",
          "理解 Java 泛型、POJO、record 和对象序列化",
          "能够创建并从 savepoint 恢复作业"
        ],
        conceptMap: [
          {
            label: "keyed state",
            relation: "当前 operator + state name + key（以及 namespace）拥有"
          },
          {
            label: "operator state",
            relation: "绑定并行 operator instance，并按 list/union 规则重分配"
          },
          {
            label: "state backend",
            relation: "决定运行时存取结构与 snapshot 实现"
          },
          {
            label: "checkpoint storage",
            relation: "持久保存 snapshot 元数据与状态句柄"
          }
        ],
        invariant:
          "每份状态都必须能回答 owner、stable uid、state name、key/namespace、serializer snapshot、redistribution rule、cleanup rule 与 durable storage；答不全就不能声称可恢复或可升级。",
        body: [
          "keyed state 只在 KeyedStream 上按当前 key 访问；operator state 属于一个并行实例，常用于 source/sink 与无业务 key 的运行时进度；broadcast state 在所有下游实例保存规则副本，更新逻辑必须确定且与到达顺序无关。",
          "HashMap/EmbeddedRocksDB 等 backend 改变本地读写、内存与 snapshot 特征，不改变业务状态的逻辑所有权。checkpoint storage 是持久层位置；把 backend 与 storage 混为一个配置，会导致错误的容量与容灾判断。",
          "State V2 和 ForSt 在 Flink 2.3 仍是 Experimental。主实验使用稳定 State V1 与生产 backend；实验性能力单列观察，不把未来设计写成当前保证。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先算 key-group",
        title: "并行度从 2 改成 5，状态为什么还能找到原来的 key",
        prediction:
          "maxParallelism=128，keyBy 后并行度从 2 调到 5。请先说明 Flink 是直接把每个业务 key 存进“subtask 2 的文件”，还是先映射到更稳定的中间分区；再预测修改 maxParallelism 会发生什么。",
        invariant:
          "key 先经确定性 hash 映射到 [0, maxParallelism) 的 key-group，再由连续 key-group range 分配给当前 subtask；maxParallelism 是状态布局合同，不是可以随意调大的普通容量参数。",
        body: [
          "rescaling 时移动的是 key-group range 对应的状态句柄/字节范围，业务 key 因而跟随所属 key-group 到新 subtask。maxParallelism 给出可扩展上界，也影响 backend 内部结构和元数据开销。",
          "恢复时显式修改 maxParallelism 通常会破坏原状态映射。改变 KeySelector 或 key 的序列化结构更危险：作业也许能启动，却把同一业务实体映射到新的 key-group，形成静默语义错误。",
          "operator state 没有 key-group。ListState 可把独立元素重新分配给新并行实例；UnionListState 会把全部元素广播给每个实例，数据量会随并行度放大。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "真实 restore 实验",
        title: "同一份输入做 2→5 rescale，再做一次故意不兼容升级",
        prediction:
          "保留 uid/state name/serializer/maxParallelism 时，每个 customer 的去重计数是否改变？把 key 类型字段删除，或把 maxParallelism 改为 256 后，失败应该发生在构图、部署还是 restore？",
        codeLabel: "StateRescaleIT.java · 实验步骤",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · MiniCluster · canonical savepoint`,
        runCommand:
          "mvn -Dtest=StateRescaleIT test\n./bin/flink stop --savepointPath file:///tmp/flink-savepoints <job-id>\n./bin/flink run -d -s file:///tmp/flink-savepoints/<savepoint> -p 5 target/job-v2.jar",
        code: `// V1: uid/maxParallelism 固定，parallelism=2
events.keyBy(Event::customerId)
      .process(new DeduplicateAndCount())
      .uid("customer-deduplicate")
      .setMaxParallelism(128)
      .setParallelism(2);

// 生成 canonical savepoint 后，V2 只把 parallelism 改成 5。
// 对照实验分别修改：uid、state descriptor name、key schema、
// serializer schema、maxParallelism，并保存精确 restore 错误。`,
        expectedOutput: [
          "2→5 恢复后，每个 customer 的已见 eventId 与 count 与 savepoint 前一致",
          "subtask index 变化，但同一 customer 只归属一个新 subtask",
          "不兼容 serializer 或 maxParallelism 变更在 restore 阶段明确失败",
          "移除 uid 时可能无法匹配旧状态；不得用 allowNonRestoredState 掩盖"
        ],
        observation:
          "校验要读取业务状态结果，而不是只看作业 RUNNING。恢复成功只证明字节可读；还要用不可变输入日志重放 oracle 证明 key 归属与结果没有静默漂移。",
        trace: [
          {
            thread: "write path",
            action: "key → key-group → backend key/value bytes",
            state: "serializer 决定持久字节布局"
          },
          {
            thread: "snapshot path",
            action: "backend 产出 state handle 与 serializer snapshot",
            state: "checkpoint/savepoint 保存恢复所需元数据"
          },
          {
            thread: "restore path",
            action: "uid 匹配 operator → 检查 serializer compatibility → 分配 key-group",
            state: "兼容时迁移/复用，不兼容时拒绝启动"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "恢复的真实对象",
        title: "TypeSerializerSnapshot 决定旧字节能否由新代码解释",
        body: [
          "Flink 保存的不只是业务值字节，还保存 serializer snapshot。恢复时，新 serializer 与旧 snapshot 协商兼容性：原样兼容、需要迁移、重新配置或不兼容。这个决策比 Java 类是否同名、serialVersionUID 是否相同更接近真实合同。",
          "Flink 生成的 POJO/Avro serializer 支持特定 schema evolution；key schema 演进不受支持，因为多个旧 key 可能合并为同一新 key，且 RocksDB 依赖二进制 key identity。Kryo 无法为状态 schema evolution 提供可靠兼容检查，不能把“本地反序列化没报错”当升级证明。",
          "State TTL 使用 processing time。过期值逻辑上不可见，不等于对应字节立刻从 heap、RocksDB 或 checkpoint 物理删除；cleanup 依赖访问、增量清理或 compaction 等策略。TTL 不是精确业务 timer，也不能保证在某毫秒释放容量。"
        ],
        trace: [
          {
            thread: "registration",
            action: "按 operator uid + descriptor name 注册 state",
            state: "建立逻辑状态标识和当前 serializer"
          },
          {
            thread: "compatibility",
            action: "新 serializer 检查旧 TypeSerializerSnapshot",
            state: "返回 compatible/as-is、migration、reconfigured 或 incompatible"
          },
          {
            thread: "TTL access",
            action: "按 processing time 判断 value 是否过期",
            state: "逻辑读取可返回空，物理字节可能仍存在"
          }
        ],
        invariant:
          "升级门禁必须对真实 savepoint 做 restore；任何只编译 V2、只单测新 serializer 或只启动空状态作业的验证都没有覆盖旧字节。"
      },
      {
        kind: "api-decision",
        eyebrow: "按所有权选择状态",
        title: "不要用最熟悉的 ValueState 解决所有问题",
        apiOptions: [
          {
            api: "ValueState / MapState / ListState（keyed）",
            useWhen: "状态天然按稳定业务 key 隔离",
            guarantees: "当前 key 下的 managed state 与 checkpoint/rescale 集成",
            doesNotGuarantee: "跨 key 原子事务或自动限制状态大小"
          },
          {
            api: "ListState（operator）",
            useWhen: "独立 split/partition/writer item 可在 rescale 时重新分配",
            guarantees: "list 元素可按 redistribution 规则交给新并行实例",
            doesNotGuarantee: "元素内部能够安全拆分"
          },
          {
            api: "BroadcastState",
            useWhen: "小型控制规则需要复制到所有 keyed subtask",
            guarantees: "每个 subtask 持有规则副本并可读取",
            doesNotGuarantee: "不同 task 接收控制事件的全局顺序相同"
          },
          {
            api: "State TTL",
            useWhen: "允许按处理时间把长期未访问状态变为逻辑过期",
            guarantees: "按 TTL 配置控制读取可见性",
            doesNotGuarantee: "event-time 截止、精确删除时刻或立即回收磁盘"
          }
        ],
        body: [
          "backend 选择要由状态规模、访问模式、checkpoint/recovery SLO 和本地磁盘条件驱动。不要把 Experimental ForSt 的远端异步方向当成 2.3 的生产默认，也不要假设切 backend 后性能必然更好。"
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "实现可升级的去重与规则状态",
        task:
          "实现 CustomerRiskState：按 customerId 保存有界 eventId 去重索引、累计金额和规则版本；规则流使用 BroadcastState。为 V1/V2 定义明确 schema 演进，并提供从 V1 canonical savepoint 恢复到 V2、再 rescale 的自动化测试。",
        constraints: [
          "所有 operator 显式稳定 uid；maxParallelism 在 V1 固定并写入升级清单",
          "禁止把 key 类型作为本次升级对象；禁止 Kryo fallback",
          "BroadcastState 更新必须由 ruleVersion 确定，不能依赖本地到达顺序",
          "TTL 只能清理允许过期的去重索引，不得决定财务业务截止",
          "测试必须检查业务 oracle、state size、restore 与 rescale，而不只检查 RUNNING"
        ],
        hints: [
          "把业务 key、state descriptor name 和 value schema 作为三份独立合同审查。",
          "先用 TypeInformation/ExecutionConfig 检查实际 serializer，避免泛型或容器悄悄落到 Kryo。",
          "为过期数据另设指标；逻辑不可见与磁盘回收分别观察。"
        ],
        adversarialTest:
          "让两个并行实例以不同顺序收到 ruleVersion 9 和 10，断言最终都选择版本 10；随后从 V1 savepoint 恢复 V2，并故意把 key schema 或 maxParallelism 改掉，测试必须拒绝发布，而不是添加 allowNonRestoredState 继续跑。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "状态边界",
        title: "managed state 一致，不代表外部缓存与 static 也被恢复",
        localGuarantee:
          "Flink 对已注册 managed state、匹配 uid/state name 和兼容 serializer 提供 checkpoint、restore 与规定的 redistribution。",
        breaksWith:
          "static cache、线程本地变量、外部 Redis/数据库、异步客户端缓冲、改变 key selector、未稳定 uid 与未受支持 schema 演进都在该保证之外。",
        alternatives: [
          "需要外部权威状态时使用版本化读写、幂等键或事务，并纳入端到端恢复设计",
          "需要检查/重写 savepoint 时评估 State Processor API，而不是直接修改文件",
          "实验 State V2/ForSt 时建立独立分支与回退路径，不污染稳定生产合同"
        ],
        body: [
          "operator 的 close 不是持久化钩子；本地 RocksDB 目录也不是 durable checkpoint。TaskManager 丢失时能恢复到哪里，取决于最近成功 checkpoint/savepoint 的远端 state handle。",
          "broadcast rule 的一致性来自确定性更新逻辑和 checkpoint，而不是所有 task 同时收到同一条消息。控制事件若会重试、乱序或来自旧 attempt，需要规则版本与 fencing。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "给你一份 savepoint，先写恢复证明再改类",
        body: [
          "闭卷列出一次有状态升级的不可变合同，并说明每项违反后是明确 restore 失败还是可能静默业务错误。"
        ],
        checkpoint: {
          prompt:
            "为什么 parallelism 可从 2 改为 5，而 maxParallelism、key serializer 与 key selector 不能同样随意改变？TTL 过期后为何 checkpoint 仍可能很大？",
          hint:
            "用 key→key-group→subtask 三段映射和“逻辑不可见不等于物理删除”回答。",
          answer: [
            "parallelism 只重新分配既有 key-group range；maxParallelism 定义 key-group 空间，是状态布局的一部分。",
            "改变 key serializer/selector 会改变 key 的二进制 identity 或 hash 映射，可能把旧状态送到错误归属；key schema evolution 不受支持。",
            "TTL 按 processing time 让过期值逻辑不可见，但物理 cleanup 可能延后到访问、增量扫描或 compaction。",
            "因此 restore 测试必须检查真实旧字节、业务结果与物理状态趋势。"
          ],
          successCriteria: [
            "能为 keyed/operator/broadcast state 说清 owner 与 rescale 规则",
            "能区分 backend、checkpoint storage 与本地恢复",
            "能解释 TypeSerializerSnapshot 的兼容决策",
            "能准确陈述 TTL、State V2 与 ForSt 的 2.3 边界"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Working with State",
        "docs/dev/datastream/fault-tolerance/state/",
        "稳定 State API、keyed/operator/broadcast state 与 TTL。"
      ),
      flinkDoc(
        "State Schema Evolution",
        "docs/dev/datastream/fault-tolerance/serialization/schema_evolution/",
        "serializer compatibility、支持范围、key 与 Kryo 的限制。"
      ),
      flinkDoc(
        "State Backends",
        "docs/dev/datastream/fault-tolerance/state_backends/",
        "HashMap、EmbeddedRocksDB、checkpoint storage 与 backend 选择。"
      ),
      flinkDoc(
        "Working with State V2",
        "docs/dev/datastream/fault-tolerance/state_v2/",
        "State V2 的 Experimental API 与迁移观察入口，不作为本课生产默认。"
      )
    ]
  }),
  defineFlinkLesson({
    slug: "flink-event-time-watermarks",
    week: 2,
    title: "事件时间与水位线：何时可以宣布结果完整",
    dek: "把 watermark 当作分布式事件时间进度声明，而不是定时触发器；从分区最小值、idle input、watermark alignment、window lifecycle 与 timer 恢复推导迟到数据和状态上界。",
    tags: ["Event Time", "Watermark", "Window", "Timer", "Late Data"],
    searchTerms: [
      "event time",
      "processing time",
      "WatermarkStrategy",
      "idleness",
      "watermark alignment",
      "allowed lateness",
      "KeyedProcessFunction",
      "timer"
    ],
    keyIdea:
      "watermark 回答的是“事件时间已经推进到哪里”，不是“现在几点”；下游进度取所有活跃输入的最小值，因此完整性、延迟与状态大小是同一个协议的三面。",
    learningBlocks: [
      {
        kind: "orientation",
        eyebrow: "先写结果契约",
        title: "没有完整性定义，就没有正确的窗口结果",
        goal:
          "能够为订单、支付两条乱序流定义 timestamp、watermark、迟到策略、窗口更新语义与状态清理时刻，并证明结果何时只是暂定、何时可视为最终。",
        prerequisites: [
          "完成 Dataflow 运行时课程",
          "理解按 key 分区与多输入算子",
          "能区分业务发生时间与机器处理时间"
        ],
        conceptMap: [
          {
            label: "event timestamp",
            relation: "记录在业务世界发生的时间"
          },
          {
            label: "watermark W",
            relation: "上游声明事件时间进度已到 W"
          },
          {
            label: "window / timer",
            relation: "在 watermark 跨过边界后触发事件时间动作"
          },
          {
            label: "allowed lateness",
            relation: "主触发后继续保留窗口并接受更新的期限"
          }
        ],
        invariant:
          "事件时间正确性必须同时说明：timestamp 来源、每个 split 的 watermark 生成、活跃输入最小值、idle 判定、允许迟到、late side output、重复 firing 的更新语义与最终清理边界。",
        body: [
          "processing time 使用任务机器的当前时间，低延迟但失败重放不确定；event time 来自记录，可在相同输入与确定性逻辑下重现。watermark 只是上游基于已见数据和源知识作出的进度声明，它不能阻止更晚到达的旧事件。",
          "窗口不是把流切成文件。WindowAssigner 选择 namespace，Trigger 决定何时 fire，window function 计算结果，allowed lateness 决定主 firing 后状态保留多久。fire 不等于 purge；晚到记录可能让同一窗口再次输出更新。",
          "事件时间 timer 属于当前 key，并随 managed state/checkpoint 恢复；processing-time timer 则依赖墙钟。二者都不能替代外部系统的业务截止时间协议。"
        ]
      },
      {
        kind: "misconception",
        eyebrow: "先手算一遍",
        title: "一个沉默分区，为什么能让整个窗口永远不开",
        prediction:
          "Kafka 两个 partition：P0 的 watermark 已到 12:10，P1 最后一个 watermark 停在 11:55 后再无记录。下游 12:00–12:05 窗口何时触发？给 P1 配置 30 秒 idleness 后又会怎样？",
        invariant:
          "多输入/多 channel 下游 watermark 是所有活跃输入 watermark 的最小值；idle 是把暂时无进度的输入排除出最小值，不是伪造它已经读完。",
        body: [
          "没有 idleness 时，P1 会把下游进度卡在 11:55，P0 再快也不能单独宣布全局事件时间前进。标记 P1 idle 后，下游可以跟随其余活跃输入推进。",
          "idleness 超时过短会把只是暂时安静的分区排除，随后从该分区到来的旧事件将变成 late。它是一项准确性—延迟取舍，不是无条件开启的性能开关。",
          "watermark alignment 解决相反问题：快 source 远远领先慢 source，使 join/window 缓存不断增长。它暂停过快的 source/split 来限制漂移；在 2.3 中只对 FLIP-27 Source 生效，不能在普通 DataStream 后补一个 strategy 就获得 source 暂停能力。"
        ]
      },
      {
        kind: "experiment",
        eyebrow: "确定性事件脚本",
        title: "手工控制记录、watermark、idle 与 late firing",
        prediction:
          "依次发出 eventTime=12:01、watermark=12:05、eventTime=12:03、watermark=12:07。对 5 分钟滚动窗口、allowedLateness=1 分钟，哪些是主 firing、late firing 和丢弃？",
        codeLabel: "EventTimeScenarioTest.java · 测试骨架",
        codeKind: "pseudocode",
        runtime: `${FLINK_RUNTIME} · JUnit 5 · operator test harness`,
        runCommand:
          "mvn -Dtest=EventTimeScenarioTest test\nmvn -Dtest=WatermarkIdlenessIT verify",
        code: `// 使用 two-input/operator harness 或可控 FLIP-27 测试 Source：
emit(P0, order("A", "12:01:00"));
emitWatermark(P0, "12:05:00");
assertNoWindowResult(); // P1 仍停在 11:55

markIdle(P1);
assertWindow("12:00-12:05", count = 1, firing = MAIN);

emit(P1, order("B", "12:03:00"));
assertWindow("12:00-12:05", count = 2, firing = LATE_UPDATE);

emitWatermark(P0, "12:06:01");
emit(P1, order("C", "12:02:00"));
assertSideOutputContains("C");`,
        expectedOutput: [
          "P1 活跃且 watermark 落后时没有主结果",
          "P1 idle 后窗口主 firing 输出 count=1",
          "allowed lateness 内 B 触发同一窗口的更新结果 count=2",
          "清理边界之后 C 进入 late side output，而不是静默改写旧结果"
        ],
        observation:
          "实验必须记录 currentInputWatermark、窗口 key/end、firing 类型和 RowKind/业务版本。只有 count 值而没有触发上下文，无法判断第二条输出是重复还是更新。",
        trace: [
          {
            thread: "SourceReader / source operator",
            action: "为每个 split 提取 timestamp 并推进 watermark",
            state: "split 进度先在 source 内合并"
          },
          {
            thread: "downstream task",
            action: "取所有活跃 input channel 的最小 watermark",
            state: "最慢活跃输入决定事件时间"
          },
          {
            thread: "window operator",
            action: "watermark 跨过窗口边界时调用 trigger",
            state: "主 firing 后按 allowed lateness 保留或清理状态"
          }
        ]
      },
      {
        kind: "mechanism",
        eyebrow: "把时间画成状态机",
        title: "timestamp、watermark、timer 与 cleanup 是四个不同动作",
        body: [
          "TimestampAssigner 只给记录标时间；WatermarkGenerator 根据 source/split 已见记录和策略生成进度；算子把多路 watermark 合并后推进内部 timer service；WindowOperator 再根据 namespace 与 trigger fire。任一步都不能由下一步倒推替代。",
          "事件时间 timer 以 key + timestamp 注册，同一 key/timestamp 的重复注册会合并。回调执行时运行时恢复相应 current key，因此可以访问 keyed state。匹配成功后不删除 timer 或 state，会留下幽灵超时和持续增长的状态。",
          "session window 的晚到事件还可能把两个窗口重新 merge；sliding window 会让一条记录属于多个窗口；Evictor 会阻止预聚合。精通的判断标准不是会调用 window，而是能先估算 namespace 数、每条记录复制数和最终清理条件。"
        ],
        trace: [
          {
            thread: "record path",
            action: "assign timestamp → assign window namespace → update state",
            state: "记录可以属于一个或多个窗口"
          },
          {
            thread: "watermark path",
            action: "combine minimum → advance event-time clock → fire timers",
            state: "进度事件不等同于业务记录"
          },
          {
            thread: "cleanup path",
            action: "window end + allowed lateness 后移除窗口状态",
            state: "逻辑最终性与物理状态生命周期对齐"
          }
        ],
        invariant:
          "任何窗口输出都必须被下游解释为 append、upsert 或 retract 中的一种；只要允许 late firing，就不能默认每次 firing 都是一个新的独立事实。"
      },
      {
        kind: "api-decision",
        eyebrow: "选择进度协议",
        title: "bounded out-of-orderness 不是万能参数",
        apiOptions: [
          {
            api: "forBoundedOutOfOrderness",
            useWhen: "能用数据证明每个 split 的乱序上界相对稳定",
            guarantees: "watermark 相对已见最大 timestamp 保留给定延迟",
            doesNotGuarantee: "迟到绝不会超过上界，或所有分区速率相同"
          },
          {
            api: "withIdleness",
            useWhen: "分区可能长期无记录且不应阻塞其他活跃输入",
            guarantees: "idle 输入暂时不参与下游 watermark 最小值",
            doesNotGuarantee: "重新活跃的旧记录仍然 on-time"
          },
          {
            api: "withWatermarkAlignment",
            useWhen: "FLIP-27 sources 之间进度差导致下游 join/window 状态失控",
            guarantees: "通过暂停过快 source/split 限制 watermark drift",
            doesNotGuarantee: "legacy source 或 source 之后赋 watermark 时生效"
          },
          {
            api: "KeyedProcessFunction + timer",
            useWhen: "窗口 API 无法表达自定义相关、超时和清理协议",
            guarantees: "按 key 管理状态并在时间边界回调",
            doesNotGuarantee: "自动删除业务状态或使 processing time 可重放"
          }
        ],
        body: [
          "参数来自业务分布和错误预算：观察各 split 的 out-of-orderness、静默时长、watermark drift 和 late rate，再决定策略。用一个全局 5 秒常量掩盖数据差异，通常只是在延迟与丢数之间盲选。"
        ]
      },
      {
        kind: "implementation",
        eyebrow: "独立实现",
        title: "实现订单—支付事件时间相关器",
        task:
          "使用 KeyedCoProcessFunction 按 orderId 关联订单与支付。订单到达后注册事件时间截止 timer；支付在截止前到达则输出 PAID 并删除状态/timer；截止后输出 UNPAID。另行输出过晚支付，并定义迟到纠正是否产生 UPDATE。",
        constraints: [
          "所有输入 timestamp 来自不可变业务字段，不得使用 System.currentTimeMillis 代替",
          "为订单、支付和 deadline 分别建模状态，状态必须有明确清理路径",
          "两路 source 都要展示 per-split watermark、idleness 与 drift 指标",
          "测试覆盖先支付后订单、同 timestamp、重复事件、idle partition、恢复后 timer",
          "下游输出必须带 orderId、decisionVersion、decisionType 与 evidence timestamp"
        ],
        hints: [
          "先写合法状态转移表，再选择 ValueState/MapState 和 timer。",
          "删除 timer 不是删除状态；两者都要在成功关联和超时路径处理。",
          "若允许迟到纠正，UNPAID→PAID 是更新，不是第二笔独立结果。"
        ],
        adversarialTest:
          "在订单状态写入并注册 timer 后触发 checkpoint，随后失败并从 checkpoint 恢复；推进 watermark 跨过 deadline，断言只输出一个 UNPAID。再让 idle timeout 小于正常分区静默周期，证明 late rate 会升高，而不是把 idleness 当成无损优化。"
      },
      {
        kind: "distributed-boundary",
        eyebrow: "完整性边界",
        title: "watermark 约束的是计算进度，不是真实世界",
        localGuarantee:
          "在给定 source watermark 声明、活跃输入集合与确定性 operator 逻辑下，Flink 按合并后的 watermark 触发事件时间 timer/window，并 checkpoint 相关 managed state。",
        breaksWith:
          "错误 timestamp、过度激进的 idle 判定、source 不支持 split 暂停、外部数据永久迟到、processing-time lookup 和 append-only 下游都会破坏预期。",
        alternatives: [
          "对必须修正的迟到结果使用 upsert/retract sink 与版本字段",
          "对不可修正结果定义明确 late side output、补偿流和审计指标",
          "对业务最终截止使用持久业务状态与补偿协议，不只依赖内存 timer"
        ],
        body: [
          "watermark alignment 是流控：它可以限制快输入领先，从而限制 join/window 状态，但会降低快 source 的读取速度。它不提高事件 timestamp 的真实性，也不消除真实迟到。",
          "processing time 在恢复后可能得到不同结果。若业务需要可重演的历史重算，必须明确哪些 SQL/UDF、lookup 和 timer 依赖墙钟。"
        ]
      },
      {
        kind: "checkpoint",
        eyebrow: "闭卷检查",
        title: "从两个分区的进度推导一个窗口的命运",
        body: [
          "不给 API 名称，只给事件、watermark 与 idle 时间线；你应能手算每一步 current watermark、状态是否保留、是否 firing、输出属于 append 还是 update。"
        ],
        checkpoint: {
          prompt:
            "解释 idle input 与 watermark alignment 为什么方向相反却都与状态大小有关；再说明 allowed lateness 为什么既增加正确性机会，也增加状态和下游更新成本。",
          hint:
            "一个移除最慢的静默输入，一个暂停最快的领先输入；最后把 late firing 当作更新。",
          answer: [
            "idle input 把确认无数据的静默输入暂时排除出最小 watermark，避免整体进度永远不前进。",
            "alignment 暂停过快的 FLIP-27 source/split，避免快输入产生大量必须等待慢输入的缓存状态。",
            "allowed lateness 让主 firing 后的晚到记录仍可更新结果，因此窗口状态必须保存到更晚的 cleanup 边界。",
            "late firing 会产生同一逻辑窗口的新版本；append-only 下游会重复计数，必须使用 upsert/retract 或显式版本补偿。"
          ],
          successCriteria: [
            "能从活跃输入最小值计算下游 watermark",
            "能区分 timestamp assignment、watermark generation、trigger 与 cleanup",
            "能说明 alignment 仅适用于 FLIP-27 Source",
            "能为 timer 与窗口证明恢复、清理和下游更新语义"
          ]
        }
      }
    ],
    references: [
      flinkDoc(
        "Timely Stream Processing",
        "docs/concepts/time/",
        "event time、processing time、watermark、lateness 与 window 的概念基础。"
      ),
      flinkDoc(
        "Generating Watermarks",
        "docs/dev/datastream/event-time/generating_watermarks/",
        "per-source strategy、idleness、watermark alignment 及其 FLIP-27 约束。"
      ),
      flinkDoc(
        "Windows",
        "docs/dev/datastream/operators/windows/",
        "window lifecycle、trigger、allowed lateness、late firing 与状态成本。"
      ),
      flinkDoc(
        "Process Function",
        "docs/dev/datastream/operators/process_function/",
        "KeyedProcessFunction、TimerService 与 keyed timer 语义。"
      )
    ]
  })
].sort((left, right) => left.week - right.week);

export const flinkModules: FlinkModule[] = [
  {
    id: "runtime",
    title: "分布式 Dataflow 与运行时",
    question: "一条记录从 main 到 sink，究竟在哪个进程、task 和线程执行？",
    outcome:
      "能还原 StreamGraph→JobGraph→execution attempt，解释 chaining、slot、mailbox、partition 与顺序边界。",
    lessonSlug: "flink-dataflow-runtime",
    topics: ["Dataflow", "JobMaster", "TaskManager", "Operator Chain", "Mailbox"]
  },
  {
    id: "time",
    title: "时间、水位线与定时器",
    question: "系统凭什么宣布一个事件时间结果已经完整？",
    outcome:
      "能从活跃输入最小 watermark 推导 window/timer/late firing，并设计 idleness、alignment 与补偿。",
    lessonSlug: "flink-event-time-watermarks",
    topics: ["Event Time", "Watermark", "Idleness", "Window", "Timer"]
  },
  {
    id: "state",
    title: "状态、Key Group 与序列化",
    question: "并行度和代码都变了，旧状态字节为什么仍能或不能恢复？",
    outcome:
      "能设计 state owner、key-group/rescale、serializer evolution、backend 与 TTL 的完整合同。",
    lessonSlug: "flink-state-serialization",
    topics: ["Managed State", "Key Group", "Serializer", "TTL", "State Backend"]
  },
  {
    id: "checkpoint",
    title: "Checkpoint 与 Exactly-once",
    question: "一个 completed checkpoint 到底证明了什么，还没有证明什么？",
    outcome:
      "能手算一致切面，区分 aligned/unaligned，并完成 source—state—sink 端到端证明。",
    lessonSlug: "flink-checkpoint-exactly-once",
    topics: ["Barrier", "Checkpoint", "Unaligned", "Channel State", "Exactly-once"]
  },
  {
    id: "network",
    title: "网络栈、反压与流量控制",
    question: "Source 显示反压时，真正的慢点可能在哪里？",
    outcome:
      "能沿 buffer/credit 定位 CPU、I/O、skew 与隐藏队列，并量化 debloat/async/checkpoint 取舍。",
    lessonSlug: "flink-network-backpressure",
    topics: ["Network Buffer", "Credit", "Backpressure", "Skew", "Async I/O"]
  },
  {
    id: "recovery",
    title: "Rescaling、Failover 与升级",
    question: "故障或新并行度下，状态如何找到正确的新 attempt？",
    outcome:
      "能设计 region failover、状态重分配、uid/maxParallelism、canonical savepoint 与 epoch fencing。",
    lessonSlug: "flink-rescaling-failover-upgrades",
    topics: ["Failover Region", "Restart", "Rescaling", "Savepoint", "HA"]
  },
  {
    id: "source",
    title: "FLIP-27 Source",
    question: "谁拥有一个 split，失败后如何证明它既没有丢也没有双重提交？",
    outcome:
      "能实现 Enumerator/Reader/Split serializer、线程取消、watermark alignment 与 chaos/rescale 测试。",
    lessonSlug: "flink-source-connector",
    topics: ["FLIP-27", "SplitEnumerator", "SourceReader", "Offset", "Watermark"]
  },
  {
    id: "sink",
    title: "Sink V2 与 Connector 正确性",
    question: "flush、precommit、checkpoint completion 与 external commit 有何差别？",
    outcome:
      "能实现 sink2 writer/committable/committer、幂等重试、事务 fencing 和升级兼容。",
    lessonSlug: "flink-sink-connector",
    topics: ["Sink V2", "SinkWriter", "Committable", "Committer", "Transaction"]
  },
  {
    id: "sql",
    title: "动态表、SQL 与优化器",
    question: "一条声明式 SQL 为什么会生成更新流、状态和 shuffle？",
    outcome:
      "能手推 RowKind/changelog，阅读 EXPLAIN，审计 join、NDU、TTL、pushdown 与 sink negotiation。",
    lessonSlug: "flink-sql-optimizer",
    topics: ["Dynamic Table", "Changelog", "EXPLAIN", "Join", "Determinism"]
  },
  {
    id: "performance",
    title: "性能证据与容量诊断",
    question: "吞吐下降、checkpoint 变慢和容器重启，怎样用证据区分根因？",
    outcome:
      "能建立 SLO→subtask→JVM/native→backend→external 的可证伪诊断与容量曲线。",
    lessonSlug: "flink-performance-diagnostics",
    topics: ["Metrics", "Checkpoint Phases", "Memory", "Profiling", "Capacity"]
  },
  {
    id: "operations",
    title: "生产部署、HA 与运维",
    question: "集群完全消失后，凭哪些事实安全重建并验证同一条作业？",
    outcome:
      "能交付不可变发布单元、安全余量告警、升级/回滚、HA game day 与事故 runbook。",
    lessonSlug: "flink-production-operations",
    topics: ["Deployment", "Classloading", "HA", "SLO", "Runbook"]
  },
  {
    id: "source-code",
    title: "源码阅读与毕业审计",
    question: "怎样把一个源码实现路径变成可证伪、可升级的工程结论？",
    outcome:
      "能完成 graph/barrier/connector-SQL 三条 trace，并用真实故障切点交付窄加固和恢复证据。",
    lessonSlug: "flink-source-code-capstone",
    topics: ["Source Code", "Runtime Trace", "Failure Path", "Compatibility", "Capstone"]
  }
];
