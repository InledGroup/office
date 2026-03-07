import type { Metadata } from "next";
import { AboutView } from "@/components/main/about-view";

export const metadata: Metadata = {
  title: "About - Web Office Suite by ZIZIYI",
  description:
    "Learn about Web Office Suite by ZIZIYI: an open-source, serverless, privacy-first web office application powered by OnlyOffice WebAssembly technology.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AboutPage() {
  return <AboutView />;
}
