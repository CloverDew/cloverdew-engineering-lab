import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { phases } from "@/lib/content";
import { getPublishedLessonsByTrack } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "24 周 Java 与系统工程学习路线图",
  description: "Cloverdew 工程实验室的 24 周 Java 并发与系统工程主线。"
};

const months = [
  {
    month: "01",
    title: "共享状态与协作",
    weeks: [
      "线程与丢失更新",
      "可见性与先行发生（happens-before）",
      "原子状态迁移",
      "从第一性原理实现有界队列"
    ],
    gate: "实现、破坏并解释一个有界监视器队列。"
  },
  {
    month: "02",
    title: "执行生命周期",
    weeks: [
      "条件变量与租户许可",
      "有界执行器与过载",
      "取消与关闭",
      "活性与初步度量"
    ],
    gate: "为 QueryGate 的容量、状态和关闭策略做出论证。"
  },
  {
    month: "03",
    title: "运行时证据",
    weeks: [
      "进程、线程与调度",
      "JVM 分配与 GC",
      "远程调用与截止时间",
      "竞争与严谨基准测试"
    ],
    gate: "从一次线程转储或 JFR 记录中解释一个延迟事件。"
  },
  {
    month: "04",
    title: "查询与流式系统行为",
    weeks: [
      "查询执行流水线",
      "公平的租户调度",
      "CDC 生产者与背压",
      "幂等性与交付语义"
    ],
    gate: "在明确的负载下量化租户等待时间和 CDC 延迟。"
  },
  {
    month: "05",
    title: "面向 AI 的可信数据",
    weeks: [
      "确定性上下文规划",
      "数据新鲜度与 CDC 驱动的上下文",
      "指标、追踪与 SLO",
      "故障注入演练"
    ],
    gate: "证明先校验权限再检索，并追踪结果溯源。"
  },
  {
    month: "06",
    title: "工程证明",
    weeks: [
      "正确性审计",
      "容量曲线",
      "作品集设计文档",
      "技术答辩与 v1.0"
    ],
    gate: "重新实现一个机制，并在不借助 AI 的情况下捍卫该系统。"
  }
];

export default function RoadmapPage() {
  const firstLesson = getPublishedLessonsByTrack("java-concurrency")[0];
  const startLabel =
    firstLesson.week === 0 ? "从准备单元开始" : "从第 1 周开始";

  return (
    <>
      <section className="page-hero">
        <div className="shell narrow">
          <p className="eyebrow">24 个有效学习周 · 48 个专注小时</p>
          <h1>
            通向系统所有权的
            <br />
            窄而深之路。
          </h1>
          <p>
            先用一个不计入 24 周的 Java 阅读桥接单元补齐代码阅读坐标，再进入每周
            两小时的深度练习。这里始终是 Java 与系统工程主线；Flink
            精通内容拥有独立轨道，不挤占这 24 周。生活打断学习时，计划随之顺延。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="roadmap-principles">
            <div>
              <strong>一个项目</strong>
              <span>QueryGate 每月持续演进。</span>
            </div>
            <div>
              <strong>一项机制</strong>
              <span>每周都有一个明确而聚焦的实现目标。</span>
            </div>
            <div>
              <strong>一道面试题</strong>
              <span>二十分钟，到点停止。</span>
            </div>
            <div>
              <strong>一个检查点</strong>
              <span>每四周由证据决定学习节奏。</span>
            </div>
          </div>

          <div className="month-list">
            {months.map((item) => (
              <article className="month-row" key={item.month}>
                <div className="month-index">{item.month}</div>
                <div className="month-title">
                  <p>第 {Number(item.month)} 月</p>
                  <h2>{item.title}</h2>
                </div>
                <ol>
                  {item.weeks.map((week, index) => (
                    <li key={week}>
                      <span>
                        第{(Number(item.month) - 1) * 4 + index + 1}周
                      </span>
                      {week}
                    </li>
                  ))}
                </ol>
                <div className="month-gate">
                  <span>通过门槛</span>
                  <p>{item.gate}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section roadmap-phases">
        <div className="shell">
          <p className="eyebrow">三个核心问题</p>
          <div className="phase-question-list">
            {phases.map((phase) => (
              <div key={phase.id}>
                <span>{phase.id}</span>
                <h3>{phase.question}</h3>
              </div>
            ))}
          </div>
          <div className="roadmap-actions">
            <Link className="button button-primary" href={`/lessons/${firstLesson.slug}`}>
              {startLabel} <ArrowIcon />
            </Link>
            <Link className="button button-quiet" href="/flink">
              查看独立 Flink 精通轨道 <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
