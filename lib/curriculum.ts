import {
  lessons as javaConcurrencyLessons,
  type Lesson
} from "@/lib/content";
import {
  getLessonTrack,
  summarizeLesson,
  type LessonTrack
} from "@/lib/curriculum-meta";
import { flinkLessons } from "@/lib/flink-content";

export type CatalogLesson = Lesson & { track: LessonTrack };

export {
  getLessonSubjectLabel,
  getLessonTrack,
  getLessonTrackHref,
  getLessonTrackLabel,
  getLessonUnitLabel,
  lessonTrackHrefs,
  lessonTrackLabels,
  summarizeLesson,
  shouldRevealLessonCodeAfterAttempt,
  type LessonSummary,
  type LessonTrack
} from "@/lib/curriculum-meta";

function normalizeLesson(
  lesson: Lesson,
  fallbackTrack: LessonTrack
): CatalogLesson {
  return {
    ...lesson,
    track: lesson.track ?? fallbackTrack
  };
}

const normalizedJavaLessons = javaConcurrencyLessons.map((lesson) =>
  normalizeLesson(lesson, "java-concurrency")
).sort((left, right) => left.week - right.week);
const normalizedFlinkLessons = flinkLessons.map((lesson) =>
  normalizeLesson(lesson, "flink-mastery")
).sort((left, right) => left.week - right.week);

export const lessons: CatalogLesson[] = [
  ...normalizedJavaLessons,
  ...normalizedFlinkLessons
];

export const publishedLessons = lessons.filter(
  (lesson) => lesson.status === "published"
);

export const lessonSummaries = lessons.map(summarizeLesson);

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getLessonsByTrack(
  track: LessonTrack,
  source: readonly CatalogLesson[] = lessons
) {
  return source.filter((lesson) => lesson.track === track);
}

export function getPublishedLessonsByTrack(track: LessonTrack) {
  return getLessonsByTrack(track, publishedLessons);
}
