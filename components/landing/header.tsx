"use client";

import Link from "next/link";
import { useAppStore, useHasHydrated } from "@/store";
import { LocaleName, Language } from "@ziziyi/utils";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

// Languages we want to show in the landing
const landingLanguages = ["es", "en", "de", "fr", "zh-CN"];

export function LandingHeader() {
  const { language, setState } = useAppStore();
  const hasHydrated = useHasHydrated();

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-12 w-full shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center">
          <img src="/logo.svg" className="w-10 h-10" alt="logo" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-foreground leading-5 pt-1">
            Inled InSuite Office
          </h1>
          <span className="text-[10px] md:text-xs font-normal opacity-70">
            Docs Sheets Slides
          </span>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
        <a href="#features" className="hover:text-primary transition-colors">Características</a>
        <a href="#editors" className="hover:text-primary transition-colors">Editores</a>
        <a href="#about" className="hover:text-primary transition-colors">Acerca de</a>
      </nav>

      <div className="flex items-center gap-3 md:gap-4">
        {hasHydrated && (
          <Select
            value={language}
            onValueChange={(value) => setState({ language: value as Language })}
          >
            <SelectTrigger className="w-auto md:w-[130px] h-10 border-none bg-transparent hover:bg-zinc-100 transition-colors shadow-none focus:ring-0 px-2 md:px-3">
               <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-text-secondary" />
                  <span className="hidden md:inline text-sm font-semibold">
                      {LocaleName[language as keyof typeof LocaleName] || language.toUpperCase()}
                  </span>
               </div>
            </SelectTrigger>
            <SelectContent align="end" position="popper" className="z-[100]">
              {landingLanguages.map((code) => (
                <SelectItem
                  key={code}
                  value={code}
                  className="font-medium"
                >
                  {LocaleName[code as keyof typeof LocaleName] || code.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Link
          href="/"
          className="px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white rounded-lg font-semibold text-xs md:text-sm shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
          onClick={() => localStorage.setItem('visited', 'true')}
        >
          Empezar ahora
        </Link>
      </div>
    </header>
  );
}
