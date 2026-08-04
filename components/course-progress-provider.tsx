"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { LessonTrack } from "@/lib/curriculum-meta";

export type CourseManifestItem = {
  slug: string;
  track: LessonTrack;
  order: number;
  status: "published" | "upcoming";
};

export type LessonProgressState =
  | "completed"
  | "current"
  | "locked"
  | "upcoming";

export type TrackProgress = {
  completed: number;
  total: number;
  currentSlug: string | null;
};

type CompletedByTrack = Record<LessonTrack, string[]>;

type CourseCatalog = {
  bySlug: Map<string, CourseManifestItem>;
  publishedByTrack: Record<LessonTrack, CourseManifestItem[]>;
  publishedPositionBySlug: Map<
    string,
    { track: LessonTrack; index: number }
  >;
};

type CourseProgressContextValue = {
  ready: boolean;
  getLessonState: (slug: string) => LessonProgressState;
  getTrackProgress: (track: LessonTrack) => TrackProgress;
  setLessonComplete: (slug: string, complete: boolean) => void;
};

const TRACKS: readonly LessonTrack[] = [
  "java-concurrency",
  "flink-mastery"
];
const STORAGE_VERSION = 2;
const STORAGE_KEY = "cloverdew-course-progress-v2";
const LEGACY_STORAGE_KEY = "cloverdew-completed-lessons";

const CourseProgressContext = createContext<
  CourseProgressContextValue | undefined
>(undefined);

function emptyProgress(): CompletedByTrack {
  return {
    "java-concurrency": [],
    "flink-mastery": []
  };
}

function isLessonTrack(value: unknown): value is LessonTrack {
  return TRACKS.some((track) => track === value);
}

function createCatalog(manifest: readonly CourseManifestItem[]): CourseCatalog {
  const bySlug = new Map<string, CourseManifestItem>();
  const originalPositions = new Map<string, number>();

  manifest.forEach((item, position) => {
    if (
      !item ||
      typeof item.slug !== "string" ||
      item.slug.length === 0 ||
      !isLessonTrack(item.track) ||
      !Number.isFinite(item.order) ||
      (item.status !== "published" && item.status !== "upcoming") ||
      bySlug.has(item.slug)
    ) {
      return;
    }

    bySlug.set(item.slug, item);
    originalPositions.set(item.slug, position);
  });

  const publishedByTrack: Record<LessonTrack, CourseManifestItem[]> = {
    "java-concurrency": [],
    "flink-mastery": []
  };

  for (const item of bySlug.values()) {
    if (item.status === "published") {
      publishedByTrack[item.track].push(item);
    }
  }

  for (const track of TRACKS) {
    publishedByTrack[track].sort(
      (left, right) =>
        left.order - right.order ||
        (originalPositions.get(left.slug) ?? 0) -
          (originalPositions.get(right.slug) ?? 0)
    );
  }

  const publishedPositionBySlug = new Map<
    string,
    { track: LessonTrack; index: number }
  >();

  for (const track of TRACKS) {
    publishedByTrack[track].forEach((item, index) => {
      publishedPositionBySlug.set(item.slug, { track, index });
    });
  }

  return { bySlug, publishedByTrack, publishedPositionBySlug };
}

function canonicalizeProgress(
  candidate: Partial<Record<LessonTrack, unknown>>,
  catalog: CourseCatalog
): CompletedByTrack {
  const canonical = emptyProgress();

  for (const track of TRACKS) {
    const rawCompleted = candidate[track];
    const requested = new Set(
      Array.isArray(rawCompleted)
        ? rawCompleted.filter(
            (slug): slug is string => typeof slug === "string"
          )
        : []
    );

    for (const lesson of catalog.publishedByTrack[track]) {
      if (!requested.has(lesson.slug)) {
        break;
      }
      canonical[track].push(lesson.slug);
    }
  }

  return canonical;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStoredProgress(
  raw: string,
  catalog: CourseCatalog
): CompletedByTrack | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== STORAGE_VERSION ||
      !isRecord(parsed.tracks)
    ) {
      return null;
    }

    return canonicalizeProgress(parsed.tracks, catalog);
  } catch {
    return null;
  }
}

function parseLegacyProgress(
  raw: string,
  catalog: CourseCatalog
): CompletedByTrack | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const candidate = emptyProgress();
    for (const slug of parsed) {
      if (typeof slug !== "string") {
        continue;
      }

      const position = catalog.publishedPositionBySlug.get(slug);
      if (position) {
        candidate[position.track].push(slug);
      }
    }

    return canonicalizeProgress(candidate, catalog);
  } catch {
    return null;
  }
}

