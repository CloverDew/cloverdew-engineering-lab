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
            <small>工程实验室</small>
          </span>
        </Link>
        <nav aria-label="主导航" className="main-nav">
          <Link href="/#library">课程</Link>
          <Link href="/roadmap">Java 学习路线</Link>
          <Link href="/flink">Flink 精通</Link>
          <Link href="/project">QueryGate 项目</Link>
        </nav>
        <div className="header-actions">
          <a
            aria-label="在 GitHub 上查看 Cloverdew"
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
