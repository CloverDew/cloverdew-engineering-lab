"use client";

import { useEffect, useRef, useState } from "react";
import { useCourseProgress } from "@/components/course-progress-provider";
import { CheckIcon } from "@/components/icons";

export function ProgressButton({ slug }: { slug: string }) {
  const { getLessonState, ready, setLessonComplete } = useCourseProgress();
  const [celebrating, setCelebrating] = useState(false);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const complete = ready && getLessonState(slug) === "completed";

  useEffect(() => {
    return () => {
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
    };
  }, []);

  function toggle() {
    if (!ready) {
      return;
    }

    setLessonComplete(slug, !complete);
    if (complete) {
      setCelebrating(false);
      return;
    }

    setCelebrating(true);
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
    }
    celebrationTimer.current = setTimeout(() => {
      setCelebrating(false);
    }, 1800);
  }

  return (
    <button
      aria-pressed={complete}
      className={`progress-button ${complete ? "is-complete" : ""}`}
      disabled={!ready}
      onClick={toggle}
      title={complete ? "撤销本课及其后的完成进度" : undefined}
      type="button"
    >
      <CheckIcon />
      {complete ? "已完成" : "标记为已完成"}
      {celebrating && (
        <span className="completion-celebration" role="status">
          <span aria-hidden="true" className="completion-clover">
            <i />
            <i />
            <i />
            <i />
            <b>˘</b>
          </span>
          <span className="completion-celebration-copy">
            <strong>完成啦</strong>
            <small>这一格进度已经亮起来了。</small>
          </span>
          <span aria-hidden="true" className="completion-sparkles">
            <i />
            <i />
            <i />
          </span>
        </span>
      )}
    </button>
  );
}
