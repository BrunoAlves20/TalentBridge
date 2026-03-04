import { Sparkles, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">

          <div className="inline-flex items-center gap-2 
            bg-blue-100 dark:bg-blue-900 
            text-blue-700 dark:text-blue-300 
            px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              Plataforma Inteligente de Recrutamento
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold 
            text-gray-900 dark:text-white 
            mb-6 leading-tight">
            Conectando <span className="text-blue-600 dark:text-blue-400">Empresas</span> aos
            <br />
            Melhores <span className="text-blue-600 dark:text-blue-400">Talentos</span>
          </h1>

          <p className="text-xl 
            text-gray-600 dark:text-gray-300 
            mb-12 leading-relaxed">
            Uma plataforma que revoluciona o recrutamento com IA.
            Empresas encontram candidatos ideais, candidatos se preparam com nosso Coach de IA
            e chegam prontos para impressionar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <button className="bg-blue-600 hover:bg-blue-700 
              text-white font-semibold 
              px-8 py-4 rounded-lg">
              Encontrar Vagas
            </button>

            <button className="bg-white dark:bg-gray-800 
              text-blue-600 dark:text-blue-400 
              border border-blue-600 dark:border-blue-400
              px-8 py-4 rounded-lg">
              Contratar Talentos
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}