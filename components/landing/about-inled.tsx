"use client";

export function LandingAboutInled() {
  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <img 
          src="https://hosted.inled.es/inled-logo-full.png" 
          alt="Inled Group Logo" 
          className="h-20 mx-auto mb-10 grayscale hover:grayscale-0 transition-all duration-500"
        />
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Acerca de Inled Group</h2>
        <p className="text-lg text-text-secondary leading-relaxed mb-8">
          Inled Group es una marca de software enfocada en la privacidad, la soberanía tecnológica Española y la IA local. Usamos tecnologías libres, agentes de IA para desarrollar y somos fans de Linux.
        </p>
        <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary">100%</span>
                <span className="text-xs uppercase tracking-widest font-bold opacity-50">Privado</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary">Libre</span>
                <span className="text-xs uppercase tracking-widest font-bold opacity-50">Open Source</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary">ES</span>
                <span className="text-xs uppercase tracking-widest font-bold opacity-50">Made in Spain</span>
            </div>
        </div>
      </div>
    </section>
  );
}
