"use client";

import { FileText, FileSpreadsheet, Presentation, Puzzle } from "lucide-react";

export function LandingEditors() {
  const editors = [
    {
      name: "Documentos",
      desc: "Compatible con .docx. La misma potencia que Microsoft Word, pero mil veces mejor que Google Docs.",
      icon: FileText,
      color: "border-blue-200",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Hojas de Cálculo",
      desc: "Compatible con .xlsx. Realiza análisis complejos y fórmulas con total compatibilidad.",
      icon: FileSpreadsheet,
      color: "border-green-200",
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Presentaciones",
      desc: "Compatible con .pptx. Crea slides impactantes directamente en tu navegador.",
      icon: Presentation,
      color: "border-orange-200",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <section id="editors" className="py-24 px-6 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Herramientas Profesionales</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Editores de escritorio potentes, ahora en tu navegador. 100% compatibles con tus archivos de siempre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {editors.map((editor, i) => (
            <div 
              key={i} 
              className={`bg-white p-8 rounded-3xl border ${editor.color} shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col items-center text-center`}
            >
              <div className={`w-16 h-16 mb-6 rounded-2xl ${editor.bgColor} flex items-center justify-center ${editor.iconColor}`}>
                <editor.icon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{editor.name}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {editor.desc}
              </p>
            </div>
          ))}

          <div 
            className="bg-primary/5 p-8 rounded-3xl border border-primary/20 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 mb-6 bg-primary rounded-2xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Puzzle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">Plugins</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Traducción, IA local, corrección ortográfica y más. Personaliza tu oficina con nuestro catálogo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
