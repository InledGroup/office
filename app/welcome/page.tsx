import { Metadata } from "next";
import { WelcomeView } from "@/components/landing/welcome-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Inled InSuite — Office Libre, Privado y Gratuito en la Web",
    description: "Abre y edita Word, Excel y PowerPoint gratis. 100% privado, sin instalaciones y hecho en España. Tus archivos nunca salen de tu navegador.",
    keywords: "office online gratis, editar word online, excel online privado, office sin registro, soberanía tecnológica, inled insuite",
    alternates: {
      canonical: "https://office.inled.es/welcome",
    },
    openGraph: {
      title: "Inled InSuite — Office Libre, Privado y Gratuito en la Web",
      description: "Abre y edita Word, Excel y PowerPoint gratis. 100% privado, sin instalaciones y hecho en España.",
      images: ["https://hosted.inled.es/insuite-office-matrix.gif"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Inled InSuite — Office Libre, Privado y Gratuito en la Web",
      description: "Abre y edita Word, Excel y PowerPoint gratis. 100% privado, sin instalaciones y hecho en España.",
      images: ["https://hosted.inled.es/insuite-office-matrix.gif"],
    },
  };
}

export default function WelcomePage() {
  return <WelcomeView />;
}
