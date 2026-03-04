import { Award, TrendingUp, Users } from 'lucide-react';
import { mockCandidates } from '../data/mockData';

export default function RecruiterDashboard() {
  return (
    <section className="py-20 
      bg-gradient-to-b 
      from-gray-50 to-white 
      dark:from-gray-900 dark:to-gray-950 
      transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 
            bg-blue-100 dark:bg-blue-900/40 
            text-blue-700 dark:text-blue-300 
            px-4 py-2 rounded-full mb-6">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Para Empresas</span>
          </div>

          <h2 className="text-4xl font-bold 
            text-gray-900 dark:text-white 
            mb-4">
            Contrate Candidatos que Já Chegam Preparados
          </h2>

          <p className="text-xl 
            text-gray-600 dark:text-gray-300 
            max-w-3xl mx-auto">
            Nosso ATS inteligente ranqueia candidatos por compatibilidade.
            Destaque para aqueles que treinaram com nossa IA e estão prontos para impressionar.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 
            rounded-2xl shadow-xl 
            border border-gray-200 dark:border-gray-700 
            overflow-hidden">

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">
                    Vaga: Desenvolvedor Front-end Sênior
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Tech Solutions • São Paulo, SP • Remoto
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-white text-2xl font-bold">127</div>
                  <div className="text-blue-100 text-xs">Candidatos</div>
                </div>
              </div>
            </div>

            <div className="p-6">

              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Candidatos por Match Score
                </h4>

                <button className="text-blue-600 dark:text-blue-400 hover:opacity-80 text-sm font-medium transition">
                  Ver Todos →
                </button>
              </div>

              <div className="space-y-4">
                {mockCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="group 
                      bg-gray-50 dark:bg-gray-700 
                      hover:bg-blue-50 dark:hover:bg-gray-600 
                      rounded-xl p-4 
                      transition-all duration-300 
                      hover:shadow-lg hover:-translate-y-1 
                      border border-transparent hover:border-blue-200 dark:hover:border-blue-500">

                    <div className="flex items-center space-x-4">

                      <div className="relative flex-shrink-0">
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
                        />

                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">

                          <h5 className="text-gray-900 dark:text-white font-semibold text-lg truncate">
                            {candidate.name}
                          </h5>

                          {candidate.isPrepared && (
                            <span className="inline-flex items-center space-x-1 
                              bg-green-100 dark:bg-green-900/40 
                              text-green-700 dark:text-green-300 
                              text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                              <Award className="w-3 h-3" />
                              <span>Candidato Preparado</span>
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {candidate.role}
                        </p>

                        <div className="flex items-center space-x-2">
                          {candidate.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="bg-white dark:bg-gray-800 
                                text-gray-700 dark:text-gray-300 
                                text-xs px-2 py-1 rounded 
                                border border-gray-200 dark:border-gray-600">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className={`w-5 h-5 ${
                            candidate.matchScore >= 90 ? 'text-green-500' :
                            candidate.matchScore >= 80 ? 'text-blue-500' :
                            'text-gray-400'
                          }`} />

                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              candidate.matchScore >= 90 ? 'text-green-600' :
                              candidate.matchScore >= 80 ? 'text-blue-600' :
                              'text-gray-600 dark:text-gray-300'
                            }`}>
                              {candidate.matchScore}%
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Match
                            </div>
                          </div>
                        </div>

                        <button className="opacity-0 group-hover:opacity-100 
                          bg-blue-600 hover:bg-blue-700 
                          text-white text-sm font-medium 
                          px-4 py-2 rounded-lg transition-all duration-200">
                          Ver Perfil
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              Criar Vaga Agora
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}