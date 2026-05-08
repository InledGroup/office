"use client";

import { Github, Globe, ShieldCheck } from "lucide-react";
import { useExtracted } from "next-intl";

export function LandingFooter() {
  const t = useExtracted();

  return (
    <footer className="bg-zinc-50 border-t border-border py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.svg" className="w-8 h-8" alt="logo" />
            <span className="font-bold text-lg">Inled InSuite</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t("The sovereign, private and free office suite made in Spain for the world.")}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4">{t("Product")}</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li><a href="#features" className="hover:text-primary transition-colors">{t("Features")}</a></li>
            <li><a href="#editors" className="hover:text-primary transition-colors">{t("Editors")}</a></li>
            <li><a href="https://github.com/InledGroup/office" className="hover:text-primary transition-colors">{t("Open Source")}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4">{t("Company")}</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li><a href="#about" className="hover:text-primary transition-colors">{t("About")}</a></li>
            <li><a href="https://inled.es" className="hover:text-primary transition-colors">Inled Group</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4">{t("Social")}</h3>
          <div className="flex gap-4">
            <a href="https://github.com/InledGroup/office" className="text-text-secondary hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://inled.es" className="text-text-secondary hover:text-primary transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-text-secondary">
          {t("Licensed under the original license except for the changes, which are licensed under MIT-INLED.")}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4" />
          <span>PrivacyCheck</span>
        </div>
      </div>
    </footer>
  );
}
