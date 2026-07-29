"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/icons";

export function ProgressButton({ slug }: { slug: string }) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(
      window.localStorage.getItem("cloverdew-completed-lessons") ?? "[]"
    ) as string[];
    setComplete(saved.includes(slug));
  }, [slug]);

  function toggle() {
    const saved = JSON.parse(
      window.localStorage.getItem("cloverdew-completed-lessons") ?? "[]"
    ) as string[];
    const next = complete
      ? saved.filter((item) => item !== slug)
      : [...new Set([...saved, slug])];
    window.localStorage.setItem(
      "cloverdew-completed-lessons",
      JSON.stringify(next)
    );
    setComplete(!complete);
  }

  return (
    <button
      className={`progress-button ${complete ? "is-complete" : ""}`}
      onClick={toggle}
      type="button"
    >
      <CheckIcon />
      {complete ? "Completed" : "Mark as complete"}
    </button>
  );
}
