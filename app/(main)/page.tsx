import type { Metadata } from "next";
import { OpenView } from "@/components/main/open-view";

export const metadata: Metadata = {
  title: "Open & Edit Office Documents Online — ZIZIYI Office",
  description:
    "A serverless, privacy-first web office application. Open, view, and edit Word (.docx), Excel (.xlsx), and PowerPoint (.pptx) documents directly in your browser — no upload, no server, fully local.",
  keywords: [
    "web office",
    "online document editor",
    "open docx in browser",
    "Word online",
    "Excel online",
    "PowerPoint online",
    "DOCX viewer",
    "XLSX editor",
    "PPTX editor",
    "serverless office",
    "privacy-first",
    "ZIZIYI",
    "OnlyOffice",
  ],
  alternates: {
    canonical: "https://office.ziziyi.com",
  },
  openGraph: {
    title: "Open & Edit Office Documents Online — ZIZIYI Office",
    description:
      "Open, view, and edit Word, Excel, and PowerPoint documents entirely in your browser. No upload, no server — your files stay private.",
    url: "https://office.ziziyi.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open & Edit Office Documents Online — ZIZIYI Office",
    description:
      "Open, view, and edit Word, Excel, and PowerPoint documents entirely in your browser. No upload, no server — your files stay private.",
  },
};

export default function HomePage() {
  return <OpenView />;
}
