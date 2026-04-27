import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { I18nProvider } from "@/components/i18n-provider";
import { ProgressProvider } from "@/components/progress-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://office.inled.es"),
  title: {
    default: "Inled InSuite - Open & Edit Office Documents Online",
    template: "%s | Inled InSuite",
  },
  description:
    "A local Office file preview and editing application. Open, view, and edit Word, Excel, and PowerPoint documents directly in your browser.",
  keywords: [
    "web office",
    "online office suite",
    "Word online",
    "Excel online",
    "PowerPoint online",
    "DOCX viewer",
    "XLSX editor",
    "serverless office",
    "Inled",
    "InSuite",
    "OnlyOffice",
  ],
  openGraph: {
    siteName: "Inled InSuite",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

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
      </head>
      <body>
        <ProgressProvider>
          <I18nProvider initialMessages={messages}>{children}</I18nProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
