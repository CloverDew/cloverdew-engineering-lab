import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { flinkLessons, flinkModules } from "@/lib/flink-content";

export const metadata: Metadata = {
  title: "Flink 精通轨道",
  description:
    "面向有 Flink 作业开发经验工程师的 12 模块深度课程：从运行时拓扑、时间与状态进入检查点、故障恢复和端到端一致性。"
};

const masteryGates = [
  {
    title: "画得出",
    body: "能从 JobGraph 一直追到 ExecutionGraph、Task、网络通道和状态归属，并解释每次转换损失或增加了什么信息。"
  },
  {
    title: "推得动",
    body: "给定 watermark、barrier、反压、失败与重调度时间线，能在不运行作业前先推导状态与输出。"
  },
  {
    title: "证得明",
    body: "能用可重复实验、指标、日志、checkpoint 元数据和故障注入区分猜测、相关性与因果证据。"
  },
  {
    title: "守得住",
    body: "能为状态大小、恢复时间、外部副作用、升级兼容和资源上限写出明确不变量与上线门槛。"
  }
];

export default function FlinkPage() {
  const firstLesson =
    flinkLessons.find((lesson) => lesson.week === 1) ?? flinkLessons[0];
  const lessonBySlug = new Map(
    flinkLessons.map((lesson) => [lesson.slug, lesson])
  );

  return (
    <>
      <section className="flink-hero">
        <div className="shell flink-hero-grid">
          <div>
            <p className="eyebrow">独立高级轨道 · {flinkModules.length} 个模块</p>
            <h1>
              不只会写作业，
              <br />
              <em>还要看见 Flink 如何活着。</em>
            </h1>
            <p className="flink-hero-dek">
              这不是 API 速查表，也不是从零入门。课程默认你写过 Flink
              作业，从数据、状态、时间和故障四条主线追进运行时，用预测、实验和恢复证据建立可迁移的系统模型。
            </p>
            <div className="hero-actions">
              <Link
                className="button button-primary"
                href={`/lessons/${firstLesson.slug}`}
              >
                从模块 01 开始 <ArrowIcon />
              </Link>
              <Link className="button button-dark-quiet" href="#modules">
                查看 12 模块
              </Link>
            </div>
          </div>

          <aside className="flink-version-card" aria-label="课程版本口径">
            <p className="eyebrow">版本口径</p>
            <h2>机制要稳定，版本差异要显式。</h2>
            <p>
              课程基线为 <strong>Apache Flink 2.3.0 + Java 17</strong>
              （核验于 2026-07-31），生产主线使用经典 DataStream API；Flink
              1.20 仅作迁移对照。DataStream V2、State V2 与 ForSt 在 2.3
              中均按 Experimental 边界学习，不把实验性 API 写成稳定承诺。
            </p>
            <ul>
              <li>
                <CheckIcon /> Java、Flink 与连接器版本在实验入口处声明
              </li>
              <li>
                <CheckIcon /> 官方文档、Javadocs 与 FLIP 用于查证契约
              </li>
              <li>
                <CheckIcon /> 版本变化与运行时不变量分开讨论
              </li>
              <li>
                <CheckIcon /> 实验命令是验收合同；先独立完成对应 Lab
                脚手架，不附完成版答案工程
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section flink-positioning">
        <div className="shell split-heading">
          <div>
            <p className="eyebrow">学习定位</p>
            <h2>从“熟悉”升级为可证明的掌握。</h2>
          </div>
          <p>
            每个模块都要求先做预测，再观察执行证据；先写出不变量和故障模型，再讨论
            API。读完正文只是开始，能够独立解释一次失败、设计一个反例并守住生产边界，才算通过。
          </p>
        </div>
      </section>

      <section className="section flink-modules-section" id="modules">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">课程地图</p>
              <h2>十二次深入，形成一张完整运行时地图。</h2>
            </div>
            <p>
              模块按因果依赖排序。不要把它当成文章合集跳着浏览；后面的状态恢复、端到端一致性与生产诊断，都依赖前面建立的执行和时间模型。
            </p>
          </div>

          <ol className="flink-module-grid">
            {flinkModules.map((module, index) => {
              const lesson = lessonBySlug.get(module.lessonSlug);

              return (
                <li key={module.id}>
                  <Link
                    className="flink-module-card"
                    href={`/lessons/${module.lessonSlug}`}
                  >
                    <div className="flink-module-index">
                      <span>{module.id}</span>
                      <small>{lesson?.readTime ?? "深度模块"}</small>
                    </div>
                    <h3>{module.title}</h3>
                    <p>{module.question}</p>
                    <ul aria-label={`${module.title} 主题`}>
                      {module.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                    <div className="flink-module-outcome">
                      <span>掌握结果</span>
                      <p>{module.outcome}</p>
                    </div>
                    <strong>
                      进入模块 {String(index + 1).padStart(2, "0")}{" "}
                      <ArrowIcon />
                    </strong>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="section flink-mastery-section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">最终掌握门槛</p>
            <h2>精通不是记住更多名词，而是承担四种证明责任。</h2>
          </div>
          <div className="flink-mastery-grid">
            {masteryGates.map((gate, index) => (
              <article key={gate.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{gate.title}</h3>
                <p>{gate.body}</p>
              </article>
            ))}
          </div>
          <div className="flink-final-cta">
            <div>
              <p className="eyebrow">开始前先接受一个约束</p>
              <h2>不要先问配置值，先问系统必须守住什么。</h2>
            </div>
            <Link
              className="button button-primary"
              href={`/lessons/${firstLesson.slug}`}
            >
              开始模块 01 <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
