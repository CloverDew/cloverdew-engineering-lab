"use client";

import Link from "next/link";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { useCourseProgress } from "@/components/course-progress-provider";
import type { FlinkModule } from "@/lib/flink-content";

type FlinkModuleListProps = {
  modules: readonly FlinkModule[];
  readTimeBySlug: Readonly<Record<string, string>>;
};

export function FlinkModuleList({
  modules,
  readTimeBySlug
}: FlinkModuleListProps) {
  const { getLessonState, ready } = useCourseProgress();

  return (
    <ol
      aria-busy={!ready}
      className={`flink-module-grid ${
        ready ? "is-progress-ready" : "is-progress-loading"
      }`}
    >
      {modules.map((module, index) => {
        const state = ready ? getLessonState(module.lessonSlug) : "locked";
        const available = state === "completed" || state === "current";
        const moduleNumber = String(index + 1).padStart(2, "0");
        const stateLabel =
          state === "completed"
            ? "已完成"
            : state === "current"
              ? "当前课程"
              : state === "upcoming"
                ? "尚未发布"
                : "尚未解锁";

        const content = (
          <>
            <div className="flink-module-index">
              <span>{module.id}</span>
              <small>{readTimeBySlug[module.lessonSlug] ?? "深度模块"}</small>
            </div>
            <div className="flink-module-status">{stateLabel}</div>
            <h3>{module.title}</h3>
            <p>{module.question}</p>
            <ul aria-label={`${module.title} 主题`}>
              {module.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <div className="flink-module-outcome">
              <span>掌握结果</span>
              <p>{module.outcome}</p>
            </div>
            <strong>
              {state === "completed" ? (
                <>
                  <CheckIcon /> 已完成 · 再次进入模块 {moduleNumber}
                </>
              ) : state === "current" ? (
                <>
                  进入当前模块 {moduleNumber} <ArrowIcon />
                </>
              ) : state === "upcoming" ? (
                <>模块 {moduleNumber} 尚未发布</>
              ) : (
                <>完成上一模块后解锁</>
              )}
            </strong>
          </>
        );

        return (
          <li key={module.id}>
            {available ? (
              <Link
                className={`flink-module-card is-${state}`}
                href={`/lessons/${module.lessonSlug}`}
              >
                {content}
              </Link>
            ) : (
              <article className={`flink-module-card is-${state}`}>
                {content}
              </article>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export type { FlinkModuleListProps };
