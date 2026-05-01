"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-12 w-full shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center">
          <img src="/logo.svg" className="w-10 h-10" alt="logo" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground leading-5 pt-1">
          {"Inled InSuite Office"}
          <span className="block text-xs font-normal opacity-70">
            Docs Sheets Slides
          </span>
        </h1>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="#features" className="hover:text-primary transition-colors">Características</a>
        <a href="#editors" className="hover:text-primary transition-colors">Editores</a>
        <a href="#about" className="hover:text-primary transition-colors">Acerca de</a>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
          onClick={() => localStorage.setItem('visited', 'true')}
        >
          Empezar ahora
        </Link>
      </div>
    </header>
  );
}
