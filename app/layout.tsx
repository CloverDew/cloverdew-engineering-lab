import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Cloverdew Engineering Lab",
    template: "%s · Cloverdew Engineering Lab"
  },
  description:
    "Concise, project-driven notes on Java concurrency, query systems, streaming infrastructure, and trustworthy data for AI."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
