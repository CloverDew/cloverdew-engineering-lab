"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { useCourseProgress } from "@/components/course-progress-provider";

export type CourseNavigationLesson = {
  slug: string;
  title: string;
};

type CourseLessonNavigationProps = {
  next: CourseNavigationLesson | null;
  previous: CourseNavigationLesson | null;
  trackHref: string;
  trackLabel: string;
};

export function CourseLessonNavigation({
  next,
  previous,
  trackHref,
  trackLabel
}: CourseLessonNavigationProps) {
  const { getLessonState, ready } = useCourseProgress();
  const nextState = next && ready ? getLessonState(next.slug) : "locked";
  const nextIsAvailable =
    nextState === "completed" || nextState === "current";

  return (
    <nav aria-label="课程导航" className="article-nav">
      {previous ? (
        <Link
          className="article-nav-item"
          href={`/lessons/${previous.slug}`}
        >
          <span>上一课</span>
          <strong>← {previous.title}</strong>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      {next ? (
        nextIsAvailable ? (
          <Link
            className="article-nav-item"
            href={`/lessons/${next.slug}`}
          >
            <span>{nextState === "completed" ? "下一课 · 已完成" : "下一课"}</span>
            <strong>
              {next.title} <ArrowIcon />
            </strong>
          </Link>
        ) : (
          <div className="article-nav-item is-locked">
            <span>
              {nextState === "upcoming" ? "下一课 · 尚未发布" : "下一课 · 尚未解锁"}
            </span>
            <strong>{next.title}</strong>
            <small>
              {nextState === "upcoming"
                ? "课程准备完成后开放"
                : "完成本课后即可继续"}
            </small>
          </div>
        )
      ) : (
        <Link className="article-nav-item" href={trackHref}>
          <span>继续学习</span>
          <strong>
            查看{trackLabel} <ArrowIcon />
          </strong>
        </Link>
      )}
    </nav>
  );
}

export type { CourseLessonNavigationProps };
