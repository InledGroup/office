"use client";

import { useEffect, useState } from "react";
import { Bug, Github, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useResolvedLanguage } from "@/store";
import { cn } from "@/lib/utils";

interface BugItem {
  title: string;
  phase: string;
  avoid: string;
  description: string;
}

/**
 * BugsReport Component
 * Displays a list of known issues and their status, loaded from a localized markdown file.
 * Includes a link to report new issues on GitHub.
 */
export function BugsReport() {
  const t = useTranslations();
  const locale = useResolvedLanguage();
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine which file to fetch based on locale
    const fileLocale = locale.startsWith("es") ? "es" : "en";
    
    setIsLoading(true);
    fetch(`/data/known-bugs.${fileLocale}.md`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load bugs");
        return res.text();
      })
      .then((text) => {
        const parsedBugs = parseMarkdown(text);
        setBugs(parsedBugs);
      })
      .catch((err) => {
        console.error("Error loading bugs:", err);
        // If localized version fails, try English as fallback
        if (fileLocale !== "en") {
          fetch("/data/known-bugs.en.md")
            .then(res => res.text())
            .then(text => setBugs(parseMarkdown(text)))
            .catch(e => console.error("Fallback error:", e));
        }
      })
      .finally(() => setIsLoading(false));
  }, [locale]);

  /**
   * Parses the markdown content into a list of BugItem objects.
   * Expected format:
   * ### Title
   * - **Phase**: status
   * - **Avoid**: tip
   * - **Description**: details
   */
  const parseMarkdown = (text: string): BugItem[] => {
    const sections = text.split("###").slice(1);
    return sections.map((section) => {
      const lines = section.split("\n");
      const title = lines[0].trim();
      
      const getValue = (key: string) => {
        const line = lines.find(l => l.includes(`**${key}**:`) || l.includes(`**${key}**: `));
        if (!line) return "";
        return line.split(`**${key}**:`)[1]?.trim() || "";
      };

      return {
        title,
        phase: getValue("Phase"),
        avoid: getValue("Avoid"),
        description: getValue("Description")
      };
    });
  };

  if (!isLoading && bugs.length === 0) return null;

  return (
    <section className="mt-12 p-8 bg-muted/20 dark:bg-white/5 border border-border rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <Bug className="w-6 h-6 text-primary" />
            {t("knownBugsTitle")}
          </h2>
          <p className="text-sm text-text-secondary mt-1.5 max-w-lg">
            {t("knownBugsDesc")}
          </p>
        </div>
        <a
          href="https://github.com/InledGroup/office/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-sm"
        >
          <Github className="w-5 h-5" />
          {t("reportOnGithub")}
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted/40 animate-pulse rounded-xl" />
          ))
        ) : (
          bugs.map((bug, i) => (
            <div key={i} className="p-5 bg-background border border-border rounded-xl shadow-sm hover:border-primary/40 transition-all group flex flex-col h-full">
              <h3 className="font-bold text-sm mb-4 flex items-start gap-2.5 leading-snug">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                {bug.title}
              </h3>
              
              <div className="space-y-3.5 mt-auto">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-text-secondary uppercase tracking-wider w-24 shrink-0">{t("bugPhase")}:</span>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full font-bold",
                    bug.phase.toLowerCase().includes("solucionado") || bug.phase.toLowerCase().includes("fixed") 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : bug.phase.toLowerCase().includes("progreso") || bug.phase.toLowerCase().includes("progress") || bug.phase.toLowerCase().includes("investigando") || bug.phase.toLowerCase().includes("investigating")
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {bug.phase}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[11px]">
                  <span className="font-bold text-text-secondary uppercase tracking-wider w-24 shrink-0">{t("bugAvoid")}:</span>
                  <p className="text-text-secondary font-medium leading-relaxed italic">
                    "{bug.avoid}"
                  </p>
                </div>

                {bug.description && (
                  <div className="pt-3 border-t border-border/40">
                    <p className="text-[11px] text-text-secondary/80 leading-relaxed italic">
                      {bug.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
