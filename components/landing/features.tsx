"use client";

import { ShieldCheck, DownloadCloud, Flag } from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      title: "Made in Spain",
      description: "El office libre, sin instalación, gratuito y 100% compatible que ha sido creado en España para España.",
      icon: Flag,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Privado 100%",
      description: "Nada se sube al servidor. Todo se queda en tu navegador. Cumplimos con las normativas de privacidad europeas y españolas más estrictas al no recoger ni un solo dato.",
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Sin instalar nada",
      description: "Todo funciona en el navegador, no necesitas más que un explorador de archivos con el que subir documentos y un navegador para usar el editor.",
      icon: DownloadCloud,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">¿Por qué elegir InSuite?</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Porque está hecho pensando en tí, no en sacar rédito económico. Porque es libre, privado y está hecho en España.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="p-8 rounded-3xl border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