function loadProgress(catalog: CourseCatalog): {
  progress: CompletedByTrack;
  storageAvailable: boolean;
} {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseStoredProgress(stored, catalog);
      if (parsed) {
        return { progress: parsed, storageAvailable: true };
      }
    }

    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy !== null) {
      const migrated = parseLegacyProgress(legacy, catalog);
      if (migrated) {
        return { progress: migrated, storageAvailable: true };
      }
    }

    return { progress: emptyProgress(), storageAvailable: true };
  } catch {
    return { progress: emptyProgress(), storageAvailable: false };
  }
}

function storeProgress(progress: CompletedByTrack): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        tracks: progress
      })
    );
  } catch {
    // Progress remains usable for the current tab when storage is unavailable.
  }
}

function progressEquals(
  left: CompletedByTrack,
  right: CompletedByTrack
): boolean {
  return TRACKS.every((track) => {
    const leftTrack = left[track];
    const rightTrack = right[track];
    return (
      leftTrack.length === rightTrack.length &&
      leftTrack.every((slug, index) => slug === rightTrack[index])
    );
  });
}

export function CourseProgressProvider({
  manifest,
  children
}: {
  manifest: readonly CourseManifestItem[];
  children: ReactNode;
}) {
  const catalog = useMemo(() => createCatalog(manifest), [manifest]);
  const [completedByTrack, setCompletedByTrack] =
    useState<CompletedByTrack>(emptyProgress);
  const completedRef = useRef(completedByTrack);
  const [ready, setReady] = useState(false);

  const applyProgress = useCallback((next: CompletedByTrack) => {
    completedRef.current = next;
    setCompletedByTrack((current) =>
      progressEquals(current, next) ? current : next
    );
  }, []);

  useEffect(() => {
    setReady(false);

    const loaded = loadProgress(catalog);
    applyProgress(loaded.progress);
    if (loaded.storageAvailable) {
      storeProgress(loaded.progress);
    }
    setReady(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === null) {
        applyProgress(emptyProgress());
        return;
      }

      if (event.key === STORAGE_KEY) {
        if (event.newValue === null) {
          applyProgress(emptyProgress());
          return;
        }

        const parsed = parseStoredProgress(event.newValue, catalog);
        if (parsed) {
          applyProgress(parsed);
        }
        return;
      }

      if (event.key === LEGACY_STORAGE_KEY && event.newValue !== null) {
        const migrated = parseLegacyProgress(event.newValue, catalog);
        if (migrated) {
          applyProgress(migrated);
          storeProgress(migrated);
        }
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [applyProgress, catalog]);

  const getLessonState = useCallback(
    (slug: string): LessonProgressState => {
      const lesson = catalog.bySlug.get(slug);
      if (!lesson) {
        return "locked";
      }
      if (lesson.status === "upcoming") {
        return "upcoming";
      }
      if (!ready) {
        return "locked";
      }

      const position = catalog.publishedPositionBySlug.get(slug);
      if (!position) {
        return "locked";
      }

      const completedCount = completedByTrack[position.track].length;
      if (position.index < completedCount) {
        return "completed";
      }
      return position.index === completedCount ? "current" : "locked";
    },
    [catalog, completedByTrack, ready]
  );

  const getTrackProgress = useCallback(
    (track: LessonTrack): TrackProgress => {
      const lessons = catalog.publishedByTrack[track];
      if (!ready) {
        return { completed: 0, total: lessons.length, currentSlug: null };
      }

      const completed = completedByTrack[track].length;
      return {
        completed,
        total: lessons.length,
        currentSlug: lessons[completed]?.slug ?? null
      };
    },
    [catalog, completedByTrack, ready]
  );

  const setLessonComplete = useCallback(
    (slug: string, complete: boolean) => {
      if (!ready) {
        return;
      }

      const position = catalog.publishedPositionBySlug.get(slug);
      if (!position) {
        return;
      }

      const current = completedRef.current;
      const trackProgress = current[position.track];
      let nextTrackProgress: string[];

      if (complete) {
        if (position.index < trackProgress.length) {
          return;
        }
        if (position.index !== trackProgress.length) {
          return;
        }
        nextTrackProgress = [...trackProgress, slug];
      } else {
        if (position.index >= trackProgress.length) {
          return;
        }
        nextTrackProgress = trackProgress.slice(0, position.index);
      }

      const next = canonicalizeProgress(
        {
          ...current,
          [position.track]: nextTrackProgress
        },
        catalog
      );
      applyProgress(next);
      storeProgress(next);
    },
    [applyProgress, catalog, ready]
  );

  const value = useMemo<CourseProgressContextValue>(
    () => ({
      ready,
      getLessonState,
      getTrackProgress,
      setLessonComplete
    }),
    [getLessonState, getTrackProgress, ready, setLessonComplete]
  );

  return (
    <CourseProgressContext.Provider value={value}>
      {children}
    </CourseProgressContext.Provider>
  );
}

export function useCourseProgress(): CourseProgressContextValue {
  const context = useContext(CourseProgressContext);
  if (!context) {
    throw new Error(
      "useCourseProgress must be used within CourseProgressProvider."
    );
  }
  return context;
}
