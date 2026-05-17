"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore, useHasHydrated } from "@/store";
import { LocaleName, Language, LocaleExtend, languages } from "@ziziyi/utils";
import { Globe, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TITLES = [
  "Select your language",
  "Selecciona tu idioma",
  "Choisissez votre langue",
  "Wählen Sie Ihre Sprache",
  "Seleziona la tua lingua",
  "Selecione o seu idioma",
  "Выберите ваш язык",
  "选择您的语言",
  "言語を選択してください",
  "언어를 선택하세요"
];

const MAJOR_LANGUAGES = ["en", "es", "fr", "de", "zh-CN", "ja", "ko", "pt-BR", "ru", "it"];

export function LanguageSelectorPopup() {
  const { language, setState } = useAppStore();
  const hasHydrated = useHasHydrated();
  const [isOpen, setIsOpen] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Check if we should show the popup
  useEffect(() => {
    if (hasHydrated) {
      const hasChosen = localStorage.getItem("language-chosen");
      if (!hasChosen && language === LocaleExtend.Auto) {
        setIsOpen(true);
      }
    }
  }, [hasHydrated, language]);

  // Title cycling animation
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTitleIndex((prev) => (prev + 1) % TITLES.length);
        setFade(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setState({ language: code });
    localStorage.setItem("language-chosen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with animated title */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 
            className={cn(
              "text-2xl md:text-3xl font-bold tracking-tight transition-opacity duration-500 min-h-[40px]",
              fade ? "opacity-100" : "opacity-0"
            )}
          >
            {TITLES[titleIndex]}
          </h2>
          <p className="text-muted-foreground mt-2">
            Choose your preferred language to continue
          </p>
        </div>

        {/* Language Grid */}
        <div className="p-6 md:p-8 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MAJOR_LANGUAGES.map((code) => (
              <button
                key={code}
                onClick={() => handleSelect(code as Language)}
                className="flex items-center justify-center p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {LocaleName[code as keyof typeof LocaleName] || code.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
