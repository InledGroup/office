import type { Metadata } from "next";
import { SettingsView } from "@/components/main/settings-view";

export const metadata: Metadata = {
  title: "Settings - Web Office Suite by ZIZIYI",
  description:
    "Customize your Web Office experience: manage themes, language preferences, and application settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return <SettingsView />;
}
