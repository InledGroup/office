import type { Metadata } from "next";
import { TemplateView } from "@/components/main/template-view";

export const metadata: Metadata = {
  title: "Free Office Templates – Word, Excel & PowerPoint | Inled InSuite",
  description:
    "Browse free, ready-made templates for Word documents, Excel spreadsheets, and PowerPoint presentations. No login required — open and edit directly in your browser.",
  keywords: [
    "free office templates",
    "Word template",
    "Excel template",
    "PowerPoint template",
    "free document template",
    "resume template online",
    "spreadsheet template",
    "presentation template",
    "web office",
    "ZIZIYI",
  ],
  alternates: {
    canonical: "https://office.inled.es/template",
  },
  openGraph: {
    title: "Free Office Templates – Word, Excel & PowerPoint | Inled InSuite",
    description:
      "Browse free, ready-made templates for Word documents, Excel spreadsheets, and PowerPoint presentations. No login required — open and edit directly in your browser.",
    url: "https://office.inled.es/template",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Office Templates – Word, Excel & PowerPoint | Inled InSuite",
    description:
      "Browse free, ready-made templates for Word, Excel, and PowerPoint. No login required — edit directly in your browser.",
  },
};

export default function TemplatePage() {
  return <TemplateView />;
}
