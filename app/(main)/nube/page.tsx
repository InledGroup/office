import type { Metadata } from "next";
import { NubeView } from "@/components/main/nube-view";

export const metadata: Metadata = {
  title: "Cloud Storage — Inled InSuite",
  description: "Manage your documents in the browser memory.",
};

export default function NubePage() {
  return <NubeView />;
}
