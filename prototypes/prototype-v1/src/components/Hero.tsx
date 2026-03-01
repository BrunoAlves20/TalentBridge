import { Sparkles, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Plataforma Inteligente de Recrutamento</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Conectando <span className="text-blue-600">Empresas</span> aos
            <br />
            Melhores <span className="text-blue-600">Talentos</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Uma plataforma que revoluciona o recrutamento com IA.
            Empresas encontram candidatos ideais, candidatos se preparam com nosso Coach de IA
            e chegam prontos para impressionar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center space-x-2">
              <span>Encontrar Vagas</span>
              <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button className="group bg-white hover:bg-gray-50 text-blue-600 font-semibold px-8 py-4 rounded-lg transition-all duration-300 border-2 border-blue-600 hover:shadow-xl hover:-translate-y-1 flex items-center space-x-2">
              <span>Contratar Talentos</span>
              <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Candidatos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">Empresas Parceiras</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Taxa de Satisfação</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Briefcase({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
