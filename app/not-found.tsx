import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="not-found">
      <div>
        <p className="eyebrow">404 · no legal transition</p>
        <h1>This page is not in the state machine.</h1>
        <p>Return to a known state and continue from there.</p>
        <Link className="button button-primary" href="/">
          Go home <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
