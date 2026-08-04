"use client";

import { useMemo, useState } from "react";
import { useCourseProgress } from "@/components/course-progress-provider";
import { LessonCard } from "@/components/lesson-card";
import {
  getLessonTrack,
  getLessonTrackLabel,
  type LessonSummary,
  type LessonTrack
} from "@/lib/curriculum-meta";

type ProgressFilter = "all" | "completed" | "current" | "locked";

const trackOrder = ["java-concurrency", "flink-mastery"] as const;

const trackDetails = {
  "java-concurrency": {
    className: "java",
    title: "Java 并发主线",
    description: "按顺序完成课程，逐步解锁下一节。"
  },
  "flink-mastery": {
    className: "flink",
    title: "Flink 精通轨道",
    description: "独立推进，不受 Java 学习进度影响。"
  }
} as const satisfies Record<
  LessonTrack,
  { className: string; title: string; description: string }
>;

export function LessonFilter({
  lessons
}: {
  lessons: readonly LessonSummary[];
}) {
  const { ready, getLessonState, getTrackProgress } = useCourseProgress();
  const [query, setQuery] = useState("");
  const [progressFilter, setProgressFilter] =
    useState<ProgressFilter>("all");
  const [track, setTrack] = useState<"all" | LessonTrack>("all");
  const progressFilterLabels = {
    all: "全部进度",
    completed: "已完成",
    current: "可学习",
    locked: "未解锁"
  };
  const trackLabels = {
    all: "全部轨道",
    "java-concurrency": "Java 并发",
    "flink-mastery": "Flink 精通"
  };

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return lessons.flatMap((lesson) => {
      const progressState = getLessonState(lesson.slug);
      const matchesProgress =
        progressFilter === "all" ||
        progressState === progressFilter ||
        (progressFilter === "locked" && progressState === "upcoming");
      const matchesTrack =
        track === "all" || getLessonTrack(lesson) === track;
      const haystack = [
        lesson.title,
        lesson.dek,
        getLessonTrackLabel(lesson),
        ...lesson.tags,
        ...(lesson.searchTerms ?? [])
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !normalized || haystack.includes(normalized);

      return matchesProgress &&
        matchesTrack &&
        matchesSearch
        ? [{ lesson, progressState }]
        : [];
    });
  }, [getLessonState, lessons, progressFilter, query, track]);

  const groups = trackOrder
    .map((groupTrack) => ({
      details: trackDetails[groupTrack],
      lessons: visible.filter(
        ({ lesson }) => getLessonTrack(lesson) === groupTrack
      ),
      progress: getTrackProgress(groupTrack),
      track: groupTrack
    }))
    .filter((group) => group.lessons.length > 0);

  return (
    <>
      <div className="library-tools">
        <label className="search-field">
          <span className="sr-only">搜索课程</span>
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          </svg>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索概念..."
            type="search"
            value={query}
          />
        </label>
        <div className="library-filter-groups">
          <div aria-label="课程轨道" className="filter-group" role="group">
            {(["all", "java-concurrency", "flink-mastery"] as const).map(
              (item) => (
                <button
                  aria-pressed={track === item}
                  className={track === item ? "active" : ""}
                  key={item}
                  onClick={() => setTrack(item)}
                  type="button"
                >
                  {trackLabels[item]}
                </button>
              )
            )}
          </div>
          <div aria-label="学习进度" className="filter-group" role="group">
            {(["all", "completed", "current", "locked"] as const).map((item) => (
              <button
                aria-pressed={progressFilter === item}
                className={progressFilter === item ? "active" : ""}
                key={item}
                onClick={() => setProgressFilter(item)}
                type="button"
              >
                {progressFilterLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        aria-busy={!ready}
        className={`lesson-track-list ${
          ready ? "is-progress-ready" : "is-progress-loading"
        }`}
      >
        {groups.map((group, groupIndex) => {
          const progressPercent = group.progress.total
            ? (group.progress.completed / group.progress.total) * 100
            : 0;
          const headingId = `${group.track}-lessons-title`;

          return (
            <section
              aria-labelledby={headingId}
              className={`lesson-track-group lesson-track-group--${
                group.details.className
              } ${groups.length > 1 && groupIndex > 0 ? "has-divider" : ""}`}
              data-track={group.track}
              key={group.track}
            >
              <header className="lesson-track-header">
                <div className="lesson-track-heading">
                  <p className="eyebrow">独立学习轨道</p>
                  <h3 id={headingId}>{group.details.title}</h3>
                  <p>{group.details.description}</p>
                </div>
                <div className="lesson-track-summary">
                  <span>
                    已完成 {group.progress.completed} / {group.progress.total}
                  </span>
                  <div
                    aria-label={`${group.details.title}学习进度`}
                    aria-valuemax={group.progress.total}
                    aria-valuemin={0}
                    aria-valuenow={group.progress.completed}
                    className="lesson-track-progress"
                    role="progressbar"
                  >
                    <span className="lesson-track-progress-bar">
                      <span
                        className="lesson-track-progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </span>
                  </div>
                </div>
              </header>
              <div className="lesson-grid">
                {group.lessons.map(({ lesson, progressState }) => (
                  <LessonCard
                    key={lesson.slug}
                    lesson={lesson}
                    progressState={progressState}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="empty-state">暂时没有符合当前筛选的课程。</p>
      )}
    </>
  );
}
