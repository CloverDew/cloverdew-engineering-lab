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
            <h2>Explain it back without notes.</h2>
            <ol>
              {lesson.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
            <details>
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
