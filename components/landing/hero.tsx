"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, FileText, FileSpreadsheet, Presentation } from "lucide-react";
import { EmbeddedEditor } from "./embedded-editor";
import { cn } from "@/lib/utils";

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<"docx" | "xlsx" | "pptx">("docx");
  const markVisited = () => localStorage.setItem('visited', 'true');

  const tabs = [
    { id: "docx", label: "Word", icon: FileText, color: "text-blue-600", url: "/files/checklist_templates_Restaurant Cleaning Checklist Doc.docx" },
    { id: "xlsx", label: "Excel", icon: FileSpreadsheet, color: "text-green-600", url: "/files/employee-leave-tracker.xlsx" },
    { id: "pptx", label: "PowerPoint", icon: Presentation, color: "text-orange-600", url: "/files/2024 Couple Wrapped Slides.pptx" },
  ];

  return (
    <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-6 overflow-hidden bg-white">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span>Beta</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
          El Office gratuito, abierto y <br className="hidden md:block" />
          <span className="inline-block mt-2 px-4 py-1 bg-red-600 text-yellow-300 transform -rotate-1 rounded-sm shadow-lg">
            Made in Spain
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          Privacidad total sin instalaciones. Abre, edita y guarda tus documentos directamente en el navegador. Tus archivos nunca abandonan tu ordenador.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link
            href="/"
            onClick={markVisited}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Empezar a usar gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-50 border border-border text-foreground rounded-xl font-bold text-lg hover:bg-zinc-100 transition-all flex items-center justify-center"
          >
            Ver características
          </a>
        </div>

        {/* Interactive Editor Preview */}
        <div className="mt-12 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="max-w-5xl mx-auto bg-white border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] md:h-[750px]">
                {/* Browser-like Header / Tab Bar */}
                <div className="h-14 bg-zinc-50 border-b border-border flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 mr-4">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                          {tabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                                activeTab === tab.id 
                                  ? "bg-white shadow-sm border border-border text-foreground" 
                                  : "text-text-secondary hover:bg-zinc-200/50"
                              )}
                            >
                              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "opacity-50")} />
                              {tab.label}
                            </button>
                          ))}
                        </div>
                    </div>
                    <div className="text-[10px] md:text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Pruébalo!
                    </div>
                </div>
                
                {/* Tab Switcher for Mobile */}
                <div className="md:hidden flex items-center border-b border-border bg-zinc-50/50">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-all",
                        activeTab === tab.id ? "border-primary text-primary bg-white" : "border-transparent text-text-secondary"
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>

                {/* The Embedded Editor */}
                <div className="flex-1 min-h-0 bg-white">
                    <EmbeddedEditor 
                      key={activeTab}
                      fileUrl={tabs.find(t => t.id === activeTab)!.url}
                      fileType={activeTab}
                    />
                </div>
            </div>
            
            {/* Legend / Info below the editor */}
            <p className="mt-6 text-sm text-text-secondary font-medium">
              Interactúa con el editor. Es una instancia real ejecutándose <span className="text-primary">100% en tu navegador</span> vía WebAssembly.
            </p>
        </div>
      </div>
    </section>
  );
}
