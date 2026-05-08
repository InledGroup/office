"use client";

import { useExtracted } from "next-intl";

export function LandingAboutInled() {
  const t = useExtracted();

  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <img 
          src="https://hosted.inled.es/inled-logo-full.png" 
          alt="Inled Group Logo" 
          className="h-20 mx-auto mb-10 grayscale hover:grayscale-0 transition-all duration-500"
        />
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("About Inled Group")}</h2>
        <p className="text-lg text-text-secondary leading-relaxed mb-8">
          {t("Inled Group is a software brand focused on privacy, Spanish technological sovereignty and local AI. We use free technologies, AI agents to develop and we are fans of Linux.")}
        </p>
        <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary">100%</span>
                <span className="text-xs uppercase tracking-widest font-bold opacity-50">{t("Private")}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary">{t("Libre")}</span>
                <span className="text-xs uppercase tracking-widest font-bold opacity-50">{t("Free Open Source")}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary">ES</span>
                <span className="text-xs uppercase tracking-widest font-bold opacity-50">{t("Made in Spain")}</span>
            </div>
        </div>
      </div>
    </section>
  );
}
