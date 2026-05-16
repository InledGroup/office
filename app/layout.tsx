import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { I18nProvider } from "@/components/i18n-provider";
import { ProgressProvider } from "@/components/progress-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://office.inled.es"),
  title: {
    default: "Inled Insuite Office - 100% private, browser based, free and fully compatible Office editor",
    template: "%s | Inled InSuite",
  },
  description:
    "A local, privacy-first Office suite. Open, view, and edit Word, Excel, and PowerPoint documents directly in your browser without uploading to any server.",
  keywords: [
    "web office",
    "online office suite",
    "Word online",
    "Excel online",
    "PowerPoint online",
    "DOCX viewer",
    "XLSX editor",
    "serverless office",
    "privacy-first",
    "Inled",
    "InSuite",
    "OnlyOffice",
  ],
  openGraph: {
    siteName: "Inled InSuite",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "https://hosted.inled.es/insuite-office-matrix.gif",
        width: 1200,
        height: 630,
        alt: "Inled InSuite - Web Office Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@inled_es",
    creator: "@inled_es",
    images: ["https://hosted.inled.es/insuite-office-matrix.gif"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Inled InSuite",
    "operatingSystem": "Any",
    "applicationCategory": "OfficeApplication",
    "description": "Open, view, and edit Word, Excel, and PowerPoint documents directly in your browser with full privacy.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "featureList": [
      "No upload required",
      "Privacy-first",
      "Edit Word documents",
      "Edit Excel spreadsheets",
      "Edit PowerPoint presentations"
    ]
  };

  const preload = () => {
    const theme = document.cookie.match(/theme=([^;]+)/)?.[1] || "";
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme == "dark" || (dark && theme != "light");
    document.documentElement.classList.toggle("dark", isDark);
  };

  return (
    <html suppressHydrationWarning>
      <head>
        <script>{`(${preload.toString()})()`}</script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ProgressProvider>
          <I18nProvider initialMessages={messages}>{children}</I18nProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
