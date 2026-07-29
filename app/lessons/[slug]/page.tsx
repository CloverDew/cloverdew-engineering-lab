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
    : { title: "Lesson not found" };
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
            <span>Week {lesson.week.toString().padStart(2, "0")}</span>
            <span>{lesson.readTime}</span>
            <span>Java concurrency</span>
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
            <p>In this lesson</p>
            {lesson.sections.map((section, sectionIndex) => (
              <a href={`#section-${sectionIndex + 1}`} key={section.title}>
                <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
            <a href="#explain-back">
              <span>{String(lesson.sections.length + 1).padStart(2, "0")}</span>
              Explain it back
            </a>
          </div>
        </aside>

        <div className="article-content">
          <div className="key-idea">
            <span>Keep this idea</span>
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
                <ol aria-label="Startup sequence" className="runtime-sequence">
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
                  <strong>Pause and reason</strong>
                  <p>{section.note}</p>
                </aside>
              )}
            </section>
          ))}

          <section className="explain-back" id="explain-back">
            <p className="eyebrow">Retrieval check</p>
            <h2>Answer first. Then inspect the reasoning.</h2>
            <p className="explain-back-intro">
              Each answer is hidden by default. Say or write your answer before
              expanding the card, then compare the mechanism, API choices, and
              distributed-system consequence.
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
                      <p className="answer-label">Detailed answer</p>
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
                          <p className="answer-label">Choose by contract</p>
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
                          <strong>Across process or machine boundaries</strong>
                          <p>{question.distributed}</p>
                        </aside>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
            <details className="ai-help">
              <summary>When may I ask AI for help?</summary>
              <p>
                First write your invariant, shared state, failure behavior, and
                proposed synchronization. Ask for a Socratic review before
                requesting code. A complete implementation is available only
                after your own compiling attempt passes review.
              </p>
            </details>
          </section>

          <div className="article-completion">
            <div>
              <strong>Reading is not the finish line.</strong>
              <p>Mark complete only after the experiment and explain-back.</p>
            </div>
            <ProgressButton slug={lesson.slug} />
          </div>

          <nav aria-label="Lesson navigation" className="article-nav">
            {previous ? (
              <Link href={`/lessons/${previous.slug}`}>
                <span>Previous</span>
                <strong>← {previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/lessons/${next.slug}`}>
                <span>Next lesson</span>
                <strong>
                  {next.title} <ArrowIcon />
                </strong>
              </Link>
            ) : (
              <Link href="/roadmap">
                <span>Continue</span>
                <strong>
                  View the roadmap <ArrowIcon />
                </strong>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </article>
  );
}
