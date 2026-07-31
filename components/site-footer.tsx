import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>Cloverdew 工程实验室</strong>
          <p>构建机制，主动破坏，并解释它为何正确。</p>
        </div>
        <div className="footer-links">
          <Link href="/roadmap">24 周 Java 路线</Link>
          <Link href="/flink">Flink 精通轨道</Link>
          <a href="https://github.com/cloverdew">github.com/cloverdew</a>
        </div>
      </div>
    </footer>
  );
}
