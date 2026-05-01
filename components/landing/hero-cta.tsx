"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function LandingHeroCTA() {
  const markVisited = () => localStorage.setItem('visited', 'true');

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col border border-border rounded-[3rem] overflow-hidden bg-zinc-50 shadow-sm">
        {/* Horizontal GIF at the top */}
        <div className="w-full relative overflow-hidden bg-black flex items-center justify-center border-b border-border">
            <img 
              src="https://hosted.inled.es/insuite-office-matrix.gif" 
              alt="Matrix Pill Meme - InSuite Office" 
              className="w-full h-auto object-cover max-h-[500px]"
            />
        </div>

        {/* Text content at the bottom */}
        <div className="p-10 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-foreground">
            Es el momento, <span className="text-red-600">tú decides</span>.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-3xl mx-auto">
            No permitas que tus datos se queden en el almacenamiento, que te cobren por simplemente editar documentos, que te obliguen a instalar algo o que te hagan pasar por regulaciones de países extranjeros.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              onClick={markVisited}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
            >
              Empezar ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/InledGroup/office"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-border text-foreground rounded-2xl font-bold text-lg hover:bg-zinc-100 transition-all flex items-center justify-center gap-3"
            >
              <Github className="w-5 h-5" />
              Revisa el código
            </a>
          </div>
          
          <p className="mt-8 text-xs text-text-secondary tracking-widest font-bold opacity-60">
            Al usar InSuite, estás usando software libre, privado y español
          </p>
        </div>
      </div>
    </section>
  );
}
