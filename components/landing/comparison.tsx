"use client";

import { useTranslations } from "next-intl";
import { Check, X, Star } from "lucide-react";

export function LandingComparison() {
  const t = useTranslations("landing");

  const suites = [
    {
      name: "InSuite",
      logo: "/logo.svg",
      privacy: t("comparison.privacy.local"),
      auditable: true,
      comp: 5,
      install: false,
      price: t("comparison.price.free"),
      diff: t("comparison.suites.insuite.diff"),
      featured: true,
    },
    {
      name: "Ziziyi Office",
      logo: "https://hosted.inled.es/ziziyi-office-insuite.png",
      privacy: t("comparison.privacy.local"),
      auditable: true,
      comp: 5,
      install: false,
      price: t("comparison.price.freemium"),
      diff: t("comparison.suites.ziziyi.diff"),
    },
    {
      name: "OnlyOffice",
      logo: "https://hosted.inled.es/onlyoffice-insuite.png",
      privacy: t("comparison.privacy.cloud"),
      auditable: false,
      comp: 5,
      install: true,
      price: t("comparison.price.freemium"),
      diff: t("comparison.suites.onlyoffice.diff"),
    },
    {
      name: "LibreOffice",
      logo: "https://hosted.inled.es/libreoffice-insuite.png",
      privacy: t("comparison.privacy.local"),
      auditable: true,
      comp: 3,
      install: true,
      price: t("comparison.price.free"),
      diff: t("comparison.suites.libreoffice.diff"),
    },
    {
      name: "MS Office",
      logo: "https://hosted.inled.es/microslop-insuite.png",
      privacy: t("comparison.privacy.lowCloud"),
      auditable: false,
      comp: 5,
      install: true,
      price: t("comparison.price.subscription"),
      diff: t("comparison.suites.msoffice.diff"),
    },
  ];

  return (
    <section className="py-24 px-6 bg-white overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{t("comparison.title")}</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t("comparison.subtitle")}
          </p>
        </div>

        <div className="min-w-[1000px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-100 text-left">
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("comparison.headers.suite")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("comparison.headers.privacy")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("comparison.headers.auditable")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("comparison.headers.compatibility")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("comparison.headers.noInstall")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("comparison.headers.price")}</th>
                <th className="py-6 px-4 font-bold text-zinc-400 uppercase text-xs">{t("comparison.headers.keyDiffs")}</th>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${suite.privacy.includes('100%') || suite.privacy === t("comparison.privacy.local") ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
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
                    <span className={suite.price === t("comparison.price.free") ? 'text-green-600 font-bold' : 'text-zinc-600'}>{suite.price}</span>
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
