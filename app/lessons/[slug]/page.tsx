import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { CopyCode } from "@/components/copy-code";
import { ProgressButton } from "@/components/progress-button";
import { getLesson, publishedLessons } from "@/lib/content";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return publishedLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return lesson
    ? { title: lesson.title, description: lesson.dek }
    : { title: "未找到课程" };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  const index = publishedLessons.findIndex((item) => item.slug === lesson.slug);
  const previous = index > 0 ? publishedLessons[index - 1] : null;
  const next =
    index < publishedLessons.length - 1 ? publishedLessons[index + 1] : null;

  return (
    <article>
      <header className="article-hero">
        <div className="shell article-shell">
          <div className="article-meta">
            <span>第 {lesson.week.toString().padStart(2, "0")} 周</span>
            <span>{lesson.readTime}</span>
            <span>Java 并发</span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.dek}</p>
          <div className="article-tags">
            {lesson.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="shell article-layout">
        <aside className="article-aside">
          <div className="toc">
            <p>本课内容</p>
            {lesson.sections.map((section, sectionIndex) => (
              <a href={`#section-${sectionIndex + 1}`} key={section.title}>
                <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
            <a href="#explain-back">
              <span>{String(lesson.sections.length + 1).padStart(2, "0")}</span>
              复述并解释
            </a>
          </div>
        </aside>

        <div className="article-content">
          <div className="key-idea">
            <span>记住这个核心观点</span>
            <p>{lesson.keyIdea}</p>
          </div>

          {lesson.sections.map((section, sectionIndex) => (
            <section id={`section-${sectionIndex + 1}`} key={section.title}>
              <p className="eyebrow">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
              {section.sequence && (
                <ol aria-label="启动顺序" className="runtime-sequence">
                  {section.sequence.map((step) => (
                    <li key={step.title}>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {section.code && (
                <div className="code-block">
                  <div className="code-header">
                    <span>{section.codeLabel ?? "Java"}</span>
                    <CopyCode code={section.code} />
                  </div>
                  <pre>
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}
              {section.comparison && (
                <div className="runtime-comparison">
                  {section.comparison.map((item) => (
                    <article key={item.title}>
                      <span>{item.label}</span>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      <ul>
                        {item.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
              {section.note && (
                <aside className="article-note">
                  <strong>暂停并推理</strong>
                  <p>{section.note}</p>
                </aside>
              )}
            </section>
          ))}

          <section className="explain-back" id="explain-back">
            <p className="eyebrow">回忆检查</p>
            <h2>先回答，再检查推理。</h2>
            <p className="explain-back-intro">
              所有答案默认折叠。请先口头或书面作答，再展开卡片，对照其中的
              机制、API 选择与分布式系统后果。
            </p>
            <ol className="question-list">
              {lesson.questions.map((question) => (
                <li key={question.prompt}>
                  <details className="question-card">
                    <summary>
                      <span>{question.prompt}</span>
                      <small aria-hidden="true" />
                    </summary>
                    <div className="question-answer">
                      <p className="answer-label">详细解答</p>
                      {question.answer.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {question.bullets && (
                        <ul>
                          {question.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                      {question.code && (
                        <div className="code-block answer-code">
                          <div className="code-header">
                            <span>{question.codeLabel ?? "Java"}</span>
                            <CopyCode code={question.code} />
                          </div>
                          <pre>
                            <code>{question.code}</code>
                          </pre>
                        </div>
                      )}
                      {question.alternatives && (
                        <div className="api-options">
                          <p className="answer-label">按契约选择</p>
                          {question.alternatives.map((alternative) => (
                            <article key={alternative.api}>
                              <h3>{alternative.api}</h3>
                              <p>{alternative.fit}</p>
                              <small>{alternative.tradeoff}</small>
                            </article>
                          ))}
                        </div>
                      )}
                      {question.distributed && (
                        <aside className="distributed-note">
                          <strong>跨进程或跨机器边界</strong>
                          <p>{question.distributed}</p>
                        </aside>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
            <details className="ai-help">
              <summary>何时可以向 AI 求助？</summary>
              <p>
                先写出不变量、共享状态、失败行为和拟采用的同步方式。先请 AI
                以苏格拉底式提问审阅，再请求代码。只有你自己的可编译尝试通过
                审阅后，才查看完整实现。
              </p>
            </details>
          </section>

          <div className="article-completion">
            <div>
              <strong>阅读不是终点。</strong>
              <p>只有完成实验和复述解释后，才标记为完成。</p>
            </div>
            <ProgressButton slug={lesson.slug} />
          </div>

          <nav aria-label="课程导航" className="article-nav">
            {previous ? (
              <Link href={`/lessons/${previous.slug}`}>
                <span>上一课</span>
                <strong>← {previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/lessons/${next.slug}`}>
                <span>下一课</span>
                <strong>
                  {next.title} <ArrowIcon />
                </strong>
              </Link>
            ) : (
              <Link href="/roadmap">
                <span>继续学习</span>
                <strong>
                  查看学习路线 <ArrowIcon />
                </strong>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </article>
  );
}
