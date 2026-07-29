import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>Cloverdew Engineering Lab</strong>
          <p>Build the mechanism. Break it. Explain why it works.</p>
        </div>
        <div className="footer-links">
          <Link href="/roadmap">24-week roadmap</Link>
          <a href="https://github.com/cloverdew">github.com/cloverdew</a>
        </div>
      </div>
    </footer>
  );
}
