import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WelcomeView } from "@/components/landing/welcome-view";

export async function generateMetadata(): Promise<Metadata> {
  // We use the default locale for server-side metadata generation
  // Since the actual language is determined on the client via store/cookies
  const t = await getTranslations("landing.seo");

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: "https://office.inled.es/welcome",
      languages: {
        "es-ES": "https://office.inled.es/welcome?lang=es",
        "en-US": "https://office.inled.es/welcome?lang=en",
        "de-DE": "https://office.inled.es/welcome?lang=de",
        "fr-FR": "https://office.inled.es/welcome?lang=fr",
        "zh-CN": "https://office.inled.es/welcome?lang=zh-CN",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: ["https://hosted.inled.es/insuite-office-matrix.gif"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://hosted.inled.es/insuite-office-matrix.gif"],
    },
  };
}

export default function WelcomePage() {
  return <WelcomeView />;
}
