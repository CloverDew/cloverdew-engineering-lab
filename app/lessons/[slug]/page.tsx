import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { CopyCode } from "@/components/copy-code";
import {
  getLearningBlockId,
  getLearningBlockKindLabel,
  getLearningBlockNavigationLabel,
  LearningBlocks
} from "@/components/learning-blocks";
import {
  type LessonNavigationItem,
  LessonStepNavigation
} from "@/components/lesson-step-navigation";
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
  const learningBlocks = lesson.learningBlocks ?? [];
  const hasLearningBlocks = learningBlocks.length > 0;
  const checkpointPrompts = learningBlocks.flatMap((block) =>
    block.checkpoint ? [block.checkpoint.prompt] : []
  );
  const retrievalPrompts =
    checkpointPrompts.length > 0
      ? checkpointPrompts
      : learningBlocks
          .flatMap((block) => (block.goal ? [block.goal] : []))
          .slice(0, 3);
  const unitLabel =
    lesson.week === 0
      ? "准备单元"
      : `第 ${lesson.week.toString().padStart(2, "0")} 周`;
  const subjectLabel = lesson.week === 0 ? "Java 阅读基础" : "Java 并发";
  const navigationItems: LessonNavigationItem[] = hasLearningBlocks
    ? [
        ...learningBlocks.map((block, blockIndex) => ({
          id: getLearningBlockId(blockIndex),
          index: blockIndex + 1,
          label: getLearningBlockNavigationLabel(block),
          shortLabel: getLearningBlockKindLabel(block.kind)
        })),
        {
          id: "explain-back",
          index: learningBlocks.length + 1,
          label: "讲给别人听",
          shortLabel: "复述"
        }
      ]
    : [
        ...lesson.sections.map((section, sectionIndex) => ({
          id: `section-${sectionIndex + 1}`,
          index: sectionIndex + 1,
          label: section.title
        })),
        {
          id: "explain-back",
          index: lesson.sections.length + 1,
          label: "复述并解释"
        }
      ];

  return (
    <article>
      <header className="article-hero">
        <div className="shell article-shell">
          <div className="article-meta">
            <span>{unitLabel}</span>
            <span>{lesson.readTime}</span>
            <span>{subjectLabel}</span>
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
          <LessonStepNavigation
            ariaLabel={hasLearningBlocks ? "本课步骤" : "本课内容"}
            items={navigationItems}
            title={hasLearningBlocks ? "本课步骤" : "本课内容"}
            variant="desktop"
          />
        </aside>

        <div className="article-content">
          <div className="key-idea">
            <span>先记住这一句</span>
            <p>{lesson.keyIdea}</p>
          </div>

          {hasLearningBlocks && (
            <LessonStepNavigation
              ariaLabel="本课学习步骤（移动端）"
              items={navigationItems}
              variant="mobile"
            />
          )}

          {hasLearningBlocks ? (
            <>
              <LearningBlocks
                blocks={learningBlocks}
                codeFirst={lesson.week >= 2}
              />
              {lesson.references?.length ? (
                <section
                  aria-labelledby="official-references-title"
                  className="lesson-references"
                  id="official-references"
                >
                  <p className="eyebrow">继续查证</p>
                  <h2 id="official-references-title">本课依据的官方资料</h2>
                  <p className="lesson-references-intro">
                    正文按问题重新组织，并非逐段翻译。需要确认精确语义时，请回到下面这些一手资料。
                  </p>
                  <ul>
                    {lesson.references.map((reference) => (
                      <li key={reference.href}>
                        <a
                          href={reference.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {reference.title}
                        </a>
                        <p>{reference.note}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section className="explain-back learning-retrieval" id="explain-back">
                <p className="eyebrow">最后做一次回忆</p>
                <h2>合上正文，试着讲给别人听。</h2>
                <p className="explain-back-intro">
                  先别翻回上文，也先别问 AI。试着说清：这节课解决了什么
                  问题、关键规则是什么，以及你会用什么例子证明它。
                </p>
                {retrievalPrompts.length > 0 ? (
                  <ol className="question-list learning-retrieval-list">
                    {retrievalPrompts.map((prompt, promptIndex) => (
                      <li key={`${promptIndex}-${prompt}`}>
                        <p>{prompt}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>
                    从本课任取一个 API，用“它保护什么、它不保护什么、跨 JVM 后会
                    怎样”这三个问题复述它的边界。
                  </p>
                )}
              </section>
            </>
          ) : (
            <>
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
            </>
          )}

          <div className="article-completion">
            <div>
              <strong>看完还不算学会。</strong>
              <p>做完实验，并能脱离正文讲清楚，再标记为完成。</p>
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
