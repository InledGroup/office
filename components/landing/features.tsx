"use client";

import { ShieldCheck, DownloadCloud, Flag } from "lucide-react";
import { useExtracted } from "next-intl";

export function LandingFeatures() {
  const t = useExtracted();

  const features = [
    {
      title: t("Made in Spain"),
      description: t("The free, no-install, free of charge and 100% compatible office created in Spain for Spain."),
      icon: Flag,
      color: "bg-red-50 text-red-600",
    },
    {
      title: t("100% Private"),
      description: t("Nothing is uploaded to the server. Everything stays in your browser. We comply with the strictest European and Spanish privacy regulations by not collecting a single piece of data."),
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: t("No installation needed"),
      description: t("Everything works in the browser, you only need a file explorer to upload documents and a browser to use the editor."),
      icon: DownloadCloud,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{t("Why choose InSuite?")}</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t("Because it is made thinking of you, not for profit. Because it is free, private and made in Spain.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="p-8 rounded-3xl border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
