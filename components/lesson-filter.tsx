"use client";

import { useMemo, useState } from "react";
import { LessonCard } from "@/components/lesson-card";
import {
  getLessonTrack,
  getLessonTrackLabel,
  type LessonSummary,
  type LessonTrack
} from "@/lib/curriculum-meta";

export function LessonFilter({
  lessons
}: {
  lessons: readonly LessonSummary[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "upcoming">("all");
  const [track, setTrack] = useState<"all" | LessonTrack>("all");
  const filterLabels = {
    all: "全部状态",
    published: "已发布",
    upcoming: "即将推出"
  };
  const trackLabels = {
    all: "全部轨道",
    "java-concurrency": "Java 并发",
    "flink-mastery": "Flink 精通"
  };

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const matchesStatus = filter === "all" || lesson.status === filter;
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
      return (
        matchesStatus &&
        matchesTrack &&
        (!normalized || haystack.includes(normalized))
      );
    });
  }, [filter, lessons, query, track]);

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
          <div aria-label="课程状态" className="filter-group" role="group">
            {(["all", "published", "upcoming"] as const).map((item) => (
              <button
                className={filter === item ? "active" : ""}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {filterLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="lesson-grid">
        {visible.map((lesson) => (
          <LessonCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
      {visible.length === 0 && (
        <p className="empty-state">暂时没有符合该搜索条件的课程。</p>
      )}
    </>
  );
}
