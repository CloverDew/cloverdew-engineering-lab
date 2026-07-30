import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Cloverdew 工程实验室",
    template: "%s · Cloverdew 工程实验室"
  },
  description:
    "以项目驱动的深入课程，讲解 Java 并发、查询系统、流式基础设施和面向 AI 的可信数据。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{const t=localStorage.getItem("cloverdew-theme");document.documentElement.dataset.theme=t||"light"}catch(e){}`}
        </Script>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
