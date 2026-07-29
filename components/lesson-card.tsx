import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import type { Lesson } from "@/lib/content";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const content = (
    <>
      <div className="lesson-card-topline">
        <span>Week {lesson.week.toString().padStart(2, "0")}</span>
        <span>{lesson.readTime}</span>
      </div>
      <h3>{lesson.title}</h3>
      <p>{lesson.dek}</p>
      <div className="tag-row">
        {lesson.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="lesson-card-action">
        {lesson.status === "published" ? (
          <>
            Read lesson <ArrowIcon />
          </>
        ) : (
          "Coming soon"
        )}
      </div>
    </>
  );

  return lesson.status === "published" ? (
    <Link className="lesson-card" href={`/lessons/${lesson.slug}`}>
      {content}
    </Link>
  ) : (
    <article className="lesson-card is-upcoming">{content}</article>
  );
}
