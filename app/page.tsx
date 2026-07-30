import Link from "next/link";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { LessonFilter } from "@/components/lesson-filter";
import { lessons, phases, publishedLessons } from "@/lib/content";

export default function HomePage() {
  const current = publishedLessons[0];
  const startLabel = current.week === 0 ? "从准备单元开始" : "从第 1 周开始";
  const featuredNumber = current.week.toString().padStart(2, "0");

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="kicker">
              <span className="status-dot" />
              为期 24 周的系统工程学习路径
            </div>
            <h1>
              读懂代码。
              <br />
              <em>掌控系统。</em>
            </h1>
            <p className="hero-dek">
              以实验为先的深入课程，帮助你建立 Java 并发基础，并将这套
              推理方法带入查询引擎、流式系统和面向 AI 的可信数据基础设施。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/lessons/${current.slug}`}>
                {startLabel} <ArrowIcon />
              </Link>
              <Link className="button button-quiet" href="/roadmap">
                查看学习路线
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <CheckIcon /> 每周 2 小时
              </span>
              <span>
                <CheckIcon /> 一个累积项目
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
              <small>querygate://当前学习路径</small>
            </div>
            <div className="terminal-body">
              <p className="terminal-comment">// 当前目标</p>
              <p>
                <span className="terminal-key">证明</span>(
                <span className="terminal-string">
                  &quot;并发正确性&quot;
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
              <p className="eyebrow">当前学习路径</p>
              <h2>先理解失败，再选择 API。</h2>
            </div>
            <p>
              每节课都将具体实验、可展开的答案、Java API 取舍、失败示例与
              面向分布式系统的生产实践连接起来。
            </p>
          </div>
          <Link className="featured-lesson" href={`/lessons/${current.slug}`}>
            <div className="featured-number">{featuredNumber}</div>
            <div>
              <p className="eyebrow">接下来阅读 · {current.readTime}</p>
              <h3>{current.title}</h3>
              <p>{current.dek}</p>
            </div>
            <span className="round-arrow">
              <ArrowIcon size={22} />
            </span>
          </Link>
        </div>
      </section>

      <section className="section phase-section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">学习主线</p>
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
              <h2>从读懂 Java，到证明并发正确性。</h2>
            </div>
            <p>
              目前已有 {publishedLessons.length} 节可学习内容，包含一个准备单元。
              后续课程保持可见，让学习顺序清晰，同时不造成负担。
            </p>
          </div>
          <LessonFilter lessons={lessons} />
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
