import type { Metadata } from "next";
import { OpenView } from "@/components/main/open-view";
import { RedirectHandler } from "@/components/redirect-handler";

export const metadata: Metadata = {
  title: "Open & Edit Office Documents Online — Inled InSuite",
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
    canonical: "https://office.inled.es",
  },
  openGraph: {
    title: "Open & Edit Office Documents Online — Inled InSuite",
    description:
      "Open, view, and edit Word, Excel, and PowerPoint documents entirely in your browser. No upload, no server — your files stay private.",
    url: "https://office.inled.es",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open & Edit Office Documents Online — Inled InSuite",
    description:
      "Open, view, and edit Word, Excel, and PowerPoint documents entirely in your browser. No upload, no server — your files stay private.",
  },
};

export default function HomePage() {
  return (
    <>
      <RedirectHandler />
      <OpenView />
    </>
  );
}
