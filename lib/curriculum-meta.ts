import type { Lesson } from "@/lib/content";

export type LessonTrack = "java-concurrency" | "flink-mastery";
export type LessonSummary = Pick<
  Lesson,
  | "slug"
  | "week"
  | "title"
  | "dek"
  | "readTime"
  | "status"
  | "tags"
  | "searchTerms"
> & { track: LessonTrack };

export const lessonTrackLabels = {
  "java-concurrency": "Java 并发主线",
  "flink-mastery": "Flink 精通轨道"
} as const satisfies Record<LessonTrack, string>;

export const lessonTrackHrefs = {
  "java-concurrency": "/roadmap",
  "flink-mastery": "/flink"
} as const satisfies Record<LessonTrack, string>;

export function getLessonTrack(lesson: Pick<Lesson, "track">): LessonTrack {
  return lesson.track ?? "java-concurrency";
}

export function getLessonTrackLabel(lesson: Pick<Lesson, "track">) {
  return lessonTrackLabels[getLessonTrack(lesson)];
}

export function getLessonTrackHref(lesson: Pick<Lesson, "track">) {
  return lessonTrackHrefs[getLessonTrack(lesson)];
}

export function getLessonUnitLabel(
  lesson: Pick<Lesson, "track" | "week">
) {
  const track = getLessonTrack(lesson);

  if (track === "flink-mastery") {
    return `模块 ${lesson.week.toString().padStart(2, "0")}`;
  }

  return lesson.week === 0
    ? "准备单元"
    : `第 ${lesson.week.toString().padStart(2, "0")} 周`;
}

export function getLessonSubjectLabel(
  lesson: Pick<Lesson, "track" | "week">
) {
  const track = getLessonTrack(lesson);

  if (track === "flink-mastery") {
    return "Apache Flink";
  }

  return lesson.week === 0 ? "Java 阅读基础" : "Java 并发";
}

export function shouldRevealLessonCodeAfterAttempt(
  lesson: Pick<Lesson, "track" | "week" | "codeFirst">
) {
  return (
    lesson.codeFirst ??
    (getLessonTrack(lesson) === "flink-mastery" || lesson.week >= 2)
  );
}

export function summarizeLesson(lesson: Lesson): LessonSummary {
  return {
    slug: lesson.slug,
    week: lesson.week,
    track: getLessonTrack(lesson),
    title: lesson.title,
    dek: lesson.dek,
    readTime: lesson.readTime,
    status: lesson.status,
    tags: lesson.tags,
    searchTerms: lesson.searchTerms
  };
}
