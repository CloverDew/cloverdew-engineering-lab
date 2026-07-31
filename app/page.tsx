import Link from "next/link";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { LessonFilter } from "@/components/lesson-filter";
import { phases } from "@/lib/content";
import {
  getPublishedLessonsByTrack,
  lessonSummaries,
  publishedLessons
} from "@/lib/curriculum";

export default function HomePage() {
  const current = getPublishedLessonsByTrack("java-concurrency")[0];
  const flinkPublishedLessons =
    getPublishedLessonsByTrack("flink-mastery");
  const startLabel = current.week === 0 ? "从准备单元开始" : "从第 1 周开始";
  const featuredNumber = current.week.toString().padStart(2, "0");

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="kicker">
              <span className="status-dot" />
              Java 并发主线 · Flink 精通轨道
            </div>
            <h1>
              读懂代码，
              <br />
              <em>掌控系统。</em>
            </h1>
            <p className="hero-dek">
              先用实验和反例证明 Java 并发正确性，再沿着独立的 Flink
              高级轨道进入运行时、状态、时间、检查点与端到端一致性的真实边界。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/lessons/${current.slug}`}>
                {startLabel} <ArrowIcon />
              </Link>
              <Link className="button button-quiet" href="/flink">
                进入 Flink 精通轨道
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <CheckIcon /> 24 周 Java 主线
              </span>
              <span>
                <CheckIcon /> 12 个 Flink 深度模块
              </span>
              <span>
                <CheckIcon /> 证据胜过熟悉感
              </span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="terminal-bar">
              <span />
              <span />
              <span />
              <small>cloverdew://系统学习契约</small>
            </div>
            <div className="terminal-body">
              <p className="terminal-comment">// 当前目标</p>
              <p>
                <span className="terminal-key">证明</span>(
                <span className="terminal-string">
                  &quot;系统行为&quot;
                </span>
                );
              </p>
              <div className="terminal-rule" />
              <dl>
                <div>
                  <dt>01</dt>
                  <dd>
                    <strong>预测</strong>
                    <span>预期行为与失败模式</span>
                  </dd>
                </div>
                <div>
                  <dt>02</dt>
                  <dd>
                    <strong>实现</strong>
                    <span>从不变量出发，不依赖生成代码</span>
                  </dd>
                </div>
                <div>
                  <dt>03</dt>
                  <dd>
                    <strong>破坏</strong>
                    <span>对抗性测试与故障注入</span>
                  </dd>
                </div>
                <div>
                  <dt>04</dt>
                  <dd>
                    <strong>解释</strong>
                    <span>机制、证据与生产迁移</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section current-section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">两条独立学习轨道</p>
              <h2>先建立证明能力，再深入框架机制。</h2>
            </div>
            <p>
              Java 主线保留完整的 24 周 QueryGate 计划；Flink
              轨道面向已有作业开发经验的工程师，以运行时不变量、故障恢复和生产证据为主。
            </p>
          </div>
          <div className="track-entry-grid">
            <Link className="featured-lesson" href={`/lessons/${current.slug}`}>
              <div className="featured-number">{featuredNumber}</div>
              <div>
                <p className="eyebrow">Java 并发主线 · {current.readTime}</p>
                <h3>{current.title}</h3>
                <p>{current.dek}</p>
              </div>
              <span className="round-arrow">
                <ArrowIcon size={22} />
              </span>
            </Link>
            <Link className="flink-track-entry" href="/flink">
              <div className="flink-track-entry-meta">
                <span>高级独立轨道</span>
                <span>{flinkPublishedLessons.length} 个模块</span>
              </div>
              <h3>从“会写 Flink 作业”走到“能解释运行时为何正确”</h3>
              <p>
                追踪数据、状态、时间和 barrier 在失败前后的移动方式，并用实验验证
                checkpoint、反压、重调度与端到端一致性的边界。
              </p>
              <strong>
                查看完整 Flink 路线 <ArrowIcon />
              </strong>
            </Link>
          </div>
        </div>
      </section>

      <section className="section phase-section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Java 主线 · 24 周</p>
            <h2>一个系统，三层责任。</h2>
          </div>
          <div className="phase-grid">
            {phases.map((phase) => (
              <article className="phase-card" key={phase.id}>
                <div className="phase-meta">
                  <span>{phase.id}</span>
                  <span>{phase.weeks}</span>
                </div>
                <h3>{phase.title}</h3>
                <p>{phase.question}</p>
                <div className="phase-outcome">{phase.outcome}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section library-section" id="library">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">课程库</p>
              <h2>
                从 Java 并发，
                <br />
                到 Flink 运行时。
              </h2>
            </div>
            <p>
              目前共有 {publishedLessons.length} 节已发布内容，分属 Java
              并发主线与 Flink 精通轨道。可按轨道、状态或概念筛选。
            </p>
          </div>
          <LessonFilter lessons={lessonSummaries} />
        </div>
      </section>

      <section className="section manifesto-section">
        <div className="shell manifesto">
          <p className="eyebrow">学习标准</p>
          <blockquote>
            “偶然运行正确的代码，并不等于可以证明其正确。”
          </blockquote>
          <div className="manifesto-grid">
            <p>
              写下不变量，识别共享状态，展示 happens-before 边，限制资源
              使用，并定义失败与关闭行为。
            </p>
            <Link className="text-link" href="/project">
              查看 QueryGate 如何把这些原则落到实践中 <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
