"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockIcon } from "@/components/icons";
import { useCourseProgress } from "@/components/course-progress-provider";

type LessonAccessGateProps = {
  children: ReactNode;
  slug: string;
  trackHref: string;
};

export function LessonAccessGate({
  children,
  slug,
  trackHref
}: LessonAccessGateProps) {
  const { getLessonState, ready } = useCourseProgress();

  if (!ready) {
    return (
      <div aria-busy="true" className="lesson-access-loading">
        <span className="sr-only">正在读取课程进度…</span>
      </div>
    );
  }

  const state = getLessonState(slug);

  if (state === "completed" || state === "current") {
    return children;
  }

  const upcoming = state === "upcoming";

  return (
    <div className="shell">
      <section
        aria-labelledby="lesson-access-title"
        className="lesson-access-locked"
      >
        <span className="lesson-access-lock">
          <LockIcon size={28} />
        </span>
        <p className="eyebrow">{upcoming ? "课程准备中" : "学习顺序"}</p>
        <h1 id="lesson-access-title">
          {upcoming ? "这节课程尚未发布。" : "这节课程还没有解锁。"}
        </h1>
        <p>
          {upcoming
            ? "内容完成最终校验后会开放，先回到课程地图继续已经发布的内容。"
            : "请先完成同一轨道中的上一节课程。Java 与 Flink 各自推进，彼此不会成为前置条件。"}
        </p>
        <div className="lesson-access-actions">
          <Link className="button button-primary" href={trackHref}>
            返回本轨道
          </Link>
          <Link className="button button-quiet" href="/#library">
            查看课程地图
          </Link>
        </div>
      </section>
    </div>
  );
}

export type { LessonAccessGateProps };
