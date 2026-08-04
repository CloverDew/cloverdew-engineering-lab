import Link from "next/link";
import { ArrowIcon, CheckIcon, LockIcon } from "@/components/icons";
import type { LessonProgressState } from "@/components/course-progress-provider";
import {
  getLessonTrackLabel,
  getLessonUnitLabel,
  type LessonSummary
} from "@/lib/curriculum-meta";

type LessonCardProps = {
  lesson: LessonSummary;
  progressState: LessonProgressState;
};

export function LessonCard({ lesson, progressState }: LessonCardProps) {
  const unitLabel = getLessonUnitLabel(lesson);
  const trackLabel = getLessonTrackLabel(lesson);
  const state = lesson.status === "upcoming" ? "upcoming" : progressState;
  const isAvailable = state === "completed" || state === "current";
  const stateLabel = {
    completed: "已完成",
    current: "当前可学",
    locked: "未解锁",
    upcoming: "即将推出"
  }[state];

  const content = (
    <>
      <div className="lesson-card-topline">
        <span>
          {trackLabel} · {unitLabel}
        </span>
        <span>{lesson.readTime}</span>
      </div>
      <div className="lesson-card-status">
        {state === "completed" ? (
          <CheckIcon size={15} />
        ) : state === "current" ? (
          <ArrowIcon size={15} />
        ) : (
          <LockIcon size={15} />
        )}
        <span>{stateLabel}</span>
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
        {state === "completed" ? (
          <>
            复习课程 <ArrowIcon />
          </>
        ) : state === "current" ? (
          <>
            进入课程 <ArrowIcon />
          </>
        ) : state === "locked" ? (
          <>
            <LockIcon size={15} /> 完成上一课后解锁
          </>
        ) : (
          <>
            <LockIcon size={15} /> 内容准备中
          </>
        )}
      </div>
    </>
  );

  const className = `lesson-card is-${state}`;

  return isAvailable ? (
    <Link
      className={className}
      data-progress-state={state}
      href={`/lessons/${lesson.slug}`}
    >
      {content}
    </Link>
  ) : (
    <article className={className} data-progress-state={state}>
      {content}
    </article>
  );
}
