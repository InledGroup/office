import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Online Document Editor - Edit Word, Excel & PowerPoint Files",
  description:
    "Edit Word (.docx), Excel (.xlsx), and PowerPoint (.pptx) files directly in your browser — no upload required. A fast, private, serverless office editor powered by ZIZIYI.",
  keywords: [
    "online document editor",
    "edit Word online",
    "edit Excel online",
    "edit PowerPoint online",
    "DOCX editor",
    "XLSX editor",
    "PPTX editor",
    "browser office editor",
    "serverless document editor",
    "local file editor",
    "no upload office editor",
    "ZIZIYI office",
  ],
  openGraph: {
    title: "Online Document Editor - Edit Word, Excel & PowerPoint Files",
    description:
      "Edit Word, Excel, and PowerPoint files directly in your browser. No upload, no server — fully private and serverless.",
    type: "website",
    siteName: "Web Office Suite by ZIZIYI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Document Editor - Edit Word, Excel & PowerPoint Files",
    description:
      "Edit Word, Excel, and PowerPoint files directly in your browser. No upload, no server — fully private and serverless.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://office.ziziyi.com/editor",
  },
};

export default function Layout({ children }: PropsWithChildren<{}>) {
  return <>{children}</>;
}
