import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import {
  getLessonTrackLabel,
  getLessonUnitLabel,
  type LessonSummary
} from "@/lib/curriculum-meta";

export function LessonCard({ lesson }: { lesson: LessonSummary }) {
  const unitLabel = getLessonUnitLabel(lesson);
  const trackLabel = getLessonTrackLabel(lesson);

  const content = (
    <>
      <div className="lesson-card-topline">
        <span>
          {trackLabel} · {unitLabel}
        </span>
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
            查看课程 <ArrowIcon />
          </>
        ) : (
          "即将推出"
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
