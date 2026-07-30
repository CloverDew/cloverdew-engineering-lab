"use client";

import { useMemo, useState } from "react";
import { LessonCard } from "@/components/lesson-card";
import type { Lesson } from "@/lib/content";

export function LessonFilter({ lessons }: { lessons: Lesson[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "upcoming">("all");
  const filterLabels = {
    all: "全部",
    published: "已发布",
    upcoming: "即将推出"
  };

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const matchesStatus = filter === "all" || lesson.status === filter;
      const haystack = [
        lesson.title,
        lesson.dek,
        ...lesson.tags,
        ...(lesson.searchTerms ?? [])
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!normalized || haystack.includes(normalized));
    });
  }, [filter, lessons, query]);

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
