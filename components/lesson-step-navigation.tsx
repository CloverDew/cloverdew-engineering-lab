"use client";

import { useEffect, useState } from "react";

export type LessonNavigationItem = {
  id: string;
  index: number;
  label: string;
  shortLabel?: string;
};

type LessonStepNavigationProps = {
  ariaLabel: string;
  items: readonly LessonNavigationItem[];
  title?: string;
  variant: "desktop" | "mobile";
};

function getHashStepId(items: readonly LessonNavigationItem[]) {
  const hash = window.location.hash.slice(1);
  return items.some((item) => item.id === hash) ? hash : null;
}

export function LessonStepNavigation({
  ariaLabel,
  items,
  title,
  variant
}: LessonStepNavigationProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let animationFrame = 0;

    const updateActiveStep = () => {
      const activationLine = Math.max(
        112,
        Math.min(window.innerHeight * 0.28, 220)
      );
      let currentId = items[0].id;

      for (const item of items) {
        const section = document.getElementById(item.id);

        if (section && section.getBoundingClientRect().top <= activationLine) {
          currentId = item.id;
        } else {
          break;
        }
      }

      setActiveId((previousId) =>
        previousId === currentId ? previousId : currentId
      );
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveStep);
    };

    const hashStepId = getHashStepId(items);
    if (hashStepId) {
      setActiveId(hashStepId);
    }
    scheduleUpdate();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [items]);

  const links = items.map((item) => {
    const isActive = item.id === activeId;

    return (
      <a
        aria-current={isActive ? "step" : undefined}
        aria-label={
          variant === "mobile"
            ? `第 ${item.index} 步：${item.label}`
            : undefined
        }
        className={
          variant === "mobile"
            ? `learning-step-link${isActive ? " is-active" : ""}`
            : isActive
              ? "is-active"
              : undefined
        }
        href={`#${item.id}`}
        key={item.id}
        onClick={() => setActiveId(item.id)}
      >
        <span
          className={variant === "mobile" ? "learning-step-index" : undefined}
        >
          {String(item.index).padStart(2, "0")}
        </span>
        {variant === "mobile" ? (item.shortLabel ?? item.label) : item.label}
      </a>
    );
  });

  if (variant === "mobile") {
    return (
      <nav
        aria-label={ariaLabel}
        className="learning-step-nav learning-step-nav-mobile"
        data-mobile-step-nav
      >
        {links}
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className="toc">
      {title && <p>{title}</p>}
      {links}
    </nav>
  );
}
