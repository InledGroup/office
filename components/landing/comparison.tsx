"use client";

import { Check, X, Star } from "lucide-react";
import { useExtracted } from "next-intl";

export function LandingComparison() {
  const t = useExtracted();

  const suites = [
    {
      name: "InSuite",
      logo: "/logo.svg",
      privacy: t("Local"),
      auditable: true,
      comp: 5,
      install: false,
      price: t("Free"),
      diff: t("Supports Export PDF, IndexedDB"),
      featured: true,
    },
    {
      name: "Ziziyi Office",
      logo: "https://hosted.inled.es/ziziyi-office-insuite.png",
      privacy: t("Local"),
      auditable: true,
      comp: 5,
      install: false,
      price: t("Freemium"),
      diff: t("Cannot export to PDF. No browser saving."),
    },
    {
      name: "OnlyOffice",
      logo: "https://hosted.inled.es/onlyoffice-insuite.png",
      privacy: t("Cloud"),
      auditable: false,
      comp: 5,
      install: true,
      price: t("Freemium"),
      diff: t("Certain components are not auditable."),
    },
    {
      name: "LibreOffice",
      logo: "https://hosted.inled.es/libreoffice-insuite.png",
      privacy: t("Local"),
      auditable: true,
      comp: 3,
      install: true,
      price: t("Free"),
      diff: t("Paltry interface, installation needed, low compatibility"),
    },
    {
      name: "MS Office",
      logo: "https://hosted.inled.es/microslop-insuite.png",
      privacy: t("Low (Cloud)"),
      auditable: false,
      comp: 5,
      install: true,
      price: t("Subscription"),
      diff: t("Proprietary, expensive, data spying"),
    },
  ];

  return (
    <section className="py-24 px-6 bg-white overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{t("Honest Comparison")}</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t("The best way for you to see why InSuite is the best option is by comparing it with the rest of the options in the market.")}
          </p>
        </div>

        <div className="min-w-[1000px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-100 text-left">
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("Suite")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("Privacy")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("Auditable")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("Compatibility")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("No Install")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("Price")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("Key Differences")}</th>
              </tr>
            </thead>
            <tbody>
              {suites.map((suite, i) => (
                <tr 
                  key={i} 
                  className={`border-b border-zinc-100 transition-colors ${suite.featured ? "bg-primary/5 font-medium" : "hover:bg-zinc-50"}`}
                >
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <img 
                          src={suite.logo} 
                          alt={suite.name} 
                          className="max-w-full max-h-full object-contain rounded-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/favicon.ico";
                          }}
                        />
                      </div>
                      <span className={suite.featured ? "font-bold text-primary" : "font-semibold whitespace-nowrap"}>{suite.name}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${suite.privacy === t("Local") ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                      {suite.privacy}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-center">
                    {suite.auditable ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < suite.comp ? "text-yellow-400 fill-yellow-400" : "text-zinc-200"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    {!suite.install ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="py-6 px-4">
                    <span className={suite.price === t("Free") ? 'text-green-600 font-bold' : 'text-zinc-600'}>{suite.price}</span>
                  </td>
                  <td className="py-6 px-4 text-sm text-text-secondary italic">
                    {suite.diff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
