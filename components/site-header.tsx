import Link from "next/link";
import { GithubIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>
            <strong>Cloverdew</strong>
            <small>Engineering Lab</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="main-nav">
          <Link href="/#library">Lessons</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/project">QueryGate</Link>
        </nav>
        <div className="header-actions">
          <a
            aria-label="Cloverdew on GitHub"
            className="icon-button"
            href="https://github.com/cloverdew"
            rel="noreferrer"
            target="_blank"
          >
            <GithubIcon />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
