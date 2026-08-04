import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import {
  CourseProgressProvider,
  type CourseManifestItem
} from "@/components/course-progress-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { lessonSummaries } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: {
    default: "Cloverdew 工程实验室",
    template: "%s · Cloverdew 工程实验室"
  },
  description:
    "以实验和系统不变量驱动的深入课程，讲解 Java 并发、Apache Flink、查询系统与可信数据基础设施。"
};

const courseManifest: CourseManifestItem[] = lessonSummaries.map(
  (lesson) => ({
    slug: lesson.slug,
    track: lesson.track,
    order: lesson.week,
    status: lesson.status
  })
);

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="zh-CN"
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{const t=localStorage.getItem("cloverdew-theme");document.documentElement.dataset.theme=t||"light"}catch(e){}`}
        </Script>
        <CourseProgressProvider manifest={courseManifest}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CourseProgressProvider>
      </body>
    </html>
  );
}
