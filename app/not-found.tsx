import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="not-found">
      <div>
        <p className="eyebrow">404 · 不存在合法迁移</p>
        <h1>这个页面不在状态机中。</h1>
        <p>返回一个已知状态，再从那里继续。</p>
        <Link className="button button-primary" href="/">
          返回首页 <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
